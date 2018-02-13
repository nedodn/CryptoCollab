pragma solidity ^0.4.18;

import './zeppelin/StandardToken.sol';
import './zeppelin/SafeMath.sol';
import './zeppelin/Ownable.sol';

contract NoteToken is StandardToken, Ownable {
    using SafeMath for uint256;

    string public constant NAME = "Note Token";
    string public constant SYMBOL = "NOTE";
    uint256 public tokensLeft;
    uint256 public endTime;

    modifier beforeEndTime() {
        require(now < endTime);
        _;
    }

    modifier afterEndTime() {
        require(now > endTime);
        _;
    }

    function NoteToken(uint256 _endTime) public {
        totalSupply = 10000;
        tokensLeft = totalSupply;

        endTime = _endTime;
    }

    function purchaseNotes(uint256 _numNotes) beforeEndTime() external payable {
        require(_numNotes <= 100);
        require(_numNotes <= tokensLeft);
        require(_numNotes == (msg.value / 0.001 ether));

        balances[msg.sender] = balances[msg.sender].add(_numNotes);
        tokensLeft = tokensLeft.sub(_numNotes);
    }

    function returnNotes(uint256 _numNotes) beforeEndTime() external {
        require(_numNotes <= balances[msg.sender]);

        balances[msg.sender] = balances[msg.sender].sub(_numNotes);
        tokensLeft = tokensLeft.add(_numNotes);
    }

    function withdraw() afterEndTime() onlyOwner() external {
        owner.transfer(this.balance);
    }
}