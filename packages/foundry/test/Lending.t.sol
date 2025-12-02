// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/DEX.sol";
import "../contracts/Lending.sol";
import "../contracts/Dai.sol";
import "../contracts/MovePrice.sol";
import "../contracts/FlashLoanLiquidator.sol";

contract LendingTest is Test {
    Dai public dai;
    DEX public dex;
    Lending public lending;
    address alice = makeAddr("alice");
    MovePrice public oracle;
    address bob = makeAddr("bob");
    address liquidator = makeAddr("liquidator");
    FlashLoanLiquidator public flashLoanLiquidator;

    event Liquidated(
        address indexed user,
        address indexed liquidator,
        uint256 amountForLiquidator,
        uint256 liquidatedUserDebt,
        uint256 price
    );

    event CollateralAdded(
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

    function setUp() public {
        //INITIALIZATIONS
        dai = new Dai();
        dex = new DEX(address(dai));
        lending = new Lending(address(dex), address(dai));
        oracle = new MovePrice(address(dex), address(dai));
        flashLoanLiquidator = new FlashLoanLiquidator(
            address(lending),
            address(dex),
            address(dai)
        );

        //MINTS && APPROVALS
        dai.mintTo(address(this), 1000000);
        dai.mintTo(address(lending), 1000000);
        dai.mintTo(address(oracle), 10000000000000000000000 ether);
        dai.mintTo(address(flashLoanLiquidator), 1000000000 ether);

        dai.approve(address(dex), type(uint256).max);

        dex.innit{value: 1000 ether}(1000000);
        vm.deal(alice, 10 ether);
        vm.deal(address(oracle), 1000 ether);
    }

    function testAddCollateral() public {
        vm.startPrank(alice);

        vm.expectEmit(true, true, false, false);
        emit CollateralAdded(alice, 2 ether, dex.currentPrice());
        lending.addCollateral{value: 2 ether}();
        assertEq(lending.s_userCollateral(alice), 2 ether);

        vm.stopPrank();
    }

    function test_DoesNotAcceptZeroCollateral() public {
        vm.startPrank(alice);
        vm.expectRevert(Lending__InvalidAmount.selector);
        lending.addCollateral{value: 0 ether}();
        vm.stopPrank();
    }

    function test_WithdrawCollateralWithoutDebt() public {
        uint256 aliceInitialBalance = alice.balance;
        vm.startPrank(alice);
        lending.addCollateral{value: 2 ether}();
        assertLt(alice.balance, aliceInitialBalance);
        lending.withdrawCollateral(2 ether);
        uint256 aliceFinalBalance = alice.balance;
        assertEq(aliceFinalBalance, aliceInitialBalance);
        vm.stopPrank();
    }

    function test_CannotWithdrawMoreThanDepositedCollateral() public {
        vm.startPrank(alice);
        lending.addCollateral{value: 2 ether}();
        vm.expectRevert(Lending__InvalidAmount.selector);
        lending.withdrawCollateral(3 ether);
        vm.stopPrank();
    }

    function test_ShouldPreventWithdrawalIfItMakesUserUnsafe() public {
        vm.startPrank(alice);
        lending.addCollateral{value: 2 ether}();
        uint256 price = dex.currentPrice();
        console.log("Price from DEX", price);
        console.log(
            "Collateral Value (CORN)",
            lending.calculateCollateralValue(alice)
        );
        lending.borrowDai(1600);
        vm.expectRevert(Lending__UnsafePositionRatio.selector);
        lending.withdrawCollateral(1 ether);
        vm.stopPrank();
    }

    function testBorrowWithinLimit() public {
        vm.startPrank(alice);

        lending.addCollateral{value: 2 ether}();
        uint256 price = dex.currentPrice();
        //uint256 collateralValue = lending.calculateCollateralValue(alice);
        console.log("Price from DEX", price);
        vm.expectEmit(true, true, false, false);
        emit AssetBorrowed(alice, 600, dex.currentPrice());
        lending.borrowDai(600);
        vm.stopPrank();
        assertEq(lending.s_userBorrowed(alice), 600);
        //assertEq(lending.s_userDebt(alice), 1 ether);
    }

    function test_UnableToBorrowOverLimit() public {
        vm.startPrank(alice);
        // vm.deal(alice, 100 ether);
        lending.addCollateral{value: 2 ether}();
        uint256 price = dex.currentPrice();
        console.log("Price from DEX", price);
        console.log(
            "Collateral Value (CORN)",
            lending.calculateCollateralValue(alice)
        );
        //max borrowable Collateral value/ borrowed amount  < 1.2 ...? ignore decimals .
        vm.expectRevert(Lending__UnsafePositionRatio.selector);
        lending.borrowDai(2100);
        vm.stopPrank();
    }

    function testCannotWithdrawCollateralBelowSafeRatio() public {
        vm.deal(alice, 100 ether);
        vm.startPrank(alice);
        lending.addCollateral{value: 2 ether}();
        uint256 price = dex.currentPrice();
        console.log("Price from DEX", price);
        console.log(
            "Collateral Value (CORN)",
            lending.calculateCollateralValue(alice)
        );

        //Borrow an amount near the safe limit
        uint256 borrowAmount = 1600;
        lending.borrowDai(borrowAmount); //close to the 120% threshold
        vm.stopPrank();

        // Check initial safety

        assertFalse(
            lending.isLiquidatable(alice),
            "Should not be liquidatable initially"
        );

        // Try to withdraw a large portion of collateral
        uint256 withdrawAmount = 1.5 ether; // leaves only 0.5 ETH

        vm.startPrank(alice);
        vm.expectRevert(Lending__UnsafePositionRatio.selector);
        lending.withdrawCollateral(withdrawAmount);
        vm.stopPrank();

        // Ensure collateral balance unchanged
        assertEq(
            lending.s_userCollateral(alice),
            2 ether,
            "Collateral should remain locked"
        );
    }

    function test_PreventLiquidationWhenPositionSafe() public {
        vm.startPrank(alice);
        lending.addCollateral{value: 2 ether}();
        //uint256 price = dex.currentPrice();
        lending.borrowDai(600);
        vm.stopPrank();

        vm.startPrank(liquidator);
        dai.approve(address(dex), 600);
        vm.expectRevert(Lending__NotLiquidatable.selector);
        lending.liquidate(alice);
        vm.stopPrank();
    }

    function test_ItShouldEmitAppropriateEventsOnLiquidation() public {
        vm.startPrank(alice);
        lending.addCollateral{value: 2 ether}();
        uint256 price = dex.currentPrice();
        lending.borrowDai(1600);
        vm.stopPrank();

        vm.prank(address(oracle)); ///drop the price of corn such that the user can be liquidated
        oracle.movePrice(150 ether);

        // vm.prank(address(dex));
        dai.mintTo(liquidator, 3000);

        vm.startPrank(liquidator);
        dai.approve(address(lending), 3000);
        vm.expectEmit(true, true, true, false);
        emit Liquidated(alice, liquidator, 2500, 1600, price);
        lending.liquidate(alice);
        vm.stopPrank();
    }

    function test_RepayBorrowedAmount() public {
        vm.startPrank(alice);
        lending.addCollateral{value: 2 ether}();
        uint256 price = dex.currentPrice();
        lending.borrowDai(600);
        // uint256 initialCornBalance = corn.balanceOf(alice);

        dai.approve(address(lending), 600);

        vm.expectEmit(true, true, false, false);
        emit AssetRepaid(alice, 600, price);
        lending.repayDai(600);
        vm.stopPrank();

        assertEq(lending.s_userBorrowed(alice), 0);
    }

    function test_flashLoanLiquidation() public {
        vm.startPrank(alice);
        lending.addCollateral{value: 5 ether}();
        uint256 price = dex.currentPrice();
        lending.borrowDai(1600);
        vm.stopPrank();
        console.log("Price from DEX", price);
        console.log(
            "Collateral Value (CORN)",
            lending.calculateCollateralValue(alice)
        );
        vm.prank(address(oracle)); ///drop the price of corn such that the user can be liquidated
        oracle.movePrice(650 ether);

        console.log("New Price from DEX", price);
        console.log(
            "NewCollateral Value (CORN)",
            lending.calculateCollateralValue(alice)
        );
        //vm.deal(address(flashLoanLiquidator), 1 ether);
        uint256 initialLendingBalance = dai.balanceOf(address(lending));
        uint256 initialLiquidatorBalance = liquidator.balance;
        uint256 initialCollateralBalance = lending.s_userCollateral(alice);
        vm.startPrank(liquidator);
        lending.flashLoan(
            IFlashLoanRecipient(flashLoanLiquidator),
            1600,
            alice
        );
        vm.stopPrank();

        //Lending must have its dai returned
        uint256 finalLendingBalance = dai.balanceOf(address(lending));
        assertEq(finalLendingBalance, initialLendingBalance + 1600);
        //Liquidator must have its dai returned
        uint256 finalLiquidatorBalance = liquidator.balance;
        assertEq(lending.s_userBorrowed(alice), 0, "Debt Cleared");
        assertLt(
            lending.s_userCollateral(alice),
            initialCollateralBalance,
            "Collateral Reduced"
        );

        //Initiator must get leftover ETH
        assertGt(finalLiquidatorBalance, initialLiquidatorBalance);

        // Liquidator should end with 0 dai (no leftovers)
        assertEq(dai.balanceOf(address(liquidator)), 0);
    }
}
