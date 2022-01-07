import React from "react";

export default function CustomLabel({ children, className, ...props }) {
    className = "text-sm  px-2 sm:px-4 bg-white font-semibold" + " " + className;
    return (
        <label {...props} className={className}>
            {children}
        </label>
    );
}