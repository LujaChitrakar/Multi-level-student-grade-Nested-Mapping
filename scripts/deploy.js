const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const NestedMappingContract = await ethers.deployContract("NestedMapping");
  const nestedMapping_address = await NestedMappingContract.getAddress();
  console.log("Contract address:", nestedMapping_address);
  saveFrontendFiles(nestedMapping_address);
}

function saveFrontendFiles(contract_address) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "nestedMapping-address.json"),
    JSON.stringify({ NestedMapping: contract_address }, undefined, 2)
  );

  const NestedMappingArtifact = artifacts.readArtifactSync("NestedMapping");

  fs.writeFileSync(
    path.join(contractsDir, "NestedMapping.json"),
    JSON.stringify(NestedMappingArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
