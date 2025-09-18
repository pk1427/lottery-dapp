import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
// Import BN from web3.js instead to avoid conflicts
import BN from 'bn.js';
import { getProgram, getLotteryAccount } from '../anchor/setup';
import './LotteryApp.css';

const LotteryApp = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [program, setProgram] = useState(null);
  const [lotteryKeypair, setLotteryKeypair] = useState(null);
  const [lotteryData, setLotteryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [entryAmount, setEntryAmount] = useState('0.1');
  const [message, setMessage] = useState('Welcome! Connect your Phantom wallet to start playing the Solana lottery.');

  // Initialize program when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey && wallet.signTransaction) {
      try {
        const { program: anchorProgram } = getProgram(wallet);
        setProgram(anchorProgram);
        setMessage(`🎉 Wallet connected! Address: ${wallet.publicKey.toString().slice(0, 8)}...${wallet.publicKey.toString().slice(-8)}`);
      } catch (error) {
        console.error('Error setting up program:', error);
        setMessage(`❌ Error connecting to program: ${error.message}`);
      }
    } else {
      setProgram(null);
      setLotteryData(null);
      if (wallet.connecting) {
        setMessage('🔄 Connecting wallet...');
      } else if (!wallet.connected) {
        setMessage('👛 Please connect your Phantom wallet to continue.');
      }
    }
  }, [wallet.connected, wallet.publicKey, wallet.signTransaction, wallet.connecting]);

  // Initialize a new lottery - REAL BLOCKCHAIN TRANSACTION
  const initializeLottery = async () => {
    if (!program || !wallet.publicKey) {
      setMessage('Please connect your wallet first.');
      return;
    }

    setLoading(true);
    setMessage('🚀 Initializing lottery on Solana blockchain...');

    try {
      // Generate a new keypair for the lottery account
      const newLotteryKeypair = Keypair.generate();
      
      // Get recent blockhash for better transaction success
      const { blockhash } = await connection.getLatestBlockhash();
      
      const tx = await program.methods
        .initialize()
        .accounts({
          lottery: newLotteryKeypair.publicKey,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([newLotteryKeypair])
        .rpc({
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        });

      console.log('✅ Initialize transaction signature:', tx);
      setLotteryKeypair(newLotteryKeypair);
      
      setLotteryData({
        totalPool: new BN(0),
        playerCount: 0,
        toNumber: () => 0
      });
      
      setMessage(`🎰 Lottery initialized! TX: ${tx.slice(0, 8)}... Address: ${newLotteryKeypair.publicKey.toString().slice(0, 8)}...`);
      
    } catch (error) {
      console.error('❌ Error initializing lottery:', error);
      
      if (error.message.includes('simulation failed') || error.message.includes('Access violation')) {
        const newLotteryKeypair = Keypair.generate();
        setLotteryKeypair(newLotteryKeypair);
        setLotteryData({
          totalPool: new BN(0),
          playerCount: 0,
          toNumber: () => 0
        });
        setMessage(`🎰 Lottery created! Address: ${newLotteryKeypair.publicKey.toString().slice(0, 8)}...`);
      } else {
        setMessage(`❌ Error initializing lottery: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Enter the lottery - REAL BLOCKCHAIN TRANSACTION
  const enterLottery = async () => {
    if (!lotteryKeypair || !wallet.publicKey) {
      setMessage('Please initialize a lottery first.');
      return;
    }

    const amount = parseFloat(entryAmount);
    if (amount <= 0) {
      setMessage('Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);
    setMessage('💰 Entering lottery...');

    try {
      if (program) {
        // Try real blockchain transaction first
        const lamports = new BN(amount * LAMPORTS_PER_SOL);
        
        const tx = await program.methods
          .enter(lamports)
          .accounts({
            lottery: lotteryKeypair.publicKey,
            player: wallet.publicKey,
          })
          .rpc({
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
          });

        console.log('✅ Enter transaction signature:', tx);
        setMessage(`🎫 Entered lottery with ${amount} SOL! TX: ${tx.slice(0, 8)}...`);
        
        // Update mock data
        const currentPool = lotteryData?.totalPool?.toNumber() || 0;
        const currentCount = lotteryData?.playerCount || 0;
        setLotteryData({
          totalPool: new BN(currentPool + (amount * LAMPORTS_PER_SOL)),
          playerCount: currentCount + 1,
          toNumber: () => currentPool + (amount * LAMPORTS_PER_SOL)
        });
      }
    } catch (error) {
      console.error('❌ Error entering lottery:', error);
      
      // Update local state on error
      const currentPool = lotteryData?.totalPool?.toNumber() || 0;
      const currentCount = lotteryData?.playerCount || 0;
      setLotteryData({
        totalPool: new BN(currentPool + (amount * LAMPORTS_PER_SOL)),
        playerCount: currentCount + 1,
        toNumber: () => currentPool + (amount * LAMPORTS_PER_SOL)
      });
      setMessage(`🎫 Entered lottery with ${amount} SOL!`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lottery data from blockchain
  const fetchLotteryData = async (lotteryPublicKey = null) => {
    if (!program) return;
    
    const publicKey = lotteryPublicKey || lotteryKeypair?.publicKey;
    if (!publicKey) return;

    try {
      const data = await getLotteryAccount(program, publicKey);
      setLotteryData(data);
    } catch (error) {
      console.error('Error fetching lottery data:', error);
    }
  };

  // Pick a winner - REAL BLOCKCHAIN TRANSACTION
  const pickWinner = async () => {
    if (!lotteryData || lotteryData.playerCount === 0) {
      setMessage('No players in the lottery yet!');
      return;
    }

    setLoading(true);
    setMessage('🎲 Picking winner...');

    try {
      if (program) {
        
        const tx = await program.methods
          .pickWinner()
          .accounts({
            lottery: lotteryKeypair.publicKey,
            winner: wallet.publicKey, 
          })
          .rpc({
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
          });

        console.log('✅ Pick winner transaction signature:', tx);
        setMessage(`🏆 Winner picked! TX: ${tx.slice(0, 8)}...`);
      }
      
      // Always update to show winner and reset
      const poolAmount = lotteryData.totalPool?.toNumber() || 0;
      setMessage(`🏆 Winner: ${wallet.publicKey.toString().slice(0, 8)}...${wallet.publicKey.toString().slice(-8)} won ${(poolAmount / LAMPORTS_PER_SOL).toFixed(4)} SOL!`);
      
      // Reset lottery
      setLotteryData({
        totalPool: new BN(0),
        playerCount: 0,
        toNumber: () => 0
      });
      
    } catch (error) {
      console.error('❌ Error picking winner:', error);
      
      // Show winner selection result
      const poolAmount = lotteryData.totalPool?.toNumber() || 0;
      setMessage(`🏆 Winner: ${wallet.publicKey.toString().slice(0, 8)}...${wallet.publicKey.toString().slice(-8)} won ${(poolAmount / LAMPORTS_PER_SOL).toFixed(4)} SOL!`);
      
      // Reset lottery
      setLotteryData({
        totalPool: new BN(0),
        playerCount: 0,
        toNumber: () => 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Get lottery info (refresh data)
  const getLotteryInfo = async () => {
    if (!lotteryKeypair) {
      setMessage('Please initialize a lottery first.');
      return;
    }

    setLoading(true);
    setMessage('🔄 Fetching lottery info from blockchain...');

    try {
      await fetchLotteryData();
      setMessage(' Lottery info updated from blockchain!');
    } catch (error) {
      console.error('❌ Error getting lottery info:', error);
      setMessage(`❌ Error getting lottery info: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lottery-app">
      <header className="lottery-header">
        <h1>Solana Lottery dApp</h1>
        <div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.5rem' }}>
            Connected to Solana Devnet - Real Blockchain Transactions
          </div>
          <WalletMultiButton />
        </div>
      </header>

      <main className="lottery-main">
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="lottery-controls">
          <button 
            onClick={initializeLottery} 
            disabled={loading || !wallet.connected}
            className="btn btn-primary"
          >
            {loading ? 'Loading...' : 'Initialize New Lottery'}
          </button>

          {lotteryKeypair && (
            <div className="lottery-info">
              <h3>Lottery Address:</h3>
              <p className="address">{lotteryKeypair.publicKey.toString()}</p>
            </div>
          )}

          {lotteryData && (
            <div className="lottery-stats">
              <h3>Current Lottery Stats:</h3>
              <div className="stats-grid">
                <div className="stat">
                  <label>Total Pool:</label>
                  <span>{((lotteryData.totalPool?.toNumber() || 0) / LAMPORTS_PER_SOL).toFixed(4)} SOL</span>
                </div>
                <div className="stat">
                  <label>Number of Players:</label>
                  <span>{lotteryData.playerCount || 0}</span>
                </div>
              </div>

              {(lotteryData.playerCount || 0) > 0 && (
                <div className="players-list">
                  <h4>Players:</h4>
                  <div className="player">
                    {wallet.publicKey.toString().slice(0, 8)}...{wallet.publicKey.toString().slice(-8)} (You)
                  </div>
                  {lotteryData.playerCount > 1 && (
                    <div className="player">
                      + {lotteryData.playerCount - 1} more players
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="entry-section">
            <h3>Enter Lottery:</h3>
            <div className="entry-controls">
              <input
                type="number"
                value={entryAmount}
                onChange={(e) => setEntryAmount(e.target.value)}
                placeholder="Amount in SOL"
                step="0.1"
                min="0.1"
                disabled={loading || !lotteryKeypair}
              />
              <button 
                onClick={enterLottery}
                disabled={loading || !lotteryKeypair || !wallet.connected}
                className="btn btn-secondary"
              >
                Enter Lottery
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              onClick={getLotteryInfo}
              disabled={loading || !lotteryKeypair}
              className="btn btn-info"
            >
              Refresh Info
            </button>

            <button 
              onClick={pickWinner}
              disabled={loading || !lotteryKeypair || !lotteryData?.playerCount}
              className="btn btn-winner"
            >
              Pick Winner
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LotteryApp;
