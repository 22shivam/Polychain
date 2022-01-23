import React from "react";
import Header from "./Header";
import Footer from "./footer";

export default function Page() {
    return (
        <div className="flex flex-col w-screen h-screen">
            <Header brandedButtonLabel="Dashboard" brandedButtonCallback={() => { router.push("/dashboard") }} />
            <CustomLabel className="mt-4 self-center">Invalid Address</CustomLabel>
            <div className="flex-1" id="spacer"></div>
            <Footer />
        </div>
    )
}