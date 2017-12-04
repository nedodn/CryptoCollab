pragma solidity ^0.4.17;

contract Opus {

    //Note structure consisting of four pitches (Midi values from 0-128, 128 will represent a rest ), 
    //duration (value between 1 and 8: 1 = sixteenth, 2 = eight, 3 = dotted eigth, 4 = quarter, 
    //5 = dotted quarter, 6 = half, 7 = dotted half, 8 = whole,
    // the owner of the note, and price set by owner
    struct note {
        uint[4] pitches;
        uint duration;
        address composer;
        bool forSale;
        uint price;
    }

    //The composition will consist of a fixed number of notes, number may be subject to change
    note[1000] composition;
    mapping (address => uint[]) ownedNoteIds;

    modifier noteForSale(uint _id) {
        require(composition[_id].forSale);
        _;
    }

    modifier onlyComposer(uint _id) {
        require(composition[_id].composer == msg.sender);
        _;
    }

    //Constructor that gives all notes to sender, sets them for sale, and sets their price to an initial value
    function Opus(uint _initialPrice) {

        for (uint i = 0; i < 1000; i++) {
            composition[i].composer = msg.sender;
            composition[i].forSale = true;
            composition[i].price = _initialPrice;
        }
    }

    function setNotePitches(uint _id, uint[4] _pitches) onlyComposer(_id) external {

        for (uint i = 0; i < 4; i++) {
            composition[_id].pitches[i] = _pitches[i];
        }

    }

    function setNoteDuration(uint _id, uint _duration) onlyComposer(_id) external {

        require(_duration >= 1 && _duration <= 8);

        composition[_id].duration = _duration;

    }

    function purchaseNote(uint _id, uint _price, bool _forSale) noteForSale(_id) external payable {

        uint price = composition[_id].price;
        require(msg.value == price);

        composition[_id].price = 0;

        composition[_id].composer.transfer(price);

        composition[_id].composer == msg.sender;
        composition[_id].price = _price;
        composition[_id].forSale = _forSale;

        ownedNoteIds[msg.sender].push(_id);
    }

    function getOwnedNotes() external view returns (uint[]) {

        uint[] memory _ownedNotes = ownedNoteIds[msg.sender];

        return _ownedNotes;
    }

    function getComposition() external view returns (uint[4][1000] _pitches,
                                                     uint[1000] _durations,
                                                     address[1000] _composers,
                                                     bool[1000] _forSales,
                                                     uint[1000] _prices
                                                    ) {
                                                        

    }



}