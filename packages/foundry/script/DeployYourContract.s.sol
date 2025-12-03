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

        // if (block.chainid == 31337) {
        // Give deployer enough CORN for DEX bootstrap
        dai.mintTo(address(deployer), 10_000_000 ether);

        // Mint some tokens to MovePrice
        dai.mintTo(address(i_movePrice), 10_000_000_0000 ether);

        // Mint tokens for Lending contract buffer
        dai.mintTo(address(i_lending), 1000000 ether);

        // Approve DEX to pull deployer's CORN
        dai.approve(address(dex), type(uint256).max);

        if (block.chainid == 31337) {
            // Initialize DEX with full liquidity
            dex.innit{value: 1 ether}(2000 ether);
        }
        //new YourContract(deployer);
    }
}
