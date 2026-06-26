import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect({ network: "sepolia" });

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  console.log("Deploying Voting contract...");
  const Voting = await ethers.getContractFactory("Voting", deployer);
  const voting = await Voting.deploy();

  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log("Voting contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
