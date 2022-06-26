import { BigNumber, ethers } from "ethers"
import { network, run } from "hardhat"

export const tokenAmountBN = (input: number) => {
  return BigNumber.from(input).mul(BigNumber.from(10).pow(18))
}

export const convertBnToDecimal = (input: BigNumber) => {
  return ethers.utils.formatEther(input.toString())
}
export const convertDecimalToBn = (input: string) => {
  const sanitizedInput = input.replace(/[^\d.-]/g, "") //https://stackoverflow.com/questions/1862130/strip-all-non-numeric-characters-from-string-in-javascript
  return ethers.utils.parseUnits(sanitizedInput)
}

export async function moveBlocks(amount: number) {
  console.log("Moving blocks...")
  for (let index = 0; index < amount; index++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    })
  }
  console.log(`Moved ${amount} blocks`)
}

export async function moveTime(amount: number) {
  console.log("Moving blocks...")
  await network.provider.send("evm_increaseTime", [amount])

  console.log(`Moved forward in time ${amount} seconds`)
}

const verify = async (contractAddress: string, args: any[]) => {
  console.log("Verifying contract...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
      contract: "contracts/Timelock.sol:TimeLock"
    })
    console.log(`Successully verified ${contractAddress}`)
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!")
    } else {
      console.log(e)
    }
  }
}

export default verify
