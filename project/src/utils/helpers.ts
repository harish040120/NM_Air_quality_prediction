// Simple delay function to simulate API calls
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Format date string to readable format
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    return dateString;
  }
};

// Validate latitude value
export const isValidLatitude = (lat: string): boolean => {
  const latNum = parseFloat(lat);
  return !isNaN(latNum) && latNum >= -90 && latNum <= 90;
};

// Validate longitude value
export const isValidLongitude = (lng: string): boolean => {
  const lngNum = parseFloat(lng);
  return !isNaN(lngNum) && lngNum >= -180 && lngNum <= 180;
};