import { ethers } from 'ethers';

export interface WalletInfo {
  address: string;
  chainId: number;
  balance: string;
}

export interface SignatureRequest {
  message: string;
  nonce: string;
}

export interface SignatureResponse {
  signature: string;
  address: string;
}

class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet(): Promise<WalletInfo> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Create provider
      this.provider = new ethers.BrowserProvider(window.ethereum);

      // Request account access
      await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Get signer
      this.signer = await this.provider.getSigner();

      // Get address and balance
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      const network = await this.provider.getNetwork();

      return {
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet. Please try again.');
    }
  }

  /**
   * Sign a message for authentication
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    try {
      const signature = await this.signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error('Failed to sign message. Please try again.');
    }
  }

  /**
   * Get current wallet info if connected
   */
  async getWalletInfo(): Promise<WalletInfo | null> {
    if (!this.provider || !this.signer) {
      return null;
    }

    try {
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      const network = await this.provider.getNetwork();

      return {
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      return null;
    }
  }

  /**
   * Switch to a specific network
   */
  async switchNetwork(chainId: number): Promise<void> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed.');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the chain is not added, try to add it
      if (error.code === 4902) {
        await this.addNetwork(chainId);
      } else {
        throw new Error('Failed to switch network.');
      }
    }
  }

  /**
   * Add a network to MetaMask
   */
  private async addNetwork(chainId: number): Promise<void> {
    const networkConfigs: Record<number, any> = {
      11155111: {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      },
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io'],
      },
    };

    const config = networkConfigs[chainId];
    if (!config) {
      throw new Error(`Network configuration for chainId ${chainId} not found.`);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [config],
      });
    } catch (error) {
      console.error('Error adding network:', error);
      throw new Error('Failed to add network.');
    }
  }

  /**
   * Disconnect wallet (reset provider and signer)
   */
  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }

  /**
   * Get current network chain ID
   */
  async getChainId(): Promise<number | null> {
    if (!this.provider) {
      return null;
    }

    try {
      const network = await this.provider.getNetwork();
      return Number(network.chainId);
    } catch (error) {
      console.error('Error getting chain ID:', error);
      return null;
    }
  }

  /**
   * Setup event listeners for MetaMask
   */
  setupEventListeners(
    onAccountsChanged: (accounts: string[]) => void,
    onChainChanged: (chainId: string) => void,
    onConnect: (connectInfo: { chainId: string }) => void,
    onDisconnect: (error: { code: number; message: string }) => void
  ): void {
    if (!this.isMetaMaskInstalled()) {
      return;
    }

    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', onChainChanged);
    window.ethereum.on('connect', onConnect);
    window.ethereum.on('disconnect', onDisconnect);
  }

  /**
   * Remove event listeners
   */
  removeEventListeners(): void {
    if (!this.isMetaMaskInstalled()) {
      return;
    }

    // MetaMask doesn't provide a way to remove specific listeners
    // This is a limitation of the MetaMask API
  }
}

// Create singleton instance
const walletService = new WalletService();

export default walletService;

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}