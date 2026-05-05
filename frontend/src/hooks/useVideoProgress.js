import { useState, useEffect } from 'react';

const useVideoProgress = (episodeId) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`progress_${episodeId}`);
    if (savedProgress) {
      setProgress(parseInt(savedProgress));
    }
  }, [episodeId]);

  const saveProgress = (currentTime) => {
    const progressPercent = (currentTime / duration) * 100;
    setProgress(progressPercent);
    localStorage.setItem(`progress_${episodeId}`, progressPercent);
  };

  return { progress, saveProgress };
};

export default useVideoProgress;