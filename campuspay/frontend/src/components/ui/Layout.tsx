import type { FC, ReactNode } from 'react';
import Navbar from '../Navbar';
import ThreeBackground from './ThreeBackground';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen text-white relative font-sans">
            <ThreeBackground />
            <Navbar />
            <main className="relative z-10 container mx-auto px-4 py-8 pointer-events-none md:pointer-events-auto [&>*]:pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default Layout;
