import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { algodClient, waitForConfirmation, algosToMicroAlgos } from '../utils/algorand';
import algosdk from 'algosdk';
import { Buffer } from 'buffer';
import { motion } from 'framer-motion';
import { Rocket, Target, Heart, TrendingUp, Cpu } from 'lucide-react';

const Fundraising: React.FC = () => {
    const { isConnected, accountAddress, peraWallet } = useWallet();
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [appId, setAppId] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('');

    const createCampaign = async () => {
        setStatus("INITIALIZING DAO CONTRACT...");
        setTimeout(() => setStatus("DEPLOYMENT PENDING: REQUIRED TEAL ARTIFACTS."), 1000);
    };

    const contribute = async () => {
        if (!appId || !amount || !accountAddress) return;
        setStatus("PROCESSING CONTRIBUTION...");

        try {
            const suggestedParams = await algodClient.getTransactionParams().do();
            const appIndex = parseInt(appId);

            const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: accountAddress,
                receiver: algosdk.getApplicationAddress(appIndex),
                amount: algosToMicroAlgos(parseFloat(amount)),
                suggestedParams,
            });

            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: accountAddress,
                appIndex,
                appArgs: [new Uint8Array(Buffer.from("contribute"))],
                suggestedParams,
            });

            const txns = [payTxn, appCallTxn];
            const groupID = algosdk.computeGroupID(txns);
            txns.forEach(t => t.group = groupID);

            const signerGroup = txns.map(txn => ({ txn, signers: [accountAddress] }));

            const signed = await peraWallet.signTransaction([signerGroup]);
            const { txid } = await algodClient.sendRawTransaction(signed).do();

            setStatus(`HASH: ${txid}`);
            await waitForConfirmation(algodClient, txid, 4);
            setStatus(`CONFIRMED. HASH: ${txid}`);

        } catch (error) {
            console.error(error);
            setStatus("TRANSACTION FAILED.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-cyber-pink tracking-tighter mb-2 flex justify-center items-center gap-3">
                    <Rocket className="w-10 h-10 text-red-500" />
                    CAMPUS DAO
                </h2>
                <p className="text-red-500/60 font-mono tracking-widest text-xs uppercase">Decentralized Project Funding</p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Launch Pad */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1 glass-card p-6 h-fit border-t-2 border-red-500 relative"
                >
                    <div className="absolute top-0 inset-x-0 h-32 bg-red-500/10 blur-3xl -z-10" />

                    <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-500 border border-red-500/30">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white font-mono uppercase">Launch Initiative</h3>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Project Title</label>
                            <input
                                className="cyber-input border-red-500/20 focus:border-red-500 focus:ring-red-500/50"
                                placeholder="Core::Robotics_Fund"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Funding Target</label>
                            <div className="relative">
                                <input
                                    className="cyber-input pr-12 text-right font-mono border-red-500/20 focus:border-red-500 focus:ring-red-500/50"
                                    placeholder="0"
                                    value={goal}
                                    onChange={e => setGoal(e.target.value)}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500">ALGO</span>
                            </div>
                        </div>
                        <button
                            onClick={createCampaign}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold tracking-widest uppercase shadow-lg shadow-red-500/20 mt-2 transition-all hover:scale-[1.02]"
                        >
                            Deploy Contract
                        </button>
                    </div>
                </motion.div>

                {/* Dashboard */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Campaign Card */}
                    <div className="glass-card p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 bg-green-500/10 text-green-400 text-xs font-mono font-bold rounded-bl-xl border-l border-b border-green-500/20 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Status: ACTIVE
                        </div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Hackathon Prize Pool</h3>
                                <p className="text-slate-400 text-sm font-mono border-l-2 border-cyber-pink pl-3">Smart Contract Address: 652...8A2</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-full border border-white/10 group-hover:border-cyber-pink/50 transition-colors">
                                <Target className="w-8 h-8 text-cyber-pink" />
                            </div>
                        </div>

                        <div className="mb-8 relative z-10">
                            <div className="flex justify-between text-xs font-mono mb-3 uppercase tracking-wider">
                                <span className="text-white font-bold"><span className="text-cyber-pink text-lg">1,250</span> ALGO RAISED</span>
                                <span className="text-slate-500">TARGET: 5,000 ALGO</span>
                            </div>
                            <div className="h-2 bg-cyber-dark border border-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-cyber-pink w-[25%] rounded-full relative shadow-[0_0_15px_rgba(255,0,170,0.5)]">
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm relative z-10">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">App ID</label>
                                    <input
                                        className="w-full mt-2 bg-transparent border-b border-white/20 p-2 text-white font-mono text-sm focus:border-cyber-pink outline-none transition-colors"
                                        placeholder="123456"
                                        value={appId}
                                        onChange={e => setAppId(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contribution</label>
                                    <input
                                        className="w-full mt-2 bg-transparent border-b border-white/20 p-2 text-white font-mono text-sm focus:border-cyber-pink outline-none transition-colors text-right"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={contribute}
                                    disabled={!isConnected}
                                    className="bg-cyber-pink/20 hover:bg-cyber-pink text-white p-3 rounded-lg transition-all border border-cyber-pink/50 hover:shadow-[0_0_20px_rgba(255,0,170,0.4)]"
                                >
                                    <Heart className="w-5 h-5 fill-current" />
                                </button>
                            </div>
                        </div>

                        {status && <div className="mt-4 text-center text-xs text-cyber-pink font-mono animate-pulse">{status}</div>}

                        {/* Background Effects */}
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-5 flex items-center gap-4 border border-blue-500/20">
                            <div className="p-3 bg-blue-500/10 rounded-full text-blue-400 border border-blue-500/20">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white font-mono">12</div>
                                <div className="text-[10px] text-blue-400 uppercase tracking-widest">Active nodes</div>
                            </div>
                        </div>
                        <div className="glass-card p-5 flex items-center gap-4 border border-purple-500/20">
                            <div className="p-3 bg-purple-500/10 rounded-full text-purple-400 border border-purple-500/20">
                                <Heart className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white font-mono">45k</div>
                                <div className="text-[10px] text-purple-400 uppercase tracking-widest">TVL (Algo)</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Fundraising;
