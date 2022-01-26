import React from "react";
import Header from "./Header";
import Footer from "./footer";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/router";

export default function Page({ children }) {
    const router = useRouter();
    return (
        <div className="flex flex-col w-screen h-screen">
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
            <Header className="" brandedButtonLabel="Dashboard" brandedButtonCallback={() => { router.push("/dashboard") }} />
            {children}
            <div className="flex-1" id="spacer"></div>
            <Footer />
        </div>
    )
}