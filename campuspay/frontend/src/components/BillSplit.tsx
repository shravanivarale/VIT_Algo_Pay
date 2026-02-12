import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { algodClient, algosToMicroAlgos, formatAddress } from '../utils/algorand';
import algosdk from 'algosdk';
import { Buffer } from 'buffer';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Share2, Check, Copy, GripVertical, Trash2 } from 'lucide-react';

const BillSplit: React.FC = () => {
    const { isConnected, accountAddress, peraWallet } = useWallet();
    const [participants, setParticipants] = useState<{ address: string; amount: string }[]>([]);
    const [newAddress, setNewAddress] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [groupPayload, setGroupPayload] = useState<string>('');
    const [status, setStatus] = useState('');

    const addParticipant = () => {
        if (!newAddress || !newAmount) return;
        setParticipants([...participants, { address: newAddress, amount: newAmount }]);
        setNewAddress('');
        setNewAmount('');
    };

    const removeParticipant = (index: number) => {
        setParticipants(participants.filter((_, i) => i !== index));
    };

    const createGroupTransaction = async () => {
        if (!accountAddress) return;
        setStatus('INITIALIZING ATOMIC GROUP...');

        try {
            const suggestedParams = await algodClient.getTransactionParams().do();
            const txns: algosdk.Transaction[] = [];
            const creator = accountAddress;

            participants.forEach(p => {
                const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                    sender: p.address,
                    receiver: creator,
                    amount: algosToMicroAlgos(parseFloat(p.amount)),
                    suggestedParams,
                });
                txns.push(txn);
            });

            const groupID = algosdk.computeGroupID(txns);
            txns.forEach(txn => txn.group = groupID);

            const encoded = txns.map(txn => Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64'));
            setGroupPayload(JSON.stringify(encoded));
            setStatus('GROUP ENCODED. READY FOR TRANSMISSION.');
        } catch (error) {
            console.error(error);
            setStatus('Error creating group.');
        }
    };

    const signPart = async () => {
        if (!groupPayload || !accountAddress) return;
        try {
            const txnsData: string[] = JSON.parse(groupPayload);
            const txns = txnsData.map(str => algosdk.decodeUnsignedTransaction(Buffer.from(str, 'base64')));

            const myTxnIndices = txns
                .map((txn, index) => algosdk.encodeAddress((txn as any).from.publicKey) === accountAddress ? index : -1)
                .filter(index => index !== -1);

            if (myTxnIndices.length === 0) {
                setStatus("NO SIGNABLE TRANSACTIONS FOUND FOR THIS IDENTITY.");
                return;
            }

            const signerGroup = txns.map((txn, index) => {
                if (myTxnIndices.includes(index)) {
                    return { txn, signers: [accountAddress] };
                }
                return { txn, signers: [] };
            });

            const signedParts = await peraWallet.signTransaction([signerGroup]);
            setStatus("PARTIAL SIGNATURE APPENDED TO PAYLOAD.");
            // Payload ready for transmission

        } catch (error) {
            console.error(error);
            setStatus("SIGNING FAILED.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple to-cyber-pink tracking-tighter mb-2 flex justify-center items-center gap-3">
                    <Users className="w-10 h-10 text-cyber-purple" />
                    ATOMIC SPLIT
                </h2>
                <p className="text-cyber-purple/60 font-mono tracking-widest text-xs uppercase">Multi-Party Payment Reconstruction</p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Creator Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-purple/20 rounded-full blur-3xl -z-10 group-hover:bg-cyber-purple/30 transition-colors" />

                    <h3 className="text-xl font-bold mb-6 text-white font-mono flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyber-purple rounded-full animate-pulse" />
                        CONFIGURE GROUP
                    </h3>

                    <div className="space-y-6 mb-8">
                        <div className="p-4 bg-cyber-dark/80 rounded-xl border border-white/5 space-y-4 shadow-inner">
                            <label className="text-[10px] font-bold text-cyber-purple uppercase tracking-widest">Add Node / Participant</label>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 cyber-input text-xs font-mono"
                                    placeholder="ALGO ADDRESS..."
                                    value={newAddress}
                                    onChange={e => setNewAddress(e.target.value)}
                                />
                                <div className="relative w-32">
                                    <input
                                        className="w-full cyber-input text-xs font-mono pr-8"
                                        placeholder="0.00"
                                        value={newAmount}
                                        onChange={e => setNewAmount(e.target.value)}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-cyber-purple font-bold">ALGO</span>
                                </div>
                                <button
                                    onClick={addParticipant}
                                    className="bg-cyber-purple/20 hover:bg-cyber-purple/40 text-cyber-purple border border-cyber-purple/50 rounded-xl p-2 transition-all hover:scale-105"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {participants.map((p, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-lg border-l-2 border-cyber-purple group/item hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <GripVertical className="w-4 h-4 text-slate-600" />
                                            <span className="text-xs text-slate-300 font-mono tracking-tight">{formatAddress(p.address)}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-white font-mono">{p.amount} <span className="text-[10px] text-cyber-purple">ALGO</span></span>
                                            <button
                                                onClick={() => removeParticipant(i)}
                                                className="text-red-500/50 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {participants.length === 0 && (
                                <div className="text-center py-10 text-slate-600 border-2 border-dashed border-white/5 rounded-xl font-mono text-xs">
                                    [NO ACTIVE NODES CONNECTED]
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={createGroupTransaction}
                        className="w-full btn-cyber-filled from-cyber-purple to-cyber-pink shadow-cyber-purple/20"
                    >
                        COMPILE TRANSACTION GROUP
                    </button>
                </motion.div>

                {/* Signer Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 relative"
                >
                    <div className="absolute top-0 right-0 p-4 bg-white/5 rounded-bl-2xl backdrop-blur-sm border-b border-l border-white/5">
                        <Share2 className="w-6 h-6 text-cyber-pink" />
                    </div>

                    <h3 className="text-xl font-bold mb-6 text-white font-mono flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyber-pink rounded-full animate-pulse" />
                        SIGNING INTERFACE
                    </h3>

                    <div className="space-y-6">
                        <div className="relative group">
                            <textarea
                                className="w-full h-64 bg-black/60 border border-white/10 rounded-xl p-4 text-[10px] font-mono text-cyber-pink/80 outline-none focus:border-cyber-pink/50 resize-none custom-scrollbar"
                                placeholder="// INJECT GROUP PAYLOAD HERE..."
                                value={groupPayload}
                                onChange={e => setGroupPayload(e.target.value)}
                            />
                            <button
                                className="absolute bottom-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-slate-400 hover:text-white transition-colors"
                                onClick={() => navigator.clipboard.writeText(groupPayload)}
                                title="Copy Payload"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={signPart}
                            disabled={!isConnected}
                            className="w-full py-4 rounded-xl border border-cyber-pink/30 text-cyber-pink font-bold font-mono tracking-widest hover:bg-cyber-pink/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            <Check className="w-5 h-5 group-hover:scale-125 transition-transform" />
                            AUTHORIZE MY SEGMENT
                        </button>

                        <AnimatePresence>
                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-4 rounded-xl bg-cyber-pink/10 border border-cyber-pink/20 text-cyber-pink text-xs font-mono text-center"
                                >
                                    {status}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BillSplit;
