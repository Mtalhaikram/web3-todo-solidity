// // lib/contract.ts
// import { createPublicClient, createWalletClient, http } from "viem";
// import { sepolia } from "viem/chains";
// import abi from "./abi.json"; // Save ABI in this file

// export const CONTRACT_ADDRESS =
//   "0xBd5E4f7DfA9f1bb5b0E90AB92846Fe55D482173f";

// export const publicClient = createPublicClient({
//   chain: sepolia,
//   transport: http("https://eth-sepolia.g.alchemy.com/v2/XXXX"), // your RPC
// });

// export const walletClient = (account: `0x${string}`) =>
//   createWalletClient({
//     account,
//     chain: sepolia,
//     transport: http("https://eth-sepolia.g.alchemy.com/v2/XXXX"),
//   });

// export const contractConfig = {
//   address: CONTRACT_ADDRESS as `0x${string}`,
//   abi,
// };

// lib/contract.ts
import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import abi from "./abi.json";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
export const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

export const walletClient = (account: `0x${string}`) =>
  createWalletClient({
    account,
    chain: sepolia,
    transport: http(RPC_URL),
  });

export const contractConfig = {
  address: CONTRACT_ADDRESS,
  abi,
};
