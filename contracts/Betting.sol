// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Betting {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function placeBet() public payable {
        // In a real game, you'd add logic to check the bet is valid
    }

    function payoutWinners(address[] calldata winners) public {
        require(msg.sender == owner, "Only the owner can payout winners.");
        uint256 amountPerWinner = address(this).balance / winners.length;
        for (uint256 i = 0; i < winners.length; i++) {
            payable(winners[i]).transfer(amountPerWinner);
        }
    }

    // Function to withdraw funds in case of emergency
    function emergencyWithdraw() public {
        require(msg.sender == owner, "Only the owner can withdraw.");
        payable(owner).transfer(address(this).balance);
    }
}
