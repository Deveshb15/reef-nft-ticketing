import React, { useState } from "react";
import { Contract, BigNumber, utils } from "ethers";
import GreeterContract from "../contracts/Greeter.json";
import Uik from '@reef-defi/ui-kit';

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
		<div style={{marginTop:'10px'}}>
		  <Uik.Text text='Add a Event' type='title'/>
			<div style={{marginTop:'15px'}}>
			<Uik.Container>
      <Uik.Input 

	  		placeholder="Ticket Supply"                 
			id="contract__supply"
			type={"number"}
			onChange={(e) => setContractSupply(e.target.value)}
		/>
	  <Uik.Input 
	  	id="contract__price"
		type={"number"}
		onChange={(e) => setContractPrice(e.target.value)}
		placeholder="Ticket Price"
	  />
      <Uik.Input
			id="contract__tickets"
			type={"number"}
			onChange={(e) => setContractPerMint(e.target.value)}
			placeholder="No. of Tickets per user"
	  />
      <Uik.Input
			id="contract__uri"
			type={"text"}
			onChange={(e) => setUri(e.target.value)}
			value={uri}
			placeholder="Ticket image URL"
	  />

			</Uik.Container>
			</div>
			{/* <button
								onClick={setGreeting}
								className="container-button"
						>Set Greeting</button> */}
						<div style={{marginTop:'25px', display:'flex',justifyContent:'center'}}>

						<Uik.Button onClick={addNewEvent} text='Add New Edition'/>
						</div>
			{/* <button onClick={addNewEvent} className="container-button">
				Add New Edition
			</button> */}
		</div>
	);
};

export default AddEvent;
