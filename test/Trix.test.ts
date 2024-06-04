import { expect } from "chai";
import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Trix } from "../typechain-types";
import { TokenERC20 } from "../typechain-types/contracts/Token.sol";

const { ethers } = hre;

describe("Trix", () => {
  let owner: SignerWithAddress;
  let streamer: SignerWithAddress;
  let donater1: SignerWithAddress;

  let token: TokenERC20;
  let contract: Trix;

  beforeEach(async () => {
    [owner, streamer, donater1] = await ethers.getSigners();
    token = (await ethers.deployContract(
      "TokenERC20",
      owner
    )) as unknown as TokenERC20;
    contract = (await ethers.deployContract("Trix", owner)) as unknown as Trix;

    const transferTokensToDonaterTx = await token
      .connect(owner)
      .transfer(donater1.address, 10000);
    await transferTokensToDonaterTx.wait();
  });

  it("can send donat to streamer in native token", async () => {
    const donatAmount = 100;

    const tx = contract
      .connect(donater1)
      .sendDonation(streamer.address, "Username", "Test message", {
        value: donatAmount,
      });

    await expect(tx).to.emit(contract, "Donat");

    const { amount, fee } = calcFeeAndAmount(donatAmount);

    await expect(tx).to.changeEtherBalance(streamer, amount);
    await expect(tx).to.changeEtherBalance(owner, fee);
    await expect(tx).to.changeEtherBalance(donater1, -donatAmount);
  });

  it("can send donat to streamer in ERC20 token", async () => {
    const donatAmount = 100;

    const approveTx = await token
      .connect(donater1)
      .approve(contract.address, donatAmount);
    await approveTx.wait();

    const tx = contract
      .connect(donater1)
      .sendTokenDonation(
        streamer.address,
        "username",
        "message",
        token.address,
        donatAmount
      );

    await expect(tx).to.emit(contract, "Donat");

    const { fee, amount } = calcFeeAndAmount(donatAmount);

    await expect(tx).to.changeTokenBalance(token, streamer, amount);
    await expect(tx).to.changeTokenBalance(token, owner, fee);
    await expect(tx).to.changeTokenBalance(token, donater1, -donatAmount);
  });

  it("donater can't donat zero funds in native token", async () => {
    const tx = contract
      .connect(donater1)
      .sendDonation(streamer.address, "username", "message", {
        value: 0,
      });

    await expect(tx).to.be.revertedWith("Donation can't be equal zero");
  });

  it("donater can't donat zero funds in ERC20 token", async () => {
    const tx = contract
      .connect(donater1)
      .sendTokenDonation(
        streamer.address,
        "username",
        "message",
        token.address,
        0
      );

    await expect(tx).to.be.revertedWith("Donation can't be equal zero");
  });
});

const calcFeeAndAmount = (donatAmount: number) => {
  const fee = donatAmount * 0.03;
  const amount = donatAmount - fee;

  return {
    fee,
    amount,
  };
};
