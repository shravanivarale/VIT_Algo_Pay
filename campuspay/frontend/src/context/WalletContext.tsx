import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

const peraWallet = new PeraWalletConnect();

interface WalletContextType {
    isConnected: boolean;
    accountAddress: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    peraWallet: PeraWalletConnect;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [accountAddress, setAccountAddress] = useState<string | null>(null);
    const isConnected = !!accountAddress;

    useEffect(() => {
        // Reconnect to the session when the component mounts
        peraWallet.reconnectSession().then((accounts) => {
            // Setup the disconnect event listener
            peraWallet.connector?.on('disconnect', handleDisconnectWallet);

            if (accounts.length) {
                setAccountAddress(accounts[0]);
            }
        });

        // Cleanup
        return () => {
            // connector.off might not be exposed or needed as per Pera docs,
            // managing state locally is usually enough.
        }
    }, []);

    const handleDisconnectWallet = () => {
        localStorage.removeItem("walletconnect"); // Clear WC session if needed
        setAccountAddress(null);
    };

    const connectWallet = async () => {
        try {
            const newAccounts = await peraWallet.connect();
            peraWallet.connector?.on('disconnect', handleDisconnectWallet);
            setAccountAddress(newAccounts[0]);
        } catch (error) {
            if ((error as any)?.data?.type !== 'CONNECT_MODAL_CLOSED') {
                console.error('Error connecting wallet:', error);
            }
        }
    };

    const disconnectWallet = async () => {
        await peraWallet.disconnect();
        handleDisconnectWallet();
    };

    return (
        <WalletContext.Provider value={{ isConnected, accountAddress, connectWallet, disconnectWallet, peraWallet }}>
            {children}
        </WalletContext.Provider>
    );
};
