import { useState } from 'react';
import type { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Wallet, Menu, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: FC = () => {
    const { isConnected, accountAddress, connectWallet, disconnectWallet } = useWallet();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: 'P2P Transfer', path: '/p2p' },
        { name: 'Split Bills', path: '/split' },
        { name: 'Fundraise', path: '/fundraise' },
        { name: 'NFT Tickets', path: '/tickets' },
        { name: 'Subscriptions', path: '/subscriptions' },
    ];

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-cyber-dark/70 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-cyber-neon blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative bg-gradient-to-br from-cyber-dark to-cyber-light border border-white/10 p-2.5 rounded-xl group-hover:border-cyber-neon/50 transition-colors">
                                    <Zap className="h-6 w-6 text-cyber-neon" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold tracking-wider font-mono text-white">
                                    VIT <span className="text-cyber-neon">ALGO</span> PAY
                                </span>
                                <span className="text-[10px] text-slate-400 tracking-[0.2em] uppercase">
                                    Future Finance
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:block ml-12">
                        <div className="flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`relative px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-300 overflow-hidden group ${location.pathname === item.path
                                        ? 'text-cyber-neon'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <span className="relative z-10">{item.name}</span>
                                    {location.pathname === item.path && (
                                        <motion.div
                                            layoutId="nav-glow"
                                            className="absolute inset-0 bg-cyber-neon/10 border-b-2 border-cyber-neon"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-cyber-neon transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Wallet Connection */}
                    <div>
                        {isConnected ? (
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex flex-col items-end mr-2">
                                    <span className="text-[10px] text-cyber-neon font-bold tracking-wider uppercase flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyber-neon animate-pulse" />
                                        Connected
                                    </span>
                                    <span className="text-xs text-white font-mono bg-cyber-light/50 px-2 py-1 rounded border border-white/10">
                                        {accountAddress?.slice(0, 4)}...{accountAddress?.slice(-4)}
                                    </span>
                                </div>
                                <button
                                    onClick={disconnectWallet}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={connectWallet}
                                className="group relative px-6 py-2.5 bg-cyber-neon/10 hover:bg-cyber-neon/20 border border-cyber-neon/50 hover:border-cyber-neon text-cyber-neon rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                            >
                                <span className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Connect Wallet
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-300 hover:text-white p-2"
                        >
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-cyber-dark/95 border-t border-white/10 backdrop-blur-xl"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-4 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
