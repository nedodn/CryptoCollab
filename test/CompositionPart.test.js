require('babel-polyfill');

import getAccounts from './helpers/getAccounts'
import latestTime from './helpers/latestTime'
import { increaseTimeTo, duration } from './helpers/increaseTime'
import ether from './helpers/ether';
const NoteToken = artifacts.require('NoteToken.sol')
const CompositionPart = artifacts.require('CompositionPart.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('CompositionPart', (accounts) => {
    let bach, beethoven
    let endTime
    let noteToken, compositionPart

  beforeEach(async () => {
    const accounts = await getAccounts(web3)
    bach = accounts[0]
    beethoven = accounts[1]
    endTime = latestTime() + duration.days(7) 

    //bach is the owner
    noteToken = await NoteToken.new(endTime, { from: bach })
    compositionPart = await CompositionPart.new(endTime, noteToken.address)
    await noteToken.setCompositionAddress(compositionPart.address)
  })

  it('can place valid notes before endTime', async () => {
    await noteToken.purchaseNotes(10, { value: ether(0.01), from: beethoven }).should.be.fulfilled
    //can place valid note
    await compositionPart.placeNotes([1], [1], 1, { from: beethoven }).should.be.fulfilled
    //can't place invalid note due to pitch
    await compositionPart.placeNotes([128], [1], 1, { from: beethoven }).should.be.rejected
    //can't place invalid note due to place
    await compositionPart.placeNotes([1], [1000], 1, { from: beethoven }).should.be.rejected
    //can't place note without a note token
    await compositionPart.placeNotes([1], [2], 1, { from: bach }).should.be.rejected

    await noteToken.purchaseNotes(30, { value: ether(0.03), from: bach }).should.be.fulfilled
    //can place note with token
    await compositionPart.placeNotes([1], [2], 1, { from: bach }).should.be.fulfilled
    //can't place a note where there already is one
    await compositionPart.placeNotes([1], [1], 1, { from: bach }).should.be.rejected
    //arrays must be same length
    await compositionPart.placeNotes([1], [1, 1], 1, { from: bach }).should.be.rejected
    //can place 10 notes
    await compositionPart.placeNotes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [3, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10, { from: bach }).should.be.fulfilled
    //can't place > 10 notes
    await compositionPart.placeNotes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 11, { from: bach }).should.be.rejected

    //cannot place notes after endTime
    await increaseTimeTo(endTime + duration.seconds(1))
    await compositionPart.placeNotes([1], [3], 1, { from: beethoven }).should.be.rejected
  })

  it('can remove valid notes before endTime', async () => {
    await noteToken.purchaseNotes(30, { value: ether(0.03), from: beethoven }).should.be.fulfilled
    await compositionPart.placeNotes([1], [1], 1, { from: beethoven }).should.be.fulfilled
    //remove valid placed note
    await compositionPart.removeNotes([1], [1], 1, { from: beethoven }).should.be.fulfilled
    //cannot remove nonexistent note
    await compositionPart.removeNotes([1], [1], 1, { from: beethoven }).should.be.rejected

    await compositionPart.placeNotes([1], [1], 1, { from: beethoven }).should.be.fulfilled
    //cannot remove someone else's note
    await compositionPart.removeNotes([1], [1], 1, { from: bach }).should.be.rejected
    
    await compositionPart.placeNotes([1], [7], 1, { from: beethoven }).should.be.fulfilled

    await compositionPart.placeNotes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [3, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10, { from: beethoven }).should.be.fulfilled
    await compositionPart.placeNotes([11], [11], 1, { from: beethoven }).should.be.fulfilled
    //can't remove more than 10 notes at a time
    await compositionPart.removeNotes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [3, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 11, { from: beethoven }).should.be.rejected
    //can remove multiple notes up to 10
    await compositionPart.removeNotes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [3, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10, { from: beethoven }).should.be.fulfilled

    await compositionPart.placeNotes([1], [5], 1, { from: beethoven }).should.be.fulfilled
    //cannot remove notes after endTime
    await increaseTimeTo(endTime + duration.seconds(1))
    await compositionPart.removeNotes([1], [5], 1, { from: beethoven }).should.be.rejected
  })
})