pragma solidity ^0.4.21;

import './zeppelin/StandardToken.sol';
import './zeppelin/SafeMath.sol';
import './zeppelin/Ownable.sol';

contract NoteToken is StandardToken, Ownable {
    using SafeMath for uint256;

    string public constant NAME = "Note Token";
    string public constant SYMBOL = "NOTE";
    uint256 public tokensLeft;
    uint256 public endTime;
    address compositionAddress;

    modifier beforeEndTime() {
        require(now < endTime);
        _;
    }

    modifier afterEndTime() {
        require(now > endTime);
        _;
    }
    event TokensBought(uint256 _num, uint256 _tokensLeft);
    event TokensReturned(uint256 _num, uint256 _tokensLeft);

    function NoteToken(uint256 _endTime) public {
        totalSupply = 5000;
        tokensLeft = totalSupply;

        endTime = _endTime;
    }

    function purchaseNotes(uint256 _numNotes) beforeEndTime() external payable {
        require(_numNotes <= 100);
        require(_numNotes <= tokensLeft);
        require(_numNotes == (msg.value / 0.001 ether));

        balances[msg.sender] = balances[msg.sender].add(_numNotes);
        tokensLeft = tokensLeft.sub(_numNotes);

        emit TokensBought(_numNotes, tokensLeft);
    }

    function returnNotes(uint256 _numNotes) beforeEndTime() external {
        require(_numNotes <= balances[msg.sender]);
        
        uint256 refund = _numNotes * 0.001 ether;
        balances[msg.sender] = balances[msg.sender].sub(_numNotes);
        tokensLeft = tokensLeft.add(_numNotes);
        msg.sender.transfer(refund);
        emit TokensReturned(_numNotes, tokensLeft);
    }

    function setCompositionAddress(address _compositionAddress) onlyOwner() external {
        require(compositionAddress == address(0));

        compositionAddress = _compositionAddress;
    }

    function transferToComposition(address _from, uint256 _value) beforeEndTime() public returns (bool) {
        require(msg.sender == compositionAddress);
        require(_value <= balances[_from]);

        balances[_from] = balances[_from].sub(_value);
        balances[compositionAddress] = balances[compositionAddress].add(_value);
        Transfer(_from, compositionAddress, _value);
        return true;
    }

    function end() afterEndTime() external {
        selfdestruct(compositionAddress);
    }
}
