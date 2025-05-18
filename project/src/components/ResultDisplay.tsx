import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CheckCircleIcon, AlertTriangleIcon, AlertCircleIcon } from 'lucide-react';

interface ResultDisplayProps {
  result: any;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const { isDarkMode } = useTheme();
  
  if (result.error) {
    return (
      <div className={`mt-4 p-4 rounded-lg border ${
        isDarkMode 
          ? 'bg-red-900/20 border-red-800 text-red-200' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-start">
          <AlertCircleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-red-500" />
          <div>
            <h3 className="text-sm font-medium">Error</h3>
            <p className="mt-1 text-sm">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-500';
    if (aqi <= 150) return 'text-orange-500';
    if (aqi <= 200) return 'text-red-500';
    if (aqi <= 300) return 'text-purple-500';
    return 'text-pink-600';
  };

  const getAqiCategory = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const aqi = result.aqi || result.prediction || 75; // Example fallback for demo

  return (
    <div className={`mt-6 rounded-lg border overflow-hidden ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } transition-all duration-300 transform animate-fade-in`}>
      <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Prediction Results
        </h3>
      </div>
      
      <div className="p-5">
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`text-4xl font-bold mb-2 ${getAqiColor(aqi)}`}>
            {aqi}
          </div>
          <div className={`text-lg font-medium ${getAqiColor(aqi)}`}>
            {getAqiCategory(aqi)}
          </div>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Air Quality Index (AQI)
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-xs uppercase font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Location</p>
            <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {result.location_name || "Sample Location"}
            </p>
          </div>
          
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-xs uppercase font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Parameter</p>
            <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {result.parameter || "PM2.5"} ({result.unit || "µg/m³"})
            </p>
          </div>
          
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-xs uppercase font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Date & Time (Local)</p>
            <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {result.datetime_local || new Date().toLocaleString()}
            </p>
          </div>
          
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-xs uppercase font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Coordinates</p>
            <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {result.latitude || "37.7749"}, {result.longitude || "-122.4194"}
            </p>
          </div>
        </div>
        
        <div className={`mt-6 p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-blue-900/20 border-blue-800 text-blue-200' 
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex">
            <AlertTriangleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-blue-500" />
            <div>
              <p className="text-sm">
                This prediction is based on historical data and may vary from actual measurements.
                For official air quality information, please consult local environmental agencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;