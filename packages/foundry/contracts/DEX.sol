// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @notice Simple DEX contract that allows users to swap ETH for Dai and Dai for ETH
 */

contract DEX {
    /* ========== GLOBAL VARIABLES ========== */

    IERC20 token; //instantiates the imported contract
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    /* ========== EVENTS ========== */

    event Swap(
        address swapper,
        address inputToken,
        uint256 inputAmount,
        address outputToken,
        uint256 outputAmount
    );
    event PriceUpdated(uint256 price);
    /**
     * @notice Emitted when liquidity provided to DEX and mints LPTs.
     */
    event LiquidityProvided(
        address liquidityProvider,
        uint256 liquidityMinted,
        uint256 ethInput,
        uint256 tokensInput
    );

    /**
     * @notice Emitted when liquidity removed from DEX and decreases LPT count within DEX.
     */
    event LiquidityRemoved(
        address liquidityRemover,
        uint256 liquidityWithdrawn,
        uint256 tokensOutput,
        uint256 ethOutput
    );

    /* ========== CONSTRUCTOR ========== */

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @notice initializes amount of tokens that will be transferred to the DEX itself from the erc20 contract. Loads contract up with both ETH and Dai.
     * @param tokens amount to be transferred to DEX
     * @return totalLiquidity is the number of LPTs minting as a result of deposits made to DEX contract
     * NOTE: since ratio is 1:1, this is fine to initialize the totalLiquidity as equal to eth balance of contract.
     */

    function innit(uint256 tokens) public payable returns (uint256) {
        require(totalLiquidity == 0, "DEX: init - already has liquidity");
        totalLiquidity = address(this).balance;
        liquidity[msg.sender] = totalLiquidity;
        require(
            token.transferFrom(msg.sender, address(this), tokens),
            "DEX: init - Transfer Unsuccessful"
        );
        return totalLiquidity;
    }

    /**
     * @notice returns the amount you should receive (yOutput) when given the reserves of both assets in the pool
     */
    function price(
        uint256 ethInput,
        uint256 EthReserves,
        uint256 tokenReserves
    ) public pure returns (uint256 tokenOutput) {
        uint256 numerator = ethInput * tokenReserves;
        uint256 denominator = (EthReserves) + ethInput;
        return numerator / denominator;
    }

    /**
     * @notice returns the current price of ETH in Dai
     */
    function currentPrice() public view returns (uint256 _currentPrice) {
        _currentPrice = price(
            1 ether,
            address(this).balance,
            token.balanceOf(address(this))
        );
    }

    /**
     * @notice returns the amount you need to put in (xInput) when given the amount of yOutput you want along with the reserves of both assets in the pool
     */
    function calculateEthInput(
        uint256 tokenOutput,
        uint256 EthReserves,
        uint256 tokenReserves
    ) public pure returns (uint256 ethInput) {
        require(tokenOutput > 0, "DEX: Cannot Swap 0 tokens");
        require(tokenOutput < tokenReserves, "DEX: Insufficient Liquidity");
        uint256 numerator = tokenOutput * EthReserves;
        uint256 denominator = tokenReserves - tokenOutput;
        return numerator / denominator;
    }

    /**
     * @notice sends Ether to DEX in exchange for $Dai
     */

    function ethToToken() internal returns (uint256 tokenOutput) {
        require(msg.value > 0, "DEX: Cannot Swap 0 ETH");
        uint256 ethReserves = address(this).balance - msg.value;
        uint256 tokenReserves = token.balanceOf(address(this));
        tokenOutput = price(msg.value, ethReserves, tokenReserves);
        require(
            token.transfer(msg.sender, tokenOutput),
            "DEX: ethToToken - Transfer Unsuccessful"
        );
        emit Swap(
            msg.sender,
            address(0),
            msg.value,
            address(token),
            tokenOutput
        );
        return tokenOutput;
    }

    /**
     * @notice sends $Dai tokens to DEX in exchange for Ether
     */

    function tokenToEth(
        uint256 tokenInput
    ) internal returns (uint256 ethOutput) {
        require(tokenInput > 0, "DEX: Cannot Swap 0 tokens");
        require(
            token.balanceOf(msg.sender) >= tokenInput,
            "DEX: Insufficient Token Balance"
        );
        require(
            token.allowance(msg.sender, address(this)) >= tokenInput,
            "DEX: Insufficient Token Allowance (approve first)"
        );
        uint256 ethReserves = address(this).balance;
        uint256 tokenReserves = token.balanceOf(address(this));
        ethOutput = price(tokenInput, tokenReserves, ethReserves);
        require(
            token.transferFrom(msg.sender, address(this), tokenInput),
            "Transfer Unsuccessful: Reverted Swap"
        );
        (bool sent, ) = msg.sender.call{value: ethOutput}("");
        require(sent, "Transfer Unsuccessful: Revert in Transferring ETH");
        emit Swap(
            msg.sender,
            address(token),
            tokenInput,
            address(0),
            ethOutput
        );
        return ethOutput;
    }

    /**
     * @notice allows users to swap ETH for $Dai or $Dai for ETH with a single method
     */

    function swap(
        uint256 inputAmount
    ) public payable returns (uint256 outputAmount) {
        if (msg.value > 0 && inputAmount == msg.value) {
            outputAmount = ethToToken();
        } else {
            outputAmount = tokenToEth(inputAmount);
        }
        emit PriceUpdated(currentPrice());
    }

    /**
     * @notice allows deposits of $Dai and $ETH to liquidity pool
     * NOTE: parameter is the msg.value sent with this function call. That amount is used to determine the amount of $CORN needed as well and taken from the depositor.
     * NOTE: user has to make sure to give DEX approval to spend their tokens on their behalf by calling approve function prior to this function call.
     * NOTE: Equal parts of both assets will be removed from the user's wallet with respect to the price outlined by the AMM.
     */
}
