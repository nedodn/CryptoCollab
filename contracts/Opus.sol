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

    address owner;

    //The composition will consist of a fixed number of notes, number may be subject to change
    note[1000] composition;
    mapping (address => uint[]) ownedNoteIds;

    uint durationLockTime;
    uint pitchLockTime;
    bool composingStarted;

    modifier noteForSale(uint _id) {
        require(composition[_id].forSale);
        _;
    }

    modifier onlyComposer(uint _id) {
        require(composition[_id].composer == msg.sender);
        _;
    }

    modifier beforeDurationLock() {
        require(now < durationLockTime);
        _;
    }

    modifier beforePitchLock() {
        require(now < pitchLockTime);
        _;
    }

    //Constructor that gives all notes to sender, sets them for sale, and sets their price to an initial value
    function Opus(uint _durationLockTime, uint _pitchLockTime) {

        require(_durationLockTime > now && _pitchLockTime > _durationLockTime);

        owner = msg.sender;

        durationLockTime = _durationLockTime;
        pitchLockTime = _pitchLockTime;
        composingStarted = false;
    }

    function startComposing() external {
        require(owner == msg.sender && !composingStarted);

        for (uint i = 0; i < 1000; i++) {
            composition[i].composer = msg.sender;
            composition[i].forSale = true;
            composition[i].price = 0.01 ether;
        }
    }

    //lets owner of a note change the pitches, after a certain amount of time pitches will be locked, end of composition 
    function setNotePitches(uint _id, uint[4] _pitches) onlyComposer(_id) beforePitchLock() external {

        for (uint i = 0; i < 4; i++) {
            composition[_id].pitches[i] = _pitches[i];
        }

    }


    //lets owner of note change the duration, after a certain amount of time durations will be locked
    function setNoteDuration(uint _id, uint _duration) onlyComposer(_id) beforeDurationLock() external {

        require(_duration >= 1 && _duration <= 8);

        composition[_id].duration = _duration;

    }

    //lets someone purchase a note that is listed for sale, give it a new price. 
    function purchaseNote(uint _id, uint _price) noteForSale(_id) beforePitchLock() external payable {
        require(composition[_id].composer != msg.sender);

        uint price = composition[_id].price;
        require(msg.value == price);

        composition[_id].price = 0;

        composition[_id].composer.transfer(price);

        composition[_id].composer == msg.sender;
        composition[_id].price = _price;
        composition[_id].forSale = false;

        ownedNoteIds[msg.sender].push(_id);
    }

    //set owned note for sale or not for sale
    function toggleForSale(uint _id) onlyComposer(_id) beforePitchLock() external {
        composition[_id].forSale = !composition[_id].forSale;
    }

    //set an owned notes price
    function setNotePrice(uint _id, uint _price) onlyComposer(_id) beforePitchLock() external {
        composition[_id].price = _price;
    }

    //get any notes owned by the sender
    function getOwnedNotes() external view returns (uint[]) {

        uint[] memory _ownedNotes = ownedNoteIds[msg.sender];

        return _ownedNotes;
    }

    //get specific note information
    function getNoteInformation(uint _id) external view returns (uint[4] _pitches,
                                                                uint _duration,
                                                                address _composer,
                                                                bool _forSale,
                                                                uint price
                                                                ) {
        uint[4] memory pitches = composition[_id].pitches;
        _pitches = pitches;
        _duration = composition[_id].duration;
        _composer = composition[_id].composer;
        _forSale = composition[_id].forSale;
        price = composition[_id].price;
    }

    //get whole composition
    function getComposition() external view returns (uint[4][1000] _pitches,
                                                     uint[1000] _durations,
                                                     address[1000] _composers,
                                                     bool[1000] _forSales,
                                                     uint[1000] _prices
                                                    ) {
        for (uint i = 0; i < 1000; i++) {
            _pitches[i] = composition[i].pitches;

            _durations[i] = composition[i].duration;
            _composers[i] = composition[i].composer;
            _forSales[i] = composition[i].forSale;
            _prices[i] = composition[i].price;
        }                                                                                               
    }
}