import { useRouter } from "next/router";
import Gateway from "../../components/Gateway";
import { ToastContainer } from "react-toastify";

export default function Embed() {
    const router = useRouter()
    const {address} = router.query
    return (<>
    <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                style={{ maxWidth: "70%", left: "50%", transform: "translate(-50%, 0%)" }}
            />
    <Gateway blockchain="SOL" address={address} advertisement={true} /></>)
}