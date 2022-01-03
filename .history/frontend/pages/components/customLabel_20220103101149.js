import React from "react";

export default function CustomLabel({ children, ...props }) {
    return (
        <label {...props} className="inline-flex justify-center shadow-sm px-4 py-2 bg-white text-black text-lg font-semibold">
            {children}
        </label>
    );
}