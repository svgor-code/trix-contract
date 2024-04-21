import { expect } from "chai";
import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Trix } from "../typechain-types";
import { Bitcoin } from "../typechain-types/contracts/Token.sol";
import {} from "ethers/lib/utils";

const { ethers } = hre;

describe("Trix", () => {
  let owner: SignerWithAddress;
  let streamer: SignerWithAddress;
  let donater1: SignerWithAddress;

  let token: Bitcoin;
  let contract: Trix;

  beforeEach(async () => {
    [owner, streamer, donater1] = await ethers.getSigners();
    token = (await ethers.deployContract(
      "Bitcoin",
      owner
    )) as unknown as Bitcoin;
    contract = (await ethers.deployContract("Trix", owner)) as unknown as Trix;
  });

  it("donater can send donat to streamer", async () => {
    const donatAmount = 100;

    const tx = await contract
      .connect(donater1)
      .sendDonation(
        streamer.address,
        "Username",
        "Test message",
        ethers.constants.AddressZero,
        {
          value: donatAmount,
        }
      );

    await expect(tx).to.emit(contract, "Donat");

    const fee = donatAmount * 0.01;
    const amount = donatAmount - fee;

    await expect(tx).to.changeEtherBalance(streamer, amount);
    await expect(tx).to.changeEtherBalance(owner, fee);
    await expect(tx).to.changeEtherBalance(donater1, -donatAmount);
  });
});
