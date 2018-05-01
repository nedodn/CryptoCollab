'use strict'

import '../stylesheets/app.css'

import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import { default as Tone } from 'tone'
import { getNoteName } from './notes.js'

import { UI } from "./ui.js"

import notetoken_artifacts from '../../build/contracts/NoteToken.json'
import compositionpart_artifacts from '../../build/contracts/CompositionPart.json'

const NoteToken = contract(notetoken_artifacts)
const CompositionPart = contract(compositionpart_artifacts)

var accounts, account
var remoteNode
var PlacedEvents, RemovedEvents

var noteArray = []
var composerArray = []
var pitchStack = []
var placeStack = []

var place = 0
var start
var end
var stopped = true

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

      UI.setupHeader( accs );

      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }
    
      if (accs.length === 0) {
        return
      }
    
      accounts = accs
      account = accounts[0]
    })

    var EventsContract = web3.eth.contract(compositionpart_artifacts.abi)
    var EventsInstance = EventsContract.at('0x160bcb977cfb124fddac1f4879955887f228de35')
    PlacedEvents = EventsInstance.NotePlaced({fromBlock: '5529369', toBlock: 'latest'})
    RemovedEvents = EventsInstance.NoteRemoved({fromBlock: '5529369', toBlock: 'latest'})

    PlacedEvents.watch((error, event) => {
      if(!error) {
        let _composer = event.args.composer
        let _pitch = event.args.pitch.toNumber()
        let _place = event.args.place.toNumber()

      if (document.getElementById(_composer + _pitch.toString() + _place.toString() + 'place')) {
        return
      }

        noteArray[_pitch][_place] = true
        composerArray[_pitch][_place] = _composer

        if (_place >= start && _place <= end) {
          let id = _pitch.toString() + "#" + _place.toString()
          let cell = document.getElementById(id)
          if (account === _composer) {
           cell.style.backgroundColor = 'purple'
          }
          else {
           cell.style.backgroundColor = 'black'
          }
          cell.title = cell.title + ' Composer: ' + _composer
        }
        let feed = document.getElementById('feed-body')
        let elem = document.createElement('tr')
        let note = getNoteName(_pitch)
        elem.innerHTML = '<td>' + _composer + ' placed ' + note.name + ' at ' + _place.toString() + '</td>'
        elem.id = _composer + _pitch.toString() + _place.toString() + 'place'
        feed.appendChild(elem)
      }
    })

    RemovedEvents.watch((error, event) => {
      if(!error) {
        let _composer = event.args.composer
        let _pitch = event.args.pitch.toNumber()
        let _place = event.args.place.toNumber()

        if (document.getElementById(_composer + _pitch.toString() + _place.toString() + 'remove')) {
          return
        }

        noteArray[_pitch][_place] = false
        composerArray[_pitch][_place] = 0

        if (_place >= start && _place <= end) {
          let id = _pitch.toString() + "#" + _place.toString()
          let cell = document.getElementById(id)

          cell.style.backgroundColor = ''
          
          let x = cell.title.search('Composer')
          let newTitle = cell.title.substr(0, (x-1))
          cell.title = newTitle
        }

        let feed = document.getElementById('feed-body')
        let elem = document.createElement('tr')
        let note = getNoteName(_pitch)
        elem.innerHTML = '<td>' + _composer + ' removed ' + note.name + ' at ' + _place.toString() + '</td>'
        elem.id = _composer + _pitch.toString() + _place.toString() + 'remove'
        feed.appendChild(elem)
      }
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

    for (let i = 0; i < 128; i++) {
      for (let x = start; x < end; x++) {
        if (noteArray[i][x]) {
          let id = i + '#' + x
          let cell = document.getElementById(id)
          cell.style.backgroundColor = 'black'
          cell.title = cell.title + ' Composer: ' + composerArray[i][x]
        }
      }
    }

    let instance = await CompositionPart.deployed()
    let _notes = await instance.getPlacedNotes.call({ from: account })
    
    let pitches = _notes[0]
    let places = _notes[1]

    for (let i = 0; i < pitches.length; i++) {
      if (places[i] >= start && places[i] < end) {
        let id = pitches[i].toString() + '#' + places[i].toString()
        let cell = document.getElementById(id)
        cell.style.backgroundColor = 'purple'
      }
    }

    let placeText = document.getElementById('place')
    placeText.innerText = (place + 1).toString()
  },

  setStartAndEnd: function () {
    start = place * 100
    end = start + 100
  },

  clearStacks: function () {
    pitchStack = []
    placeStack = []
  },

  buildArray: async function () {
    let progress = document.getElementById('progress')

    if (!remoteNode) {
      CompositionPart.setProvider(readWeb3.currentProvider)
    }

    let instance = await CompositionPart.deployed()
   

    for (let i = 0; i < 128; i++) {
      progress.innerText = 'Getting line ' + i.toString() + ' of 127'
      let line = await instance.getNoteLine.call(i)
      noteArray[i] = line[0]
      composerArray[i] = line[1]

      for (let x = start; x < end; x++) {
        if (noteArray[i][x]) {
          let id = i + '#' + x
          let cell = document.getElementById(id)
          cell.style.backgroundColor = 'black'
          cell.title = cell.title + ' Composer: ' + line[1][x]
        }
      }
    }

    if (!remoteNode) {
      CompositionPart.setProvider(web3.currentProvider)
      instance = await CompositionPart.deployed()

      let _notes = await instance.getPlacedNotes.call({ from: account })
      let pitches = _notes[0]
      let places = _notes[1]
  
      for (let i = 0; i < pitches.length; i++) {
        if (places[i] >= start && places[i] < end) {
          let id = pitches[i].toString() + '#' + places[i].toString()
          let cell = document.getElementById(id)
          cell.style.backgroundColor = 'purple'
        }
      }
    }

    let placeText = document.getElementById('place')
    placeText.innerText = (place + 1).toString()
    progress.innerText = 'Composition synced'
  },

  buildTable: function () {
    let root = document.getElementById('comppart')
    let table = document.createElement('table')
    table.className = 'comptable'
    table.id = 'table'
    table.border = 1
    let tbody = document.createElement('tbody')
    let row, cell

    let col = document.createElement('col')
    tbody.appendChild(col)

    for (let i = 0; i < 100; i++) {
      col = document.createElement('col')
      col.id = start + i
      tbody.appendChild(col)
    }

    for (let i = 127; i >= 0; i--) {
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
        cell.addEventListener('mouseover', () => {
          col = document.getElementById(x.toString())
          col.style.backgroundColor = 'gray'
        })
        cell.addEventListener('mouseleave', () => {
          col = document.getElementById(x.toString())
          col.style.backgroundColor = ''
        })
        cell.title = 'Pitch: ' + noteName.name + ' Place: ' + (x)
        row.appendChild(cell)
      }
      tbody.appendChild(row)
    }

    table.appendChild(tbody)
    root.appendChild(table)
  },

  getNoteBalance: async function () {
    let balance = document.getElementById('balance')
    let notesLeft = document.getElementById('notesLeft')
    let instance
    if (!remoteNode) {
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
  let num = document.getElementById('purchase').value
  if (num == 0) {
    return
  }
  let price = num * 0.001

  let instance = await NoteToken.deployed()
  try {
    let res = await instance.purchaseNotes(num, { value: web3.toWei(price, 'ether'), from: account })
    console.log(res)
  } catch (e) {
    console.log(e)
  }
  App.getNoteBalance()
}

window.returnNotes = async function () {
  let num = document.getElementById('return').value
  if (num == 0) {
    return
  }

  let instance = await NoteToken.deployed()
  try {
    let res = await instance.returnNotes(num, { value: web3.toWei(price, 'ether'), from: account })
    console.log(res)
  } catch (e) {
    console.log(e)
  }
  App.getNoteBalance()
}

window.toggleNote = async function (id) {
  if (remoteNode) {
    return
  }

  let split = id.indexOf('#')
  let _pitch = id.substr(0, split)
  let _place = id.substr(split + 1)
  _pitch = Number(_pitch)
  _place = Number(_place)

  let cell = document.getElementById(id)

  if (cell.style.backgroundColor === 'black') {
    return
  }

  if (cell.style.backgroundColor === 'blue' || cell.style.backgroundColor === 'red') {
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
      cell.style.backgroundColor = ''
      noteArray[_pitch][_place] = false
    }
    return
  }
  else {
    let noteName = getNoteName(_pitch)
    let note = noteName.name
    if (note.indexOf('/') !== -1) {
      note = note.substr((note.indexOf('/') + 1))
    }

    synth.triggerAttackRelease(note, 0.5)

    if (pitchStack.length === 10) {
      return
    }

    if (cell.style.backgroundColor === 'purple') {
      noteArray[_pitch][_place] = false
      cell.style.backgroundColor = 'red'
    }
    else {
      noteArray[_pitch][_place] = true
      cell.style.backgroundColor = 'blue'
    }
    
    pitchStack.push(_pitch)
    placeStack.push(_place)
  }
}

window.removeNotes = async function () {
  if (pitchStack.length === 0) {
    return
  }
  let progress = document.getElementById('progress')
  progress.innerText = 'Removing Notes...'
  let res

  let instance = await CompositionPart.deployed()
  try {
    res = await instance.removeNotes(pitchStack, placeStack, pitchStack.length, { from: account })
  } catch (e) {
    console.log(e)
    progress.innerText = 'Composition Synced'
    return
  }
  if (res.receipt.status === '0x0') {
    progress.innerText = 'Something went wrong'
    setTimeout(() => { progress.innerText = 'Composition Synced' }, 3000)
  }
  else {
    progress.innerText = 'Composition Synced'
    App.clearStacks()
    App.getNoteBalance()
  }
  console.log(res)
}

window.placeNotes = async function () {
  let numNotes = pitchStack.length

  if (numNotes === 0) {
    return
  }
  
  let progress = document.getElementById('progress')
  progress.innerText = 'Placing Notes...'
  let res

  let instance = await CompositionPart.deployed()
  try {
    res = await instance.placeNotes(pitchStack, placeStack, numNotes, { from: account })
  } catch (e) {
    console.log(e)
    progress.innerText = 'Composition Synced'
    return
  }
  if (res.receipt.status === '0x0') {
    progress.innerText = 'Something went wrong'
    setTimeout(() => { progress.innerText = 'Composition Synced' }, 3000)
  }
  else {
    progress.innerText = 'Composition Synced'
    App.clearStacks()
    App.getNoteBalance()
  }
  console.log(res)
}

window.play = async function () {
  if (!stopped) {
    return
  }
  stopped = false
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  let from = document.getElementById('from').value
  let to = document.getElementById('to').value

  let tempo = document.getElementById('tempo').value
  let tempoInMs = 60000 / tempo

  let notes = []
  for (let i = (from - 1); i <= (to - 1); i++) {
    if (stopped) {
      return
    }
    let element = document.getElementById((i).toString())
    if (element) {
      element.style.backgroundColor = 'lightgray'
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

    if (element) {
      element.style.backgroundColor = 'white'
    }
  }
  stopped = true
}

window.loop = async function () {
  if (!stopped) {
    return
  }
  stopped = false
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  let from = document.getElementById('from').value
  let to = document.getElementById('to').value

  let tempo = document.getElementById('tempo').value
  let tempoInMs = 60000 / tempo

  let notes = []
  do {
    for (let i = (from - 1); i <= (to - 1); i++) {
      if (stopped) {
        return
      }

      let element = document.getElementById((i).toString())
      if (element) {
        element.style.backgroundColor = 'lightgray'
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
      if (element) {
        element.style.backgroundColor = 'white'
      }
    }
  } while (!stopped)
}

window.stop = function () {
  stopped = true
}

window.setInstrument = function () {
  let instrument = document.getElementById('instrument').value
  synth.dispose()

  if (instrument === 'Kalimba') {
    synth = new Tone.PolySynth(128, Tone.FMSynth).toMaster()

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
  }
  else if (instrument === 'Electric Cello') {
    synth = new Tone.PolySynth(128, Tone.FMSynth).toMaster()
    synth.set(
      {
        "harmonicity": 3.01,
        "modulationIndex": 14,
        "oscillator": {
            "type": "triangle"
        },
        "envelope": {
            "attack": 0.2,
            "decay": 0.3,
            "sustain": 0.4,
            "release": 1.2
        },
        "modulation" : {
            "type": "square"
        },
        "modulationEnvelope" : {
            "attack": 0.01,
            "decay": 0.5,
            "sustain": 0.5,
            "release": 0.1
        }
      }
    )
  }
  else if (instrument === 'Harmonics') {
    synth = new Tone.PolySynth(128, Tone.AMSynth).toMaster()
    synth.set(
      {
        "harmonicity": 3.999,
        "oscillator": {
            "type": "square"
        },
        "envelope": {
            "attack": 0.03,
            "decay": 0.3,
            "sustain": 0.7,
            "release": 0.8
        },
        "modulation" : {
            "volume" : 12,
            "type": "square6"
        },
        "modulationEnvelope" : {
            "attack": 2,
            "decay": 3,
            "sustain": 0.8,
            "release": 0.1
        }
      }
    )
  }
  else if (instrument === 'Pizzicato') {
    synth = new Tone.PolySynth(128, Tone.MonoSynth).toMaster()
    synth.set(
      {
        "oscillator": {
           "type": "sawtooth"
       },
       "filter": {
           "Q": 3,
           "type": "highpass",
           "rolloff": -12
       },
       "envelope": {
           "attack": 0.01,
           "decay": 0.3,
           "sustain": 0,
           "release": 0.9
       },
       "filterEnvelope": {
           "attack": 0.01,
           "decay": 0.1,
           "sustain": 0,
           "release": 0.1,
           "baseFrequency": 800,
           "octaves": -1.2
       }
      }
    )
  }
  else if (instrument ==='Wah') {
    synth = new Tone.PolySynth(128, Tone.MonoSynth).toMaster()
    synth.set(
      {
        "oscillator" : {
            "type" : "pwm",
            "modulationFrequency" : 1
        },
        "filter" : {
            "Q" : 6,
            "rolloff" : -24 
        },
        "envelope" : {
            "attack" : 0.025,
            "decay" : 0.3,
            "sustain" : 0.9,
            "release" : 2
        },
        "filterEnvelope" : {
            "attack" : 0.245,
            "decay" : 0.131,
            "sustain" : 0.5,
            "release" : 2,
            "baseFrequency" : 20,
            "octaves" : 7.2,
            "exponent" : 2
        }
      }
    )
  }
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
  if (place === 9) {
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
    window.readWeb3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/mXHEyD5OI3wXAnDE6uT4"))
    remoteNode = false
  } else {
    console.warn("Using web3 provided by remoteNode")
    // use remoteNode node for web3
    window.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/mXHEyD5OI3wXAnDE6uT4"))
    remoteNode = true
  }
  App.start()
})

window.addEventListener('keydown', (e) => {
  if (e.keyCode === 32) {
    e.preventDefault()
    if (stopped) {
      window.play()
    }
    else {
      window.stop()
    }
  }
})
