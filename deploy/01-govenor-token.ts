import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from '../constants';
import { ethers } from "hardhat"
import { Signer } from "ethers";
import verify from "../utils";

const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------")
  log("Deploying GovernanceToken and waiting for confirmations...")
  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    args: [],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })

  log(`GovernanceToken at ${governanceToken.address}`);

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(governanceToken.address, [])
  }

  await delegate(governanceToken.address, deployer, deployer);

};

const delegate = async (governanceTokenAddress: string, delegatedAccount: string, signer: Signer | string ) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress, signer)
    const transactionResponse = await governanceToken.delegate(delegatedAccount)
    
    await transactionResponse.wait(1)
    console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`)
}

export default deployGovernanceToken;
deployGovernanceToken.tags = ["all", "token"];
// hh --network rinkeby deploy --tags token
