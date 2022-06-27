import { BigNumberish } from "ethers";
import hardhat, { ethers, network } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { AMOUNT, developmentChains, FUNC, MIN_DELAY, PROPOSAL_DESCRIPTION } from "../constants";
import { GovernanceToken, GovernorContract } from "../typechain";
import { moveTime, moveBlocks } from "../utils";


export async function queueAndExecute(hre: HardhatRuntimeEnvironment) {

    const {developmentTeam} = await hre.getNamedAccounts();
  const args : [string, BigNumberish]= [developmentTeam, AMOUNT] 
  const governanceToken: GovernanceToken  = await ethers.getContract("GovernanceToken");

  const developmentBalance_1 = await governanceToken.balanceOf(developmentTeam); 
  const totalSupply_1 = await governanceToken.totalSupply(); 

  console.log(`development team balance 1: ${developmentBalance_1}`);
  console.log(`total supply 1: ${totalSupply_1}`);
  
  const encodedFunctionCall = governanceToken.interface.encodeFunctionData(FUNC, args)

  console.log(encodedFunctionCall, 'encodedFunctionCall')
  const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
  // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)

  const governor: GovernorContract = await ethers.getContract("GovernorContract")
  console.log("Queueing...")
  const queueTx = await governor.queue([governanceToken.address], [0], [encodedFunctionCall], descriptionHash)
  await queueTx.wait(1)

  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1)
    await moveBlocks(1)
  }

  console.log("Executing...")
  // this will fail on a testnet because you need to wait for the MIN_DELAY!
  const executeTx = await governor.execute(
    [governanceToken.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  )
  const receipt = await executeTx.wait(1)
  console.log(`execution success: ${receipt.transactionHash}`);

  const developmentBalance_2 = await governanceToken.balanceOf(developmentTeam); 
  const totalSupply_2 = await governanceToken.totalSupply(); 

  console.log(`development team balance 1: ${developmentBalance_2}`);
  console.log(`total supply 1: ${totalSupply_2}`);
  
}

queueAndExecute(hardhat)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
