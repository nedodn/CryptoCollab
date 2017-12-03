pragma solidity ^0.4.17;

contract Opus {

    //Note structure consisting on its pitch (Midi value from 0-128, 128 will represent a rest ), 
    //duration (value between 1 and 8: 1 = sixteenth, 2 = eight, 3 = dotted eigth, 4 = quarter, 
    //5 = dotted quarter, 6 = half, 7 = dotted half, 8 = whole,
    // the owner of the note, and price set by owner
    struct note {
        uint8[4] pitches;
        uint8 duration;
        address composer;
        bool forSale;
        uint256 price;
        uint16 id;
    }

    //The composition will consist of a fixed number of notes, number may be subject to change
    note[1000] composition;

    modifier noteForSale(uint16 _id) {
        require(composition[_id].forSale);
        _;
    }

    modifier onlyComposer(uint16 _id) {
        require(composition[_id].composer == msg.sender);
        _;
    }

    //Constructor that gives all notes to sender, sets them for sale, and sets their price to an initial value
    function Opus(uint256 _initialPrice) {

        for (uint16 i = 0; i < 1000; i++) {
            composition[i].composer = msg.sender;
            composition[i].forSale = true;
            composition[i].price = _initialPrice;
            composition[i].id = i;
        }
    }

    function setNotePitches(uint16 _id, uint8[4] _pitches) onlyComposer(_id) external {

        for (uint8 i = 0; i < 4; i++) {
            composition[_id].pitches[i] = _pitches[i];
        }

    }

    function setNoteDuration(uint16 _id, uint8 _duration) onlyComposer(_id) external {

        require(_duration >= 1 && _duration <= 8);

        composition[_id].duration = _duration;

    }

    function purchaseNote(uint16 _id, uint256 _price, bool _forSale) noteForSale(_id) external payable {

        uint256 price = composition[_id].price;
        require(msg.value == price);

        composition[_id].price = 0;

        composition[_id].composer.transfer(price);

        composition[_id].composer == msg.sender;
        composition[_id].price = _price;
        composition[_id].forSale = _forSale;
    }



}