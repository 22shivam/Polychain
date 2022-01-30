import Page from './components/Page';
import { UserContext } from './_app';
import { useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import CustomBrandedButton from './components/customBrandedButton';
import CustomLabel from './components/customLabel';
import CustomInput from './components/customInput';
import { parseBalanceMap } from '../lib/parseBalanceMap';

export default function Airdrop() {
    const { userAccount, setUserAccount } = useContext(UserContext);

    const [address, setAddress] = useState("");
    const [overrideValue, setOverrideValue] = useState(0);
    const [merkleRoot, setMerkleRoot] = useState({});
    const [tokenAddress, setTokenAddress] = useState("");

    const syntaxTester = new RegExp(/[,]+/);

    function parseAddresses() {
        let addressList = address.split(/\r?\n/);
        if (addressList.filter(addr => !syntaxTester.test(addr)).length > 0) {
            console.log('must have amount for each wallet');
            return;
        }

        addressList = addressList.map(addr => {
            const [a, amt] = addr.split(",");
            return {
                address: a,
                earnings: `0x${(amt * (10 ** 18)).toString(16)}`
            };
        });
        return addressList;
    }

    function updateAmount() {
        const addressList = address.split(/\r?\n/).map(addr => {
            if (addr.indexOf(",") > -1) {
                return `${addr.substring(0, addr.indexOf(","))},${overrideValue}`;
            } else {
                return `${addr},${overrideValue}`;
            }
        });
        setAddress(addressList.join("\n"));
    }

    function getMerkleRoot() {
        if (userAccount.address) {
            const addresses = parseAddresses();
            if (addresses) {
                console.log(addresses);
                const balanceMap = parseBalanceMap(addresses);
                console.log("balance map", balanceMap);
                setMerkleRoot(balanceMap.merkleRoot);
                console.log("merkle root", merkleRoot);
            }
        } else {
            console.log('must be signed in');
        }
    }

    function sendAirdrop() {
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
            const contract = await token.deploy(tokenAddress, merkleRoot);
            console.log("Contract Address", contract.address);
            await contract.deployTransaction.wait();
        })();
    }

    useEffect(() => {
        console.log('account', userAccount);
        // (async () => {
        //     const bcr = await fetch('/contracts_MerkleDistributor_sol_MerkleDistributor.bin');
        //     const bc = await bcr.text();
        //     const abir = await fetch('/contracts_MerkleDistributor_sol_MerkleDistributor.abi');
        //     const abi = await abir.text();
        //     console.log(bc, abi);

        //     const accounts = await ethereum.request({ method: "eth_requestAccounts" })
        //     const provider = new ethers.providers.Web3Provider(window.ethereum);
        //     const signer = provider.getSigner();

        //     const token = new ethers.ContractFactory(abi, bc, signer);
        //     const contract = await token.deploy("0x65217BaAF6198D507B8CA75392b41d5b6A6aD328", MERKLE_ROOT);
        //     console.log(contract.address);
        //     await contract.deployTransaction.wait();
        // })();
    }, [userAccount]);

    return (<>
        <Page>

            <h1>Enter ethereum address below</h1>
            <p>Should be address followed by , and amount</p>
            <textarea onChange={(e) => setAddress(e.target.value)} value={address}></textarea>
            <CustomBrandedButton className="px-6 self-start ml-4" onClick={getMerkleRoot}>Extract</CustomBrandedButton>
            <h1>Set amount for All</h1>
            <div className='flex flex-col mt-4 items-start'>
                <CustomLabel className="ml-2">Amount:</CustomLabel>
                <CustomInput className="my-1 w-72 sm:w-96" type="text" placeholder="0.00" value={overrideValue} onChange={(e) => setOverrideValue(e.target.value)} />
            </div>
            <CustomBrandedButton className="px-6 self-start ml-4" onClick={() => updateAmount()}>Update</CustomBrandedButton>
            <h1>Enter address of token</h1>
            <CustomInput className="my-1 w-72 sm:w-96" type="text" placeholder="0.00" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} />
            <CustomBrandedButton onClick={sendAirdrop}>Airdrop</CustomBrandedButton>
        </Page>
    </>)
}