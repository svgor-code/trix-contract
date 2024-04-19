import { ethers } from "hardhat";

async function main() {
  const Trix = await ethers.getContractFactory("Trix");
  const trix = await Trix.deploy();

  await trix.deployed();

  console.log(`Contract address: ${trix.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
