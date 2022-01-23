import ButtonGenerator from "./components/ButtonGenerator";
import CustomButton from "./components/customButton";
import CustomBrandedButton from "./components/customBrandedButton";
import CustomInput from "./components/customInput";
import { useState } from "react";
import { useRouter } from 'next/router'
import CustomLabel from "./components/customLabel";

export default function Brand() {
    const [username, setUsername] = useState("");
    const [done, setDone] = useState(false);
    const router = useRouter()

    if (done) {
        return <ButtonGenerator username={username} />
    } else {
        return (
            <div className="flex flex-col items-center justify-center mx-4">
                <div onClick={() => { router.push("/") }} className="my-10 cursor-pointer">
                    <img src="croppedPolychainLogo.png" width="200"></img>
                </div>
                <CustomLabel className="text-2xl mb-10">Get an embeddable Polychain button for your website today!</CustomLabel>
                <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm p-3 pt-6 sm:p-6 bg-white">
                    <CustomLabel>Enter a Polychain username</CustomLabel>
                    <div className="flex justify-center my-3">
                        <span className="border text-sm sm:text-base border-gray-300 shadow-sm border-r-0 rounded-l-md px-2 sm:px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-medium sm:font-semibold ">polychian.tech/</span>
                        <CustomInput value={username} onChange={(e) => { setUsername((e.target.value).replace(/[^a-zA-Z0-9]/g, "")) }} name="field_name" className="homepageInput rounded-l-none ml-0 mr-2 sm:mr-2 input-placeholder" type="text" placeholder="Enter Username" />
                        <CustomBrandedButton className="text-xs sm:text-base py-1" onClick={() => setDone(true)}>Create Button</CustomBrandedButton>
                    </div>
                </div>
            </div>
        );
    }
}