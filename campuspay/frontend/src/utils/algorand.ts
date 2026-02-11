import algosdk from 'algosdk';

const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;

const INDEXER_TOKEN = '';
const INDEXER_SERVER = 'https://testnet-idx.algonode.cloud';
const INDEXER_PORT = 443;

export const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
export const indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_SERVER, INDEXER_PORT);

export const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const microAlgosToAlgos = (microAlgos: number) => {
    return algosdk.microalgosToAlgos(microAlgos);
};

export const algosToMicroAlgos = (algos: number) => {
    return algosdk.algosToMicroalgos(algos);
};

export const waitForConfirmation = async (
    algodClient: algosdk.Algodv2,
    txId: string,
    timeout: number
) => {
    return algosdk.waitForConfirmation(algodClient, txId, timeout);
};
