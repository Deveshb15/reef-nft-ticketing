import React, { useState } from "react";
import { Contract, BigNumber, utils } from "ethers";
import GreeterContract from "../contracts/Greeter.json";

const FactoryAbi = GreeterContract.abi;
const factoryContractAddress = GreeterContract.address;

const AddEvent = ({ checkSigner, signer }) => {
	const [contractSupply, setContractSupply] = useState("500");
	const [contractPrice, setContractPrice] = useState("0");
	const [contractPerMint, setContractPerMint] = useState("10");
	const [uri, setUri] = useState("");

	const addNewEvent = async () => {
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		console.log(factoryContract);
		try {
			const data = await factoryContract.addNewEdition(
				contractSupply.toString(),
				utils.parseEther(contractPrice.toString()),
				contractPerMint.toString(),
				uri.toString()
			);
			console.log(data);
			if (data) {
				setContractSupply("500");
				setContractPrice("0");
				setContractPerMint("10");
				setUri("ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1005");
                document.getElementById("contract__supply").value = ""
                document.getElementById("contract__price").value = ""
                document.getElementById("contract__tickets").value = ""
                document.getElementById("contract__uri").value = ""
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<h1>Add a Event</h1>
			<input
                id="contract__supply"
				type={"number"}
				onChange={(e) => setContractSupply(e.target.value)}
				placeholder="Ticket Supply"
			/>
			<input
                id="contract__price"
				type={"number"}
				onChange={(e) => setContractPrice(e.target.value)}
				placeholder="Ticket Price"
			/>
			<input
                id="contract__tickets"
				type={"number"}
				onChange={(e) => setContractPerMint(e.target.value)}
				placeholder="Number of Tickets per user"
			/>
			<input
                id="contract__uri"
				type={"text"}
				onChange={(e) => setUri(e.target.value)}
				value={uri}
				placeholder="Ticket image URL"
			/>
			{/* <button
								onClick={setGreeting}
								className="container-button"
						>Set Greeting</button> */}
			<button onClick={addNewEvent} className="container-button">
				Add New Edition
			</button>
		</div>
	);
};

export default AddEvent;
