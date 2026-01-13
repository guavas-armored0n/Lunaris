# Lunaris

## Overview
Lunaris is an inspection repository focused on validating Base Sepolia infrastructure. It provides deterministic outputs that confirm RPC responsiveness, explorer visibility, and contract presence without performing any interactive or state-changing actions.

Built for Base.

## Purpose
This repository exists to help developers and reviewers quickly verify that a Base Sepolia environment is healthy before moving forward with more complex tooling or mainnet workflows. It is designed for diagnostics, documentation validation, and CI-style checks.

## What Lunaris Does
- validates RPC availability and correct chainId responses
- optionally discovers wallet addresses through Coinbase Wallet
- reads ETH balances in a safe, read-only manner
- reads latest block number, timestamp, and gas price
- checks bytecode existence at a small set of target addresses
- prints direct Basescan links for all inspected data

## What Lunaris Never Does
- does not send transactions
- does not sign messages
- does not write onchain state

## Internal Flow
1) load Base Sepolia constants and explorer root  
2) perform a lightweight JSON-RPC health check  
3) initialize Coinbase Wallet SDK provider  
4) create viem clients for wallet discovery and public reads  
5) read balances if wallet addresses are available  
6) read block and gas data  
7) check bytecode presence and emit Basescan links  

## Base Sepolia Details
- Network: Base Sepolia  
- chainId (decimal): 84532  
- Explorer: https://sepolia.basescan.org  

## Repository Structure
- README.md  
- app/Lunaris.mjs  
- package.json  
- contracts/LunarisProbe.sol - a minimal "network probe" contract for repeatable Base Sepolia checks: stable read-only fingerprint for eth_call, plus an optional ping() that emits an event to validate signing + explorer/indexer visibility
- config/base-sepolia.json  
- samples/targets.json  

## Author Contacts

- GitHub: https://github.com/guavas-armored0n
   
- Twitter: https://x.com/Edwina78874220
  
- Email: guavas.armored0n@icloud.com

## License
MIT License

## Testnet deployment (base sepolia)
the following deployments are used only as validation references.

network: base sepolia  
chainId (decimal): 84532  
explorer: https://sepolia.basescan.org  

contract LunarisProbe.sol address:  
your_address  

deployment and verification:
- https://sepolia.basescan.org/address/your_address
- https://sepolia.basescan.org/your_address/0#code  

these deployments provide a controlled environment for validating base tooling and read-only onchain access prior to base mainnet usage.
