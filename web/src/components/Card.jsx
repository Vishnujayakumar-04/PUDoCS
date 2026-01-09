import React from 'react';

const Card = ({ children, className = '', title, titleRight, onClick, ...props }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
            {...props}
        >
            {(title || titleRight) && (
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    {title && <h3 className="font-bold text-gray-800 text-lg">{title}</h3>}
                    {titleRight && <div>{titleRight}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export default Card;
