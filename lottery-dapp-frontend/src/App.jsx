import React from 'react';
import { WalletContextProvider } from './WalletContextProvider';
import LotteryApp from './components/LotteryApp';
import './App.css';

function App() {
  return (
    <WalletContextProvider>
      <LotteryApp />
    </WalletContextProvider>
  );
}

export default App;
