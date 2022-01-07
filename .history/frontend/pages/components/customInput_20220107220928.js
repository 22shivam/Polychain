import React from "react";

export default function CustomInput({ pattern, children, className, maxLength, ...props }) {
    className = "mx-4 input-text border border-gray-300 shadow-sm px-2 text-sm sm:text-base sm:px-4 rounded-md input-placeholder focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500" + " " + className;
    return (
        <input {...props} maxLength={maxLength} className={className} pattern={pattern} >
            {children}
        </input>
    );
}