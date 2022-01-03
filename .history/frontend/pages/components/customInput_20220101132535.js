import React from "react";

export default function CustomInput({ children, ...props }) {
    return (
        <input {...props} className="mx-4 border border-gray-300 shadow-sm px-4 rounded-md input-placeholder">
            {children}
        </input>
    );
}