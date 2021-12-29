const transferERC20 = async (e) => {
    e.preventDefault();
    try {
        const signer = await getEthSigner()
        const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
        const decimals = await contract.decimals()
        await contract.transfer("0x76aEB5092D8eabCec324Be739b8BA5dF473F0055", ethers.utils.parseUnits(ERC20payValue.toString(), decimals));
    } catch (err) {
        console.log(err)
    }
}