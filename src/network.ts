import {PROVIDER_CHAIN_ID, PROVIDER_NETWORK} from '@env';
import {ethers} from 'ethers';

const provider = new ethers.providers.StaticJsonRpcProvider(PROVIDER_NETWORK, {
  chainId: parseInt(PROVIDER_CHAIN_ID, 10),
  name: 'dev',
});

export const getDefaultNetwork = () => provider;

export const getDefaultChainId = () => parseInt(PROVIDER_CHAIN_ID, 10);
