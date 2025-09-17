import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LotteryDapp } from "../target/types/lottery_dapp";
import { expect } from "chai";

describe("lottery-dapp", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.LotteryDapp as Program<LotteryDapp>;
  const provider = anchor.getProvider();

  // Create a keypair for the lottery account
  const lotteryKeypair = anchor.web3.Keypair.generate();
  
  // Test 1: Initialize lottery
  it("Initialize lottery", async () => {
    console.log("🎯 Testing: Initialize lottery");
    
    const tx = await program.methods
      .initialize()
      .accounts({
        lottery: lotteryKeypair.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([lotteryKeypair])
      .rpc();

    console.log("✅ Initialize transaction signature:", tx);
    
    // Fetch the lottery account to verify initialization
    const lotteryAccount = await program.account.lottery.fetch(lotteryKeypair.publicKey);
    console.log("📊 Lottery initialized with pool:", lotteryAccount.totalPool.toString());
    console.log("👥 Number of players:", lotteryAccount.players.length);
    
    expect(lotteryAccount.totalPool.toNumber()).to.equal(0);
    expect(lotteryAccount.players.length).to.equal(0);
  });

  // Test 2: Enter lottery
  it("Enter lottery", async () => {
    console.log("🎯 Testing: Enter lottery");
    
    const entryAmount = new anchor.BN(1000000000); // 1 SOL in lamports
    
    const tx = await program.methods
      .enter(entryAmount)
      .accounts({
        lottery: lotteryKeypair.publicKey,
        player: provider.wallet.publicKey,
      })
      .rpc();

    console.log("✅ Enter transaction signature:", tx);
    
    // Check lottery state after entry
    const lotteryAccount = await program.account.lottery.fetch(lotteryKeypair.publicKey);
    console.log("📊 Pool after entry:", lotteryAccount.totalPool.toString());
    console.log("👥 Number of players:", lotteryAccount.players.length);
    console.log("🎫 Player address:", lotteryAccount.players[0].toString());
    
    expect(lotteryAccount.totalPool.toNumber()).to.equal(1000000000);
    expect(lotteryAccount.players.length).to.equal(1);
  });

  // Test 3: Add more players
  it("Add second player", async () => {
    console.log("🎯 Testing: Add second player");
    
    // Create a second player
    const secondPlayer = anchor.web3.Keypair.generate();
    
    // Airdrop SOL to second player
    const signature = await provider.connection.requestAirdrop(
      secondPlayer.publicKey,
      2000000000 // 2 SOL
    );
    await provider.connection.confirmTransaction(signature);
    
    const entryAmount = new anchor.BN(500000000); // 0.5 SOL
    
    const tx = await program.methods
      .enter(entryAmount)
      .accounts({
        lottery: lotteryKeypair.publicKey,
        player: secondPlayer.publicKey,
      })
      .signers([secondPlayer])
      .rpc();

    console.log("✅ Second player entry signature:", tx);
    
    // Check lottery state
    const lotteryAccount = await program.account.lottery.fetch(lotteryKeypair.publicKey);
    console.log("📊 Pool after second entry:", lotteryAccount.totalPool.toString());
    console.log("👥 Number of players:", lotteryAccount.players.length);
    
    expect(lotteryAccount.totalPool.toNumber()).to.equal(1500000000); // 1.5 SOL
    expect(lotteryAccount.players.length).to.equal(2);
  });

  // Test 4: Get lottery info
  it("Get lottery info", async () => {
    console.log("🎯 Testing: Get lottery info");
    
    const tx = await program.methods
      .getLotteryInfo()
      .accounts({
        lottery: lotteryKeypair.publicKey,
      })
      .rpc();

    console.log("✅ Get info transaction signature:", tx);
    console.log("ℹ️ Check the program logs for lottery info");
  });

  // Test 5: Pick winner
  it("Pick winner", async () => {
    console.log("🎯 Testing: Pick winner");
    
    // Get lottery state before picking winner
    const lotteryBefore = await program.account.lottery.fetch(lotteryKeypair.publicKey);
    const winnerAddress = lotteryBefore.players[0]; // We'll use first player as winner
    
    const tx = await program.methods
      .pickWinner()
      .accounts({
        lottery: lotteryKeypair.publicKey,
        winner: winnerAddress,
      })
      .rpc();

    console.log("✅ Pick winner transaction signature:", tx);
    
    // Check lottery state after picking winner
    const lotteryAfter = await program.account.lottery.fetch(lotteryKeypair.publicKey);
    console.log("📊 Pool after winner picked:", lotteryAfter.totalPool.toString());
    console.log("👥 Number of players after reset:", lotteryAfter.players.length);
    
    expect(lotteryAfter.totalPool.toNumber()).to.equal(0);
    expect(lotteryAfter.players.length).to.equal(0);
  });
});
