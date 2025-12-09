"use client";

import { useEffect, useState } from "react";
import abi from "../lib/abi.json";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
} from "viem";
import { sepolia } from "viem/chains";
import { CONTRACT_ADDRESS } from "../lib/contract";

export default function Home() {
  const [account, setAccount] = useState("");
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [currentChainId, setCurrentChainId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Create client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC),
  });

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
    
    // Check and switch to Sepolia if needed
    await switchToSepolia();
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) return;

    try {
      // Check current chain
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const sepoliaChainId = "0xaa36a7"; // 11155111 in hex

      if (chainId !== sepoliaChainId) {
        try {
          // Try to switch to Sepolia
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: sepoliaChainId }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: sepoliaChainId,
                    chainName: "Sepolia",
                    nativeCurrency: {
                      name: "Sepolia ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://rpc.sepolia.org"],
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              });
            } catch (addError) {
              console.error("Failed to add Sepolia network:", addError);
              throw addError;
            }
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error("Failed to switch to Sepolia:", error);
      alert("Please switch your MetaMask to Sepolia network manually");
    }
  };

  const loadTodos = async () => {
    const count = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "taskCount",
    });

    let tasks = [];
    for (let i = 1; i <= Number(count); i++) {
      const task = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "tasks",
        args: [i],
      });

      // task is returned as an array: [id, text, completed]
      if (task && task[1] && task[1].trim() !== "") {
        tasks.push({
          id: task[0],
          text: task[1],
          completed: task[2],
        });
      }
    }

    setTodos(tasks);
  };

  const addTodo = async () => {
    if (!newTask) return;
    if (!account) return alert("Please connect wallet first");

    setIsLoading(true);
    try {
      // Ensure we're on the right network
      await switchToSepolia();

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      // Send transaction and get hash
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "createTask",
        args: [newTask],
        account: account as `0x${string}`,
      });

      console.log("Transaction sent:", hash);
      
      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction confirmed:", receipt);

      setNewTask("");
      
      // Reload todos after transaction is confirmed
      await loadTodos();
    } catch (error) {
      console.error("Failed to add todo:", error);
      alert("Failed to add task. Please make sure you're on Sepolia network.");
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (id) => {
    if (!account) return alert("Please connect wallet first");

    setIsLoading(true);
    try {
      await switchToSepolia();

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "completeTask",
        args: [id],
        account: account as `0x${string}`,
      });

      console.log("Transaction sent:", hash);
      
      // Wait for transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash });
      console.log("Task completed");

      // Reload todos after transaction is confirmed
      await loadTodos();
    } catch (error) {
      console.error("Failed to complete task:", error);
      alert("Failed to complete task. Please make sure you're on Sepolia network.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id) => {
    if (!account) return alert("Please connect wallet first");

    setIsLoading(true);
    try {
      await switchToSepolia();

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "deleteTask",
        args: [id],
        account: account as `0x${string}`,
      });

      console.log("Transaction sent:", hash);
      
      // Wait for transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash });
      console.log("Task deleted");

      // Reload todos after transaction is confirmed
      await loadTodos();
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task. Please make sure you're on Sepolia network.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
    
    // Listen for chain changes
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_chainId" }).then(setCurrentChainId);
      
      window.ethereum.on("chainChanged", (chainId: string) => {
        setCurrentChainId(chainId);
      });
    }
  }, []);

  const getNetworkName = (chainId: string) => {
    const id = parseInt(chainId, 16);
    switch (id) {
      case 11155111:
        return "Sepolia ✅";
      case 31337:
        return "Hardhat (Local) ⚠️";
      case 1:
        return "Ethereum Mainnet";
      default:
        return `Unknown (${id})`;
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Web3 Todo — Sepolia</h1>

      {currentChainId && (
        <p style={{ 
          color: parseInt(currentChainId, 16) === 11155111 ? "green" : "orange",
          fontWeight: "bold" 
        }}>
          Network: {getNetworkName(currentChainId)}
        </p>
      )}

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <div style={{ marginTop: 20 }}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task"
          disabled={isLoading}
        />
        <button onClick={addTodo} disabled={isLoading}>
          {isLoading ? "Processing..." : "Add"}
        </button>
      </div>

      {isLoading && (
        <p style={{ color: "blue", marginTop: 10 }}>
          ⏳ Transaction in progress... Please wait for confirmation.
        </p>
      )}

      <h2 style={{ marginTop: 20 }}>Tasks</h2>

      {todos.map((t) => (
        <div key={t.id} style={{ marginTop: 10 }}>
          <b>{t.text}</b> — {t.completed ? "✔ Done" : "❌ Pending"}
          {!t.completed && (
            <button onClick={() => completeTask(t.id)} disabled={isLoading}>
              Complete
            </button>
          )}
          <button 
            onClick={() => deleteTask(t.id)} 
            style={{ marginLeft: 10 }}
            disabled={isLoading}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
