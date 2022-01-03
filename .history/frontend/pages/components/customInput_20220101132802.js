import React from "react";

export default function CustomInput({ children, ...props }) {
    return (
        <input className="mx-4 border border-gray-300 shadow-sm px-4 rounded-md input-placeholder" {...props} >
            {children}
        </input>
    );
}