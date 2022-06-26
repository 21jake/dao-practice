import { tokenAmountBN } from './utils'

export interface networkConfigItem {
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
  // Default one is ETH/USD contract on Kovan
  kovan: {
    blockConfirmations: 6,
  },
  rinkeby: {
    blockConfirmations: 6,
  },
};

export const developmentChains = ["hardhat", "localhost"];
export const MIN_DELAY = 60 // 1 minute - after a vote passes, investor have 1 to react before the execution phase

// Governor config
export const QUORUM_PERCENTAGE = 4 // Need 4% of voters to pass
export const VOTING_PERIOD = 40 // How many blocks long for a voting
export const VOTING_DELAY = 1 // 1 Block - How many blocks till a proposal vote becomes active

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"

// Inputs to be encoded
export const AMOUNT = tokenAmountBN(100);
export const FUNC = "mint"
export const PROPOSAL_DESCRIPTION = `Very`