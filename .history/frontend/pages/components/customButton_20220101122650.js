// create react component
import React from "react";

export default function CustomButton({ children, ...props }) {
    return (
        <button {...props} className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 font-semibold">
            {children}
        </button>
    );
}