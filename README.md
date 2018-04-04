# CryptoCollab
Decentralized MIDI Composition Project

To run:

 1. Download project

 2. Install truffle: $npm install -g truffle
 
 3. Install project: $npm install
 
 4. Start a local blockchain running on port 8545 (Ganache or testrpc)
 
 5. Migrate Contracts: $truffle migrate --reset
 
 6. Run dev server: $npm run dev

# How To Use

Purchase notes, current price of 0.001 ETH

Select notes to place (up to 10 at a time)

Click the add notes button and confirm the transaction

Once the transaction is complete, rebuild the array by pressing the rebuild button

Notes should be added, your notes show up as purple

Remove your notes by selecting them and clicking the remove notes button (up to 10 at a time)

Press Play!

 
 ## Other Info
  1. The y-axis of the grid represents MIDI values 0-127, x-axis represents the note's place in the piece
