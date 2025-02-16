# Quant Coin Presale Program

A Solana program for managing a multi-phase token presale with advanced features and safety mechanisms.

## Overview

The Quant Coin Presale Program is a sophisticated Solana smart contract that manages a token presale across multiple phases. It includes features like phase management, emergency controls, and user purchase tracking.

## Features

### Phase Management

- 5 distinct presale phases with different allocations and prices
- Automatic phase transitions
- Phase status tracking (Upcoming, Active, Ended)
- Per-phase purchase limits and tracking

### Phase Details

1. **Phase 1**

   - Allocation: 50,000 tokens (5%)
   - Price: 0.00004 SOL per token
   - Soft cap: 100 tokens
   - Hard cap: 50,000 tokens

2. **Phase 2**

   - Allocation: 100,000 tokens (10%)
   - Price: 0.000023 SOL per token
   - Soft cap: 200 tokens
   - Hard cap: 100,000 tokens

3. **Phase 3**

   - Allocation: 350,000 tokens (35%)
   - Price: 0.00000857 SOL per token
   - Soft cap: 300 tokens
   - Hard cap: 350,000 tokens

4. **Phase 4**

   - Allocation: 400,000 tokens (40%)
   - Price: 0.000009 SOL per token
   - Soft cap: 400 tokens
   - Hard cap: 400,000 tokens

5. **Phase 5**
   - Allocation: 100,000 tokens (10%)
   - Price: 0.000015 SOL per token
   - Soft cap: 500 tokens
   - Hard cap: 100,000 tokens

### Security Features

- Emergency stop functionality
- Admin-only controls
- Purchase limits per address
- Secure token vault management

### User Features

- Individual purchase tracking
- Phase-specific purchase history
- Token claiming system
- Purchase history preservation

## Program Instructions

### Admin Instructions

1. `create_presale`

   - Initializes the presale with token mint and parameters
   - Sets up initial phase configuration

2. `deposit_token`

   - Allows admin to deposit presale tokens
   - Initializes token vault

3. `withdraw_sol`

   - Allows admin to withdraw collected SOL
   - Only accessible by presale authority

4. `emergency_stop`

   - Immediately pauses all presale operations
   - Admin-only function for emergency situations

5. `resume_presale`
   - Resumes paused presale operations
   - Sets new display end time
   - Admin-only function

### User Instructions

1. `buy_token`

   - Purchase tokens in current active phase
   - Automatically handles phase transitions
   - Enforces purchase limits

2. `claim_token`
   - Claim purchased tokens from specific phases
   - Maintains purchase history
   - Prevents double claims

## Phase Status System

The program uses an enumerated status system for phases:

- `Upcoming (0)`: Phase not yet started
- `Active (1)`: Phase currently accepting purchases
- `Ended (2)`: Phase completed

## Technical Details

### Token Configuration

- Decimals: 9 (same as SOL)
- Total Supply: 1,000,000 tokens
- Max Tokens Per Address: 20,000 tokens (2% of total supply)

### Program Accounts

1. `PresaleInfo`: Main presale state account
2. `UserInfo`: Individual user purchase records
3. `Phase`: Phase-specific information and status

## Integration

The program includes TypeScript integration scripts for all major functions:

- `createPresale.ts`: Initialize presale
- `depositToken.ts`: Deposit presale tokens
- `buyToken.ts`: Purchase tokens
- `claimToken.ts`: Claim purchased tokens

## Safety Mechanisms

1. **Purchase Validation**

   - Soft cap enforcement
   - Hard cap limits
   - Per-address limits
   - Phase status checks

2. **State Protection**

   - Purchase history preservation
   - Phase-specific claim tracking
   - Emergency stop capability

3. **Access Control**
   - Admin-only functions
   - PDA-based account validation
   - Secure vault management

## Development

### Prerequisites

- Solana Tool Suite
- Anchor Framework
- Node.js and npm/yarn

### Building

```bash
anchor build
```

### Testing

```bash
anchor test
```

### Deployment

```bash
anchor deploy
```

## License

[Add your license information here]
