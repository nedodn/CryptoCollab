pragma solidity ^0.4.17;

contract Opus {

    struct noteId {
        uint pitch;
        uint place;
        address placer;
    }

    bool[129][100] composition;

    uint notes = 5000;
    uint notesAvailable;
    uint notePrice;

    address owner;
    uint endTime;

    mapping (address => uint) ownedNotes;
    noteId[] placedNotes;

    uint durationLockTime;
    uint pitchLockTime;
    bool composingStarted;

    modifier beforeEndTime() {
        require(now < endTime);
        _;
    }

    modifier isValidNote(uint _pitch, uint _place) {
        require(_pitch >= 0 && _pitch < 129);
        require(_place >= 0 && _place < 100);
        _;
    }

    function Opus(uint _endTime) {
        owner = msg.sender;

        endTime = _endTime;

        notesAvailable = 5000;
        notePrice = 0.01 ether;
    }

    function purchaseNote(uint numNotes) beforeEndTime() external payable {
        require(numNotes < 100 && numNotes <= notesAvailable && msg.value == (numNotes * notePrice));

        if (ownedNotes[msg.sender] == 0) {
            ownedNotes[msg.sender] = numNotes;
        }else {
            ownedNotes[msg.sender] = ownedNotes[msg.sender] + numNotes;
        }

        notesAvailable = notesAvailable - numNotes;
    }

    function placeNote(uint _pitch, uint _place) beforeEndTime() isValidNote(_pitch, _place) external {
        require(ownedNotes[msg.sender] > 0 && !composition[_pitch][_place]);

        noteId memory note;
        note.pitch = _pitch;
        note.place = _place;
        note.placer = msg.sender;

        placedNotes.push(note);

        composition[_pitch][_place] = true;
        ownedNotes[msg.sender]--;
    }

    function removeNote(uint _pitch, uint _place) beforeEndTime() isValidNote(_pitch, _place) external {
        require(composition[_pitch][_place] && noteOwner(_pitch, _place, msg.sender));

        composition[_pitch][_place] = false;

        uint noteIndex = getPlacedNoteIndex(_pitch, _place, msg.sender);

        delete placedNotes[noteIndex];
        ownedNotes[msg.sender]++;
    }

    function noteOwner(uint _pitch, uint _place, address sender) internal view returns (bool) {
        for (uint i = 0; i < placedNotes.length; i++) {
            noteId memory note = placedNotes[i];
            if (note.pitch == _pitch && note.place == _place && note.placer == sender) {
                return true;
            }
        }

        return false;
    }

    function getPlacedNoteIndex(uint _pitch, uint _place, address sender) internal view returns (uint) {
        for (uint i = 0; i < placedNotes.length; i++) {
            noteId memory note = placedNotes[i];
            if (note.pitch == _pitch && note.place == _place && note.placer == sender) {
                return i;
            }
        }
    }

    function getComposition() external view returns (bool[129][100] _composition) {
        bool[129][100] memory temp = composition;
        return temp;
    }


}