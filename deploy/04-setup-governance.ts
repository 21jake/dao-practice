import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ADDRESS_ZERO } from "../constants";
import { TimeLock } from "../typechain";

const setupGovenor: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()
  const governanceToken = await ethers.getContract("GovernanceToken", deployer)
  const timeLock: TimeLock = await ethers.getContract("TimeLock", deployer)
  const governor = await ethers.getContract("GovernorContract", deployer)

  log("----------------------------------------------------")
  log("Setting up governor contract as proposer in timelock contract...")
  // would be great to use multicall here...
  const proposerRole = await timeLock.PROPOSER_ROLE()
  const executorRole = await timeLock.EXECUTOR_ROLE()
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()

  const proposerTx = await timeLock.grantRole(proposerRole, governor.address)
  const receiptProposerTx = await proposerTx.wait(1)
  log(`Succesfully set up governor contract as proposer in timelock contract: ${receiptProposerTx.transactionHash}`)

  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO)
  await executorTx.wait(1)
  const receiptExecutorTx = await proposerTx.wait(1)
log(`Succesfully set up address zero as executor in timelock contract: ${receiptExecutorTx.transactionHash}`)
//   const revokeTx = await timeLock.revokeRole(adminRole, deployer)
//   await revokeTx.wait(1)

  // Guess what? Now, anything the timelock wants to do has to go through the governance process!
}

export default setupGovenor
setupGovenor.tags = ["all", "setup-gov"]
