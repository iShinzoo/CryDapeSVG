import Head from "next/head";
import { useState } from "react";
import Web3 from "web3";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/utils/contract";

export default function Home() {
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState(null);

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
      contract.events.NFTMinted({}, (error, event) => {
        if (error) {
          console.error("Error with event:", error);
          return;
        }
        const tokenId = event.returnValues.tokenId;
        setMintedTokenId(tokenId);
        console.log("NFT Minted - Token ID:", tokenId);
      });

      const mint = await contract.methods.mintNFT().send({
        from: address,
      });

      console.log("Mint transaction:", mint);
    } catch (error) {
      console.error("Error minting NFT:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(circle, rgba(65,74,198,1) 0%, rgba(0,0,0,1) 100%)",
      }}
    >
      <Head>
        <title>Anime Character NFT Minter</title>
        <meta
          name="description"
          content="Mint your random anime character NFT"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {address && (
        <div className="fixed top-6 right-6 bg-black/70 backdrop-blur-md p-3 rounded-lg shadow-lg text-white text-sm font-semibold max-w-xs">
          <label className="block text-xs text-gray-300 mb-1">
            Connected Wallet:
          </label>
          <div className="break-all">{address}</div>
        </div>
      )}

      <main className="relative bg-black/50 backdrop-blur-md p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-lg w-full mt-12">
        <h1 className="text-4xl font-extrabold text-center text-white">
          Anime Character NFT Minter
        </h1>

        {loading ? (
          <div className="text-2xl font-bold text-yellow-300">
            Minting your NFT...
          </div>
        ) : mintedTokenId ? (
          <div className="flex flex-col items-center gap-6">
            <div className="text-2xl font-bold text-green-400">
              Successfully minted NFT #{mintedTokenId}!
            </div>
            <a
              href={getOpenSeaURL(mintedTokenId)}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 rounded-lg bg-white text-[#414ac6] text-lg font-semibold transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
            >
              View on OpenSea
            </a>
            <button
              onClick={() => {
                setMintedTokenId(null);
                mintNFT();
              }}
              className="py-3 px-6 rounded-lg bg-white text-[#414ac6] text-lg font-semibold transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
            >
              Mint Another NFT
            </button>
          </div>
        ) : address ? (
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={mintNFT}
              className="py-3 px-6 rounded-lg bg-white text-[#414ac6] text-lg font-semibold transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
            >
              Mint NFT
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="py-3 px-6 rounded-lg bg-white text-[#414ac6] text-lg font-semibold transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
          >
            Connect Wallet
          </button>
        )}
      </main>
    </div>
  );
}
