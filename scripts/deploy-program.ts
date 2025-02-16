import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

async function deployProgram() {
  try {
    // Read the program ID
    const programId = fs
      .readFileSync(path.join(__dirname, "../program-id.txt"), "utf-8")
      .trim();
    console.log("Deploying program with ID:", programId);

    // Build the program
    console.log("\nBuilding program...");
    await execAsync("anchor build");
    console.log("Build completed successfully");

    // Switch to devnet
    console.log("\nSwitching to devnet...");
    await execAsync("solana config set --url devnet");
    console.log("Switched to devnet");

    // Airdrop some SOL if needed (2 SOL for deployment)
    // console.log("\nAirdropping SOL for deployment...");
    // await execAsync("solana airdrop 2");
    // console.log("Airdrop successful");

    // Deploy the program
    console.log("\nDeploying program...");
    await execAsync("anchor deploy --provider.cluster devnet");
    console.log("Deployment successful!");

    console.log("\nProgram deployed successfully to devnet!");
    console.log("Program ID:", programId);
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

// Run deployment
deployProgram().catch(console.error);
