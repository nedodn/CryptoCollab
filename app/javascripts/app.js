// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import opus_artifacts from '../../build/contracts/Opus.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Opus = contract(opus_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the Opus abstraction for Use.
    Opus.setProvider(web3.currentProvider);

    self.buildTable();
    self.getComp();
    self.getNotes();
    self.getPlacedNotes();
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  buildTable: function() {
    var self = this;
    
    $("#tableLabel").html("");
    
    $("#tableLabel").append("<th>Pitch</th>");
    for(let i = 0; i < 100; i++) {
      $("#tableLabel").append("<th>Note: " + (i + 1) + " </th>");
    }

    let line = "";
    
    for(let i = 0; i < 128; i++) {
      line = line + "<tr><td>" + (127- i) + "</td>";
      for(let x = 0; x < 100; x++) {
       line = line + "<td id='" + i.toString() + "note" + x.toString() + "'onclick='toggleNote(this)'>   </td>";
      }
      line = line + "</tr>";
    }

    $("#comp").html(line);
  },

  getComp: function() {
    Opus.deployed().then(function(instance) {
      for (let i = 0; i < 128; i++) {
        instance.getNoteLine.call(i, {from: web3.eth.accounts[0]}).then(function(line) {
          for (let x = 0; x < 100; x++) {
            if (line[x] == true) {
              let elem = "#" + i.toString() + "note" + x.toString() + "";
              $(`${elem}`).css("background-color", "black");
            }
          }
        })
      }
})
},

  getNotes: function() {
    Opus.deployed().then(function(instance) {
      instance.getOwnedNotes.call({from: web3.eth.accounts[0]}).then(function(_notes) {
        $("#owned").text(_notes.toNumber() + " Notes Owned");
    })
  })
},

  getPlacedNotes: function() {
    Opus.deployed().then(function(instance) {
      instance.getPlacedNotes.call({from: web3.eth.accounts[0]}).then(function(_notes) {
        let pitches = _notes[0];
        let places = _notes[1];
        for(let i = 0; i < pitches.length; i++) {
          if(pitches[i] == 129) {
            continue;
          }
          else {
          let id = "#" + pitches[i].toString() + "note" + places[i].toString();
          $(`${id}`).css("background-color", "purple");
          }
        }
      })
    })
  }
};

window.purchaseNotes = function() {

  let num = $("#purchase").val();
  let price = num * 0.01;

  Opus.deployed().then(function(instance) {
    instance.purchaseNote(num, {value: web3.toWei(price,"ether"), from: web3.eth.accounts[0]}).then(function(x) {
  })
})
}

window.returnNotes = function() {

  let num = $("#return").val();

  Opus.deployed().then(function(instance) {
    instance.returnNotes(num, {gas: 75000, from: web3.eth.accounts[0]}).then(function() {
    })
  })
}

window.toggleNote = function(el) {

  let _pitch, _place;
  let id = el.id;

  console.log(id);
  
  let n = id.indexOf("n");

  _pitch = id.substr(0,n);

  let e = id.indexOf("e");

  _place = id.substr(e+1);

  Opus.deployed().then(function(instance) {
    instance.getNote.call(_pitch, _place, {from: web3.eth.accounts[0]}).then(function (_note) {
      if(!_note) {
        instance.placeNote(_pitch, _place, {from: web3.eth.accounts[0]}).then(function(x) {
          location.reload();
        })
      }
      else {
        console.log("here");
        instance.removeNote(_pitch, _place, {gas: 75000, from: web3.eth.accounts[0]}).then(function(x) {
          location.reload();
        })
      }
    })
  })
}

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source.")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
