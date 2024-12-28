import Head from "next/head";
import { useState } from "react";
import Web3 from "web3";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/utils/contract";

export default function Home() {
  const [address, setAddress] = useState(null);
  const [Contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (typeof window !== "undefined") {
      const { ethereum } = window;
      if (ethereum) {
        try {
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
          console.log(accounts);
          setAddress(accounts[0]);

          const web3 = new Web3(ethereum);
          const contractInstance = new web3.eth.Contract(
            CONTRACT_ABI,
            CONTRACT_ADDRESS
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("Error connecting wallet:", error);
        }
      } else {
        console.error("Ethereum wallet not found!");
      }
    }
  };

  console.log("Address ", address)
  console.log("CONTRACT ", Contract)
  console.log("LOADING ", loading)

  const mintNFT = async () => {
    if (!Contract) {
      console.error("Contract not initialized!");
      return;
    }

    setLoading(true); // Start loading
    try {
      const mint = await Contract.methods.safeMint(address).send({ from: address });
      console.log("Minted NFT: ", mint);
    } catch (error) {
      console.error("Error minting NFT: ", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <Head>
        <title>Interact with Smart Contract</title>
        <meta name="description" content="Interact with Smart Contract" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex items-center justify-center min-h-screen">
        <h1 className="text-4xl font-extrabold">Interact with Contract</h1>
        {loading ? (
          <h1 className="text-2xl font-extrabold">Loading...</h1>
        ) : address ? (
          <button
            onClick={mintNFT}
            className="py-2 px-4 rounded-xl bg-black text-white transform hover:scale-105"
          >
            Mint NFT
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="py-2 px-4 rounded-xl bg-black text-white transform hover:scale-105"
          >
            Connect Wallet
          </button>
        )}
      </main>
    </div>
  );
}
