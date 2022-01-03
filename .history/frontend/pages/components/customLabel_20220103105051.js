import React from "react";

export default function CustomLabel({ children, ...props }) {
    return (
        <label {...props} className="shadow-sm px-4 my-1 bg-white text-black font-semibold">
            {children}
        </label>
    );
}