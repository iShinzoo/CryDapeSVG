const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const CryDapeSVG = await hre.ethers.getContractFactory("CryDapeSVG");
  
  // Deploy the contract
  const cryDapeSVG = await CryDapeSVG.deploy();
  
  // Wait for deployment to finish
  await cryDapeSVG.waitForDeployment();
  
  // Get the contract address
  const address = await cryDapeSVG.getAddress();
  
  console.log("CryDapeSVG deployed to:", address);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });