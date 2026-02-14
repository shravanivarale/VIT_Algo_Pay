import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { CreditCard, Zap, CheckCircle, Activity, ShieldCheck } from 'lucide-react';

const Subscriptions: React.FC = () => {
    const { isConnected, accountAddress } = useWallet();
    const [status, setStatus] = useState<string | null>(null);
    const [activeSubs, setActiveSubs] = useState<number[]>([]);

    const services = [
        { id: 1, name: "Campus Mess Hall", price: 450, billing: "Monthly", icon: <Zap className="w-6 h-6 text-yellow-400" />, color: "from-yellow-400 to-orange-500" },
        { id: 2, name: "Gym Membership", price: 150, billing: "Monthly", icon: <Activity className="w-6 h-6 text-red-400" />, color: "from-red-400 to-pink-500" },
        { id: 3, name: "Library Extended Access", price: 50, billing: "Semester", icon: <ShieldCheck className="w-6 h-6 text-blue-400" />, color: "from-blue-400 to-cyan-500" },
    ];

    const toggleSubscription = async (id: number) => {
        if (!accountAddress) return;

        if (activeSubs.includes(id)) {
            // Simulate specific cancellation logic if needed, for now just toggle off
            setActiveSubs(prev => prev.filter(subId => subId !== id));
            setStatus(`SUBSCRIPTION ID:${id} CANCELLED`);
            return;
        }

        setStatus(`INITIALIZING STREAM PAY FOR ID: ${id}...`);

        try {
            // Simulate Smart Contract Interaction for Recurring Payment Stream
            setTimeout(() => setStatus("1. APPROVING ALLOWANCE CONTRACT..."), 800);
            setTimeout(() => setStatus("2. CONFIGURING PAYMENT INTERVALS..."), 1600);
            setTimeout(() => setStatus(`3. STREAM ACTIVATED: TX_${Math.random().toString(36).substr(2, 6).toUpperCase()}`), 2400);

            setTimeout(() => {
                setActiveSubs(prev => [...prev, id]);
                setStatus(null);
            }, 3000);
        } catch (e) {
            setStatus("STREAM PAY FAILED");
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 tracking-tighter mb-2 flex justify-center items-center gap-3">
                    <CreditCard className="w-10 h-10 text-blue-400" />
                    STREAM PAY
                </h2>
                <p className="text-blue-500/60 font-mono tracking-widest text-xs uppercase">Automated Recurring Campus Payments</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
                {services.map((service, index) => (
                    <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative group rounded-3xl p-1 bg-gradient-to-b ${service.color} p-[1px]`}
                    >
                        <div className="bg-black/90 rounded-[22px] h-full p-8 relative overflow-hidden backdrop-blur-xl">
                            {/* Background Glow */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.color} opacity-10 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:opacity-20 transition-opacity`} />

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className={`p-3 rounded-2xl bg-gradient-to-br ${service.color} bg-opacity-10 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                                    <div className="text-white drop-shadow-md">
                                        {service.icon}
                                    </div>
                                </div>
                                {activeSubs.includes(service.id) && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/30"
                                    >
                                        <CheckCircle className="w-3 h-3" />
                                        Active
                                    </motion.div>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-white font-mono mb-2 leading-tight">{service.name}</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 font-mono">{service.price}</span>
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">ALGO/{service.billing}</span>
                            </div>

                            {activeSubs.includes(service.id) ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-slate-400">Next Payment</span>
                                            <span className="text-white font-mono">24h 15m</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full bg-gradient-to-r ${service.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: "85%" }}
                                                transition={{ duration: 1.5, ease: "circOut" }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleSubscription(service.id)}
                                        className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-bold uppercase tracking-widest"
                                    >
                                        Cancel Stream
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => toggleSubscription(service.id)}
                                    disabled={!isConnected}
                                    className={`w-full py-4 rounded-xl bg-gradient-to-r ${service.color} text-white font-bold tracking-widest uppercase shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transform transition-all hover:scale-[1.02] disabled:opacity-50 disabled:grayscale`}
                                >
                                    Activate Stream
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {status && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-white font-mono text-xs shadow-2xl z-50 flex items-center gap-3"
                >
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    {status}
                </motion.div>
            )}
        </div>
    );
};

export default Subscriptions;
