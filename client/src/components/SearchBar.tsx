import React from 'react';

const SearchBar: React.FC<{ placeholder?: string }> = ({ placeholder = 'Search' }) => (
  <div className="flex items-center bg-gray-800 rounded p-2">
    <input className="bg-transparent flex-1 outline-none" placeholder={placeholder} />
  </div>
);

export default SearchBar;
