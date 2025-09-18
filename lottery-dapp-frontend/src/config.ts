import { PublicKey } from '@solana/web3.js';

// Program ID from deployment (REAL DEPLOYED CONTRACT)
export const PROGRAM_ID = new PublicKey('AKpH6fPQEV7cxF4mRtEsHwtdnYRcNiYwTu6BZYGqUz8u');

// RPC endpoints
export const RPC_ENDPOINTS = {
  localnet: 'http://127.0.0.1:8899',
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
};

// Default to devnet for demo
export const RPC_ENDPOINT = RPC_ENDPOINTS.devnet;

// Import the IDL
export { default as IDL } from './idl/lottery_dapp.json';
