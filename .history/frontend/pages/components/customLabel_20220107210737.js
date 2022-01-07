import React from "react";

export default function CustomLabel({ children, className, ...props }) {
    className = "px-2 sm:px-4 bg-white font-semibold" + " " + className;
    return (
        <label {...props} className={className}>
            {children}
        </label>
    );
}