'use strict'

import '../stylesheets/app.css'

import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import { default as Tone } from 'tone'
import { getNoteName } from './notes.js'

import notetoken_artifacts from '../../build/contracts/NoteToken.json'
import compositionpart_artifacts from '../../build/contracts/CompositionPart.json'

var NoteToken = contract(notetoken_artifacts)
var CompositionPart = contract(compositionpart_artifacts)

var accounts, account

var noteArray = []
var pitchStack = []
var placeStack = []

var synth = new Tone.PolySynth(128, Tone.MonoSynth).toMaster()

window.App = {
  start: function () {
    var self = this

    NoteToken.setProvider(web3.currentProvider)
    CompositionPart.setProvider(web3.currentProvider)

    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }
    
      if (accs.length === 0) {
        alert('Could not get any accounts! Make sure your Ethereum client is configured correctly.')
        return
      }
    
      accounts = accs
      account = accounts[0]
    })

    self.build()
  },

  build: function () {
    self.buildArray()
    self.buildTable()
    self.getNoteBalance()
  },

  buildArray: async function () {
    let instance = await CompositionPart.deployed()

    for (let i = 0; i < 128; i++) {
      let line = await instance.getNoteLine.call(i)
      noteArray[i] = line

      for (let x = 0; x < 100; x++) {
        if (noteArray[i][x]) {
          let id = i + '#' + x
          let cell = document.getElementById(id)
          cell.style.backgroundColor = 'black'
        }
      }
    }

    let _notes = await instance.getPlacedNotes.call({ from: account })
    let pitches = _notes[0]
    let places = _notes[1]

    for (let i = 0; i < pitches.length; i++) {
      let id = pitches[i].toString() + '#' + places[i].toString()
      let cell = document.getElementById(id)
      cell.style.backgroundColor = 'purple'
    }

    let play = document.getElementById('play')
    play.style.display = 'inline'
  },

  buildTable: function () {
    var root = document.getElementById('comppart')
    var table = document.createElement('table')
    table.className = 'comptable'
    table.border = 1
    var tbody = document.createElement('tbody')
    var row, cell

    for (let i = 0; i < 128; i++) {
      row = document.createElement('tr')
      cell = document.createElement('td')
      cell.id = 'first'
      let noteName = getNoteName(i)
      cell.innerText = noteName.name

      let color

      if (noteName.color) {
        color = 'white'
      }
      else {
        color = 'gray'
      }

      cell.style.backgroundColor = color
      row.appendChild(cell)

      for (let x = 0; x < 100; x++) {
        cell = document.createElement('td')
        cell.className = 'note'
        cell.id = i + '#' + x
        cell.setAttribute('onclick', "toggleNote('" + cell.id + "')")
        cell.title = 'Pitch: ' + noteName.name + ' Place: ' + (x + 1)
        row.appendChild(cell)
      }
      tbody.appendChild(row)
    }

    table.appendChild(tbody)
    root.appendChild(table)
  },

  getNoteBalance: async function () {
    var balance = document.getElementById('balance')
    let instance = await NoteToken.deployed()
    let _balance = await instance.balanceOf.call(account, { from: account })
    balance.innerText = _balance.toNumber() + ' Notes Owned'
  },
}

window.purchaseNotes = async function () {
  var num = document.getElementById('purchase').value
  let price = num * 0.001

  let instance = await NoteToken.deployed()
  let res = await instance.purchaseNotes(num, { value: web3.toWei(price, 'ether'), from: account, gas: 150000 })

  console.log(res)
}

window.returnNotes = async function () {
  var num = document.getElementById('return')

  let instance = await NoteToken.deployed()
  let res = await instance.returnNotes(num, { gas: 100000, from: account })
}

window.toggleNote = function (id) {
  var split = id.indexOf('#')

  var _pitch = id.substr(0, split)
  var _place = id.substr(split + 1)

  _pitch = Number(_pitch)
  _place = Number(_place)

  var cell = document.getElementById(id)

  if (cell.style.backgroundColor === 'black') {
    return
  }

  if (cell.style.backgroundColor === 'blue') {
    let index

    for (let i = 0; i < pitchStack.length; i++) {
      if (pitchStack[i] === _pitch && placeStack[i] === _place) {
        index = i
        break
      }
    }

    pitchStack.splice(index, 1)
    placeStack.splice(index, 1)

    CompositionPart.deployed().then(function (instance) {
      instance.getNoteOwner(_pitch, _place, { from: account }).then(function (owner) {
        if (owner === account) {
          cell.style.backgroundColor = 'purple'
        }
        else {
          cell.style.backgroundColor = 'white'
        }
        return
      })
    })
  }
  else {
    var noteName = getNoteName(_pitch)
    var note = noteName.name
    if (note.indexOf('/') !== -1) {
      note = note.substr((note.indexOf('/') + 1))
    }

    console.log(note)

    synth.triggerAttackRelease(note, 0.5)

    if (pitchStack.length === 10) {
      return
    }

    noteArray[_pitch][_place] = true

    cell.style.backgroundColor = 'blue'
    pitchStack.push(_pitch)
    placeStack.push(_place)
  }
}

window.removeNotes = async function () {
  let instance = CompositionPart.deployed()
  let res = instance.removeNotes(pitchStack, placeStack, pitchStack.length, { from: account, gas: 1500000 })
}

window.placeNotes = async function () {
  var numNotes = pitchStack.length

  let instance = await NoteToken.deployed()
  let compInstance = await CompositionPart.deployed()

  let res1 = await instance.approve(compInstance.address, numNotes, { from: account })
  let res2 = await compInstance.placeNotes(pitchStack, placeStack, numNotes, { from: account, gas: 1500000 })
}

window.play = async function () {
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  var from = document.getElementById('from').value
  var to = document.getElementById('to').value

  var tempo = document.getElementById('tempo').value
  var tempoInMs = 60000 / tempo

  var notes = []
  for (let i = (from - 1); i <= (to - 1); i++) {
    for (let x = 0; x < 128; x++) {
      if (noteArray[x][i]) {
        let note = getNoteName(x)
        let pitch = note.name
        if (pitch.indexOf('/') !== -1) {
          pitch = pitch.substr((pitch.indexOf('/') + 1))
        }
        notes.push(pitch)
      }
    }
    synth.triggerAttackRelease(notes, 0.5)
    notes = []
    await sleep(tempoInMs)
  }
}

window.refreshComp = function () {
  App.build()
}

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn('Using web3 detected from external source.')
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask")
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  }
  App.start()
})
