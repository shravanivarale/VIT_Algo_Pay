import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import Layout from './components/ui/Layout';
import P2PPayment from './components/P2PPayment';
import BillSplit from './components/BillSplit';
import Fundraising from './components/Fundraising';
import Ticketing from './components/Ticketing';
import Subscriptions from './components/Subscriptions';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Users, Ticket, Rocket } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  const modules = [
    {
      title: 'INSTANT TRANSFER',
      desc: 'Peer-to-peer crypto payments at lightspeed.',
      icon: <Globe className="w-8 h-8 text-cyber-neon" />,
      path: '/p2p',
      border: 'border-cyber-neon/50'
    },
    {
      title: 'SPLIT BILLS',
      desc: 'Atomic group transactions for shared expenses.',
      icon: <Users className="w-8 h-8 text-cyber-purple" />,
      path: '/split',
      border: 'border-cyber-purple/50'
    },
    {
      title: 'FUNDRAISE DAO',
      desc: 'Transparent crowdfunding for campus initiatives.',
      icon: <Rocket className="w-8 h-8 text-cyber-pink" />,
      path: '/fundraise',
      border: 'border-cyber-pink/50'
    },
    {
      title: 'NFT EVENTS',
      desc: 'Verifiable tickets and collectibles.',
      icon: <Ticket className="w-8 h-8 text-green-400" />,
      path: '/tickets',
      border: 'border-green-400/50'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col items-center">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16 pt-10 relative z-10"
      >
        <div className="inline-block p-12 rounded-3xl bg-cyber-dark/30 backdrop-blur-md border border-white/5 shadow-2xl">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter drop-shadow-2xl">
            <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">VIT</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-cyber-purple ml-4 drop-shadow-[0_0_25px_rgba(0,240,255,0.6)]">ALGO</span>
            <span className="text-white ml-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">PAY</span>
          </h1>
          <p className="text-cyber-neon/90 text-xl font-mono tracking-[0.2em] uppercase mb-8 drop-shadow-lg font-bold">
            Next Gen Campus Finance Protocol
          </p>

          <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white drop-shadow-lg">3.5s</span>
              <span className="text-[10px] text-cyber-neon tracking-widest uppercase">Latency</span>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white drop-shadow-lg">&lt;0.001</span>
              <span className="text-[10px] text-cyber-neon tracking-widest uppercase">Fee</span>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white drop-shadow-lg">Zero</span>
              <span className="text-[10px] text-cyber-neon tracking-widest uppercase">Carbon</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modules Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
      >
        {modules.map((mod) => (
          <motion.div
            key={mod.title}
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(mod.path)}
            className={`glass-card p-1 group cursor-pointer relative overflow-hidden h-64`}
          >
            {/* Hover Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="bg-cyber-dark/60 backdrop-blur-md h-full rounded-xl p-8 border border-white/5 relative z-10 group-hover:border-cyber-neon/30 transition-all flex flex-col justify-center items-center text-center">

              <div className={`mb-6 p-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-cyber-neon/10 group-hover:border-cyber-neon/50 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-110 ${mod.border}`}>
                {mod.icon}
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 font-mono tracking-wide group-hover:text-cyber-neon transition-colors">
                {mod.title}
              </h3>

              <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-in-out">
                <p className="text-slate-300 text-sm leading-relaxed mt-2 font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                  {mod.title === 'INSTANT TRANSFER' ? 'Peer-to-peer digital payments at lightspeed.' : mod.desc}
                </p>
              </div>

              <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-cyber-neon to-cyber-purple transition-all duration-500`} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

import { useState } from 'react';
import IntroAnimation from './components/ui/IntroAnimation';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <WalletProvider>
      <Router>
        <AnimatePresence mode="wait">
          {showIntro ? (
            <IntroAnimation key="intro" onComplete={() => setShowIntro(false)} />
          ) : (
            <Layout key="layout">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/p2p" element={<P2PPayment />} />
                <Route path="/split" element={<BillSplit />} />
                <Route path="/fundraise" element={<Fundraising />} />
                <Route path="/tickets" element={<Ticketing />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          )}
        </AnimatePresence>
      </Router>
    </WalletProvider>
  );
}

export default App;
