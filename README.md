# 🚀 StellarPoll – On-Chain Voting dApp (Level 3)

**🔗 Web Link (Live Demo):** [Insert Live App URL Here]
**📜 Smart Contract Address:** `CBFHZASNWKBVKXRXF7GZTZMQNYBVUQHAHVLMZYLBFXPJUHQMZ3EJMDTX`

A premium, end-to-end decentralized polling application built on the **Stellar Soroban** smart contract platform. This project demonstrates a complete mini-dApp with advanced UX features, smart contract integration, caching, and comprehensive testing.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Premium UI** | Glassmorphism design, animated background orbs, Inter font |
| **Skeleton Loaders** | Smooth loading states during data fetch |
| **Transaction Progress** | 3-step overlay: Signing → Submitting → Confirmed |
| **Smart Caching** | `localStorage` cache with TTL to reduce RPC calls |
| **Cache Badge** | Visual indicator when results are served from cache |
| **Wallet Connect** | Mock integration (production-ready with StellarWalletsKit) |
| **Animated Bars** | Vote progress bars animate smoothly on result load |
| **Tx Explorer Link** | Deep link to Stellar Expert after voting |
| **9 Tests Passing** | Vitest test suite covering cache, percentages, and helpers |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8 |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Icons** | Lucide React |
| **Smart Contract** | Rust / Soroban SDK 22 |
| **Blockchain** | Stellar Testnet |
| **Testing** | Vitest v4 |

---

## 📁 Project Structure

```
stellar-poll-app/
├── contract/
│   ├── Cargo.toml              # Soroban contract manifest
│   └── src/
│       └── lib.rs              # Live Poll smart contract
├── src/
│   ├── services/
│   │   ├── cacheService.js     # localStorage cache with TTL
│   │   └── stellarService.js   # Stellar/Soroban interaction layer
│   ├── utils/
│   │   └── pollUtils.js        # Pure utility functions (tested)
│   ├── App.jsx                 # Main app with all UI logic
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind v4 + custom tokens
├── tests/
│   └── poll.test.js            # 9 Vitest tests across 4 suites
├── index.html                  # SEO-optimized HTML shell
├── vite.config.js              # Vite + Vitest config
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A Stellar wallet (Freighter recommended)

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd stellar-poll-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **http://localhost:5174/** in your browser.

---

## 🧪 Running Tests

```bash
npm test
```

**Output:**
```
 ✓ tests/poll.test.js (9 tests)

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Duration  ~2.5s
```

### Test Coverage

| Suite | Tests | What's Tested |
|---|---|---|
| `CacheService` | 3 | Store/retrieve, expiry, removal |
| `calculatePercentage` | 3 | Correct %, all-zero case, dominant option |
| `getWinnerIndex` | 2 | Winner detection, no-vote edge case |
| `formatAddress` | 1 | Stellar address truncation |

---

## 📜 Smart Contract

The **Live Poll** Soroban contract lives in `contract/src/lib.rs`.

### Functions

| Function | Description |
|---|---|
| `initialize(question, options)` | Sets up the poll (one-time, panics if re-called) |
| `vote(voter, option_index)` | Casts a vote; requires auth; enforces one-vote-per-address |
| `get_results()` | Returns `(question, options, votes)` tuple |

### Key Design Decisions
- **One vote per address** enforced via `persistent` storage keyed on the voter's `Address`.
- **Vote events** emitted on-chain for real-time indexing.
- **No admin key** — the contract is immutable after deployment.

---

## 🔄 Caching Strategy

The `cacheService` wraps `localStorage` with a TTL mechanism:

```js
cacheService.set('poll_data', data, 60_000); // cache for 1 min
cacheService.get('poll_data');               // returns null if expired
```

- Poll results are cached for **60 seconds** by default.
- A **"cached"** badge appears in the UI when data is served from cache.
- Clicking the **refresh button** bypasses the cache and fetches fresh data.

---

## 💫 Transaction Lifecycle

When a user votes, the UI transitions through three states:

```
[SIGNING] → User approves in wallet
    ↓
[SUBMITTING] → Transaction broadcast to Stellar network
    ↓
[CONFIRMED] → Included in a ledger ✅
```

Each step triggers a visual update in the overlay modal, with progress dots animating between states.

---

## 🌐 Deployment

The contract is deployed to the **Stellar Testnet**.

- **Contract ID:** `CBFHZASNWKBVKXRXF7GZTZMQNYBVUQHAHVLMZYLBFXPJUHQMZ3EJMDTX`
- **Network:** Testnet
- **Explorer:** [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)

---

## 📹 Demo Video

> A 1-minute demo video is available showing:
> - Skeleton loaders on initial load
> - Wallet connection flow
> - Casting a vote with transaction progress overlay
> - Real-time vote count update
> - Cache badge on page refresh

---

## 📝 Commit History

| Commit | Description |
|---|---|
| `feat: initial scaffold` | Vite + React + Tailwind v4 + Vitest setup |
| `feat: caching and test suite` | `cacheService`, `pollUtils`, 9 passing tests |
| `feat: premium UI and finalize` | Glassmorphism UI, animated bars, tx overlay, SEO |

---

## 📄 License

MIT
