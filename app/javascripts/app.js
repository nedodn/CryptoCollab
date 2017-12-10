// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

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
    
    for(let i = 0; i < 128; i++) {
      $("#comp").append("<tr><td>" + (128 - i) + "</td>");
      for(let x = 0; x < 100; x++) {
        $("#comp").append("<td id='" + i.toString() + "note" + x.toString() + "'>   </td>");
      }
      $("#comp").append("</tr>");
    }
  },

  getComp: function() {
    Opus.deployed().then(function(instance) {
      instance.getComposition.call({gas: 50000000, from: web3.eth.accounts[0]}).then(function(comp) {
      for(let i = 0; i < 128; i++) {
        for(let x = 0; x < 100; x++) {
          if(comp[i[x]] == true) {
            let elem = "#" + i.toString() + "note" + x.toString() + "";
            $(`${elem}`).css("color", "black");
          }
        }
      }
      instance.getOwnedNotes.call({from:web3.eth.accounts[0]}).then(function(notes) {
        $("#owned").text(notes);
      })
  })
})
}


};

window.purchaseNotes = function() {

  let num = $("#purchase").val();
  let price = num * 0.01;

  Opus.deployed().then(function(instance) {
    instance.purchaseNote(num, {value: web3.toWei(price,"ether"), from: web3.eth.accounts[0]}).then(function(v) {
      console.log("it worked?");
  })
})
}

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});