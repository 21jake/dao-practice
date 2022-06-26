### On-Chain Governance Example

Here is the rundown of what the test suite does. 

1. Deploy an ERC20 token to govern the DAO.
2. Deploy a Timelock contract to give a buffer between executing proposals (The timelock is the contract that will handle all the money, ownerships, etc)
3. Deploy the Governence contract (The Governance contract is in charge of proposals and such, but the Timelock executes)
4. Deploy a simple Box contract, which will be owned by the governance process(aka, timelock contract).
5. Propose a new value to be added to the Box contract.
6. Vote on that proposal.
7. Queue the proposal to be executed.
8. Execute the proposal.


You can do it all manually on your own local network:

1. Setup local blockchain 
```
yarn hardhat node
```

2. Open a new terminal, propose a new value to be added to the Box contract

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


