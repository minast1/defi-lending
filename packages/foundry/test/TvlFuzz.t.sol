// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/DEX.sol";
import "../contracts/Lending.sol";
import "../contracts/Dai.sol";
import "../contracts/MovePrice.sol";
import "../contracts/FlashLoanLiquidator.sol";

contract TVLFuzzTest is Test {
    Dai public dai;
    DEX public dex;
    Lending public lending;
    address alice = makeAddr("alice");
    MovePrice public oracle;
    address bob = makeAddr("bob");

    function setUp() public {
        //INITIALIZATIONS
        dai = new Dai();
        dex = new DEX(address(dai));
        lending = new Lending(address(dex), address(dai));

        //MINTS && APPROVALS
        dai.mintTo(address(this), 1000000);

        dai.mintTo(address(lending), 100 ether);

        dai.approve(address(dex), type(uint256).max);

        dex.innit{value: 1000 ether}(1000000);
        vm.deal(address(this), 20 ether);
    }

    function testFuzz_tvlmath(uint256 collateralWei) public {
        collateralWei = bound(collateralWei, 1, 6 ether);
        //priceDAI = bound(priceDAI, 1 ether, 10_000 ether);

        vm.prank(address(this));
        lending.addCollateral{value: collateralWei}();

        uint256 daiInContract = dai.balanceOf(address(lending));
        uint256 daiInEth = (daiInContract * 1e18) / dex.currentPrice();

        uint256 expected = collateralWei + daiInEth;
        assertEq(lending.getTVLInETH(), expected);
    }
}
