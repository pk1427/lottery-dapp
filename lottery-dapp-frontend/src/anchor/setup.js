import { AnchorProvider, Program } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID, RPC_ENDPOINT, IDL } from '../config';

export const getProgram = (wallet) => {
  if (!wallet || !wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = new Connection(RPC_ENDPOINT, 'confirmed');
  
  // Create a wallet adapter that works with Anchor
  const anchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: async (transaction) => {
      return await wallet.signTransaction(transaction);
    },
    signAllTransactions: async (transactions) => {
      return await wallet.signAllTransactions(transactions);
    },
  };

  const provider = new AnchorProvider(connection, anchorWallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });

  const program = new Program(IDL, PROGRAM_ID, provider);
  return { program, provider, connection };
};

export const getLotteryAccount = async (program, lotteryPublicKey) => {
  try {
    const account = await program.account.lottery.fetch(lotteryPublicKey);
    return account;
  } catch (error) {
    console.error('Error fetching lottery account:', error);
    return null;
  }
};
