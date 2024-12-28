import Head from "next/head";
import { useState } from "react";
import Web3 from "web3";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/utils/contract";

export default function Home() {
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState(null);

  // OpenSea Testnet base URL
  const OPENSEA_TESTNET_BASE_URL = "https://testnets.opensea.io/assets/sepolia";

  const connectWallet = async () => {
    if (typeof window !== "undefined") {
      const { ethereum } = window;
      if (ethereum) {
        try {
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
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

  const getOpenSeaURL = (tokenId) => {
    return `${OPENSEA_TESTNET_BASE_URL}/${CONTRACT_ADDRESS}/${tokenId}`;
  };

  const mintNFT = async () => {
    if (!contract) {
      console.error("Contract not initialized!");
      return;
    }

    setLoading(true);
    try {
      // Set up event listener before minting
      contract.events.NFTMinted({}, (error, event) => {
        if (error) {
          console.error("Error with event:", error);
          return;
        }
        const tokenId = event.returnValues.tokenId;
        setMintedTokenId(tokenId);
        console.log("NFT Minted - Token ID:", tokenId);
      });

      // Call the mintNFT function
      const mint = await contract.methods.mintNFT().send({ 
        from: address
      });
      
      console.log("Mint transaction:", mint);
    } catch (error) {
      console.error("Error minting NFT:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Anime Character NFT Minter</title>
        <meta name="description" content="Mint your random anime character NFT" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-4xl font-extrabold">Anime Character NFT Minter</h1>
        {loading ? (
          <div className="text-2xl font-bold">Minting your NFT...</div>
        ) : mintedTokenId ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-xl">
              Successfully minted NFT #{mintedTokenId}!
            </div>
            <a 
              href={getOpenSeaURL(mintedTokenId)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 rounded-xl bg-blue-600 text-white transform hover:scale-105"
            >
              View on OpenSea
            </a>
            <button
              onClick={() => {
                setMintedTokenId(null);
                mintNFT();
              }}
              className="py-2 px-4 rounded-xl bg-black text-white transform hover:scale-105"
            >
              Mint Another
            </button>
          </div>
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