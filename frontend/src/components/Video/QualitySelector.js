import React from 'react';
//මේ video එකෙ 3ම use නැ කැමති නම් folder del කරන්න පුලුව
const QualitySelector = ({ currentQuality, onQualityChange, qualities }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-white text-sm">Quality:</span>
      <div className="flex space-x-2">
        {qualities.map((quality) => (
          <button
            key={quality}
            onClick={() => onQualityChange(quality)}
            className={`px-2 py-1 text-sm rounded ${
              currentQuality === quality 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {quality}p
          </button>
        ))}
      </div>
    </div>
  );
};

export default QualitySelector;