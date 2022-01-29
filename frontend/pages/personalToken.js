import Page from './components/Page';
import { UserContext } from './_app';
import { useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

export default function PersonalToken() {
    const { userAccount, setUserAccount } = useContext(UserContext);
    useEffect(() => {
        (async () => {
            const bcr = await fetch('/contracts_erc20_sol_Token.bin');
            const bc = await bcr.text();
            const abir = await fetch('/contracts_erc20_sol_Token.abi');
            const abi = await abir.text();
            console.log(bc, abi);

            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const token = new ethers.ContractFactory(abi, bc, signer);
            const contract = await token.deploy("CoolKid", "CK", "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055", 12);
            console.log(contract.address);
            await contract.deployTransaction.wait();
        })();
    }, [userAccount]);

    return(<>
        <Page />
    </>);
}