// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DEX.sol";

/**
 * @notice This contract acts as a whale account that moves the price of CORN up and down whenever anyone calls it
 */
contract MovePrice {
    DEX dex;

    constructor(address _Dex, address _daiToken) {
        dex = DEX(_Dex);
        // Approve the cornDEX to use the cornToken
        IERC20(_daiToken).approve(address(dex), type(uint256).max);
    }

    function movePrice(int256 size) public {
        if (size > 0) {
            require(address(this).balance >= uint256(size), "Not enough ETH");
            dex.swap{value: uint256(size)}(uint256(size));
        } else {
            uint256 tokenAmount = uint256(-size);

            dex.swap(tokenAmount);
        }
    }

    receive() external payable {}

    fallback() external payable {}
}
