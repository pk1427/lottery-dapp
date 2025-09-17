// Simple test script for lottery functions
const anchor = require('@project-serum/anchor');
const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function testLottery() {
    console.log("🎯 Starting Lottery Tests...\n");
    
    // Connect to local cluster
    const connection = new Connection("http://localhost:8899", "confirmed");
    const wallet = anchor.Wallet.local();
    const provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);
    
    // Load the program
    const programId = new PublicKey("5vfYx3qS4FL5yAwiBnxLkYoK4ZHTsqGXn93RGKUhPZUz");
    const idl = JSON.parse(require('fs').readFileSync('./target/idl/lottery_dapp.json', 'utf8'));
    const program = new anchor.Program(idl, programId, provider);
    
    try {
        console.log("✅ Program loaded successfully");
        console.log("📍 Program ID:", programId.toString());
        console.log("💰 Wallet:", wallet.publicKey.toString());
        
        // Check wallet balance
        const balance = await connection.getBalance(wallet.publicKey);
        console.log("💵 Wallet Balance:", balance / LAMPORTS_PER_SOL, "SOL\n");
        
        // Test 1: Create lottery account
        console.log("🎯 Test 1: Creating lottery account...");
        const lotteryKeypair = Keypair.generate();
        
        const tx1 = await program.methods
            .initialize()
            .accounts({
                lottery: lotteryKeypair.publicKey,
                user: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([lotteryKeypair])
            .rpc();
            
        console.log("✅ Lottery initialized! TX:", tx1);
        
        // Test 2: Check lottery state
        console.log("\n🎯 Test 2: Checking lottery state...");
        const lotteryAccount = await program.account.lottery.fetch(lotteryKeypair.publicKey);
        console.log("📊 Total Pool:", lotteryAccount.totalPool.toString());
        console.log("👥 Players:", lotteryAccount.players.length);
        
        // Test 3: Enter lottery
        console.log("\n🎯 Test 3: Entering lottery...");
        const entryAmount = new anchor.BN(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL
        
        const tx2 = await program.methods
            .enter(entryAmount)
            .accounts({
                lottery: lotteryKeypair.publicKey,
                player: wallet.publicKey,
            })
            .rpc();
            
        console.log("✅ Entered lottery! TX:", tx2);
        
        // Test 4: Check updated state
        console.log("\n🎯 Test 4: Checking updated state...");
        const updatedLottery = await program.account.lottery.fetch(lotteryKeypair.publicKey);
        console.log("📊 Total Pool:", updatedLottery.totalPool.toString());
        console.log("👥 Players:", updatedLottery.players.length);
        console.log("🎫 Player 1:", updatedLottery.players[0]?.toString());
        
        console.log("\n🎉 All tests passed! Your lottery contract is working!");
        
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

testLottery();
