import React from 'react';
import SeriesCard from './SeriesCard';

const SeriesGrid = ({ series, loading }) => {
  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {series.map((item) => (
        <SeriesCard key={item._id} series={item} />
      ))}
    </div>
  );
};

export default SeriesGrid;