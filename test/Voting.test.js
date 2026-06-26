import { expect } from "chai";
import hre from "hardhat";

describe("Voting", function () {
  let voting;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    const { ethers } = await hre.network.create();
    [owner, addr1, addr2] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
  });

  describe("createProposal", function () {
    it("should create a proposal successfully", async function () {
      await voting.createProposal("Test Proposal", "Test Description", 60);
      const proposal = await voting.getProposal(1);
      expect(proposal.title).to.equal("Test Proposal");
      expect(proposal.description).to.equal("Test Description");
      expect(proposal.exists).to.equal(true);
    });

    it("should fail if title is empty", async function () {
      await expect(
        voting.createProposal("", "Test Description", 60)
      ).to.be.revertedWith("Title required");
    });

    it("should increment proposalCount", async function () {
      await voting.createProposal("Proposal 1", "Description 1", 60);
      await voting.createProposal("Proposal 2", "Description 2", 60);
      expect(await voting.proposalCount()).to.equal(2);
    });
  });

  describe("vote", function () {
    beforeEach(async function () {
      await voting.createProposal("Test Proposal", "Test Description", 60);
    });

    it("should cast a yes vote", async function () {
      await voting.connect(addr1).vote(1, true);
      const proposal = await voting.getProposal(1);
      expect(proposal.yesVotes).to.equal(1);
    });

    it("should cast a no vote", async function () {
      await voting.connect(addr1).vote(1, false);
      const proposal = await voting.getProposal(1);
      expect(proposal.noVotes).to.equal(1);
    });

    it("should prevent double voting", async function () {
      await voting.connect(addr1).vote(1, true);
      await expect(
        voting.connect(addr1).vote(1, true)
      ).to.be.revertedWith("Already voted");
    });

    it("should fail on non-existent proposal", async function () {
      await expect(
        voting.connect(addr1).vote(99, true)
      ).to.be.revertedWith("Proposal does not exist");
    });

    it("should fail if voting deadline has passed", async function () {
      await voting.createProposal("Test Proposal", "Test Description", 1);
      await voting.runner.provider.send("evm_increaseTime", [61]);
      await voting.runner.provider.send("evm_mine", []);
      await expect(
        voting.connect(addr1).vote(2, true)
      ).to.be.revertedWith("Voting has ended");
    });
  });

  describe("getAllProposals", function () {
    it("should return all proposals", async function () {
      await voting.createProposal("Proposal 1", "Description 1", 60);
      await voting.createProposal("Proposal 2", "Description 2", 60);
      const proposals = await voting.getAllProposals();
      expect(proposals.length).to.equal(2);
    });
  });
});
