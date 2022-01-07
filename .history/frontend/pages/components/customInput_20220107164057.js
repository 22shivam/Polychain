import React from "react";

export default function CustomInput({ pattern, children, className, maxLength, ...props }) {
    className = "mx-4 input-text border border-gray-300 shadow-sm sm:px-4 rounded-md input-placeholder" + " " + className;
    return (
        <input {...props} maxLength={maxLength} className={className} pattern={pattern}>
            {children}
        </input>
    );
}