import { useState, useEffect } from "react";


export default function UserPayment() {
    const [qrCode, setQrCode] = useState("")
    const [ETHpayValue, setETHPayValue] = useState(0);
    const [SOLpayValue, setSOLPayValue] = useState(0);
    const [ERC20payValue, setERC20PayValue] = useState(0);
    return (
        <div>
            Make payments to Shivam, now!


        </div>
    )
}