// create react component
import React from "react";

export default function CustomBrandedButton({ children, className, ...props }) {
    className = "mx-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 text-white bg-brand-primary-medium hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 font-semibold" + " " + className;
    return (
        <button {...props} className={className}>
            {children}
        </button>
    );
}
