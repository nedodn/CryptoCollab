# CryptoCollab
Repository for the EthDev hackathon. Decentralized MIDI Composition Project

Hosted at https://nedodn.github.io/CryptoCollab/ and on the Rinkeby Test Network

Current Contract located at https://rinkeby.etherscan.io/address/0xadf7305bf5791e651fe534c4d8e43847e91ba667

To run (must have some Ethereum network running):

 1. Download project

 2. Install truffle: $npm install -g truffle
 
 3. Install project: $npm install
 
 4. Migrate Contracts: $truffle migrate
 
 5. Run dev server: $npm run dev

# How To Use

 1. Have a Metamask enable browser with an account on the Rinkeby Test Network
 
 2. Purchase notes (Current Price of 0.01 ETH)
 
 3. Place notes on the grid by clicking on a spot and confirming the transaction (May need to refresh page)
 
 4. Notes you have placed will show up as purple, while other notes will be black
 
 5. Remove notes you have placed by clicking on them and confirming the transaction
 
 6. Return unused notes for a refund
 
 7. Composing will end on a chosen date, for this demo it is Dec. 31 2017.
 
 ## Other Info
  1. The y-axis of the grid represents MIDI values 0-127, x-axis represents the note's place in the piece
