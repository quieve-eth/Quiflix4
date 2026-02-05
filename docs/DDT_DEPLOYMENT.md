# Quiflix DDT System - Deployment Guide

## Smart Contract Deployment

### Prerequisites
- Node.js 18+
- Foundry or Hardhat
- Base network testnet or mainnet funds
- MetaMask or similar wallet

### Step 1: Compile Smart Contract

```bash
# Install dependencies
npm install @openzeppelin/contracts viem

# Compile Solidity contract
npx hardhat compile
# OR with Foundry:
forge build
```

### Step 2: Deploy to Base

```bash
# Deploy using Hardhat script
npx hardhat run scripts/deploy-ddt.js --network base

# OR manually with Viem:
node scripts/deploy-ddt-viem.js
```

**Environment Variables Needed:**
```
GOODFLIX_PRIVATE_KEY=0x...
BASE_RPC_URL=https://mainnet.base.org
(Or use testnet: https://sepolia.base.org)
```

### Step 3: Save Contract Address

After deployment, you'll receive:
- Contract Address
- Deployment Transaction Hash
- ABI (automatically saved)

Add to environment variables:
```
NEXT_PUBLIC_QUIFLIX_DDT_CONTRACT=0x...
```

## Database Setup

### Step 1: Run Migrations

In Supabase SQL editor, run:
```sql
\i scripts/002_create_ddt_schema.sql
```

This creates all necessary tables:
- `films` - Film registry with blockchain tracking
- `distributors` - Distributor profiles
- `ddt_holdings` - DDT assignments to distributors
- `sales_records` - Every purchase transaction
- `revenue_payouts` - Revenue split calculations
- `ddt_ledger` - Audit trail of all DDT operations
- `smart_contract_deployments` - Contract deployment info

### Step 2: Configure Admin Settings

```sql
UPDATE public.admin_settings 
SET goodflix_wallet = '0xYourAdminWallet'
WHERE id = (SELECT id FROM public.admin_settings LIMIT 1);
```

## Environment Configuration

### Required Variables

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx

# Blockchain
NEXT_PUBLIC_QUIFLIX_DDT_CONTRACT=0x...
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
GOODFLIX_PRIVATE_KEY=0x...

# Admin Wallet
NEXT_PUBLIC_GOODFLIX_WALLET=0x...

# Email (Resend)
RESEND_API_KEY=re_xxx
```

## System Flow

### 1. Filmmaker Submission → Approval
```
Filmmaker submits → Stored in DB → Admin approves → Film registered on-chain
→ Smart contract mints 500 DDTs for that film (held by Goodflix initially)
```

### 2. Distributor Approval → DDT Assignment
```
Distributor applies for specific film → Admin selects film & approves
→ API calls smart contract: assignDDTToDistributor()
→ 1 DDT transferred to distributor wallet
→ Personalized distribution link generated and stored
```

### 3. Sale → Revenue Distribution
```
Buyer purchases through distributor's link → Sale recorded in DB
→ Smart contract: recordSaleAndDistributeRevenue()
→ Calculates splits: Filmmaker 70%, Distributor 20%, Goodflix 10%
→ Revenue entitlements updated on-chain
→ Distributor can see earnings in their dashboard
```

## Smart Contract Functions

### Admin Functions

**registerFilm(title, filmmaker, ipfsHash)**
- Called when filmmaker approved
- Returns filmId
- Should be wrapped in frontend API call

**approveFilmAndMintDDTs(filmId)**
- Mints 500 DDTs for the film
- Held by contract (Goodflix) initially
- Must call before assigning DDTs

**registerDistributor(walletAddress, companyName)**
- Called when distributor approved
- Returns distributorId
- Distributor must have valid wallet

**assignDDTToDistributor(filmId, distributorId)**
- Transfers 1 DDT to distributor
- Creates distribution license
- Emits event for tracking

**recordSaleAndDistributeRevenue(filmId, distributorId, saleAmount)**
- Records sale attribution
- Calculates revenue splits
- Updates earning balances
- Called from backend after payment confirmation

### View Functions

**getFilm(filmId)** - Returns film details
**getDistributor(distributorId)** - Returns distributor details
**getDistributorHoldings(distributorId, filmId)** - Returns DDT holding info
**getFilmRevenue(filmId)** - Returns total revenue for film

## Payment Processing

### Revenue Distribution Flow

```
Total Sale = $100
↓
Filmmaker: 70% = $70
Distributor: 20% = $20
Goodflix: 10% = $10
```

Smart contract tracks these entitlements. Actual ETH/USDC transfers handled separately via:
- 0x Protocol for swaps
- Across Protocol for bridging
- Direct payment splitter contracts

## Testing

### Test on Base Sepolia

1. Get testnet funds from [Base Faucet](https://www.coinbase.com/wallet/faucets/base-sepolia)
2. Deploy to Sepolia:
   ```bash
   npx hardhat run scripts/deploy-ddt.js --network baseSepolia
   ```
3. Test film approval → DDT assignment → Sale recording
4. Verify events in Base Sepolia explorer

### Sample Test Data

```javascript
// Filmmaker approves film
registerFilm("Shadow of the Sun", "0xfilmmaker...", "QmXXX")

// Admin approves and mints
approveFilmAndMintDDTs(1)

// Distributor applies and gets approved
registerDistributor("0xdistributor...", "My Distribution Co")
assignDDTToDistributor(1, 1)

// Sale recorded
recordSaleAndDistributeRevenue(1, 1, 1000000000000000000) // 1 ETH in wei
```

## Monitoring & Auditing

### Check Transaction History

- **DDT Operations:** Query `ddt_ledger` table
- **Sales Records:** Query `sales_records` table
- **Blockchain Events:** Monitor smart contract events on [Basescan](https://basescan.org)

### Revenue Tracking

```sql
-- Total earnings by distributor
SELECT 
  d.company_name,
  SUM(r.distributor_share) as total_earned
FROM revenue_payouts r
JOIN distributors d ON r.distributor_id = d.id
GROUP BY d.id;

-- Film performance
SELECT 
  f.title,
  COUNT(sr.id) as total_sales,
  SUM(sr.sale_amount) as total_revenue
FROM sales_records sr
JOIN films f ON sr.film_id = f.id
GROUP BY f.id;
```

## Troubleshooting

**"Could not find table 'films'"**
- Migration script not run. Execute `002_create_ddt_schema.sql` in Supabase

**DDT Assignment Fails**
- Contract not approved/no tokens minted yet
- Call `approveFilmAndMintDDTs()` first
- Verify contract has sufficient balance

**Sale Recording Fails**
- Distributor must hold at least 1 DDT for the film
- Sale amount must be > 0
- Check contract address is correct

**Smart Contract Deployment Fails**
- Insufficient gas (increase gasLimit)
- Invalid constructor params
- Wallet has insufficient funds

## Support

For issues, check:
1. Database schema: `SELECT * FROM smart_contract_deployments;`
2. Contract ABI: Stored in `admin_settings`
3. Event logs: Stored in `ddt_ledger`
4. Blockchain explorer: Basescan for transaction details
