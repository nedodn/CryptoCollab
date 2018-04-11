pragma solidity ^0.4.21;

import './NoteToken.sol';

contract CompositionPart {
    //note struct, holds pitch and place
    struct noteId {
        uint256 pitch;
        uint256 place;
    }

    //token contract
    NoteToken notes;

    //2d graph of notes and places, represents midi values 0-127 and position,
    bool[500][128] composition;
    //2d graph representing who owns a placed note
    address[500][128] composers;
    
    //time when composing freezes
    uint endTime;

    //keeps track of notes placed by an address
    mapping (address => noteId[]) ownedNotes;
    //keeps track of an addresses remaing notes
    mapping (address => uint) noteBalances;

    modifier beforeEndTime() {
        require(now < endTime);
        _;
    }

    modifier afterEndTime() {
        require(now > endTime);
        _;
    }

    modifier placeValidNotes(uint[] _pitches, uint[] _places, uint256 _numNotes) {
        require(_pitches.length == _places.length);
        require(_pitches.length <= 10);
        require(_pitches.length == _numNotes);

        for (uint256 i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 127 || _places[i] > 499) {
                revert();
            } else if (composition[_pitches[i]][_places[i]]) {
                revert();
            } 
        }
        _;
    }

    modifier removeValidNotes(uint[] _pitches, uint[] _places, uint256 _numNotes) {
        require(_pitches.length == _places.length);
        require(_pitches.length <= 10);
        require(_pitches.length == _numNotes);

        for (uint256 i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 127 || _places[i] > 499) {
                revert();
            } else if (composers[_pitches[i]][_places[i]] != msg.sender) {
                revert();
            }
        }
        _;
    }

    event NotePlaced(address composer, uint pitch, uint place);
    event NoteRemoved(address composer, uint pitch, uint place);

    //constructor
    function CompositionPart(uint _endTime, address _noteToken) public {
        endTime = _endTime;
        notes = NoteToken(_noteToken);
    }

    //places up to 10 valid notes in the composition
    function placeNotes(uint256[] _pitches, uint256[] _places, uint256 _numNotes) beforeEndTime() placeValidNotes(_pitches, _places, _numNotes) external {
        require(notes.transferToComposition(msg.sender, _numNotes));

        for (uint256 i = 0; i < _pitches.length; i++) {
            noteId memory note;
            note.pitch = _pitches[i];
            note.place = _places[i];

            ownedNotes[msg.sender].push(note);

            composition[_pitches[i]][_places[i]] = true;
            composers[_pitches[i]][_places[i]] = msg.sender;

            emit NotePlaced(msg.sender, _pitches[i], _places[i]);
        }
    }

    //removes up to 10 owned notes from composition
    function removeNotes(uint256[] _pitches, uint256[] _places, uint256 _numNotes) beforeEndTime() removeValidNotes(_pitches, _places, _numNotes) external {
        for (uint256 i = 0; i < _pitches.length; i++) {
            uint256 pitch = _pitches[i];
            uint256 place = _places[i];
            composition[pitch][place] = false;
            composers[pitch][place] = 0x0;

            removeOwnedNote(msg.sender, pitch, place);

            emit NoteRemoved(msg.sender, pitch, place);
        }

        require(notes.transfer(msg.sender, _numNotes));
    }

    //internal function to remove notes from ownedNotes array
    function removeOwnedNote(address sender, uint256 _pitch, uint256 _place) internal {
        uint256 length = ownedNotes[sender].length;

        for (uint256 i = 0; i < length; i++) {
            if (ownedNotes[sender][i].pitch == _pitch && ownedNotes[sender][i].place == _place) {
                ownedNotes[sender][i] = ownedNotes[sender][length-1];
                delete ownedNotes[sender][length-1];
                ownedNotes[sender].length = (length - 1);
                break;
            }
        }
    }

    //gets a line in the composition for viewing purposes and to prevent having to get the whole composition at once
    function getNoteLine(uint _pitch) external view returns (bool[500]) {
        bool[500] memory line = composition[_pitch];
        return line;
    }

    //returns whether or note a note exists at a pitch and place
    function getNote(uint _pitch, uint _place) external view returns (bool) {
        bool _note = composition[_pitch][_place];
        return _note; 
    }

    //returns note owner
    function getNoteOwner(uint _pitch, uint _place) external view returns (address) {
        return composers[_pitch][_place];
    }

    //returns notes placed by sender
    function getPlacedNotes() external view returns (uint[], uint[]) {
        uint length = ownedNotes[msg.sender].length;

        uint[] memory pitches = new uint[](length);
        uint[] memory places = new uint[](length);
        
        for (uint i = 0; i < ownedNotes[msg.sender].length; i++) {
            pitches[i] = ownedNotes[msg.sender][i].pitch;
            places[i] = ownedNotes[msg.sender][i].place;
        }

        return (pitches,places);
    }

    function () external {
        revert();
    }
}