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

contract('NoteToken', (accounts) => {
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
  })

  it('cannot set composition address from someone who is not the owner or after it has been set', async () => {
    await noteToken.setCompositionAddress(compositionPart.address, { from: beethoven }).should.be.rejected
    await noteToken.setCompositionAddress(compositionPart.address, { from: bach }).should.be.fulfilled
    await noteToken.setCompositionAddress(compositionPart.address, { from: bach }).should.be.rejected
  })

  it('can allow note purchases of 100 or less as long as there are tokens left, the price is right and it is before endTime', async () => {
    await noteToken.purchaseNotes(1, { value: ether(0.001) }).should.be.fulfilled
    await noteToken.purchaseNotes(100, { value: ether(0.1) }).should.be.fulfilled
    await noteToken.purchaseNotes(101, { value: ether(0.101) }).should.be.rejected
    await noteToken.purchaseNotes(95, { value: ether(0.096) }).should.be.rejected

    for (let i = 0; i < 48; i++) {
        await noteToken.purchaseNotes(100, { value: ether(0.1) }).should.be.fulfilled
    }
    await noteToken.purchaseNotes(99, { value: ether(0.099) }).should.be.fulfilled
    await noteToken.purchaseNotes(1, { value: ether(0.001) }).should.be.rejected

    await increaseTimeTo(endTime + duration.seconds(1))
    await noteToken.purchaseNotes(1, { value: ether(0.001) }).should.be.rejected
  })

  it('can refund notes as long as the sender has notes and it is before endTime', async () => {
    await noteToken.purchaseNotes(1, { value: ether(0.001), from: beethoven }).should.be.fulfilled
    //cannot refund more notes than owned
    await noteToken.returnNotes(2, { from: beethoven }).should.be.rejected
    await noteToken.returnNotes(1, { from: beethoven }).should.be.fulfilled
    await noteToken.returnNotes(1, { from: beethoven }).should.be.rejected

    await noteToken.purchaseNotes(1, { value: ether(0.001), from: beethoven }).should.be.fulfilled
    await noteToken.transfer(bach, 1, { from: beethoven }).should.be.fulfilled
    await noteToken.returnNotes(1, { from: beethoven }).should.be.rejected
    await noteToken.returnNotes(1, { from: bach }).should.be.fulfilled

    await noteToken.purchaseNotes(1, { value: ether(0.001), from: beethoven }).should.be.fulfilled
    await increaseTimeTo(endTime + duration.seconds(1))
    await noteToken.returnNotes(1, { value: ether(0.001) }).should.be.rejected
  })

  it('can only call transferToComposition() from the composition address after it has been set', async () => {
    await noteToken.purchaseNotes(2, { value: ether(0.002), from: beethoven }).should.be.fulfilled
    await compositionPart.placeNotes([1], [1], 1, { from: beethoven }).should.be.rejected
    
    await noteToken.setCompositionAddress(compositionPart.address, { from: bach }).should.be.fulfilled
    await noteToken.transferToComposition(beethoven, 1, { from: beethoven }).should.be.rejected
    await compositionPart.placeNotes([1], [1], 1, { from: beethoven }).should.be.fulfilled
  })

  it('cannot selfdestruct until after endTime', async () => {
    await noteToken.end().should.be.rejected
    await increaseTimeTo(endTime + duration.seconds(1))
    await noteToken.end().should.be.fulfilled
  })
})