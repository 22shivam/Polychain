import Page from './components/Page';
import { UserContext } from './_app';
import { useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

const MERKLE_ROOT = "0x58815614f0d1a4a780fd47a20af795f43c6abe3a56880afb925a64411dd53d86";

export default function Airdrop() {
    const { userAccount, setUserAccount } = useContext(UserContext);
    useEffect(() => {
        (async () => {
            const bcr = await fetch('/contracts_MerkleDistributor_sol_MerkleDistributor.bin');
            const bc = await bcr.text();
            const abir = await fetch('/contracts_MerkleDistributor_sol_MerkleDistributor.abi');
            const abi = await abir.text();
            console.log(bc, abi);

            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const token = new ethers.ContractFactory(abi, bc, signer);
            const contract = await token.deploy("0x65217BaAF6198D507B8CA75392b41d5b6A6aD328", MERKLE_ROOT);
            console.log(contract.address);
            await contract.deployTransaction.wait();
        })();
    }, [userAccount]);
    return(<>
        <Page />
    </>)
}