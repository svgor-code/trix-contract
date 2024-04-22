import { BigNumber } from "ethers";
import { ethers } from "hardhat";

async function main() {
  const [owner, wallet2, wallet3] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("TokenERC20", {

  });
  const token = await Token.deploy();

  const Trix = await ethers.getContractFactory("Trix");
  const trix = await Trix.deploy();

  await token.deployed();
  await trix.deployed();

  console.log(`Token Contract address: ${token.address}`);
  console.log(`Trix Contract address: ${trix.address}`);

  const tokensAmount = BigNumber.from("10000000000000000000"); // 10 Ether

  const approveTx = await token.approve(owner.address, tokensAmount);
  await approveTx.wait();

  const tx1 = await token
    .connect(owner)
    .transferFrom(owner.address, wallet2.address, tokensAmount.div(2));
  const tx2 = await token
    .connect(owner)
    .transferFrom(owner.address, wallet3.address, tokensAmount.div(2));

  await tx1.wait();
  await tx2.wait();

  const tokenBalanceWallet2 = await token.balanceOf(wallet2.address);
  const tokenBalanceWallet3 = await token.balanceOf(wallet3.address);

  console.log(
    `Wallet ${wallet2.address} accept ${tokenBalanceWallet2} of ERC20 tokens`
  );
  console.log(
    `Wallet ${wallet3.address} accept ${tokenBalanceWallet3} of ERC20 tokens`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
