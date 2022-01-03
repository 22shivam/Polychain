import React from "react";

export default function CustomLabel({ children, className, ...props }) {
    className = " text-gray-700 px-4 bg-white text-black font-semibold" + " " + className;
    return (
        <label {...props} className={className}>
            {children}
        </label>
    );
}