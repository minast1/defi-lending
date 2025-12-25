// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Dai.sol";
import "./DEX.sol";

error Lending__InvalidAmount();
error Lending__TransferFailed();
error Lending__UnsafePositionRatio();
error Lending__BorrowingFailed();
error Lending__RepayingFailed();
error Lending__PositionSafe();
error Lending__NotLiquidatable();
error Lending__InsufficientLiquidatorDai();
error Lending__NoCollateralDEposited();
error Lending__InvalidAddress();

interface IFlashLoanRecipient {
    function executeOperation(
        uint256 amount,
        address initiator,
        address extraParam
    ) external returns (bool);
}

contract Lending is Ownable {
    uint256 private constant COLLATERAL_RATIO = 120; // 120% collateralization required
    uint256 private constant LIQUIDATOR_REWARD = 10; // 10% reward for liquidators

    Dai private dai;
    DEX private dex;

    mapping(address => uint256) public s_userCollateral; // User's collateral balance
    mapping(address => uint256) public s_userBorrowed; // User's borrowed dai balance

    //System totals for TVL
    uint256 public totalSystemCollateral; //ETH (wei)
    uint256 public totalSystemBorrowed; ///Dai units

    event CollateralAdded(
        address indexed user,
        uint256 indexed amount,
        uint256 price
    );
    event CollateralWithdrawn(
        address indexed user,
        uint256 indexed amount,
        uint256 price
    );
    event AssetBorrowed(
        address indexed user,
        uint256 indexed amount,
        uint256 price
    );
    event AssetRepaid(
        address indexed user,
        uint256 indexed amount,
        uint256 price
    );
    event Liquidated(
        address indexed user,
        address indexed liquidator,
        uint256 amountForLiquidator,
        uint256 liquidatedUserDebt,
        uint256 price
    );

    constructor(address _dex, address _dai) Ownable(msg.sender) {
        dex = DEX(_dex);
        dai = Dai(_dai);
    }

    /**
     * @notice Allows users to add ETH as collateral to their account
     */
    function addCollateral() public payable {
        if (msg.value == 0) revert Lending__InvalidAmount();

        s_userCollateral[msg.sender] += msg.value;
        totalSystemCollateral += msg.value;
        emit CollateralAdded(msg.sender, msg.value, dex.currentPrice());
    }

    /**
     * @notice Allows users to withdraw collateral as long as it doesn't make them liquidatable
     * @param amount The amount of collateral to withdraw
     */
    function withdrawCollateral(uint256 amount) public {
        if (amount == 0 || amount > s_userCollateral[msg.sender])
            revert Lending__InvalidAmount();

        s_userCollateral[msg.sender] -= amount;
        totalSystemCollateral -= amount;

        if (s_userBorrowed[msg.sender] > 0) {
            _validatePosition(msg.sender);
        }
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert Lending__TransferFailed();
        emit CollateralWithdrawn(msg.sender, amount, dex.currentPrice());
    }

    /**
     * @notice Calculates the total collateral value for a user based on their collateral balance
     * @param user The address of the user to calculate the collateral value for
     * @return uint256 The collateral value
     */
    function calculateCollateralValue(
        address user
    ) public view returns (uint256) {
        uint256 collateral = s_userCollateral[user];
        uint256 price = dex.currentPrice();
        return (collateral * price) / 1e18; //Returns collateral value in DAI
    }

    /**
     * @notice Calculates the position ratio for a user to ensure they are within safe limits
     * @param user The address of the user to calculate the position ratio for
     * @return uint256 The position ratio
     */
    function _calculatePositionRatio(
        address user
    ) internal view returns (uint256) {
        uint256 collateralValue = calculateCollateralValue(user);
        uint256 debt = s_userBorrowed[user];
        if (debt == 0) return type(uint256).max;

        return (collateralValue * 1e18) / debt;
    }

    /**
     * @notice Checks if a user's position can be liquidated
     * @param user The address of the user to check
     * @return bool True if the position is liquidatable, false otherwise
     */
    function isLiquidatable(address user) public view returns (bool) {
        uint256 positionRatio = _calculatePositionRatio(user);
        return positionRatio < COLLATERAL_RATIO * 1e16; // ---> 1.2e18
    }

    /**
     * @notice Internal view method that reverts if a user's position is unsafe
     * @param user The address of the user to validate
     */
    function _validatePosition(address user) internal view {
        if (s_userBorrowed[user] == 0) return;
        if (isLiquidatable(user)) revert Lending__UnsafePositionRatio();
    }

    /**
     * @notice Allows users to borrow dai based on their collateral
     * @param borrowAmount The amount of dai to borrow
     */
    function borrowDai(uint256 borrowAmount) public {
        uint256 price = dex.currentPrice();
        if (borrowAmount == 0) revert Lending__InvalidAmount();
        if (s_userCollateral[msg.sender] == 0)
            revert Lending__NoCollateralDEposited();

        s_userBorrowed[msg.sender] += borrowAmount;
        totalSystemBorrowed += borrowAmount;

        _validatePosition(msg.sender);

        bool sent = dai.transfer(msg.sender, borrowAmount);
        if (!sent) revert Lending__BorrowingFailed();
        emit AssetBorrowed(msg.sender, borrowAmount, price);
    }

    /**
     * @notice Allows users to repay dai and reduce their debt
     * @param repayAmount The amount of dai to repay
     */
    function repayDai(uint256 repayAmount) public {
        if (repayAmount == 0 || repayAmount > s_userBorrowed[msg.sender])
            revert Lending__InvalidAmount();
        if (s_userBorrowed[msg.sender] == 0)
            revert Lending__NoCollateralDEposited();
        s_userBorrowed[msg.sender] -= repayAmount;
        totalSystemBorrowed -= repayAmount;
        // _validatePosition(msg.sender);
        uint256 price = dex.currentPrice();
        bool sent = dai.transferFrom(msg.sender, address(this), repayAmount);
        if (!sent) revert Lending__RepayingFailed();
        emit AssetRepaid(msg.sender, repayAmount, price);
    }

    /**
     * @notice Allows liquidators to liquidate unsafe positions
     * @param user The address of the user to liquidate
     * @dev The caller must have enough dai to pay back user's debt
     * @dev The caller must have approved this contract to transfer the debt
     */
    function liquidate(address user) public {
        if (!isLiquidatable(user)) revert Lending__NotLiquidatable();

        uint256 userDebt = s_userBorrowed[user];
        if (userDebt == 0) revert Lending__NotLiquidatable();

        if (dai.balanceOf(msg.sender) < userDebt)
            revert Lending__InsufficientLiquidatorDai();

        uint256 collateralValue = calculateCollateralValue(user);
        uint256 userCollateral = s_userCollateral[user];

        ///Pull dai from liquidator
        bool sent = dai.transferFrom(msg.sender, address(this), userDebt);
        if (!sent) revert Lending__TransferFailed();

        //Compute proportional ETH that corresponds to the paid debt
        uint256 collateralPurchased = (userDebt * userCollateral) /
            collateralValue;
        //10% reward for liquidators
        uint256 reward = (collateralPurchased * LIQUIDATOR_REWARD) / 100;
        uint256 totalPayout = collateralPurchased + reward;

        //Dont exceed total collateral
        totalPayout = totalPayout > userCollateral
            ? userCollateral
            : totalPayout;

        s_userCollateral[user] -= totalPayout;
        totalSystemCollateral -= totalPayout;

        totalSystemBorrowed -= userDebt;
        //adjust dai.balanceOf(account);to reflect this
        dai.burn(user, userDebt);
        s_userBorrowed[user] = 0;

        //Send ETH to liquidator
        (bool success, ) = payable(msg.sender).call{value: totalPayout}("");
        if (!success) revert Lending__TransferFailed();
        emit Liquidated(
            user,
            msg.sender,
            totalPayout,
            userDebt,
            dex.currentPrice()
        );
    }

    function flashLoan(
        IFlashLoanRecipient _recipient,
        uint256 _amount,
        address _extraParam
    ) public {
        //Send the loan to the recipient - No collateral is required since it gets repaid all in the same transaction
        dai.transfer(address(_recipient), _amount);

        //Execute the operation
        bool sent = _recipient.executeOperation(
            _amount,
            msg.sender,
            _extraParam
        );
        require(sent, "FlashLoanRecipient failed to execute operation");

        //Get the loan back - Should revert if it doesn't have enough
        dai.transferFrom(address(_recipient), address(this), _amount);
    }

    /* ========== TVL getters ========== */
    // Total Value Locked expressed in DAI (DAI units, not scaled): collateral (ETH->DAI) + DAI balance held by lending contract
    function getTVLInDAI() public view returns (uint256) {
        uint256 price = dex.currentPrice(); // DAI per ETH (token units)
        uint256 collateralValueDAI = (totalSystemCollateral * price) / 1e18;
        uint256 daiInContract = dai.balanceOf(address(this));
        return collateralValueDAI + daiInContract;
    }

    // TVL expressed in ETH (wei): total collateral + value of DAI held converted to ETH
    function getTVLInETH() public view returns (uint256) {
        uint256 price = dex.currentPrice(); // DAI per ETH
        uint256 daiInContract = dai.balanceOf(address(this));
        // convert dai -> ETH: (dai * 1e18) / price
        uint256 daiInEth = (daiInContract * 1e18) / price;
        return totalSystemCollateral + daiInEth;
    }

    // helpers to expose internal totals for tests / UI
    function getTotalSystemCollateral() external view returns (uint256) {
        return totalSystemCollateral;
    }
    function getTotalSystemBorrowed() external view returns (uint256) {
        return totalSystemBorrowed;
    }
}
