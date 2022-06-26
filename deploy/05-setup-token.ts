import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ADDRESS_ZERO } from "../constants";
import { GovernanceToken, TimeLock } from "../typechain";

const setupToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { log } = deployments
  const { deployer, developmentTeam } = await getNamedAccounts()
  const timeLock: TimeLock = await ethers.getContract("TimeLock", deployer);
  const governanceToken: GovernanceToken = await ethers.getContract("GovernanceToken", deployer);

  log("----------------------------------------------------")
  log("Setting up timelock contract as minter in token contract...")
  // would be great to use multicall here...
  const minterRole = await governanceToken.MINTER_ROLE();
  

  const grantMinterTx = await governanceToken.grantRole(minterRole, timeLock.address);
  const receipt = await grantMinterTx.wait(1);
log(`Successfully grant minter role for timelock: ${receipt.transactionHash}`);
  
}

export default setupToken
setupToken.tags = ["all", "setup-token"]
