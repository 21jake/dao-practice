import * as fs from "fs"
import { network, ethers } from "hardhat"
import { developmentChains, VOTING_PERIOD } from "../constants"
import { moveBlocks } from "../utils"


const proposalId = "31919211290507555755122575281310779505984151890060834540086466724183748876463"

async function main(proposalId: string) {
  // You could swap this out for the ID you want to use too
  
  // 0 = Against, 1 = For, 2 = Abstain for this example
  const voteWay = 1
  const reason = "For the team"
  await vote(proposalId, voteWay, reason);


  const governor = await ethers.getContract("GovernorContract")
  const proposalState = await governor.state(proposalId)
  console.log(`Current Proposal State: ${proposalState}`)
}

// 0 = Against, 1 = For, 2 = Abstain for this example
export async function vote(proposalId: string, voteWay: number, reason: string) {
  console.log("Voting...")
  const governor = await ethers.getContract("GovernorContract")
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
  const voteTxReceipt = await voteTx.wait(1)
  console.log(voteTxReceipt.events[0].args.reason)
  const proposalState = await governor.state(proposalId)
  console.log(`Current Proposal State: ${proposalState}`)
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1)
  }
}

main(proposalId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
