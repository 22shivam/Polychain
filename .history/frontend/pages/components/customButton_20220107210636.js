// create react component
import React from "react";

export default function CustomButton({ children, className, ...props }) {
    className = "mx-1 inline-flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-2 sm:px-4 py-1 sm:py-2 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 font-semibold" + " " + className;
    return (
        <button {...props} className={className}>
            {children}
        </button>
    );
}

