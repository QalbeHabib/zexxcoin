# ZEXXCOIN Presale Program

A Solana-based presale program that implements a phased token sale system with increasing prices per phase. This program allows for a controlled distribution of tokens through multiple phases with different allocations and pricing.

## Overview

The ZEXXCOIN Presale Program is designed to facilitate a token presale with the following features:

- 5 distinct presale phases with different token allocations and prices
- Total supply of 1,000,000 tokens
- Automated phase transitions
- Token claiming system
- Admin controls for token deposits and SOL withdrawals

## Presale Phases

The presale is divided into 5 phases with the following allocations and expected SOL raise:

| Phase | Token Allocation | Percentage | Price (SOL) | SOL Raised |
| ----- | ---------------- | ---------- | ----------- | ---------- |
| 1     | 50,000           | 5%         | 0.0005      | 25 SOL     |
| 2     | 100,000          | 10%        | 0.001       | 100 SOL    |
| 3     | 350,000          | 35%        | 0.0015      | 525 SOL    |
| 4     | 400,000          | 40%        | 0.002       | 800 SOL    |
| 5     | 100,000          | 10%        | 0.0025      | 250 SOL    |

Total Expected SOL Raise: 1,700 SOL
Average Token Price: 0.0017 SOL

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
git clone https://github.com/yourusername/ZEXXCOIN-presale.git
cd ZEXXCOIN-presale
```

2. Install dependencies:

```

```
