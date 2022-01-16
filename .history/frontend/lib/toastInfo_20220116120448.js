import { toast } from "react-toastify";

export default function toastInfo(msg) {
    try {
        return toast.info(msg, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
        });
    } catch (e) {
        alert("Something went wrong")
    }
}