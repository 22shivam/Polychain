import { ethers } from "ethers";
import getEthSigner from "./getEthSigner";

const transferERC20 = async (e, TOKEN_ADDRESS, TOKEN_ABI, recipientAddress, amount) => {
    try {
        const signer = await getEthSigner()
        const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
        const decimals = await contract.decimals()
        await contract.transfer(recipientAddress, ethers.utils.parseUnits(amount.toString(), decimals));
    } catch (err) {
        console.log(err)
    }
}

export default transferERC20