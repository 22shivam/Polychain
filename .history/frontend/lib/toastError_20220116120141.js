import { toast } from "react-toastify";

export default function toastError(msg) {
    try {
        return toast.error(msg, {
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
