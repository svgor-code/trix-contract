import { ethers } from "hardhat";

async function main() {
  const Donats = await ethers.getContractFactory("Donats");
  const donats = await Donats.deploy();

  await donats.deployed();

  console.log(`Contract address: ${donats.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
