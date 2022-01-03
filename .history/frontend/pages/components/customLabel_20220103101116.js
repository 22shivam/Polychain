import React from "react";

export default function CustomLabel({ children, ...props }) {
    return (
        <label {...props} className="inline-flex justify-center shadow-sm px-4 py-2 bg-white text-gray-700 font-semibold">
            {children}
        </label>
    );
}