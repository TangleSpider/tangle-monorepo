async function getChainId() {

  let provider = await detectEthereumProvider();

  if (provider) {
    return await ethereum.request({ method: 'eth_chainId' });
  } else {
    console.log('Please install MetaMask!');
  }

}

export { getChainId }
