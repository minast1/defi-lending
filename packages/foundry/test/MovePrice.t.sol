// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/DEX.sol";
import "../contracts/Lending.sol";
import "../contracts/Dai.sol";
import "../contracts/MovePrice.sol";
import "../contracts/FlashLoanLiquidator.sol";

contract MovePriceTest is Test {
    Dai public dai;
    DEX public dex;
    Lending public lending;
    address alice = makeAddr("alice");
    MovePrice public oracle;
    address bob = makeAddr("bob");
    address liquidator = makeAddr("liquidator");
    FlashLoanLiquidator public flashLoanLiquidator;

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
        dai.mintTo(address(liquidator), 3000);
        dai.mintTo(address(oracle), 10000000000000000000000 ether);
        dai.mintTo(address(lending), 100 ether);

        dai.approve(address(dex), type(uint256).max);

        dex.innit{value: 1000 ether}(1000000);
        vm.deal(alice, 20 ether);
        vm.deal(bob, 20 ether);
        vm.deal(address(oracle), 1000 ether);
    }

    function test_ItMovesPriceDown() public {
        uint256 price = dex.currentPrice();
        assertGt(price, 0);

        vm.prank(alice);
        oracle.movePrice(650 ether);
        uint256 newPrice = dex.currentPrice();
        assertLe(newPrice, price);
    }

    function test_ItMovesPriceUp() public {
        uint256 price = dex.currentPrice();
        console.log("Price from DEX", price);
        vm.prank(alice);
        oracle.movePrice(-500 ether);

        uint256 newPrice = dex.currentPrice();
        console.log("New Price from DEX", newPrice);
        assertGe(newPrice, price);
    }

    function test_TVL_Innit() public view {
        uint256 tvl = lending.getTVLInETH();
        uint256 daiInEth = (dai.balanceOf(address(lending)) * 1e18) /
            dex.currentPrice();
        assertEq(
            tvl,
            daiInEth,
            "TVL should be initialialized when contract has recieved DAI"
        );
    }

    function test_TVL_WithCollateral() public {
        vm.prank(alice);
        lending.addCollateral{value: 10 ether}();

        assertEq(
            lending.getTotalSystemCollateral(),
            10 ether,
            "TVL should equal ETH collateral"
        );
        uint256 tvlEth = lending.getTVLInETH();
        uint256 daiInEth = (dai.balanceOf(address(lending)) * 1e18) /
            dex.currentPrice();
        uint256 expectedTvl = 10 ether + daiInEth;
        assertEq(tvlEth, expectedTvl);
    }

    function test_TVL_AfterBorrow() public {
        vm.startPrank(alice);
        lending.addCollateral{value: 1 ether}();

        //uint256 collateralValue = lending.calculateCollateralValue(alice);
        uint256 tvlBefore = lending.getTVLInETH();
        uint256 daiInEth = (dai.balanceOf(address(lending)) * 1e18) /
            dex.currentPrice();
        assertEq(tvlBefore, 1 ether + daiInEth);
        lending.borrowDai(500);
        assertEq(lending.getTotalSystemBorrowed(), 500);
        uint256 daiInEthAfterBorrow = (dai.balanceOf(address(lending)) * 1e18) /
            dex.currentPrice();
        uint256 tvlAfter = lending.getTVLInETH();
        uint256 expected = 1 ether + daiInEthAfterBorrow;
        assertEq(tvlAfter, expected);
        vm.stopPrank();
    }

    function test_TVL_AfterRepay() public {
        vm.startPrank(alice);
        lending.addCollateral{value: 10 ether}();
        lending.borrowDai(1000);
        dai.approve(address(lending), type(uint256).max);
        lending.repayDai(1000);
        vm.stopPrank();

        uint256 daiInEth = (dai.balanceOf(address(lending)) * 1e18) /
            dex.currentPrice();
        uint256 expected = 10 ether + daiInEth;
        uint256 tvl = lending.getTVLInETH();

        assertApproxEqAbs(
            tvl,
            expected,
            1e12,
            "TVL should include repaid DAI converted to ETH"
        );
    }

    function test_TVL_AfterLiquidation() public {
        vm.startPrank(alice);
        lending.addCollateral{value: 5 ether}();
        lending.borrowDai(3000);
        vm.stopPrank();

        vm.prank(alice);
        oracle.movePrice(650 ether);

        assertTrue(lending.isLiquidatable(alice));

        vm.startPrank(liquidator);
        dai.approve(address(lending), 3000);
        lending.liquidate(alice);
        vm.stopPrank();

        assertEq(lending.s_userBorrowed(alice), 0);
        assert(lending.getTotalSystemCollateral() < 2 ether);
        uint256 tvl = lending.getTVLInETH();
        assertGt(
            tvl,
            0,
            "Liquidation adds DAI + reduces ETH but TVL stays positive"
        );
    }

    function test_getTVLInETH_multipleDeposits_and_daiBalance() public {
        // alice deposits 1 ETH, bob deposits 3 ETH
        vm.prank(alice);
        lending.addCollateral{value: 1 ether}();
        vm.prank(bob);
        lending.addCollateral{value: 3 ether}();

        uint256 expectedDaiInEth = (dai.balanceOf(address(lending)) * 1e18) /
            dex.currentPrice();

        uint256 expectedTotalCollateral = 4 ether;
        uint256 tvlEth = lending.getTVLInETH();
        assertEq(tvlEth, expectedTotalCollateral + expectedDaiInEth);
    }
}
