// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 createdAt;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
        bool exists;
        bool active;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 public proposalCount;

    event ProposalCreated(uint256 id, string title, address creator, uint256 deadline);
    event VoteCast(uint256 proposalId, address voter, bool vote);

    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _durationInMinutes
    ) public {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");
        require(_durationInMinutes > 0, "Duration must be greater than 0");

        proposalCount++;

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            title: _title,
            description: _description,
            creator: msg.sender,
            createdAt: block.timestamp,
            deadline: block.timestamp + (_durationInMinutes * 1 minutes),
            yesVotes: 0,
            noVotes: 0,
            exists: true,
            active: true
        });

        emit ProposalCreated(proposalCount, _title, msg.sender, proposals[proposalCount].deadline);
    }

    function vote(uint256 _proposalId, bool _voteYes) public {
        require(proposals[_proposalId].exists, "Proposal does not exist");
        require(block.timestamp < proposals[_proposalId].deadline, "Voting has ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        hasVoted[_proposalId][msg.sender] = true;

        if (_voteYes) {
            proposals[_proposalId].yesVotes++;
        } else {
            proposals[_proposalId].noVotes++;
        }

        emit VoteCast(_proposalId, msg.sender, _voteYes);
    }

    function getProposal(uint256 _proposalId) public view returns (Proposal memory) {
        require(proposals[_proposalId].exists, "Proposal does not exist");
        return proposals[_proposalId];
    }

    function getAllProposals() public view returns (Proposal[] memory) {
        Proposal[] memory allProposals = new Proposal[](proposalCount);
        for (uint256 i = 1; i <= proposalCount; i++) {
            allProposals[i - 1] = proposals[i];
        }
        return allProposals;
    }
}