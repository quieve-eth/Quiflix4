# Quiflix Payment System

Complete guide to the Quiflix payment integration with Pretium.africa for Kenyan users.

## Overview

The payment system enables:
- Kenyan users to purchase films in KES (Kenyan Shillings)
- Automatic conversion to stablecoins (USDC/USDT) via Pretium
- Direct payments to filmmaker and distributor wallets
- Real-time transaction tracking
- Secure wallet management for creators

## Architecture

### Payment Flow

1. **Viewer Initiates Purchase**
   - Clicks "Buy Now" on distributor's film link
   - Directed to checkout page at `/checkout/[filmId]?ref=[referralCode]`

2. **Checkout Page** (`/app/checkout/[filmId]/page.tsx`)
   - Displays film details and price
   - Shows exchange rate (KES to USD)
   - Allows selection of:
     - Payment method (M-Pesa, Credit Card)
     - Stablecoin preference (USDC or USDT)

3. **Order Creation** (`/api/payment/create-order`)
   - Creates payment transaction record in database
   - Calls Pretium API to generate payment order
   - Returns payment URL for redirect

4. **Pretium Payment Processing**
   - User completes payment on Pretium platform
   - Funds convert to stablecoins on Base network
   - Stablecoins sent to buyer's ephemeral wallet

5. **Webhook Processing** (`/api/payment/webhook/pretium`)
   - Receives payment completion notification
   - Updates transaction status to "completed"
   - Triggers revenue distribution

6. **Revenue Distribution**
   - Smart contract automatically splits:
     - 70% to filmmaker
     - 20% to distributor
     - 10% to Goodflix platform
   - Payouts sent to respective wallets

## Wallet Management

### Wallet Creation

Wallets are created automatically for:
- **Filmmakers**: When application is approved
- **Distributors**: When application is approved
- **Platform**: Single platform wallet for Goodflix fee collection

Wallets are:
- Base network compatible (EVM)
- Encrypted at rest using AES-256-GCM
- Never exposed to users
- Managed server-side

### Wallet Functions

```typescript
// Create wallet for filmmaker/distributor
createWalletForUser(userId, userType)

// Retrieve wallet
getWalletForUser(userId)

// Get platform wallet
getPlatformWallet()
```

## Integration with Pretium.africa

### API Endpoints

**Create Order**
```bash
POST https://api.pretium.africa/v1/orders
Authorization: Bearer PRETIUM_API_KEY

{
  "amount_kes": 1000,
  "stablecoin": "USDC",
  "wallet_address": "0x...",
  "payment_method": "mpesa",
  "network": "base"
}
```

**Get Exchange Rate**
```bash
GET https://api.pretium.africa/v1/exchange-rates?from=KES&to=USD
Authorization: Bearer PRETIUM_API_KEY
```

### Environment Variables Required

```env
PRETIUM_API_KEY=your_api_key
PRETIUM_WEBHOOK_SECRET=your_webhook_secret
WALLET_ENCRYPTION_KEY=hex_encoded_32_byte_key
```

### Webhook Configuration

Set webhook URL in Pretium dashboard:
```
https://yourdomain.com/api/payment/webhook/pretium
```

The webhook receives:
- `order_id`: Pretium transaction ID
- `status`: "completed" | "failed"
- `stablecoin_amount`: Amount in stablecoins
- `wallet_address`: Recipient wallet
- `blockchain_tx`: Transaction hash on Base

## Supported Payment Methods (Kenya)

1. **M-Pesa** (Recommended)
   - Min: 100 KES
   - Max: 500,000 KES
   - Fee: 0%
   - Instant settlement

2. **Credit/Debit Card**
   - Min: 100 KES
   - Max: 500,000 KES
   - Fee: 2.9% + KES 50

3. **Bank Transfer**
   - Min: 1,000 KES
   - Max: 5,000,000 KES
   - Fee: 0.5%

## Database Schema

### `payment_transactions`
Tracks all payment attempts and results:
```sql
- id: UUID (primary key)
- user_id: TEXT
- user_type: 'filmmaker' | 'distributor' | 'buyer'
- transaction_type: 'purchase' | 'refund' | 'payout'
- amount_kes: NUMERIC
- amount_usd: NUMERIC
- stablecoin_type: 'USDC' | 'USDT'
- status: 'pending' | 'completed' | 'failed'
- pretium_transaction_id: TEXT (unique)
- blockchain_tx_hash: TEXT
- payment_method: TEXT
- film_id: UUID (foreign key)
```

### `wallets`
Stores encrypted wallet information:
```sql
- id: UUID (primary key)
- user_id: TEXT
- user_type: 'filmmaker' | 'distributor' | 'platform'
- wallet_address: TEXT (unique)
- wallet_private_key_encrypted: TEXT
- balance_usdc: NUMERIC
- balance_usdt: NUMERIC
```

### `payment_methods`
Stores user payment preferences:
```sql
- user_id: TEXT
- payment_method_type: 'mpesa' | 'credit_card' | 'bank_transfer'
- is_primary: BOOLEAN
```

## Revenue Flow Diagram

```
Purchase ($9.99 USD)
         ↓
   Pretium.africa
   (Convert KES → USDC/USDT)
         ↓
   Smart Contract on Base
         ↓
   ├─ 70% → Filmmaker Wallet ($6.99)
   ├─ 20% → Distributor Wallet ($1.99)
   └─ 10% → Platform Wallet ($0.99)
```

## Smart Contract Integration

The revenue distribution is enforced by a smart contract on Base:
- Deployed at: `process.env.QUIFLIX_DDT_CONTRACT`
- ERC1155 token standard
- Automated revenue splits
- Immutable transaction records

## Testing

### Pretium Sandbox

For testing before production:
1. Use Pretium's sandbox API endpoint
2. Use test M-Pesa numbers
3. Verify webhook delivery

### Test Flow

```
1. Go to /checkout/[testFilmId]
2. Select M-Pesa payment
3. Enter test amount
4. Confirm payment on Pretium
5. Check /wallet-dashboard for transaction
6. Verify sale attribution in distributor dashboard
```

## Error Handling

Common error scenarios:

| Error | Cause | Solution |
|-------|-------|----------|
| 404 Wallet Not Found | User doesn't have wallet | Auto-create on first purchase |
| Exchange Rate API Fails | Pretium downtime | Use fallback rate (0.0077) |
| Webhook Signature Invalid | Incorrect secret | Verify PRETIUM_WEBHOOK_SECRET |
| Insufficient Balance | User account low | Request top-up via Pretium |

## Security Considerations

1. **Private Key Encryption**
   - All private keys encrypted at rest
   - AES-256-GCM with random IV
   - Key stored securely in environment

2. **Webhook Verification**
   - Every webhook verified with HMAC-SHA256
   - Reject unsigned or tampered requests
   - Rate limit webhook endpoints

3. **Transaction Validation**
   - All amounts validated before processing
   - Double-check exchange rates
   - Verify wallet addresses on-chain

4. **PCI Compliance**
   - Pretium handles all card data
   - Never store card details
   - Use tokenization for repeat payments

## Deployment Checklist

- [ ] Set PRETIUM_API_KEY in production
- [ ] Set PRETIUM_WEBHOOK_SECRET
- [ ] Generate WALLET_ENCRYPTION_KEY (hex 64 chars)
- [ ] Run migration: `scripts/004_create_wallets.sql`
- [ ] Configure Pretium webhook URL
- [ ] Test Pretium webhook delivery
- [ ] Deploy smart contract to Base
- [ ] Set QUIFLIX_DDT_CONTRACT address
- [ ] Test end-to-end purchase flow
- [ ] Enable production mode in Pretium dashboard
