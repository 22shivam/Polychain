import React from "react";

export default function CustomLabel({ children, className, ...props }) {
    className = "px-4 bg-white text-black text-gray-700 font-semibold" + " " + className;
    return (
        <label {...props} className={className}>
            {children}
        </label>
    );
}