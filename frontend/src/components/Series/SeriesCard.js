import React from 'react';
import { Link } from 'react-router-dom';

const SeriesCard = ({ series }) => {
  return (
    <Link to={`/series/${series._id}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:transform hover:scale-105 transition duration-300">
        <img 
          src={series.coverImage || '/placeholder.jpg'} 
          alt={series.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg truncate">{series.title}</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-yellow-400">⭐ {series.rating}</span>
            <span className="text-gray-400">{series.releaseYear}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SeriesCard;