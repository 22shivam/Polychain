import { useState, useEffect } from "react";
import { ethers } from "ethers";
import TOKEN_ABI from "../lib/TOKEN_ABI";
import generateQR from "../lib/generateQR";
import transferSOL from "../lib/transferSol";

const TOKEN_ADDRESS = "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa"

const handleSubmitDESO = async (e) => {
    window.open("https://diamondapp.com/send-deso?public_key=BC1YLj4aFMVM1g44wBgibYq8dFQ1NxTCpQFyJnNMqGqmyUt9zDVjZ5L", "_blank");
}

const startPayment = async ({ ether, addr }) => {
    try {
        if (!window.ethereum)
            throw new Error("No crypto wallet found. Please install it.");

        const accounts = await ethereum.request({ method: "eth_requestAccounts" })
        // await window.ethereum.request({ method: 'eth_accounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tx = await signer.sendTransaction({
            to: addr,
            value: ethers.utils.parseEther(ether)
        });
        console.log(tx)
    } catch (err) {
        console.error(err)
    }
};



export default function App() {
    const [qrCode, setQrCode] = useState("")
    const [ETHpayValue, setETHPayValue] = useState(0);
    const [SOLpayValue, setSOLPayValue] = useState(0);
    const [ERC20payValue, setERC20PayValue] = useState(0);
    const [username, setUsername] = useState("")

    useEffect(() => {
        (async () => {
            const qrCode = await generateQR("bitcoin:3DBGwFbBoj7FjBFcbVi8hFcpmCjPhCY62X")
            setQrCode(qrCode)
        })()
    }, [])

    const handleSubmitEth = async (e) => {
        e.preventDefault();
        await startPayment({
            ether: ETHpayValue,
            addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
        });
    };

    const handleSubmitSol = async (e) => {
        e.preventDefault();
        await transferSOL(SOLpayValue, "AA6bqLgTzYPpFFH2R9XLdudibWcemLkKDRtZmPQEsEiS");
    };

    const handleSubmitERC20 = async (e) => {
        e.preventDefault();
        try {
            if (!window.ethereum)
                throw new Error("No crypto wallet found. Please install it.");
            // await window.ethereum.send("eth_requestAccounts");
            // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
            const decimals = await contract.decimals()
            await contract.transfer("0x76aEB5092D8eabCec324Be739b8BA5dF473F0055", ethers.utils.parseUnits(ERC20payValue.toString(), decimals));
        } catch (err) {
            console.log(err)
        }
    }

    const registerUsingEthereum = async (e) => {
        const ETHpayValue =
            await startPayment({
                ether: ,
                addr: "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055"
            })
    }

    return (
        <div>
            <div>
                <h1> Enter Username </h1>
                <input value={username} onChange={(e) => { setUsername(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ETH" />
                {/* <button onClick={registerUsingSolana}>Pay using Solana</button> */}
                <button onClick={registerUsingEthereum}>Pay using Ethereum</button>
            </div>

            <div>
                <form onSubmit={handleSubmitEth}>
                    <h1> Send ETH payment </h1>
                    <span>Send Shivam</span>
                    <input value={ETHpayValue} onChange={(e) => { setETHPayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ETH" />
                    <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>
                </form>
                <form onSubmit={handleSubmitSol}>
                    <h1> Send Sol payment </h1>
                    <span>Send Shivam</span>
                    <input value={SOLpayValue} onChange={(e) => { setSOLPayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in SOL" />
                    <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>
                </form>
                <form onSubmit={handleSubmitERC20}>
                    <h1> Send ERC20 payment </h1>
                    <span>Send Shivam</span>
                    <input value={ERC20payValue} onChange={(e) => { setERC20PayValue(e.target.value) }} className="shadow-sm mr-4 ml-4 border-4" name="ether" type="text" placeholder="Amount in ERC20" />
                    <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Pay now </button>
                </form>
                <form onSubmit={handleSubmitDESO}>
                    <span>Send Shivam</span>
                    <button type="submit" className="rounded-md shadow-lg text-blue-400 bg-slate-600 mr-4"> Send Deso </button>
                </form>
                <div>
                    <span>Pay Using Bitcoin</span>
                    <img src={qrCode}></img>
                    <a href="bitcoin:3DBGwFbBoj7FjBFcbVi8hFcpmCjPhCY62X">Send</a>
                </div></div>
        </div>

    );
}



{ "data": { "currency": "USD", "rates": { "AED": "3.6731", "AFN": "103.126753", "ALL": "106.255371", "AMD": "492.292002", "ANG": "1.801534", "AOA": "563.909", "ARS": "102.537286", "AUD": "1.380567", "AWG": "1.8005", "AZN": "1.7", "BAM": "1.72778", "BBD": "2", "BDT": "85.758262", "BGN": "1.728054", "BHD": "0.37699", "BIF": "1993.437894", "BMD": "1", "BND": "1.356107", "BOB": "6.902004", "BRL": "5.6255", "BSD": "1", "BTN": "74.92258", "BWP": "11.650294", "BYN": "2.519192", "BYR": "25191.92", "BZD": "2.014859", "CAD": "1.279096", "CDF": "1999.064499", "CHF": "0.917403", "CLF": "0.031069", "CLP": "857.3", "CNY": "6.3721", "COP": "3986.218727", "CRC": "642.396127", "CUC": "1", "CVE": "97.7", "CZK": "22.1241", "DJF": "177.952106", "DKK": "6.5645", "DOP": "57.065628", "DZD": "139.04952", "EGP": "15.7091", "ETB": "49.412536", "EUR": "0.88273", "FJD": "2.1187", "FKP": "0.744297", "GBP": "0.744297", "GEL": "3.08", "GHS": "6.147404", "GIP": "0.744297", "GMD": "52.5", "GNF": "9452.907216", "GTQ": "7.716676", "GYD": "209.127282", "HKD": "7.7996", "HNL": "24.516117", "HRK": "6.6215", "HTG": "101.329506", "HUF": "326.79", "IDR": "14227.95", "ILS": "3.11366", "INR": "74.903503", "IQD": "1458.778826", "ISK": "130.13", "JMD": "153.430318", "JOD": "0.709", "JPY": "114.817", "KES": "113.15", "KGS": "84.78975", "KHR": "4064.801357", "KMF": "434.749906", "KRW": "1186.871592", "KWD": "0.302634", "KYD": "0.832958", "KZT": "433.811349", "LAK": "11158.233524", "LBP": "1511.320361", "LKR": "202.917521", "LRD": "143.499995", "LSL": "15.528672", "LYD": "4.594387", "MAD": "9.280559", "MDL": "17.807401", "MGA": "3975.797306", "MKD": "54.430695", "MMK": "1777.243194", "MNT": "2862.037327", "MOP": "8.031696", "MRO": "356.999828", "MUR": "43.350003", "MVR": "15.46", "MWK": "810.709828", "MXN": "20.7098", "MYR": "4.184", "MZN": "63.841999", "NAD": "15.53", "NGN": "410.83", "NIO": "35.389886", "NOK": "8.838005", "NPR": "119.87597", "NZD": "1.46754", "OMR": "0.385004", "PAB": "1", "PEN": "4.001272", "PGK": "3.51032", "PHP": "50.360002", "PKR": "178.448479", "PLN": "4.063924", "PYG": "6792.282696", "QAR": "3.641", "RON": "4.3704", "RSD": "103.8", "RUB": "73.4488", "RWF": "1036.592666", "SAR": "3.755309", "SBD": "8.100479", "SCR": "13.78826", "SEK": "9.099849", "SHP": "0.744297", "SKK": "16518.004625041296", "SLL": "11313.199875", "SOS": "578.277873", "SRD": "19.4065", "SSP": "130.26", "STD": "21185.990504", "SVC": "8.746544", "SZL": "15.519307", "THB": "33.547", "TJS": "11.28517", "TMT": "3.5", "TND": "2.869", "TOP": "2.27622", "TRY": "11.6396", "TTD": "6.787516", "TWD": "27.6685", "TZS": "2306", "UAH": "27.261083", "UGX": "3541.492569", "UYU": "44.420533", "UZS": "10793.790686", "VES": "4.57815", "VND": "22859.758088", "VUV": "113.314327", "WST": "2.603871", "XAF": "579.032595", "XAG": "0.04339716", "XAU": "0.00055212", "XCD": "2.70255", "XDR": "0.713461", "XOF": "579.032595", "XPD": "0.00051127", "XPF": "105.337649", "XPT": "0.0010267", "YER": "250.249937", "ZAR": "15.5536", "ZMW": "16.567903", "JEP": "0.744297", "GGP": "0.744297", "IMP": "0.744297", "GBX": "31.75815025289015", "CNH": "6.3764", "TMM": "224.82418748538643", "ZWL": "322", "SGD": "1.3559", "USD": "1.0", "BTC": "2.0373854110776516e-05", "BCH": "0.002222889088948907", "BSV": "0.007969777352069536", "ETH": "0.00025567437311839643", "ETH2": "0.00025567437311839643", "ETC": "0.027874564459930314", "LTC": "0.006740361283364788", "ZRX": "1.2134398167220501", "USDC": "1.0", "BAT": "0.7743489177505938", "MANA": "0.28124067071962594", "KNC": "0.7451564828614009", "LINK": "0.045787545787545784", "DNT": "7.350590068617758", "MKR": "0.0003900148400646644", "CVC": "2.8553032260643496", "OMG": "0.15420200462606012", "DAI": "1.0000065000422502", "ZEC": "0.0063722678901421016", "XRP": "1.1300240218246511", "REP": "0.05465974309920743", "XLM": "3.557921177814227", "EOS": "0.3081664098613251", "XTZ": "0.20876826722338204", "ALGO": "0.6444960041247744", "DASH": "0.007089684509039347", "ATOM": "0.03527959075674722", "OXT": "2.5195263290501386", "COMP": "0.004496605063177302", "ENJ": "0.34423407917383825", "REPV2": "0.05465974309920743", "BAND": "0.17937219730941703", "NMR": "0.029201343261790046", "CGLD": "0.20703933747412007", "UMA": "0.09775171065493646", "LRC": "0.4668425106790225", "YFI": "3.371935248053045e-05", "UNI": "0.05417118093174431", "BAL": "0.0580046403712297", "REN": "1.6836434043269637", "WBTC": "2.036626279688665e-05", "NU": "1.2846865364850977", "YFII": "0.0003651827465759553", "FIL": "0.026399155227032733", "AAVE": "0.003529702446083795", "BNT": "0.28776978417266186", "GRT": "1.4413375612568464", "SNX": "0.1673640167364017", "STORJ": "0.5194805194805194", "SUSHI": "0.11019283746556474", "MATIC": "0.38334738940427815", "SKL": "4.482294935006723", "ADA": "0.6869311351537007", "ANKR": "9.184845005740527", "CRV": "0.19665683382497542", "ICP": "0.03827018752391887", "NKN": "2.607901942886947", "OGN": "1.4695077149155034", "1INCH": "0.3738317757009346", "USDT": "0.9996501224571399", "FORTH": "0.1002004008016032", "CTSI": "1.3243279035889286", "TRB": "0.027221995372260787", "POLY": "1.9104021396503965", "MIR": "0.39207998431680063", "RLC": "0.3273322422258592", "DOT": "0.03451251078515962", "SOL": "0.005277462595983851", "DOGE": "5.566379070414695", "MLN": "0.011681560656503708", "GTC": "0.07168458781362008", "AMP": "19.140587616039813", "SHIB": "27510.316368638236", "CHZ": "3.15905860053704", "KEEP": "1.5034202811395925", "LPT": "0.024271844660194174", "QNT": "0.005321696556862328", "BOND": "0.05934718100890207", "RLY": "2.7434842249657065", "CLV": "1.3071895424836601", "FARM": "0.006479621590099138", "MASK": "0.08371703641691083", "FET": "1.7889087656529514", "PAX": "1.0050251256281406", "ACH": "16.340269777854033", "ASM": "10.919414719371042", "PLA": "0.6318716036901302", "RAI": "0.32948929159802304", "TRIBE": "0.9462976105985331", "ORN": "0.18331805682859761", "IOTX": "6.21793875330328", "UST": "0.9985022466300548", "QUICK": "0.0038915048449235314", "AXS": "0.009767532721234616", "REQ": "2.694401034649997", "WLUNA": "0.01073594932631918", "TRU": "3.050640634533252", "RAD": "0.09666505558240696", "COTI": "2.619515389652914", "DDX": "0.21668472372697725", "SUKU": "1.9588638589618024", "RGT": "0.035669698591046906", "XYO": "27.67438320718427", "ZEN": "0.015248551387618176", "AUCTION": "0.03942440370589395", "JASMY": "12.663838409421897", "WCFG": "0.9478672985781991", "BTRST": "0.27434842249657065", "AGLD": "0.5221932114882506", "AVAX": "0.009040365230755323", "FX": "1.0945110271985992", "TRAC": "0.7804268935107503", "LCX": "5.0352467270896275", "ARPA": "9.25925925925926", "BADGER": "0.059470710674992565", "KRL": "0.7284912945290304", "PERP": "0.11185682326621925", "RARI": "0.07137758743754462", "DESO": "0.011757789535567314", "API3": "0.20746887966804978", "CRO": "1.7161489617298782", "MDT": "8.359806052499582", "VGX": "0.3058103975535168", "ALCX": "0.004511617414843221", "COVAL": "8.815621280909772", "FOX": "1.6957775139901645", "MUSD": "1.0005002501250624", "GALA": "2.0509454858689855", "POWR": "2.243158366980709", "GYEN": "115.21401002361888", "SPELL": "42.94610264118531", "ENS": "0.023721978412999643", "BLZ": "4.373496610540127", "IDEX": "3.7383177570093458", "MCO2": "0.0979431929480901", "POLS": "0.35778175313059035", "SUPER": "0.8064516129032259", "GODS": "0.21344717182497333", "IMX": "0.19685039370078738", "RBN": "0.4662004662004662", "BICO": "0.20554984583761562" } } }