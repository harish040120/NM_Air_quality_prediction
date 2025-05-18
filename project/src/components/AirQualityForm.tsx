import React, { useState } from 'react';
import { MapPinIcon, AlertTriangleIcon, AirplayIcon, LoaderIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { predictAirQuality } from '../services/api';
import ResultDisplay from './ResultDisplay';
import MapPreview from './MapPreview';
import FormField from './FormField';

interface FormData {
  location_id: string;
  location_name: string;
  parameter: string;
  unit: string;
  datetimeUTC: string;
  datetime_local: string;
  latitude: string;
  longitude: string;
}

const AirQualityForm: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    location_id: '',
    location_name: '',
    parameter: '',
    unit: '',
    datetimeUTC: new Date().toISOString().slice(0, 16),
    datetime_local: new Date().toISOString().slice(0, 16),
    latitude: '',
    longitude: ''
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [predictionResult, setPredictionResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.location_id.trim()) newErrors.location_id = 'Location ID is required';
    if (!formData.location_name.trim()) newErrors.location_name = 'Location name is required';
    if (!formData.parameter.trim()) newErrors.parameter = 'Parameter is required';
    if (!formData.unit.trim()) newErrors.unit = 'Unit is required';
    
    const latNum = parseFloat(formData.latitude);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    
    const longNum = parseFloat(formData.longitude);
    if (isNaN(longNum) || longNum < -180 || longNum > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // When latitude or longitude changes, enable map preview
    if ((name === 'latitude' || name === 'longitude') && 
        formData.latitude.trim() && formData.longitude.trim()) {
      setShowMap(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setPredictionResult(null);
    
    try {
      const result = await predictAirQuality(formData);
      setPredictionResult(result);
    } catch (error) {
      console.error('Prediction error:', error);
      setPredictionResult({ error: 'Failed to get prediction. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      location_id: '',
      location_name: '',
      parameter: '',
      unit: '',
      datetimeUTC: new Date().toISOString().slice(0, 16),
      datetime_local: new Date().toISOString().slice(0, 16),
      latitude: '',
      longitude: ''
    });
    setErrors({});
    setPredictionResult(null);
    setShowMap(false);
  };

  return (
    <div className={`rounded-lg overflow-hidden transition-all duration-300 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-xl`}>
      <div className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-500 to-teal-500'}`}>
        <h2 className="text-white text-xl font-semibold flex items-center">
          <AirplayIcon className="mr-2" size={24} />
          Air Quality Index Prediction
        </h2>
        <p className="text-white/80 mt-1">
          Enter the required parameters to predict air quality index
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Location ID"
            name="location_id"
            value={formData.location_id}
            onChange={handleInputChange}
            error={errors.location_id}
            icon={<MapPinIcon size={18} />}
          />
          
          <FormField
            label="Location Name"
            name="location_name"
            value={formData.location_name}
            onChange={handleInputChange}
            error={errors.location_name}
          />
          
          <FormField
            label="Parameter"
            name="parameter"
            value={formData.parameter}
            onChange={handleInputChange}
            error={errors.parameter}
            placeholder="e.g., PM2.5, CO2, O3"
          />
          
          <FormField
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            error={errors.unit}
            placeholder="e.g., µg/m³, ppm"
          />
          
          <FormField
            label="Date/Time (UTC)"
            name="datetimeUTC"
            type="datetime-local"
            value={formData.datetimeUTC}
            onChange={handleInputChange}
            error={errors.datetimeUTC}
          />
          
          <FormField
            label="Date/Time (Local)"
            name="datetime_local"
            type="datetime-local"
            value={formData.datetime_local}
            onChange={handleInputChange}
            error={errors.datetime_local}
          />
          
          <FormField
            label="Latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            error={errors.latitude}
            placeholder="e.g., 37.7749"
          />
          
          <FormField
            label="Longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            error={errors.longitude}
            placeholder="e.g., -122.4194"
          />
        </div>
        
        {showMap && formData.latitude && formData.longitude && (
          <div className="mt-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <MapPreview 
              latitude={parseFloat(formData.latitude)} 
              longitude={parseFloat(formData.longitude)}
              locationName={formData.location_name}
            />
          </div>
        )}
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <button
            type="button"
            onClick={resetForm}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
            ${isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } w-full sm:w-auto`}
          >
            Reset Form
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
            ${isDarkMode 
              ? 'bg-gradient-to-r from-blue-600 to-teal-600' 
              : 'bg-gradient-to-r from-blue-500 to-teal-500'
            } text-white hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0
            flex items-center justify-center gap-2 w-full sm:w-auto`}
          >
            {isLoading ? (
              <>
                <LoaderIcon size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Predict Air Quality Index
              </>
            )}
          </button>
        </div>
      </form>
      
      {predictionResult && (
        <div className="px-6 pb-6">
          <ResultDisplay result={predictionResult} />
        </div>
      )}
    </div>
  );
};

export default AirQualityForm;