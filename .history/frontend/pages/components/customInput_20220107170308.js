import React from "react";

export default function CustomInput({ pattern, children, className, maxLength, ...props }) {
    className = "input-text border border-gray-300 shadow-sm px-2 text-sm sm:text-base sm:px-4 rounded-md input-placeholder" + " " + className;
    return (
        <input {...props} maxLength={maxLength} className={className} pattern={pattern}>
            {children}
        </input>
    );
}