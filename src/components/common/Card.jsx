import React from 'react';
import './Card.css';

const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <div
            className={`glass-panel card ${hover ? 'card-hover' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
