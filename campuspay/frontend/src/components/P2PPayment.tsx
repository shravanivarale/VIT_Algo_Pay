import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { algodClient, algosToMicroAlgos, waitForConfirmation } from '../utils/algorand';
import algosdk from 'algosdk';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Buffer } from 'buffer';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, QrCode, ArrowRight, Loader, Zap, ChevronDown } from 'lucide-react';

const P2PPayment: React.FC = () => {
    const { isConnected, accountAddress, peraWallet } = useWallet();
    const [receiver, setReceiver] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [assetId, setAssetId] = useState<number>(0);
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        if (isScanning) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            scanner.render((decodedText) => {
                setReceiver(decodedText);
                setIsScanning(false);
                scanner.clear();
            }, (_error) => {
                // Scanning... (Suppress errors for cleaner console)
            });

            return () => {
                scanner.clear().catch(console.error);
            };
        }
    }, [isScanning]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountAddress || !isConnected) return;

        setLoading(true);
        setStatus("Initiating Quantum Link...");

        try {
            const suggestedParams = await algodClient.getTransactionParams().do();
            const noteEncoded = new Uint8Array(Buffer.from(note, "utf8"));

            let txn;
            if (assetId === 0) {
                txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                    sender: accountAddress,
                    receiver: receiver,
                    amount: algosToMicroAlgos(parseFloat(amount)),
                    note: noteEncoded,
                    suggestedParams,
                });
            } else {
                txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    sender: accountAddress,
                    receiver: receiver,
                    assetIndex: assetId,
                    amount: parseInt(amount),
                    note: noteEncoded,
                    suggestedParams,
                });
            }

            const singleTxnGroups = [{ txn, signers: [accountAddress] }];

            setStatus("Awaiting Biometric Signature...");
            const signedTxn = await peraWallet.signTransaction([singleTxnGroups]);

            setStatus("Broadcasting to Ledger...");
            const response = await algodClient.sendRawTransaction(signedTxn).do();
            const txId = response.txid;

            setStatus(`Validating: ${txId}`);
            await waitForConfirmation(algodClient, txId, 4);

            setStatus(`Success: ${txId}`);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setStatus(`Failed: ${(error as Error).message}`);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card relative overflow-hidden"
            >
                {/* Header Actions */}
                <div className="h-2 bg-gradient-to-r from-cyber-neon to-cyber-purple w-full absolute top-0 left-0" />

                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-2">
                                <Zap className="w-8 h-8 text-cyber-neon fill-current" />
                                INSTANT TRANSFER
                            </h2>
                            <p className="text-cyber-neon/60 font-mono text-xs tracking-widest uppercase">
                                Secure P2P Protocol
                            </p>
                        </div>
                        <div className="px-3 py-1 border border-cyber-neon/30 rounded-full text-xs font-mono text-cyber-neon animate-pulse">
                            TESTNET ACTIVE
                        </div>
                    </div>

                    <form onSubmit={handleSend} className="space-y-6">
                        {/* Receiver Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Recipient Address</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={receiver}
                                    onChange={(e) => setReceiver(e.target.value)}
                                    className="cyber-input pr-12 font-mono text-sm"
                                    placeholder="ADDRESS..."
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsScanning(!isScanning)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-cyber-neon/20 rounded-lg text-cyber-neon transition-colors"
                                >
                                    <QrCode className="w-5 h-5" />
                                </button>
                                <div className="absolute inset-0 border border-cyber-neon/0 group-hover:border-cyber-neon/30 rounded-xl pointer-events-none transition-all" />
                            </div>
                            {isScanning && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="mt-2 p-2 rounded-xl border border-cyber-neon/30 bg-black/80 overflow-hidden"
                                >
                                    <div id="reader" className="[&_div]:!shadow-none [&_video]:!rounded-lg"></div>
                                </motion.div>
                            )}
                        </div>

                        {/* Asset Selection */}
                        <div className="grid grid-cols-5 gap-4">
                            <div className="col-span-2 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Asset</label>
                                <div className="relative">
                                    <select
                                        className="cyber-input appearance-none cursor-pointer"
                                        value={assetId === 0 ? 'algo' : 'asa'}
                                        onChange={(e) => setAssetId(e.target.value === 'algo' ? 0 : 0)}
                                    >
                                        <option value="algo">ALGO</option>
                                        <option value="asa">ASA (Token)</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            </div>

                            {assetId !== 0 || (document.querySelector('select')?.value === 'asa') ? (
                                <div className="col-span-3 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Asset ID</label>
                                    <input
                                        type="number"
                                        value={assetId}
                                        onChange={(e) => setAssetId(parseInt(e.target.value))}
                                        className="cyber-input font-mono"
                                        placeholder="0"
                                    />
                                </div>
                            ) : (
                                <div className="col-span-3 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Amount</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="cyber-input pl-4 pr-16 text-right font-mono text-xl font-bold tracking-wider"
                                            placeholder="0.00"
                                            step="0.000001"
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-cyber-neon">ALGO</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Note Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Encrypted Note</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="cyber-input min-h-[80px] text-sm"
                                placeholder="Add transaction data..."
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isConnected}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group ${loading || !isConnected
                                ? 'bg-cyber-dark border border-white/5 text-slate-600 cursor-not-allowed'
                                : 'btn-cyber-filled hover:shadow-[0_0_40px_rgba(0,240,255,0.4)]'
                                }`}
                        >
                            {loading ? <Loader className="animate-spin text-white" /> : <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            {loading ? 'EXECUTING SMART CONTRACT...' : 'AUTHORIZE TRANSFER'}
                        </button>
                    </form>

                    {/* Status Feedback */}
                    <AnimatePresence>
                        {status && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6"
                            >
                                <div className={`p-4 rounded-xl border backdrop-blur-md flex items-start gap-3 ${status.includes('Success')
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                    : status.includes('Failed')
                                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                        : 'bg-cyber-neon/10 border-cyber-neon/30 text-cyber-neon'
                                    }`}>
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${status.includes('Success') ? 'bg-green-400' : 'bg-cyber-neon animate-pulse'}`} />
                                    <div className="flex-1">
                                        <p className="font-mono text-xs uppercase tracking-wider">{status}</p>
                                        {status.startsWith('Success:') && (
                                            <a
                                                href={`https://testnet.algoexplorer.io/tx/${status.split(':')[1].trim()}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors border-b border-dashed border-current pb-0.5"
                                            >
                                                Verify on Chain <ArrowRight className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default P2PPayment;
