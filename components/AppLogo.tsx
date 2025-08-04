import React from 'react';
import { Link } from 'react-router-dom';

export const AppLogo = () => (
    <Link to="/" className="flex items-center group">
        {/* ✅ FIXED: Removed text and set a fixed height for layout stability */}
        <img
          src="/elevate-ai.png"
          alt="Elevate AI Logo"
          // This fixed height ensures the header layout doesn't break
          className="h-10 w-auto object-contain" 
        />
    </Link>
);