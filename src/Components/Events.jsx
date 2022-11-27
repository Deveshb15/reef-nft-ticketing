import React, { useState, useEffect } from "react";
import { Contract, BigNumber, utils } from "ethers";
import axios from "axios";
import GreeterContract from "../contracts/Greeter.json";

const FactoryAbi = GreeterContract.abi;
const factoryContractAddress = GreeterContract.address;

const Events = ({ isWalletConnected, checkSigner, signer }) => {
	const [contract, setContract] = useState(null);
	const [events, setEvents] = useState([]);

	const DEFAULT_IPFS_GATEWAY_URL = "https://ipfs.io/ipfs/";

	const cleanUpHash = async (hash, gateway = DEFAULT_IPFS_GATEWAY_URL) => {
		try {
			// remove the leading 'ipfs://' if it exists
			if (hash?.startsWith("ipfs://")) {
				const response = await axios(gateway + hash.substring(7));
				const data = response.data;
				console.log(data);
				// return gateway + hash.substring(7);
				return data;
			}
			return null;
		} catch (err) {
			console.log(err);
		}
	};

	const cleanUpIPFS = (hash, gateway = "https://ipfs-gateway.cloud/ipfs/") => {
		// remove the leading 'ipfs://' if it exists
		if (hash?.startsWith("ipfs://")) {
			return gateway + hash.substring(7);
		}
		return hash;
	};

	const getAllEvents = async () => {
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		console.log(factoryContract);
		try {
			let tokensCreated = await factoryContract._tokensCreated();
			console.log("Tokens created ", tokensCreated.toString());
			let tokens = [];
			if (tokensCreated) {
				tokensCreated = +tokensCreated;
				for (let i = 0; i < tokensCreated; i++) {
					let tokenUri = await factoryContract.uri(i);
					console.log(" I ", i, " uri ", tokenUri);
					if (tokenUri) {
						const data = await cleanUpHash(tokenUri);
						setEvents((prev) => [...prev, data]);
						// tokens.push(data)
					}
				}
			}
			console.log("URIs ", tokens);
			// setEvents(tokens);
		} catch (error) {
			console.log(error);
		}
	};

    const mintNft = async(tokenId) => {
        await checkSigner()
        const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		console.log(factoryContract);
        try {
            const mint = await factoryContract.mint(tokenId)
            console.log(mint)
        } catch(err) {
            console.log(err)
        }
    }

	// useEffect(() => {
	//     getContract()
	// }, [signer])

	useEffect(() => {
		if (signer) {
			getAllEvents();
		}
	}, [signer]);

	return (
		<div>
			<h1>Events around you</h1>
			{/* <button
								onClick={setGreeting}
								className="container-button"
						>Set Greeting</button> */}
			<div className="event__contianer">
				{events.map((ev, i) => {
					return (
						<div key={i} className="event__main">
							<img
								className="event__image"
								src={
									ev?.image
										? cleanUpIPFS(ev.image)
										: ev.image_url
										? cleanUpIPFS(ev.image_url)
										: "https://i.ibb.co/tZh0rvt/Untitled-design-3-removebg-preview.png"
								}
								onError={({ currentTarget }) => {
									currentTarget.onerror = null; // prevents looping
									currentTarget.src =
										"https://i.ibb.co/tZh0rvt/Untitled-design-3-removebg-preview.png";
								}}
								alt={`event-${i}`}
							/>
                            <button onClick={() => mintNft(i)} className="event__mint">Mint Button</button>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Events;
