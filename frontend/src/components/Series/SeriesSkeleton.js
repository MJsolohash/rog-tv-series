import React from 'react';

const SeriesSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {[...Array(12)].map((_, index) => (
        <div key={index} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
          <div className="w-full h-64 bg-gray-700"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeriesSkeleton;