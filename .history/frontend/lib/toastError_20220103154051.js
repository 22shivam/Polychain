import { toast } from "react-toastify";

export default function toastError(msg, newestOnTop = true) {
    return toast.error(msg, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        newestOnTop: newestOnTop,
        progress: undefined,
    });
}
