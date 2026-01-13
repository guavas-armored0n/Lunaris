import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import axios from "axios";
import { createPublicClient, createWalletClient, custom, formatEther, http, isAddress } from "viem";
import { baseSepolia } from "viem/chains";
import fs from "node:fs";

const NETWORK = {
  name: "Base Sepolia",
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
};

function addressLink(a) {
  return `${NETWORK.explorer}/address/${a}`;
}
function blockLink(n) {
  return `${NETWORK.explorer}/block/${n}`;
}
function codeLink(a) {
  return `${NETWORK.explorer}/address/${a}#code`;
}
function short(a) {
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

function loadTargets() {
  try {
    const raw = fs.readFileSync("samples/targets.json", "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.targets) ? parsed.targets : [];
  } catch {
    return [];
  }
}

async function rpcHealth() {
  const payload = { jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] };
  const res = await axios.post(NETWORK.rpcUrl, payload, { timeout: 10000 });
  return res?.data?.result ?? null;
}

export async function run() {
  console.log("Built for Base");
  console.log(`Network: ${NETWORK.name}`);
  console.log(`chainId (decimal): ${NETWORK.chainId}`);
  console.log(`Explorer: ${NETWORK.explorer}`);
  console.log("");

  console.log("RPC check:");
  try {
    const chainIdHex = await rpcHealth();
    console.log(`- eth_chainId: ${chainIdHex}`);
  } catch (e) {
    console.log(`- rpc error: ${e?.message || String(e)}`);
  }
  console.log("");

  const sdk = new CoinbaseWalletSDK({
    appName: "Lunaris",
    darkMode: false,
  });

  const provider = sdk.makeWeb3Provider(NETWORK.rpcUrl, NETWORK.chainId);

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(provider),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(NETWORK.rpcUrl),
  });

  const targets = loadTargets();
  console.log(`Targets: ${targets.length}`);
  console.log("");

  let addresses = [];
  try {
    addresses = await walletClient.getAddresses();
  } catch {
    console.log("Wallet not available, continuing with RPC-only reads");
  }

  if (addresses.length) {
    console.log("Balances:");
    for (const a of addresses) {
      const bal = await publicClient.getBalance({ address: a });
      console.log(`- ${short(a)}: ${formatEther(bal)} ETH`);
      console.log(`  ${addressLink(a)}`);
    }
    console.log("");
  }

  const latest = await publicClient.getBlockNumber();
  const block = await publicClient.getBlock({ blockNumber: latest });
  const gasPrice = await publicClient.getGasPrice();

  console.log("Block and gas:");
  console.log(`- Latest block: ${latest.toString()}`);
  console.log(`  ${blockLink(latest.toString())}`);
  console.log(`- Timestamp: ${new Date(Number(block.timestamp) * 1000).toISOString()}`);
  console.log(`- Gas price (gwei): ${(Number(gasPrice) / 1e9).toFixed(3)}`);
  console.log("");

  console.log("Bytecode checks:");
  for (const t of targets) {
    if (!isAddress(t)) continue;
    const code = await publicClient.getBytecode({ address: t });
    const has = !!code && code !== "0x";
    console.log(`- ${short(t)}: ${has ? "bytecode found" : "no bytecode"}`);
    console.log(`  ${codeLink(t)}`);
  }
}

run().catch((e) => console.error(e));
