import React, { useRef } from 'react';

const VideoPlayer = ({ videoUrl, thumbnail, autoPlay = false, loop = false, muted = false }) => {
  const videoRef = useRef(null);

  if (!videoUrl) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">No video selected</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        poster={thumbnail}
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        <p className="text-white">Your browser does not support HTML5 video.</p>
      </video>
    </div>
  );
};

export default VideoPlayer;