import { ethers } from "ethers";
import getEthSigner from "./getEthSigner";
import toastError from "./toastError";

const transferERC20 = async (e, TOKEN_ADDRESS, TOKEN_ABI, recipientAddress, amount) => {
    try {
        const signer = await getEthSigner()
        const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
        const decimals = await contract.decimals()
        await contract.transfer(recipientAddress, ethers.utils.parseUnits(amount.toString(), decimals));
    } catch (err) {
        toastError(err.message)
    }
}

export default transferERC20