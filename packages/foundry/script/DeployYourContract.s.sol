// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/Dai.sol";
import "../contracts/DEX.sol";
import "../contracts/DEX.sol";
import "../contracts/FlashLoanLiquidator.sol";
import "../contracts/Lending.sol";
import "../contracts/MovePrice.sol";

/**
 * @notice Deploy script for YourContract contract
 * @dev Inherits ScaffoldETHDeploy which:
 *      - Includes forge-std/Script.sol for deployment
 *      - Includes ScaffoldEthDeployerRunner modifier
 *      - Provides `deployer` variable
 * Example:
 * yarn deploy --file DeployYourContract.s.sol  # local anvil chain
 * yarn deploy --file DeployYourContract.s.sol --network optimism # live network (requires keystore)
 */
contract DeployYourContract is ScaffoldETHDeploy {
    /**
     * @dev Deployer setup based on `ETH_KEYSTORE_ACCOUNT` in `.env`:
     *      - "scaffold-eth-default": Uses Anvil's account #9 (0xa0Ee7A142d267C1f36714E4a8F75612F20a79720), no password prompt
     *      - "scaffold-eth-custom": requires password used while creating keystore
     *
     * Note: Must use ScaffoldEthDeployerRunner modifier to:
     *      - Setup correct `deployer` account and fund it
     *      - Export contract addresses & ABIs to `nextjs` packages
     */
    function run() external ScaffoldEthDeployerRunner {
        Dai dai = new Dai();
        DEX dex = new DEX(address(dai));
        Lending i_lending = new Lending(address(dex), address(dai));
        MovePrice i_movePrice = new MovePrice(address(dex), address(dai));

        new FlashLoanLiquidator(address(i_lending), address(dex), address(dai));
        // Mint some tokens to MovePrice
        dai.mintTo(address(i_movePrice), 10_000_000_000_000);

        // Mint tokens for Lending contract buffer
        dai.mintTo(address(i_lending), 1000000);

        // if (block.chainid == 31337) {
        // Give deployer enough CORN for DEX bootstrap
        if (block.chainid == 31337) {
            dai.mintTo(0x4d8341e8F2408227AD2FB34d370759dD5a09De2E, 3000);
        } else {
            dai.mintTo(0x7874665BF5Da57D222de629d4C6ba9ae619076F0, 3000);
        }

        // Approve DEX to pull deployer's CORN
        //  dai.approve(address(dex), type(uint256).max);

        // Initialize DEX with full liquidity
        // dex.innit{value: 1 ether}(2000);

        //new YourContract(deployer);
    }
}
