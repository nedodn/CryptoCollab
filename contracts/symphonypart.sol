pragma solidity ^0.4.18;

import './NoteToken.sol';

contract SymphonyPart {
    struct note {
        uint pitch;
        address composer;
    }

    mapping (uint => note[2048]) composition;

    // 1 => piccolo;
    // 2 => flute1;
    // 3 => flute2;
    // 4 => oboe1;
    // 5 => oboe2;
    // 6 => clarinet1;
    // 7 => clarinet2;
    // 8 => bassoon1;
    // 9 => bassoon2;
    // 10 => altosax1;
    // 11 => altosax2;
    // 12 => tenorsax;
    // 13 => barisax;
    // 14 => trumpet1;
    // 15 => trumpet2;
    // 16 => trumpet3;
    // 17 => horn1;
    // 18 => horn2;
    // 19 => trombone1;
    // 20 => trombone2;
    // 21 => basstrombone;
    // 22 => euphonium;
    // 23 => tuba;
    // 24 => snare;
    // 25 => bassdrum;
    // 26 => cymbals;

    NoteToken notes;

    modifier checkArguments(uint[] _pitches, uint[] _places, uint _numNotes) {
        require(_pitches.length == _places.length);
        require(_pitches.length <= 10);
        require(_pitches.length == _numNotes); 
        _;
    }

    modifier withinRange(uint[] _pitches, uint _instrument) {
        if (_instrument == 1) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 102 || _pitches[i] < 74) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 2 || _instrument == 3) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 96 || _pitches[i] < 60) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 4 || _instrument == 5) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 91 || _pitches[i] < 58) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 6 || _instrument == 7) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 94 || _pitches[i] < 50) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 8 || _instrument == 9) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 75 || _pitches[i] < 34) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 10 || _instrument == 11) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 81 || _pitches[i] < 49) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 12) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 76 || _pitches[i] < 44) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 13) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 69 || _pitches[i] < 36) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 14 || _instrument == 15 || _instrument == 16) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 82 || _pitches[i] < 55) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 17 || _instrument == 18) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 77 || _pitches[i] < 34) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 19 || _instrument == 20) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 72 || _pitches[i] < 40) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 21) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 77 || _pitches[i] < 34) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 22) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] > 77 || _pitches[i] < 34) {
                    if (_pitches[i] == 0) {
                        continue;
                    } else {
                        revert();
                    }
                }           
            }
        } else if (_instrument == 23 || _instrument == 24 || _instrument == 25) {
            for (uint i = 0; i < _pitches.length; i++) {
                if (_pitches[i] == 1 || _pitches[i] == 0) {
                    continue;
                } else {
                    revert();
                }
            }           
        }
    }

    function placeNotes(uint[] _pitches, uint[] _places, uint _numNotes, uint _instrument) checkArguments(_pitches, _places, _numNotes)
                                                                                           withinRange(_pitches, _instrument) 
                                                                                           external {
        for (uint i = 0; i < _numNotes; i++) {
            if (composition[_instrument[i]].composer != address(0)) {
                revert();
            }
        }
        
        require(notes.transferFrom(msg.sender, this, _numNotes));

        for (uint i = 0; i < _numNotes; i++) {
            note memory _note;
            _note.pitch = _pitches[i];
            _note.composer = msg.sender;

            composition[_instrument[i]] = _note;
        }                                                                                       
    }

    function removeNotes(uint[] _pitches, uint[] _places, uint _numNotes, uint _instrument) checkArguments(_pitches, _places, _numNotes)
                                                                                           withinRange(_pitches, _instrument) 
                                                                                           external {
        for (uint i = 0; i < _numNotes; i++) {
            if (composition[_instrument[i]].composer != msg.sender) {
                revert();
            }
        }
        
        require(notes.transfer(msg.sender, _numNotes));

        for (uint i = 0; i < _numNotes; i++) {
           delete composition[_instrument[i]];
        }                                                                                       
    }

    function getInstrumentPitches(uint _instrument) external view returns (uint[2048]) {
        uint[2048] memory _pitches;

        for (uint i = 0; i < 2048; i++) {
            _pitches[i] = composition[_instrument[i]].pitch;
        }
        return _pitches;
    }

    function getInstrumentComposers(uint _instrument) external view returns (address[2048]) {
        address[2048] memory _composers;

        for (uint i = 0; i < 2048; i++) {
            _composers[i] = composition[_instrument[i]].composer;
        }
        return _composers;
    }
}