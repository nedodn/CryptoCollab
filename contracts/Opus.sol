pragma solidity ^0.4.17;

contract Opus {
    //struct to hold placed note Ids
    struct noteId {
        uint pitch;
        uint place;
    }

    //2d graph of notes and places, represents midi values 0-127 and position,
    bool[100][128] composition;
    //2d graph representing who owns a placed note
    address[100][128] composers;

    //total notes availble
    uint notes = 5000;
    //notes available for purchase
    uint notesAvailable;
    //individual note price
    uint notePrice;
    
    //owner of contract
    address owner;
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

    modifier isValidNote(uint _pitch, uint _place) {
        require(_pitch >= 0 && _pitch < 128);
        require(_place >= 0 && _place < 100);
        _;
    }
    
    //constructor
    function Opus(uint _endTime) {
        owner = msg.sender;

        endTime = _endTime;

        notesAvailable = notes;
        notePrice = 0.01 ether;
    }

    //function to purchase notes, limited to 100 per purchase
    function purchaseNote(uint numNotes) beforeEndTime() external payable {
        require(numNotes <= 100 && numNotes <= notesAvailable && msg.value == (numNotes * notePrice));

        noteBalances[msg.sender] = noteBalances[msg.sender] + numNotes;

        notesAvailable = notesAvailable - numNotes;
    }

    //return unused notes;
    function returnNotes(uint numNotes) beforeEndTime() external {
        require(numNotes <= noteBalances[msg.sender]);

        uint amount = (numNotes * notePrice);
        noteBalances[msg.sender] = noteBalances[msg.sender] - numNotes;
        notesAvailable = notesAvailable + numNotes;

        msg.sender.transfer(amount);

    }

    //places a vaild note in the composition
    function placeNote(uint _pitch, uint _place) beforeEndTime() isValidNote(_pitch, _place) external {
        require(noteBalances[msg.sender] > 0 && !composition[_pitch][_place]);

        noteId memory note;
        note.pitch = _pitch;
        note.place = _place;

        ownedNotes[msg.sender].push(note);

        composition[_pitch][_place] = true;
        composers[_pitch][_place] = msg.sender;

        noteBalances[msg.sender]--;
    }

    //removes owned note from composition
    function removeNote(uint _pitch, uint _place) beforeEndTime() isValidNote(_pitch, _place) external {
        require(composition[_pitch][_place] && composers[_pitch][_place] == msg.sender);

        composition[_pitch][_place] = false;
        composers[_pitch][_place] = 0x0;

        uint noteIndex = getOwnedNoteIndex(_pitch, _place, msg.sender);

        ownedNotes[msg.sender][noteIndex].pitch = 129;
        noteBalances[msg.sender]++;
    }

    function getOwnedNoteIndex(uint _pitch, uint _place, address sender) internal view returns (uint) {
        for (uint i = 0; i < ownedNotes[msg.sender].length; i++) {
            if (ownedNotes[sender][i].pitch == _pitch && ownedNotes[sender][i].place == _place) {
                return i;
            }
        }
    }

    //gets a line in the composition for viewing purposes and to prevent having to get the whole composition at once
    function getNoteLine(uint _pitch) external view returns (bool[100]) {
        bool[100] memory line = composition[_pitch];
        return line;
    }

    //get note balance of sender
    function getOwnedNotes() external view returns (uint _notes) {
        _notes = noteBalances[msg.sender];
        return _notes;
    }

    //returns whether or note a note exists at a pitch and place
    function getNote(uint _pitch, uint _place) external view returns (bool) {
        bool _note = composition[_pitch][_place];
        return _note; 
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

    //withdraw balance after composing is done
    function withdraw() afterEndTime() external {
        require(msg.sender == owner);

        uint amount = this.balance;

        owner.transfer(amount);
    }
}