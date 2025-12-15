# Web3 Todo DApp - Sepolia Testnet 📝⛓️

A decentralized todo application built on Ethereum's Sepolia testnet using Next.js, Hardhat, and Solidity.

## 🌟 Features

- ✅ Create, complete, and delete tasks on-chain
- 🌙 Dark mode toggle with localStorage persistence
- 🔍 Filter tasks (All / Completed / Pending)
- 💎 Modern glassmorphic UI design
- 🔗 RainbowKit wallet connection
- ⛓️ Deployed on Sepolia testnet
- 🎨 Responsive and accessible interface

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- MetaMask or any Web3 wallet
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mtalhaikram/web3-todo-solidity.git
   cd web3-todo-solidity
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Create `.env.local` in the frontend directory:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
   
   Fill in your API keys and credentials:
   - Get Sepolia RPC URL from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
   - Get WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Add your deployed contract address

4. **Deploy the smart contract** (optional - contract already deployed)
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

5. **Run the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### Smart Contract
- Solidity
- Hardhat
- OpenZeppelin
- Ethers.js

### Frontend
- Next.js 15
- TypeScript
- Viem
- RainbowKit
- React

## 📁 Project Structure

```
web3-todo-solidity/
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment scripts
├── test/              # Contract tests
├── frontend/          # Next.js application
│   ├── app/          # App directory (Next.js 13+)
│   ├── lib/          # Utilities and configs
│   └── public/       # Static assets
└── hardhat.config.ts  # Hardhat configuration
```

## 🔐 Security

⚠️ **IMPORTANT**: Never commit your private keys or API keys!

- All `.env` files are gitignored
- Use `.env.example` files as templates
- Only commit non-sensitive configuration
- Use test wallets with small amounts of testnet ETH for deployment

## 🎨 Features Breakdown

### Smart Contract Features
- Create tasks with descriptions
- Mark tasks as completed
- Delete tasks
- Query task count
- Retrieve individual task details

### UI Features
- 🌙 Dark/Light mode toggle
- 🔍 Task filtering (All/Completed/Pending)
- ⏳ Loading skeletons
- 💳 Wallet connection via RainbowKit
- 🌐 Network detection (ensures Sepolia)cribed
- 📱 Fully responsive design
- ✨ Smooth animations and transitions

## 🌐 Deployed Contract

- **Network**: Sepolia Testnet
- **Contract Address**: Check `.env.example` for format

## 📝 License

MIT License - feel free to use this project for learning and development!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Built with ❤️ for the Web3 community

## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- RainbowKit for beautiful wallet connection UI
- Hardhat for excellent development tools
- The Ethereum community

---

**Note**: This is a educational project deployed on testnet. Do not use for production without proper auditing.
