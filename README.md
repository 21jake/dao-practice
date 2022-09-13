### On-Chain Governance Boilerplate

Here is the rundown of what the test suite does. 

1. Deploy a mintable ERC20 token to govern the DAO.
2. Deploy a Timelock contract to give a buffer between executing proposals (The timelock is the contract that will handle all the money, ownerships, etc)
3. Deploy the Governence contract (The Governance contract is in charge of proposals and such, but the Timelock executes)
4. Set up the token contract so as the minting will be done through governance process (MINTER will be assigned to Timelock contract address).
5. Propose a new amount to be minted to a specific address.
6. Vote on that proposal.
7. Queue the proposal to be executed.
8. Execute the proposal.


You can do it all manually on your own local network:

1. Setup local blockchain 
```
yarn hardhat node
```

2. Open a new terminal, propose a new value to be minted to a specific address

```
yarn hardhat run scripts/propose.ts --network localhost
```

3. Vote on that proposal

```
yarn hardhat run scripts/vote.ts --network localhost
```

4. Queue & Execute proposal

```
yarn hardhat run scripts/queue-and-execute.ts --network localhost
```

Greatly appreciate the guidance from [PatrickAlphaC](https://github.com/PatrickAlphaC)
