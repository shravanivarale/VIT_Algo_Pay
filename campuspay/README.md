# CampusPay

CampusPay is a decentralized campus finance platform on the Algorand blockchain.

## Project Structure

- `frontend/`: React + TypeScript frontend application.
- `contracts/`: PyTeal smart contracts.
- `backend/`: Node.js backend for metadata and indexing (optional).
- `scripts/`: Deployment and utility scripts.

## Prerequisites

- Node.js (v16+)
- Python (3.10+)
- AlgoKit (recommended)
- Docker (for local Algorand sandbox)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd campuspay
    ```

2.  **Install dependencies:**
    - Frontend: `cd frontend && npm install`
    - Contracts: `cd contracts && pip install -r requirements.txt` (or use poetry)

3.  **Run Local Sandbox:**
    ```bash
    algokit localnet start
    ```

4.  **Deploy Contracts:**
    ```bash
    # Deploy instructions here
    ```

5.  **Start Frontend:**
    ```bash
    cd frontend && npm start
    ```
