// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./Lending.sol";
import "./DEX.sol";
import "./Dai.sol";

contract FlashLoanLiquidator is IFlashLoanRecipient {
    Lending i_lending;
    DEX dex;
    Dai dai;

    constructor(address _i_lending, address _DEX, address _Dai) {
        i_lending = Lending(_i_lending);
        dex = DEX(_DEX);
        dai = Dai(_Dai);
        dai.approve(address(i_lending), type(uint256).max);
    }

    function executeOperation(
        uint256 amount,
        address initiator,
        address toLiquidate
    ) public returns (bool) {
        // First liquidate to get the collateral tokens
        i_lending.liquidate(toLiquidate);

        // Calculate required input amount of ETH to get exactly 'amount' of tokens
        uint256 ethReserves = address(dex).balance;
        uint256 tokenReserves = dai.balanceOf(address(dex));
        uint256 requiredETHInput = dex.calculateEthInput(
            amount,
            ethReserves,
            tokenReserves
        );

        // Execute the swap so we have the exact amount to repay the flash loan
        dex.swap{value: requiredETHInput}(requiredETHInput); // Swap ETH for tokens

        // Send remaining ETH back to the initiator
        if (address(this).balance > 0) {
            (bool success, ) = payable(initiator).call{
                value: address(this).balance
            }("");
            require(success, "Failed to send ETH back to initiator");
        }

        return true;
    }

    receive() external payable {}
}
