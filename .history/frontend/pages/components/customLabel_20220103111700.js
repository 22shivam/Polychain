import React from "react";

export default function CustomLabel({ children, className, ...props }) {
    className = "px-4 bg-white text-black font-semibold" + " " + className;
    return (
        <label {...props} className="px-4 bg-white text-black font-semibold">
            {children}
        </label>
    );
}