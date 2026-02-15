import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { algodClient, waitForConfirmation, algosToMicroAlgos } from '../utils/algorand';
import algosdk from 'algosdk';
import { Buffer } from 'buffer';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Calendar, Tag, QrCode, ScanLine, ShoppingCart } from 'lucide-react';
import { TICKETING_ABI, TICKETING_APPROVAL, TICKETING_CLEAR } from '../utils/contractData'; // Import artifacts

interface ResaleTicket {
    id: number;
    appId: number;
    name: string;
    price: number;
    seller: string;
    assetId: number;
}

const Ticketing: React.FC = () => {
    const { isConnected, accountAddress, peraWallet } = useWallet();
    const [eventName, setEventName] = useState('');
    const [ticketPrice, setTicketPrice] = useState('');
    const [ticketSupply, setTicketSupply] = useState('100');
    const [createdAssetId, setCreatedAssetId] = useState<number | null>(null);
    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState<'organizer' | 'resale'>('organizer');

    // Use state for dynamic listing
    const [resaleTickets, setResaleTickets] = useState<ResaleTicket[]>([
        { id: 101, appId: 0, name: "Neon Nights 2026", price: 15, seller: "H3...X9", assetId: 0 }, // Demo
    ]);

    const createEvent = async () => {
        if (!accountAddress) return;
        setStatus("MINTING TICKET ASSET (ASA)...");

        try {
            const suggestedParams = await algodClient.getTransactionParams().do();

            const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
                sender: accountAddress,
                total: parseInt(ticketSupply),
                decimals: 0,
                defaultFrozen: false,
                manager: accountAddress,
                reserve: accountAddress,
                freeze: accountAddress,
                clawback: accountAddress,
                unitName: "TICKET",
                assetName: eventName,
                assetURL: "ipfs://...",
                suggestedParams,
            });

            // Sign and submit (Array of groups)
            const signedTxn = await peraWallet.signTransaction([[{ txn, signers: [accountAddress] }]]);
            const { txid } = await algodClient.sendRawTransaction(signedTxn[0]).do(); // Access first signed txn

            setStatus(`HASH: ${txid}`);
            const ptx = await waitForConfirmation(algodClient, txid, 4);
            console.log("Confirmation Result (Asset):", ptx); // Debug

            // @ts-ignore
            const assetIndex = Number(ptx['asset-index'] || ptx.assetIndex);

            if (isNaN(assetIndex)) {
                setStatus(`ASSET MINTED BUT ID NOT FOUND. Keys: ${Object.keys(ptx).join(', ')}`);
                console.error("No asset index:", ptx);
                return;
            }

            setCreatedAssetId(assetIndex);
            setStatus(`ASSET MINTED. ID: ${assetIndex}`);

        } catch (error: any) {
            console.error(error);
            setStatus(`MINTING FAILURE: ${error.message}`);
        }
    };

    const listTicketForResale = async () => {
        if (!createdAssetId || !accountAddress || !ticketPrice) {
            setStatus("MISSING ASSET OR PRICE");
            return;
        }

        setStatus("DEPLOYING MARKETPLACE CONTRACT...");

        try {
            const suggestedParams = await algodClient.getTransactionParams().do();

            // 1. Compile Contracts
            const approvalCompileResp = await algodClient.compile(TICKETING_APPROVAL).do();
            const clearCompileResp = await algodClient.compile(TICKETING_CLEAR).do();
            const approvalProgram = new Uint8Array(Buffer.from(approvalCompileResp.result, 'base64'));
            const clearProgram = new Uint8Array(Buffer.from(clearCompileResp.result, 'base64'));

            // 2. Create Application
            const createTxn = algosdk.makeApplicationCreateTxnFromObject({
                sender: accountAddress,
                suggestedParams,
                onComplete: algosdk.OnApplicationComplete.NoOpOC,
                approvalProgram,
                clearProgram,
                numLocalInts: 0,
                numLocalByteSlices: 0,
                numGlobalInts: 2, // Price, NftId
                numGlobalByteSlices: 1, // Creator Address
            });

            const signedCreate = await peraWallet.signTransaction([[{ txn: createTxn, signers: [accountAddress] }]]);
            const { txid: createId } = await algodClient.sendRawTransaction(signedCreate[0]).do();

            setStatus(`DEPLOYING APP: ${createId}`);
            const result = await waitForConfirmation(algodClient, createId, 4);
            console.log("Confirmation Result (App):", result); // Debug

            // @ts-ignore
            const appId = result['application-index'] || result.applicationIndex;

            if (!appId) {
                console.error("No App ID found in:", result);
                throw new Error(`App ID not found. Keys: ${Object.keys(result).join(', ')}`);
            }
            setStatus(`MARKETPLACE DEPLOYED (ID: ${appId}). INITIALIZING...`);

            // 3. Fund App (MBR ~ 0.2A) + Setup + Deposit NFT
            // We need to group these:
            // Txn 1: Pay App (Fund MBR)
            // Txn 2: App Call 'setup'
            // Txn 3: Asset Transfer (Deposit)

            const appAddress = algosdk.getApplicationAddress(appId);
            const contract = new algosdk.ABIContract(TICKETING_ABI);
            const atc = new algosdk.AtomicTransactionComposer();

            // Fund App
            const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: accountAddress,
                receiver: appAddress,
                amount: algosToMicroAlgos(0.2), // 0.1 MBR + 0.1 for ASA Opt-in
                suggestedParams,
            });

            // Add Payment to ATC (as a transaction argument? No, just a transaction to the group)
            atc.addTransaction({
                txn: payTxn, signer: async () => {
                    // We will sign everything together
                    return []; // Placeholder, actually Pera handles signatures
                }
            });

            // Setup Call
            atc.addMethodCall({
                appID: appId,
                method: contract.getMethodByName('setup'),
                methodArgs: [algosToMicroAlgos(parseFloat(ticketPrice)), createdAssetId],
                sender: accountAddress,
                signer: async () => [], // Placeholder
                suggestedParams,
                onComplete: algosdk.OnApplicationComplete.NoOpOC,
            });

            // Deposit NFT
            const axferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                sender: accountAddress,
                receiver: appAddress,
                amount: 1,
                assetIndex: createdAssetId,
                suggestedParams,
            });

            atc.addTransaction({ txn: axferTxn, signer: async () => [] });

            // Execute Group
            // Custom Signer for ATC that uses Pera
            // const groupSigner = async (unsignedTxns: algosdk.Transaction[]) => {
            //     const signerGroup = unsignedTxns.map(t => ({ txn: t, signers: [accountAddress] }));
            //     const signed = await peraWallet.signTransaction([signerGroup]);
            //     return signed;
            // };

            // Re-construct ATC to use the group signer properly
            // Actually, simpler to build the group manually and sign
            const txns = [
                payTxn,
                algosdk.makeApplicationNoOpTxnFromObject({
                    sender: accountAddress,
                    appIndex: appId,
                    appArgs: [contract.getMethodByName('setup').getSelector(), algosdk.encodeUint64(algosToMicroAlgos(parseFloat(ticketPrice))), algosdk.encodeUint64(createdAssetId)],
                    foreignAssets: [createdAssetId],
                    suggestedParams,
                    // Note: Setup args are Price, NftId. Encoding needed.
                }),
                axferTxn
            ];

            algosdk.assignGroupID(txns);
            const signerGroup = txns.map(t => ({ txn: t, signers: [accountAddress] }));
            const signedGroup = await peraWallet.signTransaction([signerGroup]);

            setStatus("SENDING SETUP GROUP...");
            const { txid: setupId } = await algodClient.sendRawTransaction(signedGroup).do();
            await waitForConfirmation(algodClient, setupId, 4);

            setStatus(`LISTED SUCCESSFULLY! CONTRACT: ${appId}`);

            console.log("UPDATING RESALE LIST with:", { appId, eventName, ticketPrice, accountAddress, createdAssetId });

            // Add to resale list
            setResaleTickets(prev => {
                const updated = [...prev, {
                    id: Date.now(),
                    appId: appId,
                    name: eventName,
                    price: parseFloat(ticketPrice),
                    seller: accountAddress,
                    assetId: createdAssetId!
                }];
                console.log("NEW RESALE LIST:", updated);
                return updated;
            });

            // Allow listing again or reset?
            setCreatedAssetId(null); // Remove from "Minted" view to simulate transfer

        } catch (e: any) {
            console.error("Listing Error Full Object:", e);
            setStatus(`LISTING FAILED (See Console): ${e.message || JSON.stringify(e)}`);
        }
    };

    const buyRealTicket = async (ticket: ResaleTicket) => {
        if (!accountAddress) return;
        setStatus(`BUYING ASSET ${ticket.assetId} FROM APP ${ticket.appId}...`);

        try {
            const suggestedParams = await algodClient.getTransactionParams().do();

            // 1. Opt-In to Asset (Buyer)
            // Check if already opted in? We assume not or just do it.
            // If already opted in, this might fail (allow checking err).
            // Better to wrap in try/catch or just proceed.
            try {
                const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    sender: accountAddress,
                    receiver: accountAddress,
                    amount: 0,
                    assetIndex: ticket.assetId,
                    suggestedParams,
                });

                setStatus("OPTING IN TO ASSET...");
                const signedOptIn = await peraWallet.signTransaction([[{ txn: optInTxn, signers: [accountAddress] }]]);
                await algodClient.sendRawTransaction(signedOptIn[0]).do();
                await waitForConfirmation(algodClient, optInTxn.txID(), 4);
            } catch (e) {
                console.log("Opt-in skipped or failed (maybe already opted in)");
            }

            // 2. Buy (Pay + App Call)
            const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: accountAddress,
                receiver: algosdk.getApplicationAddress(ticket.appId),
                amount: algosToMicroAlgos(ticket.price),
                suggestedParams,
            });

            const contract = new algosdk.ABIContract(TICKETING_ABI);
            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: accountAddress,
                appIndex: ticket.appId,
                appArgs: [contract.getMethodByName('buy_ticket').getSelector()],
                suggestedParams,
                foreignAssets: [ticket.assetId], // Must define Foreign Asset to send it
            });

            const txns = [payTxn, appCallTxn];
            algosdk.assignGroupID(txns);
            const signerGroup = txns.map(t => ({ txn: t, signers: [accountAddress] }));

            setStatus("SIGNING PAYMENT...");
            const signedGroup = await peraWallet.signTransaction([signerGroup]);

            const { txid } = await algodClient.sendRawTransaction(signedGroup).do();
            setStatus(`BUYING: ${txid}`);
            await waitForConfirmation(algodClient, txid, 4);

            setStatus(`PURCHASE SUCCESSFUL!`);
            setResaleTickets(prev => prev.filter(t => t.id !== ticket.id));

        } catch (e: any) {
            console.error(e);
            setStatus(`BUY FAILED: ${e.message}`);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 tracking-tighter mb-2 flex justify-center items-center gap-3">
                    <Ticket className="w-10 h-10 text-green-400" />
                    NFT TICKETING
                </h2>
                <p className="text-green-500/60 font-mono tracking-widest text-xs uppercase">Verifiable Event Access Layer</p>

                {/* Tab Switcher */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={() => setActiveTab('organizer')}
                        className={`px-6 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-widest transition-all border ${activeTab === 'organizer' ? 'bg-green-500 text-black border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.4)]' : 'bg-transparent text-green-500 border-green-500/30 hover:border-green-500'}`}
                    >
                        Event Organizer
                    </button>
                    <button
                        onClick={() => setActiveTab('resale')}
                        className={`px-6 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-widest transition-all border ${activeTab === 'resale' ? 'bg-green-500 text-black border-green-500 shadow-[0_0_20px_rgba(0,255,100,0.4)]' : 'bg-transparent text-green-500 border-green-500/30 hover:border-green-500'}`}
                    >
                        Resale Market
                    </button>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {activeTab === 'organizer' ? (
                    <motion.div
                        key="organizer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid lg:grid-cols-2 gap-12 items-start"
                    >
                        {/* Creator Side */}
                        <div className="glass-card p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 bg-green-500/10 rounded-bl-2xl backdrop-blur-sm border-b border-l border-green-500/10">
                                <Tag className="w-6 h-6 text-green-400" />
                            </div>

                            <h3 className="text-xl font-bold mb-8 text-white font-mono flex items-center gap-2">
                                <ScanLine className="w-5 h-5 text-green-400" />
                                EVENT CONFIGURATION
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Event Designation</label>
                                    <input
                                        className="cyber-input border-green-500/20 focus:border-green-400 focus:ring-green-400/50"
                                        placeholder="e.g. YEAR_END_CONCERT_2026"
                                        value={eventName}
                                        onChange={e => setEventName(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Entry Cost</label>
                                        <div className="relative">
                                            <input
                                                className="cyber-input border-green-500/20 focus:border-green-400 focus:ring-green-400/50"
                                                placeholder="10"
                                                value={ticketPrice}
                                                onChange={e => setTicketPrice(e.target.value)}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-green-500">ALGO</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Max Supply</label>
                                        <input
                                            className="cyber-input border-green-500/20 focus:border-green-400 focus:ring-green-400/50"
                                            placeholder="100"
                                            value={ticketSupply}
                                            onChange={e => setTicketSupply(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={createEvent}
                                    disabled={!isConnected}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold tracking-widest uppercase shadow-lg shadow-green-500/20 mt-4 disabled:opacity-50 transition-all hover:scale-[1.02]"
                                >
                                    Mint Assets
                                </button>
                            </div>

                            {status && (
                                <div className="mt-6 p-4 rounded-xl bg-black/40 border border-green-500/20 text-xs font-mono text-green-400 break-all text-center">
                                    {status}
                                </div>
                            )}
                        </div>

                        {/* Ticket Preview / Status */}
                        <div className="flex flex-col items-center justify-center min-h-[400px] perspective-1000">
                            {createdAssetId ? (
                                <motion.div
                                    initial={{ rotateY: 90, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                    className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 to-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,100,0.15)] border border-green-500/30 group hover:rotate-y-12 transition-transform duration-500"
                                >
                                    {/* Holographic Finish */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

                                    <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600" />

                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-10">
                                            <div>
                                                <h4 className="font-bold text-2xl text-white font-mono uppercase tracking-tight">{eventName || "Event Name"}</h4>
                                                <div className="flex items-center gap-2 text-xs text-green-400 mt-2 font-mono">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>AUG 24, 2026 // 20:00 UTC</span>
                                                </div>
                                            </div>
                                            <div className="p-2 border border-green-500/30 rounded-lg">
                                                <Ticket className="w-6 h-6 text-green-400" />
                                            </div>
                                        </div>

                                        <div className="border border-green-500/20 bg-green-900/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 mb-8 relative overflow-hidden">
                                            <div className="absolute inset-0 grid grid-cols-6 gap-px opacity-10">
                                                {[...Array(24)].map((_, i) => <div key={i} className="bg-green-500/50" />)}
                                            </div>
                                            <QrCode className="w-32 h-32 text-white relative z-10" />
                                            <span className="text-[10px] font-mono text-green-500 tracking-[0.2em] relative z-10">ID: {createdAssetId}</span>
                                        </div>

                                        <div className="flex justify-between items-end border-t border-white/10 pt-6">
                                            <div className="text-left">
                                                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Entry Fee</div>
                                                <div className="text-2xl font-bold text-white font-mono">{ticketPrice || "0"} ALGO</div>
                                            </div>
                                            <div className="px-4 py-1.5 bg-green-500 text-black rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,0,0.4)]">
                                                Valid
                                            </div>
                                        </div>
                                    </div>

                                    {/* LIST FOR RESALE BUTTON */}
                                    <div className="p-4 bg-green-500/10 border-t border-green-500/20">
                                        <button
                                            onClick={listTicketForResale}
                                            className="w-full py-3 bg-green-500 text-black font-bold uppercase rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            List for Resale
                                        </button>
                                    </div>

                                </motion.div>
                            ) : (
                                <div className="text-center space-y-6 opacity-50">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-dashed border-white/20 animate-spin-slow">
                                        <Ticket className="w-10 h-10 text-slate-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-500 uppercase tracking-widest">No Active Asset</h4>
                                        <p className="text-slate-600 font-mono text-sm mt-2">Initialize event configuration to mint NFT.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="resale"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {resaleTickets.map(ticket => (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    className="glass-card p-6 border border-green-500/20 hover:border-green-500/50 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
                                                {ticket.appId ? "Live Contract" : "Mock Listing"}
                                            </span>
                                        </div>
                                        <Tag className="w-4 h-4 text-green-500/50" />
                                    </div>

                                    <h3 className="text-lg font-bold text-white font-mono mb-2">{ticket.name}</h3>
                                    <p className="text-slate-500 text-xs font-mono mb-6">Seller: {ticket.seller}</p>
                                    {ticket.appId > 0 && (
                                        <p className="text-green-500/70 text-[10px] font-mono mb-2">Contract ID: {ticket.appId}</p>
                                    )}

                                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5 mb-4">
                                        <span className="text-xs text-slate-400 font-mono">Ask Price</span>
                                        <span className="text-xl font-bold text-white font-mono">{ticket.price} <span className="text-xs text-green-500">ALGO</span></span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (ticket.appId > 0) {
                                                buyRealTicket(ticket);
                                            } else {
                                                setStatus("Cannot buy demo ticket. Please Mint & List your own.");
                                            }
                                        }}
                                        className="w-full py-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 hover:shadow-[0_0_15px_rgba(0,255,100,0.2)] transition-all font-mono text-xs font-bold uppercase tracking-widest"
                                    >
                                        {ticket.appId > 0 ? "Buy Now (Atomic)" : "Demo Only"}
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {resaleTickets.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-20 text-center border-dashed border-2 border-white/10 rounded-2xl"
                            >
                                <p className="text-slate-500 font-mono text-sm">MARKETPLACE EMPTY. ALL TICKETS SOLD.</p>
                            </motion.div>
                        )}

                        <div className="col-span-full mt-8">
                            {status && (
                                <div className="p-4 rounded-xl bg-black/40 border border-green-500/20 text-xs font-mono text-green-400 break-all text-center animate-pulse">
                                    {status}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Ticketing;
