// Import dependencies
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';

// Create a new Socket.io client
const socket = io('http://localhost:3000');

// Create a new functional component for the online users list
function OnlineUsersList() {
  // Initialize a state variable to store the current wallet
  const [wallet, setWallet] = useState(null);

  // Initialize a state variable to store the list of online wallets
  const [onlineWallets, setOnlineWallets] = useState([]);

  // Connect to the dapp using MetaMask
  const connectWithMetaMask = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Get the selected address
        const address = await web3.eth.getAccounts()[0];

        // Set the current wallet
        setWallet(address);

        // Send a connectWallet event to the server
        socket.emit('connectWallet', address);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error('MetaMask not detected');
    }
  };

  // Connect to the dapp using WalletConnect
  const connectWithWalletConnect = async () => {
    const provider = new WalletConnectProvider({
      rpc: { 1: 'https://mainnet.infura.io/v3/your-project-id' },
      qrcode: true,
    });

    try {
      // Connect to the WalletConnect provider
      await provider.enable();

      // Get the selected address
      const web3 = new Web3(provider);
      const address = await web3.eth.getAccounts()[0];

      // Set the current wallet
      setWallet(address);

      // Send a connectWallet event to the server
      socket.emit('connectWallet', address);
    } catch (error) {
      console.error(error);
    }
  };

  // Listen for updates to the list of online wallets
  useEffect(() => {
    socket.on('onlineWallets', (wallets) => {
      setOnlineWallets(wallets.filter((w) => w !== wallet));
    });
  }, [wallet]);

  // Render the list of online wallets and a connect button
  return (
    <div>
      {wallet ? (
        <div>
          <h2>Current Wallet: {wallet}</h2>
          <button onClick={() => setWallet(null)}>Disconnect</button>
          <h2>Online Wallets:</h2>
          <ul>
            {onlineWallets.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <button onClick={connectWithMetaMask}>Connect with MetaMask</button>
          <button onClick={connectWithWalletConnect}>Connect with WalletConnect</button>
        </div>
      )}
    </div>
  );
}

// Export the OnlineUsersList component
export default OnlineUsersList;
