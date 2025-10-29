import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './components/LanguageContext';
import { planetImageUrls } from './config';

// --- START PRELOADING ---
// Preload only the first few critical images to reduce initial load time.
// The rest of the images will be lazy-loaded in the background by the App component.
const criticalImagesToPreload = planetImageUrls.slice(0, 3);

// Start preloading critical images immediately upon script execution.
criticalImagesToPreload.forEach(url => {
  if (url) {
    const img = new Image();
    img.src = url;
  }
});
// --- END PRELOADING ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
