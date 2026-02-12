# VIT Algo Pay - Testing Guide

This guide will help you demonstrate the features of **VIT Algo Pay**, starting from the simplest visual checks to performing actual blockchain transactions.

## 🚀 Prerequisites (Do this first!)

To test the blockchain features, you need a wallet and some "fake" crypto (TestNet Algo).

1.  **Install Pera Algo Wallet** on your phone:
    *   [iOS / Android Download Link](https://perawallet.app/)
2.  **Create a New Account** in the app.
3.  **Switch to TestNet**:
    *   Go to Settings -> Developer Settings -> Node Settings -> Select **TestNet**.
4.  **Get Free Test Algo**:
    *   Go to the [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/).
    *   Copy your wallet address from Pera App and paste it there.
    *   Click "Dispense". You should see +5 or +10 ALGO in your app within seconds.

---

## 💻 Step 1: Running the Website

1.  Open your terminal/command prompt.
2.  Navigate to the project folder:
    ```bash
    cd campuspay/frontend
    ```
3.  Start the server:
    ```bash
    npm run dev
    ```
4.  Open the link shown (usually `http://localhost:5173`) in your browser.

---

## 🧪 Test 1: Visuals & Intro (Simplest)

**Goal:** Verify the UI looks cool and runs smoothly.

1.  **Reload the Page**.
2.  **Watch the Intro**: You should see "CAMPUS FINANCE REIMAGINED" followed by a Warp Speed effect.
3.  **Check Landing Page**:
    *   Verify the title "VIT ALGO PAY" is visible and "pops".
    *   Hover over the 4 cards (Instant Transfer, Split Bills, etc.).
    *   **Confirm:** The cards should zoom in, border should glow, and text description should slide up.
4.  **Check Background**: The 3D stars should be moving slowly in the background.

---

## 🔗 Test 2: Connect Wallet (Critical)

**Goal:** Connect your mobile wallet to the website.

1.  Click the **"CONNECT WALLET"** button in the top right.
2.  A QR code will appear on the screen.
3.  Open **Pera Wallet** on your phone.
4.  Tap the **Scan QR** button (yellow/black button).
5.  Scan the screen.
6.  **Confirm** the connection on your phone.
7.  **Result:** The button on the website should change to show your address (e.g., `HE72...X9A`).

---

## 💸 Test 3: P2P Payment (Primary Demo Feature)

**Goal:** Send money (ALGO) from your wallet to another address.

1.  Click **"INSTANT TRANSFER"** on the dashboard.
2.  **Receiver Address**: Paste a friend's wallet address (or a second account you created).
    *   *Need a dummy address? Use this:* `GD64YIY3TWGDMCNPP553UZPWBJJW7Q5DSK37JAA5R5C54JJOVZAD3234WI`
3.  **Amount**: Enter `1` (This transfers 1 ALGO).
4.  Click **"SEND NOW"**.
5.  **Look at your Phone**:
    *   Pera Wallet will ask you to "Sign Transaction".
    *   Slide or Tap to confirm.
6.  **Result**:
    *   Website should show "Payment Successful!" with a green tick.
    *   Your wallet balance will decrease by ~1.001 ALGO.

---

## 💰 Test 4: Fundraising (Intermediate)

**Goal:** Create a fake campaign.

1.  Click **"FUNDRAISE DAO"** on the dashboard.
2.  Click **"Create Campaign"**.
3.  **Details**:
    *   Title: "Tech Symposium 2026"
    *   Goal: `100`
    *   Deadline: Pick a future date.
4.  Click **"Create"**.
5.  **Sign** the transaction on your phone.
6.  **Result**: A new card for "Tech Symposium 2026" will appear in the list.

---

## 🎟️ Test 5: NFT Ticketing (Visual Check)

**Goal:** View the ticket interface.

1.  Click **"NFT EVENTS"** on the dashboard.
2.  You will see demo events like "VIT Hackathon".
3.  Hover over the card to see the 3D-like tilt effect.
4.  (Buying a ticket requires advanced setup, so just show the UI for now).

---

## ❓ Troubleshooting

*   **"AnimatePresence Error"**: Restart the server (`Ctrl+C` then `npm run dev`).
*   **Wallet won't connect**:
    *   Make sure your phone and laptop are on the internet.
    *   Refresh the page and try again.
    *   Ensure Pera Wallet is in **TestNet** mode.
*   **Transaction Failed**: Do you have ALGO in your wallet? Use the Dispenser (Prerequisites step).
