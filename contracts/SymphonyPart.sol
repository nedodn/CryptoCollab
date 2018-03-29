pragma solidity ^0.4.18;

import './NoteToken.sol';

contract SymphonyPart {
    struct note {
        uint pitch;
        address composer;
    }

    note[2048] piccolo;
    note[2048] flute1;
    note[2048] flute2;
    note[2048] oboe1;
    note[2048] oboe2;
    note[2048] clarinet1;
    note[2048] clarinet2;
    note[2048] bassoon1;
    note[2048] bassoon2;
    note[2048] altosax1;
    note[2048] altosax2;
    note[2048] tenorsax;
    note[2048] barisax;
    note[2048] trumpet1;
    note[2048] trumpet2;
    note[2048] trumpet3;
    note[2048] horn1;
    note[2048] horn2;
    note[2048] trombone1;
    note[2048] trombone2;
    note[2048] basstrombone;
    note[2048] euphonium;
    note[2048] tuba;
    note[2048] snare;
    note[2048] bassdrum;
    note[2048] cymbals;

    NoteToken notes;

    modifier checkArguments(uint[] _pitches, uint[] _places, uint _numNotes) {
        require(_pitches.length == _places.length);
        require(_pitches.length <= 10);
        require(_pitches.length == _numNotes); 
        _;
    }

    function placePiccolo(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 72 || _pitches[i] < 38 || _places[i] > 2047) {
                revert();
            } else if (piccolo[_places[i]].composer != address(0)) {
                revert();
            } 
        }

        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            note memory _note;
            _note.pitch = _pitches[x];
            _note.composer = msg.sender;

            piccolo[_places[x]] = _note;
        }
    }

    function removePiccolo(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 72 || _pitches[i] < 38 || _places[i] > 2047) {
                revert();
            } else if (piccolo[_places[i]].composer != msg.sender) {
                revert();
            } 
        }

        require(notes.transfer(msg.sender, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            delete piccolo[_places[x]];
        }

    }

    function placeFlute1(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 96 || _pitches[i] < 60 || _places[i] > 2047) {
                revert();
            } else if (flute1[_places[i]].composer != address(0)) {
                revert();
            } 
        }

        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            note memory _note;
            _note.pitch = _pitches[x];
            _note.composer = msg.sender;

            flute1[_places[x]] = _note;
        }
    }

    function placeFlute2(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 96 || _pitches[i] < 60 || _places[i] > 2047) {
                revert();
            } else if (flute2[_places[i]].composer != address(0)) {
                revert();
            } 
        }

        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            note memory _note;
            _note.pitch = _pitches[x];
            _note.composer = msg.sender;

            flute2[_places[x]] = _note;
        }
    }

    function placeOboe1(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 91 || _pitches[i] < 46 || _places[i] > 2047) {
                revert();
            } else if (oboe1[_places[i]].composer != address(0)) {
                revert();
            } 
        }

        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            note memory _note;
            _note.pitch = _pitches[x];
            _note.composer = msg.sender;

            oboe1[_places[x]] = _note;
        }
    }

    function placeOboe2(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 96 || _pitches[i] < 60 || _places[i] > 2047) {
                revert();
            } else if (oboe2[_places[i]].composer != address(0)) {
                revert();
            } 
        }

        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            note memory _note;
            _note.pitch = _pitches[x];
            _note.composer = msg.sender;

            oboe2[_places[x]] = _note;
        }
    }

    function placeClarinet1(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 96 || _pitches[i] < 52 || _places[i] > 2047) {
                revert();
            } else if (clarinet1[_places[i]].composer != address(0)) {
                revert();
            } 
        }

        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            note memory _note;
            _note.pitch = _pitches[x];
            _note.composer = msg.sender;

            clarinet1[_places[x]] = _note;
        }
    }

    function placeClarinet2(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 96 || _pitches[i] < 52 || _places[i] > 2047) {
                revert();
            } else if (clarinet2[_places[i]].composer != address(0)) {
                revert();
            } 
        }

        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            note memory _note;
            _note.pitch = _pitches[x];
            _note.composer = msg.sender;

            clarinet2[_places[x]] = _note;
        }
    }

    function placeBassoon1(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 76 || _pitches[i] < 34 || _places[i] > 2047) {
                revert();
            } else if (bassoon1[_places[i]].composer != address(0)) {
                revert();
            } 
        }

        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            note memory _note;
            _note.pitch = _pitches[x];
            _note.composer = msg.sender;

            bassoon1[_places[x]] = _note;
        }
    }

    function placeBassoon2(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 76 || _pitches[i] < 34 || _places[i] > 2047) {
                revert();
            } else if (bassoon2[_places[i]].composer != address(0)) {
                revert();
            } 
        }

        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            note memory _note;
            _note.pitch = _pitches[x];
            _note.composer = msg.sender;

            bassoon2[_places[x]] = _note;
        }
    }

    function placeAltoSax1(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 89 || _pitches[i] < 58 || _places[i] > 2047) {
                revert();
            } else if (altosax1[_places[i]].composer != address(0)) {
                revert();
            } 
        }

        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            note memory _note;
            _note.pitch = _pitches[x];
            _note.composer = msg.sender;

            altosax1[_places[x]] = _note;
        }
    }

    function placeAltoSax2(uint[] _pitches, uint[] _places, uint _numNotes) checkArguments(_pitches, _places, _numNotes) external {
        for (uint i = 0; i < _pitches.length; i++) {
            if (_pitches[i] > 89 || _pitches[i] < 58 || _places[i] > 2047) {
                revert();
            } else if (altosax2[_places[i]].composer != address(0)) {
                revert();
            } 
        }

        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint x = 0; x < _pitches.length; x++) {
            note memory _note;
            _note.pitch = _pitches[x];
            _note.composer = msg.sender;

            altosax2[_places[x]] = _note;
        }
    }

}