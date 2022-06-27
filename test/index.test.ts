import hardhat, { deployments, ethers } from "hardhat"
import { assert, expect } from "chai"

import { moveBlocks, moveTime, tokenAmountBN } from "../utils"
import { GovernorContract, GovernanceToken, TimeLock } from "../typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { AMOUNT, FUNC, PROPOSAL_DESCRIPTION, VOTING_DELAY, VOTING_PERIOD, MIN_DELAY } from "../constants"

describe("Governor Flow", async () => {
  let governor: GovernorContract
  let governanceToken: GovernanceToken
  let timeLock: TimeLock
  let deployer: SignerWithAddress, recipient: SignerWithAddress

  const voteWay = 1 // for
  const reason = "Mint 1_000 tokens for the development team";
  const mintAmount = tokenAmountBN(1_000)

  
  beforeEach(async () => {
    ;[deployer, recipient] = await ethers.getSigners()

    await deployments.fixture(["all"])
    governor = await ethers.getContract("GovernorContract")
    timeLock = await ethers.getContract("TimeLock")
    governanceToken = await ethers.getContract("GovernanceToken")
  })

  it("can only mint token changed through governance", async () => {
    await expect(governanceToken.connect(deployer).mint(recipient.address, AMOUNT)).to.be
      .reverted
  })

    it("proposes, votes, waits, queues, and then executes", async () => {
      const recipientBalanceBefore = await governanceToken.balanceOf(recipient.address);

      // Propose
      const encodedFunctionCall = governanceToken.interface.encodeFunctionData(FUNC, [recipient.address, AMOUNT])
      const proposeTx = await governor.propose(
        [governanceToken.address],
        [0],
        [encodedFunctionCall],
        PROPOSAL_DESCRIPTION
      )

      const proposeReceipt = await proposeTx.wait(1)
      const proposalId = proposeReceipt.events![0].args!.proposalId;
      
      let proposalState = await governor.state(proposalId)
      console.log(`Current Proposal State: ${proposalState}`)
      
      await moveBlocks(VOTING_DELAY + 1)

      // Vote
      const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
      await voteTx.wait(1)
      proposalState = await governor.state(proposalId)
      assert.equal(proposalState.toString(), "1")
      console.log(`Current Proposal State: ${proposalState}`)

      // Waiting to the end of voting period
      await moveBlocks(VOTING_PERIOD + 1)

      // Queuing the transaction
      const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION)
      const queueTx = await governor.queue([governanceToken.address], [0], [encodedFunctionCall], descriptionHash)
      await queueTx.wait(1)
      await moveTime(MIN_DELAY + 1)
      await moveBlocks(1)

      proposalState = await governor.state(proposalId)
      console.log(`Current Proposal State: ${proposalState}`)

      console.log("Executing...")

      // Executing the transaction
      const exTx = await governor.execute([governanceToken.address], [0], [encodedFunctionCall], descriptionHash)
      await exTx.wait(1);

      const recipientBalanceAfter = await governanceToken.balanceOf(recipient.address);
      expect(recipientBalanceBefore).to.equal(recipientBalanceAfter.sub(AMOUNT));
    })
})
