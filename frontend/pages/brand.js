import ButtonGenerator from "./components/ButtonGenerator";
import CustomBrandedButton from "./components/customBrandedButton";
import CustomInput from "./components/customInput";
import { useState } from "react";
import { useRouter } from 'next/router'
import CustomLabel from "./components/customLabel";
import Footer from "./components/footer";
import Header from "./components/Header";

export default function Brand() {
    const [username, setUsername] = useState("");
    const [done, setDone] = useState(false);
    const router = useRouter()


    return (
        <div className="flex flex-col h-screen w-screen">
            <div className="flex flex-col items-center">
                <Header brandedButtonCallback={() => { router.push("/dashboard") }} brandedButtonLabel="Dashboard" />
                <CustomLabel className="text-xl smtext-2xl mb-4 mt-6">Get an embeddable Polychain button for your website today!</CustomLabel>
                {!done ?
                    <div className="flex flex-col items-center">

                        <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm p-3 pt-6 sm:p-6 bg-white">
                            <CustomLabel>Enter a Polychain username</CustomLabel>
                            <div className="flex justify-center my-3">
                                <span className="border text-sm sm:text-base border-gray-300 shadow-sm border-r-0 rounded-l-md px-2 sm:px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-medium sm:font-semibold ">polychian.tech/</span>
                                <CustomInput value={username} onChange={(e) => { setUsername((e.target.value).replace(/[^a-zA-Z0-9]/g, "")) }} name="field_name" className="homepageInput rounded-l-none ml-0 mr-2 sm:mr-2 input-placeholder" type="text" placeholder="Enter Username" />
                                <CustomBrandedButton className="text-xs sm:text-base py-1" onClick={() => setDone(true)}>Create Button</CustomBrandedButton>
                            </div>
                        </div>
                    </div>
                    : <ButtonGenerator className="mt-6" username={username} />}
            </div>
            <div id="spacer" className="flex-grow"></div>
            <Footer />
        </div>
    );

}