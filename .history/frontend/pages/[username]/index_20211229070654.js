import { useState, useEffect } from "react";


export default function UserPayment() {
    const [qrCode, setQrCode] = useState("")
    const [ETHpayValue, setETHPayValue] = useState(0);
    const [SOLpayValue, setSOLPayValue] = useState(0);
    const [ERC20payValue, setERC20PayValue] = useState(0);

    useEffect(() => {
        (async () => {
            const qrCode = await generateQR("bitcoin:3DBGwFbBoj7FjBFcbVi8hFcpmCjPhCY62X")
            setQrCode(qrCode)
        })()
    }, [])


    return (
        <div>
            Make payments to Shivam, now!

            <div>

                <h1> Send ETH payment </h1>
                <span>Send Shivam</span>
                <input value={ETHpayValue} onChange={(e) => { setETHPayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ETH" />
                <button onClick={async (e) => { await transferEth({ ether: ETHpayValue, addr: RECIEPIENT_ETH_ADDRESS }) }} className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>

                <h1> Send Sol payment </h1>
                <span>Send Shivam</span>
                <input value={SOLpayValue} onChange={(e) => { setSOLPayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in SOL" />
                <button onClick={async (e) => { await transferSOL(SOLpayValue, RECIEPIENT_SOL_ADDRESS) }} className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>

                <h1> Send ERC20 payment </h1>
                <span>Send Shivam</span>
                <input value={ERC20payValue} onChange={(e) => { setERC20PayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ERC20" />
                <button onClick={() => { transferERC20(e, TOKEN_ADDRESS, TOKEN_ABI, RECIEPIENT_ETH_ADDRESS) }} className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>

                <span>Send Shivam</span>
                <button onClick={handleSubmitDESO} className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Send Deso </button>

                <span>Pay Using Bitcoin</span>
                <img src={qrCode}></img>
                <a href="bitcoin:3DBGwFbBoj7FjBFcbVi8hFcpmCjPhCY62X">Send</a>

            </div>


        </div>
    )
}