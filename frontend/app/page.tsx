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

interface Todo {
  id: bigint;
  text: string;
  completed: boolean;
}

export default function Home() {
  const [account, setAccount] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
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
    <div className="container">
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1>Web3 Todo App</h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          marginTop: 'var(--spacing-xs)'
        }}>
          Decentralized task management on Sepolia testnet
        </p>
      </div>

      {/* Network Status Badge */}
      {currentChainId && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <span className={
            parseInt(currentChainId, 16) === 11155111
              ? "badge badge-success"
              : "badge badge-warning"
          }>
            {parseInt(currentChainId, 16) === 11155111 ? "✓" : "⚠"} {getNetworkName(currentChainId)}
          </span>
        </div>
      )}

      {/* Wallet Connection Card */}
      <div className="glass-card" style={{
        marginBottom: 'var(--spacing-xl)',
        padding: 'var(--spacing-xl)',
        textAlign: 'center'
      }}>
        {!account ? (
          <div>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-md)',
              fontSize: '0.9rem'
            }}>
              Connect your wallet to get started
            </p>
            <button onClick={connectWallet} className="btn-primary">
              🔗 Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-tertiary)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              Connected Address
            </p>
            <p style={{
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          </div>
        )}
      </div>

      {/* Add Task Card */}
      <div className="glass-card" style={{
        marginBottom: 'var(--spacing-xl)',
        padding: 'var(--spacing-xl)'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          marginBottom: 'var(--spacing-md)',
          textAlign: 'center'
        }}>
          ➕ Add New Task
        </h2>
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          alignItems: 'stretch'
        }}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What needs to be done?"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading && newTask) {
                addTodo();
              }
            }}
            style={{ flex: 1 }}
          />
          <button
            onClick={addTodo}
            disabled={isLoading || !newTask}
            className="btn-primary"
            style={{ minWidth: '100px' }}
          >
            {isLoading ? "⏳" : "Add"}
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="glass-card fade-in" style={{
          marginBottom: 'var(--spacing-xl)',
          padding: 'var(--spacing-md)',
          textAlign: 'center',
          background: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'var(--primary)'
        }}>
          <p style={{
            color: 'var(--primary)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-sm)'
          }}>
            <span className="loading">⏳</span>
            Transaction in progress... Please wait for confirmation.
          </p>
        </div>
      )}

      {/* Tasks Section */}
      <div className="glass-card" style={{ padding: 'var(--spacing-xl)' }}>
        <h2 style={{
          fontSize: '1.25rem',
          marginBottom: 'var(--spacing-lg)',
          textAlign: 'center'
        }}>
          📋 Your Tasks
        </h2>

        {todos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-2xl)',
            color: 'var(--text-tertiary)'
          }}>
            <p style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📝</p>
            <p>No tasks yet. Add your first task above!</p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md)'
          }}>
            {todos.map((t, index) => (
              <div
                key={t.id}
                className="card fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  animationDelay: `${index * 50}ms`
                }}
              >
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)'
                }}>
                  <span style={{
                    fontSize: '1.5rem',
                    opacity: t.completed ? '0.5' : '1'
                  }}>
                    {t.completed ? "✅" : "⭕"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '1rem',
                      fontWeight: '500',
                      textDecoration: t.completed ? 'line-through' : 'none',
                      opacity: t.completed ? '0.6' : '1',
                      color: 'var(--text-primary)'
                    }}>
                      {t.text}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      marginTop: 'var(--spacing-xs)'
                    }}>
                      Task #{t.id.toString()}
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: 'var(--spacing-sm)',
                  flexShrink: 0
                }}>
                  {!t.completed && (
                    <button
                      onClick={() => completeTask(t.id)}
                      disabled={isLoading}
                      className="btn-success"
                      style={{ fontSize: '0.8rem' }}
                    >
                      ✓ Complete
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(t.id)}
                    disabled={isLoading}
                    className="btn-danger"
                    style={{ fontSize: '0.8rem' }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {todos.length > 0 && (
          <div style={{
            marginTop: 'var(--spacing-lg)',
            paddingTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--spacing-lg)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            <span>Total: {todos.length}</span>
            <span>•</span>
            <span>Completed: {todos.filter(t => t.completed).length}</span>
            <span>•</span>
            <span>Pending: {todos.filter(t => !t.completed).length}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: 'var(--spacing-2xl)',
        color: 'var(--text-tertiary)',
        fontSize: '0.85rem'
      }}>
        <p>Built with ❤️ on Ethereum Sepolia</p>
      </div>
    </div>
  );
}
