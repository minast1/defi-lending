# Overcollateralized Lending Protocol — Market Simulator & DeFi Playground

A full-stack decentralized lending protocol with a live market simulator, liquidation engine, and swap interface.  
Built to explore **DeFi risk dynamics**, **collateralized borrowing**, and **liquidation mechanics** in a realistic, observable environment.

This project combines **smart contracts**, **a Next.js frontend**, and a **server-side market simulator** that continuously moves prices, borrows, adds collateral, and performs liquidations.

---

## 🧠 What This Project Does

### Core Protocol

- Users deposit **ETH as collateral**
- Users borrow **DAI (ERC20 stable token)** against their collateral
- Positions are monitored for safety based on price movements
- Unsafe positions can be **liquidated** by third parties for a reward

### Market Simulator

- Randomized price movement (up & down trends)
- Random borrowing behavior (conservative vs aggressive)
- Random collateral additions
- Automated liquidation detection & execution
- ETH funding for bot wallets to keep simulation alive

### Frontend

- Swap interface (ETH ⇄ DAI)
- Borrow / Add Collateral UI
- Live liquidation monitor
- Simulator start/stop controls
- Real-time on-chain event tracking

---

## 🧩 Architecture Overview

┌────────────┐
│ Next.js │ ← App Router (UI + API routes)
│ Frontend │
└─────┬──────┘
│
│ viem / wagmi
▼
┌────────────┐
│ Ethereum │ ← Local / Testnet
│ Contracts │
└─────┬──────┘
│
│ JSON-RPC
▼
┌────────────┐
│ Simulator │ ← Node runtime (server-side)
│ Engine │
└────────────┘

---

## 🛠️ Tech Stack

### Smart Contracts

- **Solidity**
- **Foundry**
- **OpenZeppelin**

### Frontend

- **Next.js (App Router)**
- **TypeScript**
- **React Hook Form**
- **Zod**
- **TailwindCSS**
- **shadcn/ui**

### Web3 / Infra

- **wagmi**
- **viem**
- **scaffold-eth-2**
- **Alchemy / JSON-RPC**
- **MetaMask & WalletConnect**

### Simulator

- Node.js runtime
- viem wallet clients
- Server-side loops (non-edge)
- Multi-wallet bot orchestration

---

## 🚀 Running the Project

### 1. Install dependencies

```bash
yarn install

yarn chain

yarn deploy

yarn start
```
