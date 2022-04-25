import "./App.css";
import { useEffect, useState } from "react";
import idl from "./idl.json";

import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, web3, AnchorProvider } from "@project-serum/anchor";
import { Buffer } from 'buffer';
import kp from "./keypair.json"
// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed",
};

window.Buffer = Buffer;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState([]);
  const TEST_GIFS = [
    "https://media.giphy.com/media/k8kITi9SAwe9JWbUaH/giphy.gif",
    "https://media.giphy.com/media/RMwgs5kZqkRyhF24KK/giphy.gif",
    "https://media.giphy.com/media/u4zZXYFztZtSZPlWZv/giphy.gif",
    "https://media.giphy.com/media/mPbjXf7sT1rmitL8gR/giphy.gif",
    "https://media.giphy.com/media/tDdqCDneNvC0s6LdYg/giphy.gif",
    "https://media.giphy.com/media/cOSbH8NoUFt9MXbuie/giphy.gif",
  ];

  useEffect(() => {
    const onLoad = async () => {
      await checkIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new account w/ address: ",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (err) {
      console.log("Error while creating a baseAccount: ", err);
    }
  };

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account", account);
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList(null);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");
      getGifList();
      console.log(gifList)
    }
  }, [walletAddress]);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const checkIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");

          const response = await solana.connect({ onlyIfTrusted: true });
          console.log("Connected with address:", response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
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
    if (solana) {
      const res = await solana.connect();
      console.log("Connected with public key: ", res.publicKey.toString());
      setWalletAddress(res.publicKey.toString());
    }
  };

  const renderIfNotConnected = () => (
    <button
      className="h-[40px] px-[40px] text-white font-bold cursor-pointer bg-size-200 bg-pos-0 hover:bg-pos-100 hover:-translatey-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-[10px] transition-all duration-500 ease-in delay-250"
      onClick={connectWallet}
    >
      Connect Wallet
    </button>
  );

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const submitGif = async () => {
    if (inputValue.length === 0) {
      console.log("No gif link given!")
      return
    }
    setInputValue("");
    console.log('Gif link:', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
  
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue)
  
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };

  const renderIfConnected = () => {
    if (gifList == null) {
      return (
        <div className="justify-center">
          <button
            className="h-[40px] px-[40px] text-white font-bold cursor-pointer bg-size-200 bg-pos-0 hover:bg-pos-100 hover:-translatey-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-[10px] transition-all duration-500 ease-in delay-250"
            onClick={createGifAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      );
    } else {
      return (
        <div className="justify-center">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitGif();
            }}
          >
            <input
              type="text"
              placeholder="Enter your gif's link :D"
              className="inlinke-block text-white p-[10px] w-1/2 h-[60px] box-border font-bold b-0 bg-black rounded-[10px] m-[50px_auto]"
              value={inputValue}
              onChange={onInputChange}
            />
            <button
              type="submit"
              className="h-[50px] px-[30px] text-white font-bold text-whitep-5 ml-[10px] bg-size-200 bg-pos-0 hover:bg-pos-100 hover:-translatey-1 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 rounded-[10px] transition-all duration-500 ease-in delay-250"
            >
              Submit
            </button>
          </form>
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-[1.5rem] justify-items-center m-0 p-0">
            {gifList.map((gif) => (
              <div
                className="flex flex-col relative justify-self-center align-middle"
                key={gif.gif}
              >
                <img
                  className="w-full h-[300px] rounded-[10px] object-cover"
                  src={gif.gifLink}
                  alt={gif}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className={walletAddress ? "authed-container" : "container"}>
          <div className="header-container">
            <p className="header">Aesthetic Gifs 🌆</p>
            <p className="sub-text">
              View your GIF collection in the metaverse ✨
            </p>
            <p className="font-bold text-white">{walletAddress}</p>
            {!walletAddress && renderIfNotConnected()}
            {walletAddress && renderIfConnected()}
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
