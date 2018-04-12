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
var infura;

var noteArray = []
var pitchStack = []
var placeStack = []

var place = 0
var start
var end
var stopped

var synth = new Tone.PolySynth(128, Tone.FMSynth).toMaster()
// Kalimba settings
synth.set(
  {
    "harmonicity":8,
    "modulationIndex": 2,
    "oscillator" : {
        "type": "sine"
    },
    "envelope": {
        "attack": 0.001,
        "decay": 2,
        "sustain": 0.1,
        "release": 2
    },
    "modulation" : {
        "type" : "square"
    },
    "modulationEnvelope" : {
        "attack": 0.002,
        "decay": 0.2,
        "sustain": 0,
        "release": 0.2
    }
  }
)

window.App = {
  start: function () {
    NoteToken.setProvider(web3.currentProvider)
    CompositionPart.setProvider(web3.currentProvider)

    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }
    
      if (accs.length === 0) {
        alert("It looks like you don't have an Ethereum client set up. You can still listen to the piece, thanks to Infura!")
        return
      }
    
      accounts = accs
      account = accounts[0]
    })

    this.build()
  },

  build: function () {

    this.setStartAndEnd()
    this.clearStacks()
    this.buildArray()
    this.buildTable()
    this.getNoteBalance()
  },

  movePlace: async function () {
    this.setStartAndEnd()
    this.clearStacks()
    this.buildTable()

    let instance = await CompositionPart.deployed()

    for (let i = 0; i < 128; i++) {
      for (let x = start; x < end; x++) {
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
      if (places[i] >= start && places[i] <= end) {
        let id = pitches[i].toString() + '#' + places[i].toString()
        let cell = document.getElementById(id)
        cell.style.backgroundColor = 'purple'
      }
    }

    let placeText = document.getElementById('place')
    placeText.innerText = (place + 1).toString()
  },

  setStartAndEnd: function () {
    if (place === 0) {
      start = 0
      end = 100
    }
    else if (place === 1) {
      start = 100
      end = 200
    }
    else if (place === 2) {
      start = 200
      end = 300
    }
    else if (place === 3) {
      start = 300
      end = 400
    }
    else if (place === 4) {
      start = 400
      end = 500
    }
  },

  clearStacks: function () {
    pitchStack = []
    placeStack = []
  },

  buildArray: async function () {
    let progress = document.getElementById('progress')

    if (!infura) {
      CompositionPart.setProvider(readWeb3.currentProvider)
    }
    let instance = await CompositionPart.deployed()

    for (let i = 0; i < 128; i++) {
      progress.innerText = 'Getting line ' + i.toString() + ' of 127'
      let line = await instance.getNoteLine.call(i)
      noteArray[i] = line

      for (let x = start; x < end; x++) {
        if (noteArray[i][x]) {
          let id = i + '#' + x
          let cell = document.getElementById(id)
          cell.style.backgroundColor = 'black'
        }
      }
    }

    if (!infura) {
      CompositionPart.setProvider(web3.currentProvider)
      instance = await CompositionPart.deployed()
    }


    let _notes = await instance.getPlacedNotes.call({ from: account })
    let pitches = _notes[0]
    let places = _notes[1]

    for (let i = 0; i < pitches.length; i++) {
      if (places[i] >= start && places[i] <= end) {
        let id = pitches[i].toString() + '#' + places[i].toString()
        let cell = document.getElementById(id)
        cell.style.backgroundColor = 'purple'
      }
    }

    let placeText = document.getElementById('place')
    placeText.innerText = (place + 1).toString()
  },

  buildTable: function () {
    var root = document.getElementById('comppart')
    var table = document.createElement('table')
    table.className = 'comptable'
    table.id = 'table'
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

      for (let x = start; x < end; x++) {
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
    var notesLeft = document.getElementById('notesLeft')
    let instance
    if (!infura) {
      instance = await NoteToken.deployed()
      let _balance = await instance.balanceOf.call(account, { from: account })
      balance.innerText = 'You own ' + _balance.toNumber() + ' Notes'
    }
    else {
      instance = await NoteToken.deployed()
    }
    
    let _notesLeft = await instance.tokensLeft()
    notesLeft.innerText = _notesLeft + ' Notes Left'
  },
}

window.purchaseNotes = async function () {
  var num = document.getElementById('purchase').value
  let price = num * 0.001

  let instance = await NoteToken.deployed()
  let res = await instance.purchaseNotes(num, { value: web3.toWei(price, 'ether'), from: account, gas: 150000 })
  
  App.getNoteBalance()
  console.log(res)
}

window.returnNotes = async function () {
  var num = document.getElementById('return')

  let instance = await NoteToken.deployed()
  let res = await instance.returnNotes(num, { gas: 100000, from: account })
    
  App.getNoteBalance()
  console.log(res)
}

window.toggleNote = async function (id) {
  if (infura) {
    return
  }

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

    let instance = await CompositionPart.deployed()
    let owner = await instance.getNoteOwner(_pitch, _place, { from: account })
    
    if (owner === account) {
      cell.style.backgroundColor = 'purple'
      noteArray[_pitch][_place] = true      
    }
    else {
      cell.style.backgroundColor = 'white'
      noteArray[_pitch][_place] = false
    }
    return
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

    if (cell.style.backgroundColor === 'purple') {
      noteArray[_pitch][_place] = false
    }
    else {
      noteArray[_pitch][_place] = true
    }
    

    cell.style.backgroundColor = 'blue'
    pitchStack.push(_pitch)
    placeStack.push(_place)
  }
}

window.removeNotes = async function () {
  let instance = await CompositionPart.deployed()
  let res = await instance.removeNotes(pitchStack, placeStack, pitchStack.length, { from: account, gas: 1500000 })
    
  rebuild()
  console.log(res)
}

window.placeNotes = async function () {
  var numNotes = pitchStack.length

  let instance = await CompositionPart.deployed()

  let res = await instance.placeNotes(pitchStack, placeStack, numNotes, { from: account, gas: 1500000 })
  
  rebuild()
  console.log(res)
}

window.play = async function () {
  stopped = false
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  var from = document.getElementById('from').value
  var to = document.getElementById('to').value

  var tempo = document.getElementById('tempo').value
  var tempoInMs = 60000 / tempo

  var notes = []
  for (let i = (from - 1); i <= (to - 1); i++) {
    if (stopped) {
      return
    }
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

window.stop = function () {
  stopped = true
}

window.back = async function () {
  if (place === 0) {
    return
  }

  let table = document.getElementById('table')
  table.parentNode.removeChild(table)

  place--
  App.movePlace()
}

window.forward = function () {
  if (place === 4) {
    return
  }

  let table = document.getElementById('table')
  table.parentNode.removeChild(table)

  place++
  App.movePlace()
}

window.rebuild = function () {
  let table = document.getElementById('table')
  table.parentNode.removeChild(table)
  
  App.build()
}

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn('Using web3 detected from external source.')
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
    window.readWeb3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/mXHEyD5OI3wXAnDE6uT4"))
    infura = false
  } else {
    console.warn("Using web3 provided by Infura")
    // use Infura node for web3
    window.web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/mXHEyD5OI3wXAnDE6uT4"))
    infura = true
  }
  App.start()
})
