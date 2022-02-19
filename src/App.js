import { useState,useEffect } from "react";
import { ethers, utils } from "ethers";
import abi from "./contracts/BankContract.json";

function App() {

  const [isWalletConnected, setIswalletConnected] = useState(false);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [currentBankName, setCurrentBankName] = useState(null);
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const [inputValue, setInputValue] = useState({ withdrawalAmount:"", deposit:"", bankName:"" })
  const [isBankOwner, setIsBankOwner] = useState(false);
  const [customerBalance, setCustomerBalance] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = '0x136D5c119cF98b13e6C3E5A4d0eb7572aF0EA023';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum){
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setIswalletConnected(true);
        setCustomerAddress(account);
        console.log("Account connected", account);
      }else {
        setError("Please install a MetaMask Wallet to use our Bank");
        console.log("No MetaMask detected");
      }
    }catch (error){
      console.log(error);
    }

  }

  const getBankName = async () => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(); //an abstraction of an Ethereum Account,
      //  which can be used to sign messages and transactions and send signed transactions to the Ethereum Network to execute state changing operations.
      const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

      let bankName = await bankContract.bankName();
      bankName = utils.parseBytes32String(bankName);
      setCurrentBankName(bankName.toString())

    }catch (error){

    }
  }

  const setBankNameHandler = async (event) => {
    event.preventDefault();
    try {
        if (window.ethereum){
          const provider  = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

          const txn = bankContract.setbankName(utils.formatBytes32String(inputValue.bankName));
          console.log("setting ban name...");
          await txn.wait();
          console.log("Transaction name changed", txn.hash);
          await getBankName();
        }else {
          console.log("ethereum object not found, set MetaMask");
          setError("Please Install a MetaMask Wallet to use our bank");
        }
    }catch (error){
      console.log(error);
    }

  }

  const getBankOwnerHandler = async () => {
    try{
      if (window.ethereum){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract =  new ethers.Contract(contractAddress, contractABI, signer);

        let bankOwner = await bankContract.bankOwner();
        setBankOwnerAddress(bankOwner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (bankOwner.toLowerCase() == account.toLowerCase()){
          setIsBankOwner(true);
        }

      }else{
        console.log("ethereum object not found, set MetaMask");
        setError("Please Install a MetaMask Wallet to use our bank");
      }
    }catch (eror){
      console.log(error);
    }
  }

  const customerBalanceHandler = async () => {
    try{
      if (window.ethereum){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const BankContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await BankContract.getCustomerBalance();
        setCustomerBalance(utils.formatEther(balance));
        console.log("Retrieved balance is..", customerBalance);
      }else{
        console.log("ethereum object not found, set MetaMask");
        setError("Please Install a MetaMask wallet to use our bank");
      }
    }catch (error){
      console.log(error);
    }
  }

  const depositMoney = async (event) => {
    event.preventDefault();
    try{
      if (window.ethereum){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const BankContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await BankContract.depositMoney({ value: utils.parseEther(inputValue.deposit)});
        console.log("Depositing money...");
        await txn.wait();
        console.log("Depositing money done", txn.hash);

        customerBalanceHandler();
      }else{
        console.log("ethereum object not found, set MetaMask");
        setError("Pleae Install a MetaMask wallet to use our bank");
      }

    }catch (error){
      console.log(error);

    }
  }

  const withdrawMoney = async (event) => {
    event.preventDefault();
    try{
      if (window.ethereum){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.providers.Web3Provider(contractAddress, contractABI, signer);
        let myAddress = await signer.getAddress();

        const txn = await bankContract.withdrawMoney(myAddress, utils.formatEther(inputValue.withdrawalAmount));
        console.log("Withdrawing money...");
        await txn.wait()
        console.log("Withrawal Done", txn.hash)

        customerBalanceHandler()

      }else{
        console.log("ethereum object not found, set MetaMask");
        setError("Pleae Install a MetaMask wallet to use our bank");
      }
    }catch (error){
      console.log(error);
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getBankName();
    getBankOwnerHandler();
    customerBalanceHandler();
  }, [isWalletConnected]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="title">
          <h3>Bank Contract Project 💰</h3>
        </div>
        <div className="transactions">
          <div className="transactions__depositContainer">
          <form onSubmit={depositMoney}>
            <input 
            type="text"
            name="deposit"
            value={inputValue.deposit}
            onChange={handleInputChange} />
            <button
              className="btn-purple"
              onClick={depositMoney}>Deposit Money In ETH</button>
          </form>
          </div>
          <div className="transactions__withdrawContainer">
          <form onSubmit={withdrawMoney}>
            <input 
            type="text"
            name="withdrawalAmount"
            value={inputValue.withdrawalAmount}
            onChange={handleInputChange} />
            <button
              className="btn-purple"
              onClick={withdrawMoney}>Deposit Money In ETH</button>
          </form>
          </div>
          <div className="details">
            {customerBalance && (
              <h2>Customer Balance: {customerBalance}</h2>
            )}
            {bankOwnerAddress && (
              <h3>Bank Owner Address: {bankOwnerAddress}</h3>
            )}
          </div>

        </div>
      </header>
    </div>
  )
}

export default App
