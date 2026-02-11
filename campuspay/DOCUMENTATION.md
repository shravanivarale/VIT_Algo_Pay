# VIT Algo Pay: Decentralized Campus Finance Protocol

## 1. Introduction
CampusPay is a full-stack, Web3-native decentralized application (DApp) on the Algorand blockchain designed to streamline student finances. It offers modules for peer-to-peer payments, bill splitting (cashless), transparent fundraising, and NFT event ticketing, all wrapped in a premium, responsive UI.

## 2. Technology Stack & Architecture

### **Blockchain**
- **Network**: Algorand TestNet
- **SDK**: `algosdk` (Python & JavaScript)
- **Smart Contracts**: PyTeal (Python -> TEAL -> ABI)
- **Deployment**: AlgoKit / Custom Scripts
- **Indexer/Node Access**: AlgoNode API (Free Tier)

### **Frontend**
- **Framework**: React 18 (TypeScript)
- **Build Tool**: Vite
- **Styling**: TailwindCSS (v3), Custom Glassmorphism Theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Wallet Connection**: Pera Wallet (WalletConnect v2)
- **QR Code**: `html5-qrcode`

### **Backend (Planned/Optional)**
- **Server**: Node.js (Express)
- **Metadata**: IPFS / Pinata (Planned for NFT metadata)

---

## 3. Project Structure
```
campuspay/
├── contracts/          # PyTeal Smart Contracts
│   ├── fundraising.py  # Crowdfunding Logic (Stateful)
│   ├── ticketing.py    # Event/NFT Logic (Stateful/ASA)
│   ├── logic_sig.py    # Stateless Logic Signature (Bill Split)
│   └── requirements.txt
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # React Components (P2P, Split, Fundraise, Tickets)
│   │   ├── context/    # WalletContext (Pera Wallet)
│   │   ├── utils/      # Algorand Helpers, Polyfills
│   │   └── App.tsx     # Main Dashboard & Routing
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── index.css       # Global Styles & Glassmorphism Utilities
├── scripts/            # Python Scripts
│   ├── compile.py      # Compiles PyTeal to TEAL/ABI
│   └── deploy.py       # Simulates/Handles Deployment
├── backend/            # Express Server (Skeleton)
└── DOCUMENTATION.md    # This File
```

---

## 4. Modules & Features

### **Module 1: P2P Payments** (`P2PPayment.tsx`)
- **Functionality**: Send Algo or Standard Assets (ASAs) directly to another address.
- **Key Features**:
  - QR Code Scanning (Camera integration).
  - Asset Selection (Algo vs. Custom Tokens).
  - Real-time Transaction Status updates from Algorand Explorer.
  - Note Field support (UTF-8 encoded).

### **Module 2: Bill Splitting** (`BillSplit.tsx`)
- **Functionality**: Split expenses among a group of friends using atomic transactions.
- **Workflow**:
  1.  **Creator**: Adds participants (Address + Amount).
  2.  **Generate**: Creates a robust, atomic group transaction payload.
  3.  **Share**: Users share the payload string off-chain.
  4.  **Sign**: Currently, users can verify and sign their specific part of the group transaction.
- *Note*: Enforcement can be enhanced with the `logic_sig.py` contract in future updates.

### **Module 3: Fundraising** (`Fundraising.tsx`)
- **Functionality**: Transparent crowdfunding for student clubs and events.
- **Smart Contract** (`fundraising.py`):
  - **Global State**: Target Amount, Current Amount, Beneficiary, Deadline.
  - **Methods**: `create_campaign`, `contribute`, `withdraw`.
- **Frontend**: Shows active campaigns, progress bars, and donation interface.

### **Module 4: NFT Ticketing** (`Ticketing.tsx`)
- **Functionality**: Mint and verify event tickets as non-fungible tokens (ASAs).
- **Process**:
  1.  **Host**: Sets Event Name, Price, and Supply -> Mints Asset.
  2.  **Buy**: (Simulation) Users initiate purchase; ideally an Atomic Swap.
  3.  **Verify**: QR Code displays unique Asset ID for entry verification.

---

## 5. UI/UX Design System
- **Theme**: "VIT Cyber-Core"
  - **Palette**: Neon Cyan (`#00f0ff`), Electric Purple (`#7000ff`), Deep Space (`#050510`).
  - **Background**: Interactive 3D Particle Network (Three.js / React Three Fiber).
  - **Components**: Glassmorphism cards with holographic hover effects.
  - **Typography**: Inter (Body) + Space Mono (Data/Crypto).
  - **Animations**: Framer Motion for page transitions and staggering.

---

## 6. Smart Contract Specifications

### **Crowdfunding (Stateful)**
- **Global Schema**: 4 Uints (Target, Current, Deadline, TotalDonated), 1 Bytes (Beneficiary).
- **Local Schema**: 1 Uint (User Contribution).
- **Core Logic**:
  - `contribute`: Receives payment txn, updates global `Current` and local `Contribution`.
  - `withdraw`: Checks if `Current >= Target` and `Sender == Beneficiary`, then sends funds.
  - `refund`: If `Deadline` passed and `Current < Target`, contributors can reclaim funds.

### **Ticketing (Stateful + ASA)**
- **Asset Creation**: Logic to mint an asset with `total=Supply`, `decimals=0`.
- **Purchase**: Atomic Group (Payment to Creator + Asset Transfer to Buyer).
- *Status*: Contract logic is drafted; frontend currently simulates the Minting process directly via SDK.

---

## 7. Installation & Usage

### **Prerequisites**
- Node.js (v16+)
- Python (v3.10+)
- Pera Wallet App (Mobile) setup on TestNet

### **Steps**
1.  **Clone Repository**:
    ```bash
    git clone https://github.com/yourusername/campuspay.git
    cd campuspay
    ```
2.  **Install Frontend Dependencies**:
    ```bash
    cd frontend
    npm install
    ```
3.  **Compile Contracts** (Optional Development Step):
    ```bash
    cd ../scripts
    pip install -r ../contracts/requirements.txt
    python compile.py
    ```
4.  **Run Application**:
    ```bash
    cd ../frontend
    npm run dev
    ```
5.  **Access**: Open `http://localhost:5173`.

---

## 8. Development Roadmap
- [x] **Phase 1**: Core UI, AlgoSDK Integration, Basic Contract Logic.
- [ ] **Phase 2**: Full Backend Integration (Metadata hosting).
- [ ] **Phase 3**: Automated Contract Deployment Scripts (AlgoKit) integrated into frontend hooks.
- [ ] **Phase 4**: MainNet Launch & Audits.
