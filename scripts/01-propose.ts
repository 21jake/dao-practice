import hardhat, { ethers, network } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, VOTING_DELAY, FUNC, PROPOSAL_DESCRIPTION, AMOUNT } from "../constants"
import { deployments } from "hardhat"
import { moveBlocks } from "../utils"
import { GovernorContract } from "../typechain/GovernorContract"
import { GovernanceToken } from "../typechain/GovernanceToken"
import { BigNumberish } from "ethers"

export async function propose(args: [string, BigNumberish], functionToCall: string, proposalDescription: string) {
  const governor: GovernorContract = await ethers.getContract("GovernorContract")
  const governanceToken: GovernanceToken = await ethers.getContract("GovernanceToken")
  const encodedFunctionCall = governanceToken.interface.encodeFunctionData("mint", args)

  console.log(`Proposing ${functionToCall} on ${governanceToken.address} with ${args}`)
  console.log(`Proposal Description:\n  ${proposalDescription}`)

  const proposeTx = await governor.propose(
    [governanceToken.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  )
  // If working on a development chain, we will push forward till we get to the voting period.
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1)
  }
  const proposeReceipt = await proposeTx.wait(1)

  const proposalId = proposeReceipt.events![0].args!.proposalId

  console.log(`Proposed with proposal ID:\n  ${proposalId}`)

  const proposalState = await governor.state(proposalId)
  const proposalSnapShot = await governor.proposalSnapshot(proposalId)
  const proposalDeadline = await governor.proposalDeadline(proposalId)

  // The state of the proposal. 1 is not passed. 0 is passed.
  console.log(`Current Proposal State: ${proposalState}`)
  // What block # the proposal was snapshot
  console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
  // The block number the proposal voting expires
  console.log(`Current Proposal Deadline: ${proposalDeadline}`)
}

const main = async function name() {
  const { getNamedAccounts } = hardhat;
  const { developmentTeam } = await getNamedAccounts();
  await propose([developmentTeam, AMOUNT], FUNC, PROPOSAL_DESCRIPTION);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })


