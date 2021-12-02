async function requestAccounts() {

  let provider = await detectEthereumProvider();

  if (provider) {
    return await ethereum.request({ method: 'eth_requestAccounts' });
  } else {
    console.log('Please install MetaMask!');
  }

}

export { requestAccounts }
