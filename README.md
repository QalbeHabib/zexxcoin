# QuantCoin Presale Program

A Solana-based presale program that implements a phased token sale system with increasing prices per phase. This program allows for a controlled distribution of tokens through multiple phases with different allocations and pricing.

## Overview

The QuantCoin Presale Program is designed to facilitate a token presale with the following features:

- 5 distinct presale phases with different token allocations and prices
- Total supply of 50,000,000 tokens
- Automated phase transitions
- Token claiming system
- Admin controls for token deposits and SOL withdrawals

## Presale Phases

The presale is divided into 5 phases with the following allocations:

| Phase | Allocation | Percentage | Price (SOL) | Tokens Available |
| ----- | ---------- | ---------- | ----------- | ---------------- |
| 1     | 2,500,000  | 5%         | 0.19999     | 2,500,000        |
| 2     | 5,000,000  | 10%        | 0.39999     | 5,000,000        |
| 3     | 17,500,000 | 35%        | 0.49999     | 17,500,000       |
| 4     | 20,000,000 | 40%        | 0.59999     | 20,000,000       |
| 5     | 5,000,000  | 10%        | 0.69999     | 5,000,000        |

## Features

- **Phase Management**: Automatic transition between phases based on time and token sales
- **Price Tiers**: Increasing price tiers across phases
- **Purchase Limits**: Configurable maximum token purchase limit per address
- **Token Deposits**: Admin can deposit tokens to be distributed during the presale
- **Token Claims**: Users can claim their purchased tokens after the presale ends
- **SOL Withdrawal**: Admin can withdraw collected SOL from sales

## Getting Started

### Prerequisites

- Node.js v14+ and npm
- Rust and Cargo
- Solana Tool Suite
- Anchor Framework

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/QuantCoin-presale.git
cd QuantCoin-presale
```

2. Install dependencies:

```bash
npm install
```

3. Build the program:

```bash
anchor build
```

### Configuration

1. Create a `.env` file with the following variables:

```env
BUYER_PRIVATE_KEY=your_private_key_here
```

2. Update the `keypair.json` file with your admin wallet credentials.

## Usage

### Initialize Presale

Create a new presale with specified parameters:

```typescript
const createPresale = async () => {
  const maxTokenAmountPerAddress = solToLamports(0.1);
  const startTime = new anchor.BN(Math.floor(Date.now() / 1000));
  const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + 86400 * 5); // 5 days

  await program.methods
    .createPresale(TOKEN_MINT, startTime, endTime, maxTokenAmountPerAddress)
    .accounts({...})
    .signers([authorityKeypair])
    .rpc();
};
```

### Deposit Tokens

Admin can deposit tokens to be distributed during the presale:

```typescript
const depositToken = async (amount: anchor.BN) => {
  await program.methods
    .depositToken(amount)
    .accounts({...})
    .signers([authorityKeypair])
    .rpc();
};
```

### Buy Tokens

Users can purchase tokens during the active phase:

```typescript
const buyToken = async (amount: anchor.BN) => {
  await program.methods
    .buyToken(amount)
    .accounts({...})
    .signers([buyerKeypair])
    .rpc();
};
```

### Claim Tokens

Users can claim their purchased tokens after the presale ends:

```typescript
const claimToken = async () => {
  await program.methods
    .claimToken(bump)
    .accounts({...})
    .signers([buyerKeypair])
    .rpc();
};
```

## Program Architecture

### Key Accounts

1. **PresaleInfo**: Stores presale configuration and state

   - Token mint address
   - Total supply and remaining tokens
   - Phase information
   - Start and end times
   - Maximum tokens per address

2. **UserInfo**: Tracks individual user participation

   - Tokens bought
   - Phase purchases
   - Claim status
   - Total amount paid

3. **PresaleVault**: Holds collected SOL from token sales

### Phase Management

Each phase is defined by:

- Token allocation
- Price per token
- Start and end times
- Active status
- Tokens sold and available

Phases automatically transition when:

- Current phase's tokens are sold out
- Current phase's time period ends

## Security Features

- PDA-based account derivation
- Authority checks for admin operations
- Purchase limit enforcement
- Phase-based price enforcement
- Token deposit verification
- Claim verification

## Error Handling

The program includes comprehensive error handling for:

- Invalid time ranges
- Insufficient funds
- Phase state violations
- Purchase limit violations
- Token availability
- Claim conditions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
