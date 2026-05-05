import React from 'react';

const Sidebar = () => {
  return (
    <aside className="bg-gray-800 w-64 min-h-screen p-4">
      <div className="text-white">
        <h3 className="text-lg font-bold mb-4">Genres</h3>
        <ul className="space-y-2">
          <li><a href="#" className="hover:text-red-400">Action</a></li>
          <li><a href="#" className="hover:text-red-400">Drama</a></li>
          <li><a href="#" className="hover:text-red-400">Comedy</a></li>
          <li><a href="#" className="hover:text-red-400">Thriller</a></li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;