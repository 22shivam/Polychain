import React, { useEffect, useContext } from "react";
import Page from "./components/Page";
import { ethers } from "ethers";
import { UserContext } from "./_app";

export default function Claim() {

    const {userAccount, setUserAccount} = useContext(UserContext);

    useEffect(()=>{
        if (userAccount.address == "" || !userAccount.address) {
            return
        }
        (async ()=>{const abir = await fetch('/contracts_MerkleDistributor_sol_MerkleDistributor.abi');
        const abi = await abir.text();
        const accounts = await ethereum.request({ method: "eth_requestAccounts" })
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let contract = new ethers.Contract("0x2312CAF81735B5642477f89a560f6ad7d82A3074", abi, signer);
        const response = await contract.claim(0,userAccount.address,600*(10**18),"0x747d269280748aa41a7d791629a2e3dc1d2a32d4d288f77606c0100ae7bcf947");
        console.log(response)
    })();
    },[userAccount])

    return (
        <Page>
        </Page>
    )
}