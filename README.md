# StellarPoll L3 🚀

A premium end-to-end decentralized polling application built on the Stellar network (Soroban).

## Features

- **Premium UI**: Modern Glassmorphism design with smooth gradients and `framer-motion` animations.
- **Smart Contract**: Robust Soroban contract for secure, one-vote-per-address polling.
- **Real-time Progress**: Visual indicators for every stage of the transaction lifecycle (Signing -> Submitting -> Confirmed).
- **Loading States**: Skeleton loaders for seamless data fetching.
- **Advanced Caching**: Intelligent `localStorage` caching to minimize RPC calls and improve performance.
- **Comprehensive Testing**: 3+ unit tests for core business logic and caching services.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React.
- **Blockchain**: Stellar SDK, Stellar Wallets Kit.
- **Smart Contract**: Rust/Soroban.
- **Testing**: Vitest.

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Stellar wallet (e.g., Freighter)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Running Tests

To execute the unit tests:
```bash
npm test
```

## Implementation Details

### Caching Strategy
The app uses a custom `cacheService` that wraps `localStorage` with expiry logic. Poll results are cached for 1 minute by default, significantly reducing the load on Horizon/Soroban RPC nodes.

### Transaction Progress
Users receive immediate feedback when voting. The UI transitions through several states:
1. **Signing**: Waiting for the user to approve the transaction in their wallet.
2. **Submitting**: Broadcasting the signed transaction to the Stellar network.
3. **Confirmed**: Transaction has been successfully included in a ledger.

## License

MIT
