// Basic test without IDL dependency
const { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');

async function basicTest() {
    console.log("🎯 Basic Lottery Program Test\n");
    
    try {
        // Connect to local cluster
        const connection = new Connection("http://localhost:8899", "confirmed");
        
        // Load wallet
        const walletKeypair = Keypair.fromSecretKey(
            new Uint8Array(JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json')))
        );
        
        console.log("✅ Connected to localhost");
        console.log("📍 Program ID: 5vfYx3qS4FL5yAwiBnxLkYoK4ZHTsqGXn93RGKUhPZUz");
        console.log("💰 Wallet:", walletKeypair.publicKey.toString());
        
        // Check wallet balance
        const balance = await connection.getBalance(walletKeypair.publicKey);
        console.log("💵 Balance:", balance / LAMPORTS_PER_SOL, "SOL");
        
        // Check if program exists
        const programId = new PublicKey("5vfYx3qS4FL5yAwiBnxLkYoK4ZHTsqGXn93RGKUhPZUz");
        const programInfo = await connection.getAccountInfo(programId);
        
        if (programInfo) {
            console.log("✅ Program is deployed and accessible");
            console.log("📊 Program data length:", programInfo.data.length);
            console.log("👑 Program owner:", programInfo.owner.toString());
        } else {
            console.log("❌ Program not found");
            return;
        }
        
        console.log("\n🎉 Basic connectivity test passed!");
        console.log("📝 Your lottery program is deployed and ready to use!");
        console.log("\n📋 Available functions:");
        console.log("   1. initialize() - Create new lottery");
        console.log("   2. enter(amount) - Join lottery with SOL");
        console.log("   3. pick_winner() - Select random winner");
        console.log("   4. get_lottery_info() - View lottery status");
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

basicTest();
