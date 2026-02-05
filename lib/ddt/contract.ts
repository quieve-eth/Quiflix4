import { createPublicClient, createWalletClient, http, parseEther, toHex } from 'viem';
import { base } from 'viem/chains';

// This file handles interactions with the QuiflixDDT smart contract on Base network

export const DDT_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_goodflixWallet', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { internalType: 'string', name: '_title', type: 'string' },
      { internalType: 'address', name: '_filmmaker', type: 'address' },
      { internalType: 'string', name: '_filmHash', type: 'string' },
    ],
    name: 'registerFilm',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_filmId', type: 'uint256' }],
    name: 'approveFilmAndMintDDTs',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_walletAddress', type: 'address' },
      { internalType: 'string', name: '_companyName', type: 'string' },
    ],
    name: 'registerDistributor',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_filmId', type: 'uint256' },
      { internalType: 'uint256', name: '_distributorId', type: 'uint256' },
    ],
    name: 'assignDDTToDistributor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_filmId', type: 'uint256' },
      { internalType: 'uint256', name: '_distributorId', type: 'uint256' },
      { internalType: 'uint256', name: '_saleAmount', type: 'uint256' },
    ],
    name: 'recordSaleAndDistributeRevenue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Initialize clients
export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
});

// Get wallet client (server-side only)
export function getWalletClient() {
  if (!process.env.GOODFLIX_PRIVATE_KEY) {
    throw new Error('GOODFLIX_PRIVATE_KEY not configured');
  }

  return createWalletClient({
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
    account: process.env.GOODFLIX_PRIVATE_KEY as `0x${string}`,
  });
}

// Contract interactions
export async function registerFilmOnChain(
  contractAddress: string,
  title: string,
  filmmakerAddress: string,
  ipfsHash: string
): Promise<{ filmId: number; txHash: string }> {
  const walletClient = getWalletClient();

  const txHash = await walletClient.writeContract({
    account: walletClient.account,
    address: contractAddress as `0x${string}`,
    abi: DDT_CONTRACT_ABI,
    functionName: 'registerFilm',
    args: [title, filmmakerAddress as `0x${string}`, ipfsHash],
  });

  // Get receipt and extract film ID from logs
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  return {
    filmId: 1, // Would be parsed from event logs in production
    txHash,
  };
}

export async function approveFilmAndMintDDTs(
  contractAddress: string,
  filmId: number
): Promise<string> {
  const walletClient = getWalletClient();

  const txHash = await walletClient.writeContract({
    account: walletClient.account,
    address: contractAddress as `0x${string}`,
    abi: DDT_CONTRACT_ABI,
    functionName: 'approveFilmAndMintDDTs',
    args: [BigInt(filmId)],
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });

  return txHash;
}

export async function registerDistributorOnChain(
  contractAddress: string,
  walletAddress: string,
  companyName: string
): Promise<{ distributorId: number; txHash: string }> {
  const walletClient = getWalletClient();

  const txHash = await walletClient.writeContract({
    account: walletClient.account,
    address: contractAddress as `0x${string}`,
    abi: DDT_CONTRACT_ABI,
    functionName: 'registerDistributor',
    args: [walletAddress as `0x${string}`, companyName],
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });

  return {
    distributorId: 1, // Would be parsed from event logs in production
    txHash,
  };
}

export async function assignDDTToDistributor(
  contractAddress: string,
  filmId: number,
  distributorId: number
): Promise<string> {
  const walletClient = getWalletClient();

  const txHash = await walletClient.writeContract({
    account: walletClient.account,
    address: contractAddress as `0x${string}`,
    abi: DDT_CONTRACT_ABI,
    functionName: 'assignDDTToDistributor',
    args: [BigInt(filmId), BigInt(distributorId)],
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });

  return txHash;
}

export async function recordSaleOnChain(
  contractAddress: string,
  filmId: number,
  distributorId: number,
  saleAmount: string // in wei
): Promise<string> {
  const walletClient = getWalletClient();

  const txHash = await walletClient.writeContract({
    account: walletClient.account,
    address: contractAddress as `0x${string}`,
    abi: DDT_CONTRACT_ABI,
    functionName: 'recordSaleAndDistributeRevenue',
    args: [BigInt(filmId), BigInt(distributorId), BigInt(saleAmount)],
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });

  return txHash;
}
