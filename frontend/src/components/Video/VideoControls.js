import React from 'react';

const VideoControls = ({ quality, setQuality, qualities }) => {
  return (
    <div className="flex items-center space-x-4 mt-2">
      <select 
        value={quality} 
        onChange={(e) => setQuality(e.target.value)}
        className="bg-gray-800 text-white px-3 py-1 rounded"
      >
        {qualities.map(q => (
          <option key={q} value={q}>{q}p</option>
        ))}
      </select>
    </div>
  );
};

export default VideoControls;