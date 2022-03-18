import CustomInput from "./components/customInput";
import { useState } from "react";
import { useRouter } from 'next/router'
import CustomLabel from "./components/customLabel";
import Footer from "./components/footer";
import Header from "./components/Header";
import DropDownComponent from './components/DropDown';
import { CodeBlock, dracula } from "react-code-blocks";
import CustomButton from "./components/customButton";
import CustomBrandedButton from "./components/customBrandedButton";
import Page from "./components/Page";

export default function Brand() {
    const router = useRouter()

    const [style, setStyle] = useState('regular');
    const [text, setText] = useState('Buy Me Some Crypto');
    const [username, setUsername] = useState('');
    const [copied, setCopied] = useState(false);

    const script = `<script src="http://spindl.me/embed.prod.bundle.js" data-user="${username}" data-text="${text}" data-style="${style}"></script>`

    return (
        <Page>
            <div className="flex flex-col items-center">
                <CustomLabel className="text-xl sm:text-2xl mb-4 mt-6">Get an embeddable Spindl button for your website today!</CustomLabel>
                <div className={"flex flex-col items-center justify-center mx-4 mt-6"}>
                    <div id="card" className="flex flex-col justify-center rounded-xl border border-gray-300 shadow-sm bg-white w-full">
                        <div className="flex justify-center p-8 rounded-t-xl overflow-x-auto">
                            <a className={`poly-btn ${(style == 'inverted') ? 'poly-btn-inverted' : ''}`} href="#">
                                <img src="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAOxAAADsQBlSsOGwAABGBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0n77u/JyBpZD0nVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkJz8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0nYWRvYmU6bnM6bWV0YS8nPgo8cmRmOlJERiB4bWxuczpyZGY9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMnPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6QXR0cmliPSdodHRwOi8vbnMuYXR0cmlidXRpb24uY29tL2Fkcy8xLjAvJz4KICA8QXR0cmliOkFkcz4KICAgPHJkZjpTZXE+CiAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9J1Jlc291cmNlJz4KICAgICA8QXR0cmliOkNyZWF0ZWQ+MjAyMi0wMS0yMjwvQXR0cmliOkNyZWF0ZWQ+CiAgICAgPEF0dHJpYjpFeHRJZD5hNmIzZjczZS1iZGVmLTQyNDctYmIxOC1hYjBlNGQ2Y2VlOTI8L0F0dHJpYjpFeHRJZD4KICAgICA8QXR0cmliOkZiSWQ+NTI1MjY1OTE0MTc5NTgwPC9BdHRyaWI6RmJJZD4KICAgICA8QXR0cmliOlRvdWNoVHlwZT4yPC9BdHRyaWI6VG91Y2hUeXBlPgogICAgPC9yZGY6bGk+CiAgIDwvcmRmOlNlcT4KICA8L0F0dHJpYjpBZHM+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOmRjPSdodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyc+CiAgPGRjOnRpdGxlPgogICA8cmRmOkFsdD4KICAgIDxyZGY6bGkgeG1sOmxhbmc9J3gtZGVmYXVsdCc+UDwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRm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" alt="Spindl" />
                                <span className="poly-btn-text">{text}</span></a>
                        </div>
                        <div className="flex justify-center my-1 px-3 sm:px-6 pt-4">
                            <span className="border text-sm sm:text-base border-gray-300 shadow-sm border-r-0 rounded-l-md px-2 sm:px-4 py-2 bg-gray-100 muted whitespace-no-wrap font-medium sm:font-semibold ">spindl.me/</span>
                            <CustomInput value={username} onChange={(e) => { setUsername((e.target.value).replace(/[^a-zA-Z0-9]/g, "")); setCopied(false) }} name="field_name" className="rounded-l-none ml-0 mr-1 sm:mr-1 input-placeholder w-full" type="text" placeholder="Enter Username" />
                        </div>
                        <div className="flex justfy-center px-3 sm:px-6 pb-4 pt-2">

                            <CustomInput className="px-0 mx-0 text-sm flex-1 mr-6" value={text} onChange={(e) => { setText(e.target.value.slice(0, 20)); setCopied(false); }} type="text" placeholder="Enter Text" />
                            <div className="ml-1">
                                <DropDownComponent primaryLabel={(style == "inverted") ? "Light" : "Dark"} label1="Dark" label2="Light" label1onClick={() => { setStyle('regular'); setCopied(false) }} label2onClick={() => { setStyle('inverted'); setCopied(false) }} />
                            </div>
                        </div>
                        <div id="card" className="flex flex-col justify-start space-y-4 rounded-xl border border-gray-300 shadow-sm my-10 p-10 w-full overflow-hidden">
                            <CustomLabel className="text-xl">Please copy the code below into your website</CustomLabel>
                            <CustomLabel className="font-medium" style={{ maxWidth: "50ch" }}>{script}</CustomLabel>
                            {/* <CodeBlock
                        className="rounded-b-xl"
                        language="html"
                        text={script}
                        showLineNumbers={false}
                        theme={dracula}
                        wrapLines={true}
                        codeBlock={false}
                        /> */}
                            <CustomBrandedButton className="self-start ml-4 px-2 py-2 sm:px-4 sm:py-2 py-4" onClick={() => { navigator.clipboard.writeText(script); setCopied(true) }}>{(copied) ? 'Copied!' : 'Copy to Clipboard'}</CustomBrandedButton>
                        </div>
                    </div>
                </div>
            </div>
            <div id="spacer" className="flex-grow"></div>
        </Page >
    );

}