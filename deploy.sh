#!/bin/bash

echo "🎰 Solana Lottery dApp Deployment Script"
echo "========================================"

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first."
    exit 1
fi

# Check if Anchor CLI is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Please install it first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Ask user which network to deploy to
echo ""
echo "Select deployment target:"
echo "1) Devnet (recommended for demo)"
echo "2) Localnet (for development)"
echo "3) Mainnet (production - requires real SOL)"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        NETWORK="devnet"
        RPC_URL="https://api.devnet.solana.com"
        echo "🌐 Deploying to Devnet..."
        ;;
    2)
        NETWORK="localnet"
        RPC_URL="http://127.0.0.1:8899"
        echo "🏠 Deploying to Localnet..."
        echo "⚠️  Make sure you have solana-test-validator running!"
        ;;
    3)
        NETWORK="mainnet-beta"
        RPC_URL="https://api.mainnet-beta.solana.com"
        echo "🚀 Deploying to Mainnet..."
        echo "⚠️  This will use real SOL for deployment fees!"
        read -p "Are you sure? (y/N): " confirm
        if [[ $confirm != [yY] ]]; then
            echo "Deployment cancelled."
            exit 0
        fi
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

# Set Solana config
echo "⚙️  Setting Solana config..."
solana config set --url $RPC_URL

# Show current config
echo ""
echo "📋 Current Solana Configuration:"
solana config get

# Check wallet balance
echo ""
echo "💰 Wallet Balance:"
solana balance

# Ask if user wants to airdrop (only for devnet/localnet)
if [[ $NETWORK == "devnet" || $NETWORK == "localnet" ]]; then
    echo ""
    read -p "Do you want to airdrop 2 SOL for deployment? (y/N): " airdrop
    if [[ $airdrop == [yY] ]]; then
        echo "💧 Airdropping SOL..."
        solana airdrop 2
    fi
fi

# Build the program
echo ""
echo "🔨 Building the program..."
if ! anchor build; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Deploy the program
echo ""
echo "🚀 Deploying the program..."
if ! anchor deploy; then
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "📋 Next Steps:"
echo "1. Update the program ID in lottery-dapp-frontend/src/config.ts if it changed"
echo "2. Start the frontend: cd lottery-dapp-frontend && npm run dev"
echo "3. Connect your wallet and test the dApp!"
echo ""
echo "🔗 Useful Links:"
if [[ $NETWORK == "devnet" ]]; then
    echo "- Solana Faucet: https://faucet.solana.com/"
    echo "- Solana Explorer: https://explorer.solana.com/?cluster=devnet"
elif [[ $NETWORK == "mainnet-beta" ]]; then
    echo "- Solana Explorer: https://explorer.solana.com/"
else
    echo "- Local Explorer: http://localhost:3000 (if running solana-test-validator with --enable-rpc-transaction-history)"
fi

echo ""
echo "Happy lottery playing! 🎰"
