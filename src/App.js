import React, { useState } from "react";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { Provider, Signer } from "@reef-defi/evm-provider";
import { WsProvider } from "@polkadot/rpc-provider";
import { Contract } from "ethers";
import GreeterContract from "./contracts/Greeter.json";
import AddEvent from "./Components/AddEvent";
import Events from './Components/Events'

const FactoryAbi = GreeterContract.abi;
const factoryContractAddress = GreeterContract.address;

const URL = "wss://rpc-testnet.reefscan.com/ws";

function App() {
	const [signer, setSigner] = useState();
	const [isWalletConnected, setWalletConnected] = useState(false);
	const [currentPage, setCurrentPage] = useState("tickets")

	const checkExtension = async () => {
		let allInjected = await web3Enable("Reef");

		if (allInjected.length === 0) {
			return false;
		}

		let injected;
		if (allInjected[0] && allInjected[0].signer) {
			injected = allInjected[0].signer;
		}

		const evmProvider = new Provider({
			provider: new WsProvider(URL),
		});

		evmProvider.api.on("ready", async () => {
			const allAccounts = await web3Accounts();

			allAccounts[0] &&
				allAccounts[0].address &&
				setWalletConnected(true);

			console.log(allAccounts);

			const wallet = new Signer(
				evmProvider,
				allAccounts[0].address,
				injected
			);

			// Claim default account
			if (!(await wallet.isClaimed())) {
				console.log(
					"No claimed EVM account found -> claimed default EVM account: ",
					await wallet.getAddress()
				);
				await wallet.claimDefaultAccount();
			}

			setSigner(wallet);
		});
	};

	const checkSigner = async () => {
		if (!signer) {
			await checkExtension();
		}
		return true;
	};

	const setGreeting = async () => {
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		console.log(factoryContract)
		let tokensCreated = await factoryContract._tokensCreated()
		console.log("Tokens created ", tokensCreated.toString())
		let tokens = []
		if(tokensCreated) {
			tokensCreated = (+tokensCreated)
			for(let i=0; i<tokensCreated; i++) {
				let tokenUri = await factoryContract.uri(i)
				tokens.push(tokenUri)
			}
		}
		console.log("URIs ", tokens)
		// await factoryContract.setGreeting(msgVal);
		// getGreeting();
	};

	const pageHandler = () => {
		if(currentPage === "tickets") {
			setCurrentPage("addEvents")
		} else {
			setCurrentPage("tickets")
		}
	}

	return (
		<div>
			<div className="navbar">
				<p>Events</p>
				<button onClick={pageHandler}>{currentPage === "tickets" ? 'Add Event' : 'Events'}</button>
			</div>
			<div className="main__container">
				<h1>NFT event ticketing</h1>
				{
					isWalletConnected ? (
						<div>
							{
								currentPage === "tickets" ? (
									<Events isWalletConnected={isWalletConnected} checkSigner={checkSigner} signer={signer} />
								) : (
									<AddEvent checkSigner={checkSigner} signer={signer} />
								)
							}
						</div>
					) : (
						<div>
							<h1>Connect Wallet</h1>
							<button onClick={checkExtension}>Connect Wallet</button>
						</div>
					)
				}
			</div>
		</div>
	);
}

export default App;