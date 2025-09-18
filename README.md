# Solana Lottery dApp

A decentralized lottery application built on Solana using the Anchor framework with a React.js frontend.

**Deployed Program ID:** `AKpH6fPQEV7cxF4mRtEsHwtdnYRcNiYwTu6BZYGqUz8u` (Devnet)

## Features

- **Initialize Lottery**: Create a new lottery pool
- **Enter Lottery**: Players can join by paying SOL
- **View Pool**: See current pool amount and number of players
- **Pick Winner**: Randomly select a winner who receives the entire pool
- **Wallet Integration**: Connect with Phantom or Solflare wallet

## Tech Stack

- **Smart Contract**: Solana (Anchor Framework v0.30.1)
- **Frontend**: React.js + Vite
- **Wallet Integration**: Solana Wallet Adapter
- **Styling**: Custom CSS with modern gradients and animations

## Prerequisites

- Node.js (v16+)
- Rust (latest stable)
- Solana CLI (v1.17+)
- Anchor CLI (v0.30.1)
- Phantom or Solflare wallet

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd lottery-dapp

# Install root dependencies
npm install

# Install frontend dependencies
cd lottery-dapp-frontend
npm install
```

### 2. Smart Contract Setup

```bash
# Build the smart contract
anchor build

# Deploy to Devnet (for demo)
anchor deploy

# Or deploy to Localnet (for development)
# First start a local validator:
# solana-test-validator
# Then deploy:
# anchor deploy --provider.cluster localnet
```

### 3. Frontend Configuration

The frontend is pre-configured for Devnet. If you want to use Localnet:

1. Update `lottery-dapp-frontend/src/config.ts`:
```typescript
// Change this line:
export const RPC_ENDPOINT = RPC_ENDPOINTS.devnet;
// To:
export const RPC_ENDPOINT = RPC_ENDPOINTS.localnet;
```

2. Make sure your local validator is running:
```bash
solana-test-validator
```

### 4. Run the Application

```bash
# Start the frontend development server
cd lottery-dapp-frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## How to Use

1. **Connect Wallet**: Click "Select Wallet" and connect your Phantom or Solflare wallet
2. **Get SOL**: For Devnet, get SOL from the [Solana Faucet](https://faucet.solana.com/)
3. **Initialize Lottery**: Click "Initialize New Lottery" to create a new lottery pool
4. **Enter Lottery**: Enter the amount of SOL you want to bet and click "Enter Lottery"
5. **Add More Players**: Other players can enter with their wallets
6. **Pick Winner**: Once there are players, click "Pick Winner" to randomly select a winner
7. **View Results**: The winner receives the entire pool, and the lottery resets

## Smart Contract Functions

- `initialize()`: Creates a new lottery with empty pool
- `enter(amount)`: Allows players to join by paying SOL
- `pick_winner()`: Randomly selects a winner and transfers the pool
- `get_lottery_info()`: Returns current pool and player information

## Project Structure

```
lottery-dapp/
├── programs/lottery-dapp/src/lib.rs    # Smart contract code
├── tests/                              # Smart contract tests
├── lottery-dapp-frontend/              # React frontend
│   ├── src/
│   │   ├── components/LotteryApp.jsx   # Main lottery component
│   │   ├── config.ts                   # Configuration (RPC, Program ID)
│   │   ├── anchor/setup.js             # Anchor program setup
│   │   └── WalletContextProvider.jsx   # Wallet integration
├── Anchor.toml                         # Anchor configuration
└── README.md                           # This file
```

## Testing

```bash
# Run smart contract tests
anchor test

# For frontend testing, you can use the browser developer tools
# to check console logs and network requests
```

## Deployment

### Devnet Deployment (Recommended for Demo)

```bash
# Set Solana to Devnet
solana config set --url devnet

# Airdrop SOL to your wallet
solana airdrop 2

# Deploy the program
anchor deploy
```

### Mainnet Deployment (Production)

```bash
# Set Solana to Mainnet
solana config set --url mainnet-beta

# Deploy the program (requires real SOL for deployment fees)
anchor deploy
```
