import { http } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const config = getDefaultConfig({
    appName: 'Web3 Todo App',
    projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
    chains: [hardhat],
    transports: {
        [hardhat.id]: http(),
    },
});
