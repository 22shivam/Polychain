import React from "react";

export default function CustomLabel({ children, ...props }) {
    return (
        <label {...props} className="px-4 bg-white text-black font-semibold font-sm">
            {children}
        </label>
    );
}