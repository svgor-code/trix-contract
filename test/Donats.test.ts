import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Donats } from "../typechain-types";

describe("Donats", () => {
  let owner: SignerWithAddress;
  let streamer: SignerWithAddress;
  let donater1: SignerWithAddress;
  let donater2: SignerWithAddress;

  let contract: Donats;

  beforeEach(async () => {
    [owner, streamer, donater1, donater2] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory("Donats", owner);

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

    const getOwnerBalanceTx = await contract
      .connect(owner)
      .wallets(owner.address);

    const getStreamerBalanceTx = await contract
      .connect(streamer)
      .wallets(streamer.address);

    const commission = BigNumber.from(100).div(BigNumber.from(donatAmount)); // 1%

    expect(getOwnerBalanceTx).to.eq(commission);
    expect(getStreamerBalanceTx).to.eq(
      BigNumber.from(donatAmount).sub(commission)
    );
  });

  it("streamer can withdraw", async () => {
    const donatAmount = BigNumber.from(100);
    const commission = BigNumber.from(100).div(BigNumber.from(donatAmount)); // 1%

    const tx = await contract
      .connect(donater1)
      .sendDonation(streamer.address, "Username", "Test message", {
        value: donatAmount,
      });

    await tx.wait();

    const withdrawTx = await contract
      .connect(streamer)
      .withdraw(donatAmount.sub(commission));

    await expect(withdrawTx).to.changeEtherBalance(
      streamer,
      donatAmount.sub(commission)
    );
  });

  it("owner can withdraw", async () => {
    const donatAmount = BigNumber.from(100);
    const commission = BigNumber.from(100).div(BigNumber.from(donatAmount)); // 1%

    const tx = await contract
      .connect(donater1)
      .sendDonation(streamer.address, "Username", "Test message", {
        value: donatAmount,
      });

    await tx.wait();

    const withdrawTx = await contract.connect(owner).withdraw(commission);

    await expect(withdrawTx).to.changeEtherBalance(owner, commission);
  });
});
