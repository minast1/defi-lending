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
        // dai.mintTo(address(lending), 1000000);
        dai.mintTo(address(oracle), 10000000000000000000000 ether);

        dai.approve(address(dex), type(uint256).max);

        dex.innit{value: 1000 ether}(1000000);
        vm.deal(alice, 10 ether);
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
}
