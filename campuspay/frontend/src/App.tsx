import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import Layout from './components/ui/Layout';
import P2PPayment from './components/P2PPayment';
import BillSplit from './components/BillSplit';
import Fundraising from './components/Fundraising';
import Ticketing from './components/Ticketing';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Users, Ticket, Rocket } from 'lucide-react';

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
        className="text-center mb-20 pt-10"
      >
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500">VIT</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-cyber-purple ml-4 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">ALGO</span>
          <span className="text-white ml-4">PAY</span>
        </h1>
        <p className="text-cyber-neon/80 text-xl font-mono tracking-[0.2em] uppercase mb-8">
          Next Gen Campus Finance Protocol
        </p>

        <div className="flex justify-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">3.5s</span>
            <span className="text-[10px] text-slate-500 tracking-widest uppercase">Latency</span>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">&lt;0.001</span>
            <span className="text-[10px] text-slate-500 tracking-widest uppercase">Fee</span>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">Zero</span>
            <span className="text-[10px] text-slate-500 tracking-widest uppercase">Carbon</span>
          </div>
        </div>
      </motion.div>

      {/* Modules Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {modules.map((mod) => (
          <motion.div
            key={mod.title}
            variants={item}
            whileHover={{ scale: 1.02, translateY: -5 }}
            onClick={() => navigate(mod.path)}
            className={`glass-card p-1 group cursor-pointer relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="bg-cyber-dark/80 backdrop-blur-md h-full rounded-xl p-8 border border-white/5 relative z-10 group-hover:border-transparent transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors ${mod.border}`}>
                  {mod.icon}
                </div>
                <ArrowRight className="w-6 h-6 text-slate-500 group-hover:text-cyber-neon transform group-hover:translate-x-2 transition-all" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 font-mono tracking-wide">{mod.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{mod.desc}</p>

              <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-cyber-neon to-cyber-purple transition-all duration-700`} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

function App() {
  return (
    <WalletProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/p2p" element={<P2PPayment />} />
            <Route path="/split" element={<BillSplit />} />
            <Route path="/fundraise" element={<Fundraising />} />
            <Route path="/tickets" element={<Ticketing />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </WalletProvider>
  );
}

export default App;
