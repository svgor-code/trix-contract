import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Trix } from "../typechain-types";

describe("Trix", () => {
  let owner: SignerWithAddress;
  let streamer: SignerWithAddress;
  let donater1: SignerWithAddress;

  let contract: Trix;

  beforeEach(async () => {
    [owner, streamer, donater1] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory("Trix", owner);

    contract = await contractFactory.deploy();
    await contract.deployed();
  });

  it("donater can send donat to streamer", async () => {
    const donatAmount = 100;

    const tx = await contract
      .connect(donater1)
      .sendDonation(streamer.address, "Username", "Test message", {
        value: donatAmount,
      });

    await expect(tx).to.emit(contract, "Donat");

    const fee = donatAmount * 0.01;
    const amount = donatAmount - fee;

    await expect(tx).to.changeEtherBalance(streamer, amount);
    await expect(tx).to.changeEtherBalance(owner, fee);
    await expect(tx).to.changeEtherBalance(donater1, -donatAmount);  
  });
});
