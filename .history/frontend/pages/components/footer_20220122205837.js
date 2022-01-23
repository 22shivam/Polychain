import Link from 'next/link';
import React from "react";

export default function Footer() {
    return (
        <footer className="text-gray-700 bg-white body-font text-md">
            <div className="container flex items-center px-8 py-8 mx-auto max-w-7xl sm:flex-row">
                {/* <a href="#_" className="text-xl font-black leading-none text-gray-900 select-none logo">tails<span className="text-indigo-600">.</span></a> */}
                <p className="sm:ml-4 font-medium sm:pl-4 sm:border-gray-200 sm:mt-0 flex items-center justify-center">{/*© 2021 &nbsp;*/} <Link href="/" target="">Polychain</Link> &nbsp;

                </p>
                <span id="spacer" className="grow"></span>
                <span id="socials"><a href="https://twitter.com/polychainhq" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Twitter</span>
                    <svg className="sm:w-6 sm:h-6 w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                </a></span>
                <span id="spacer" className="grow"></span>
                <span className="inline-flex justify-center space-x-5 sm:ml-auto sm:mt-0 sm:justify-start font-medium items-center">


                    &nbsp; made with&nbsp;<span style={{ margin: "0px" }} className="text-red-600 text-lg">&hearts;</span> &nbsp;in india
                </span>
            </div>
        </footer>
    )
}