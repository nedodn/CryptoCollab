/**
 * UI
 */
"use strict";

import { Networks } from "./networks.js"

var UI = {};


/**
 * Setup UI header
 */

UI.setupHeader = function( accounts ) {

    var addr = ( ! accounts || ! accounts.length )
        ? "Not Logged In"
        : accounts[ 0 ];

    var addrDom = document.getElementById( "address-section" );
    addrDom.innerHTML = addr;

    var network = web3.version.network;

    var netName = Networks[ network ] || "Unknown";

    var netDom = document.getElementById( "network-section" );
    netDom.innerHTML = netName;

};

export {UI};
