import './App.css';
import { useEffect, useState } from "react";

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null)

  useEffect(() => {
    const onLoad = async () => {
      await checkIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const checkIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");

          const response = await solana.connect({ onlyIfTrusted: true });
          console.log("Connected with address:", response.publicKey.toString());
          setWalletAddress(response.publicKey.toString())

        }
      } else {
        alert("Please install the phantom wallet");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if(solana) {
      const res = await solana.connect();
      console.log("Connected with public key: ", res.publicKey.toString())
      setWalletAddress(res.publicKey.toString())
    }
  }

  const renderIfNotConnected = () => (
    <button 
      className="h-[40px] px-[40px] text-white font-bold cursor-pointer bg-size-200 bg-pos-0 hover:bg-pos-100 hover:-translatey-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-[10px] transition-all duration-500 ease-in delay-250"
      onClick={connectWallet}
      >
      Connect Wallet
    </button>
  )

  return (
    <div className="App">
      <div className="container ">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {walletAddress}
          {!walletAddress && renderIfNotConnected()}
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" />
          <a
            className="footer-text"
            href={"google.com"}
            target="_blank"
            rel="noreferrer"
          >{`built on`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;

