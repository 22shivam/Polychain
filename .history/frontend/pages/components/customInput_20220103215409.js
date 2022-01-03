import React from "react";

export default function CustomInput({ children, className, ...props }) {
    className = "mx-4 input-text text-gray-500 border border-gray-300 shadow-sm px-4 rounded-md input-placeholder" + " " + className;
    return (
        <input {...props} className={className}>
            {children}
        </input>
    );
}