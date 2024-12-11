# Solana SPL Token Presale Program

A comprehensive Solana program for managing token presales, built with the Anchor framework. This program enables projects to conduct token presales with configurable parameters, security features, and automated distribution.

## Features

### Core Functionality

1. **Presale Creation & Management**

   - Set token mint address
   - Configure soft and hard caps
   - Set per-wallet purchase limits
   - Define token price
   - Set presale duration (start/end times)

2. **Token Operations**

   - Deposit presale tokens
   - Purchase tokens with SOL
   - Claim purchased tokens
   - Withdraw collected SOL (admin)
   - Withdraw unsold tokens (admin)

3. **Security Features**
   - Authority-based access control
   - Time-based restrictions
   - Purchase amount validations
   - Soft/hard cap enforcement

### Program Instructions

1. `create_presale`

   - Initialize presale with parameters
   - Set token mint, caps, limits, and timing

   ```rust
   pub fn create_presale(
       token_mint_address: Pubkey,
       softcap_amount: u64,
       hardcap_amount: u64,
       max_token_amount_per_address: u64,
       price_per_token: u64,
       start_time: u64,
       end_time: u64,
   )
   ```

2. `update_presale`

   - Modify presale parameters
   - Update timing, limits, and pricing

   ```rust
   pub fn update_presale(
       max_token_amount_per_address: u64,
       price_per_token: u64,
       softcap_amount: u64,
       hardcap_amount: u64,
       start_time: u64,
       end_time: u64,
   )
   ```

3. `deposit_token`

   - Deposit tokens for sale

   ```rust
   pub fn deposit_token(amount: u64)
   ```

4. `buy_token`

   - Purchase tokens with SOL

   ```rust
   pub fn buy_token(quote_amount: u64)
   ```

5. `claim_token`

   - Claim purchased tokens after presale

   ```rust
   pub fn claim_token(bump: u8)
   ```

6. `withdraw_sol`

   - Withdraw collected SOL (admin only)

   ```rust
   pub fn withdraw_sol(bump: u8)
   ```

7. `withdraw_token`
   - Withdraw unsold tokens (admin only)
   ```rust
   pub fn withdraw_token(amount: u64, bump: u8)
   ```

## Program Architecture

### Account Structure

1. **PresaleInfo**: Stores presale configuration and state

   - Token mint address
   - Caps and limits
   - Timing parameters
   - Collection status

2. **UserInfo**: Tracks individual user participation
   - Purchase amounts
   - Claim status
   - Timestamps

### Security Considerations

- Authority validation for admin operations
- PDA-based account derivation
- Time-based access control
- Amount validation checks

## Development Setup

1. **Prerequisites**

   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

   # Install Solana CLI
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

   # Install Anchor CLI
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   ```

2. **Build**

   ```bash
   # Build the program
   anchor build

   # Run tests
   anchor test
   ```

3. **Deploy**

   ```bash
   # Deploy to devnet
   anchor deploy --provider.cluster devnet

   # Deploy to mainnet
   anchor deploy --provider.cluster mainnet-beta
   ```

## Testing

```bash
# Run all tests
anchor test

# Run specific test
anchor test test_create_presale
```

## Integration Guide

1. **Initialize Presale**

   ```typescript
   const presaleParams = {
     tokenMintAddress: new PublicKey("..."),
     softcapAmount: new BN("1000000000"),
     hardcapAmount: new BN("5000000000"),
     maxTokenAmountPerAddress: new BN("1000000000"),
     pricePerToken: new BN("1000000"),
     startTime: new BN(Math.floor(Date.now() / 1000) + 3600),
     endTime: new BN(Math.floor(Date.now() / 1000) + 86400),
   };
   ```

2. **User Participation**

   ```typescript
   // Buy tokens
   await program.methods
       .buyToken(new BN("1000000000"))
       .accounts({...})
       .rpc();

   // Claim tokens
   await program.methods
       .claimToken(bump)
       .accounts({...})
       .rpc();
   ```

## Security Recommendations

1. **For Administrators**

   - Thoroughly test on devnet
   - Verify all parameters before mainnet deployment
   - Secure authority keypair
   - Monitor transactions during presale

2. **For Users**
   - Verify program address
   - Check token mint address
   - Confirm presale parameters
   - Use official UI/interface

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

For detailed token creation instructions, see [TOKEN_CREATION.md](./TOKEN_CREATION.md)
