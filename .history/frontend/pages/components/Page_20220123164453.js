import React from "react";
import Header from "./Header";
import Footer from "./footer";

export default function Page({ children }) {
    return (
        <div className="flex flex-col w-screen h-screen">
            <Header className="" brandedButtonLabel="Dashboard" brandedButtonCallback={() => { router.push("/dashboard") }} />
            {children}
            <div className="flex-1" id="spacer"></div>
            <Footer />
        </div>
    )
}