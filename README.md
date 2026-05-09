# VEIL — The Oracle of Ritual Chain

## Status
- Live URL: `TBD after deployment`
- Contract address: `TBD after deploy`
- Explorer: `https://explorer.ritualfoundation.org`

## Local Run
1. Contracts
```bash
cd contracts
forge build
forge test
```

2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deploy Contract
Create `contracts/.env`:
```env
PRIVATE_KEY=0x...
RITUAL_RPC_URL=https://rpc.ritualfoundation.org
VEIL_ORACLE_ADDRESS=0x...
```

Then run:
```bash
cd contracts
source .env
forge script script/Deploy.s.sol --rpc-url ritual --broadcast
forge script script/Fund.s.sol --rpc-url ritual --broadcast
```

## RitualWallet Funding
Use RitualWallet `depositFor(contractAddress, lockDuration)` on:
`0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948`

Current script funds `0.1 RITUAL` with lock duration `1000` blocks.
