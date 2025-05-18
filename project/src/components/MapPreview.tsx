import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { MapPinIcon } from 'lucide-react';

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

const MapPreview: React.FC<MapPreviewProps> = ({ latitude, longitude, locationName }) => {
  const { isDarkMode } = useTheme();
  
  // This would typically be replaced with a real map integration
  // For now, we'll create a simple visual representation
  return (
    <div className={`relative h-40 overflow-hidden ${
      isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
    }`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-sm">Map Preview</p>
          <p className="text-xs mt-1">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     text-red-500 animate-pulse">
        <MapPinIcon size={24} />
      </div>
      
      <div className="absolute bottom-2 left-2 right-2 flex items-center bg-white/90 dark:bg-black/70 
                    rounded-md p-2 text-xs shadow-sm">
        <MapPinIcon size={14} className="mr-1 text-red-500 flex-shrink-0" />
        <span className={`truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {locationName || 'Selected Location'}
        </span>
      </div>
      
      {/* Grid lines to simulate a map */}
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-6">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className={`border ${isDarkMode ? 'border-gray-600/30' : 'border-gray-300/50'}`}></div>
        ))}
      </div>
    </div>
  );
};

export default MapPreview;