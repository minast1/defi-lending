//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error Dai__InvalidAmount();
error Dai__InsufficientBalance();
error Dai__InsufficientAllowance();
error Dai__InvalidAddress();

contract Dai is ERC20, Ownable {
    constructor() ERC20("Dai", "Dai") Ownable(msg.sender) {}

    function mintTo(
        address to,
        uint256 amount
    ) external onlyOwner returns (bool) {
        if (to == address(0)) {
            revert Dai__InvalidAddress();
        }
        if (amount == 0) {
            revert Dai__InvalidAmount();
        }
        _mint(to, amount);
        return true;
    }
}
