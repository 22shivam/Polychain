import React from "react";

export default function CustomInput({ children, ...props }) {
    return (
        <input {...props} className="rounded-r px-4 py-2 w-40 border border-gray-300 shadow-sm border-l-0 place-content-center mr-2 input-placeholder">
            {children}
        </input>
    );
}