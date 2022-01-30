import { parseBalanceMap } from '../lib/parseBalanceMap.js';

export default function merkeProcess() {
    console.log(parseBalanceMap([
            {
                "address": "0x4858b59B1dcD622E8c17D97Aa5fDdC0E54E209a3",
                "earnings": "0x2086ac351052600000"
            },
            {
                "address": "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055",
                "earnings": "0x2086ac351052600000"
            }
    ]
    ));
    return(<></>);
}