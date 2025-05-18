import React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import AirQualityForm from './components/AirQualityForm';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider>
      <div className={`min-h-screen transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-teal-50 to-blue-50 animate-gradient'
      }`}>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/10 pointer-events-none" />
        
        <header className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-display bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 tracking-wider">
              Air Quality Index Predictor
            </h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full glassmorphism
            transition-all duration-300 hover:scale-110 hover:shadow-lg ${
              isDarkMode ? 'text-yellow-400' : 'text-gray-700'
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <SunIcon size={24} /> : <MoonIcon size={24} />}
          </button>
        </header>

        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <AirQualityForm />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;