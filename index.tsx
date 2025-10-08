import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './components/LanguageContext';
import { planetImageUrls } from './config';

// --- START PRELOADING ---
// Combine all image URLs that need to be preloaded for a smooth experience.
const allImageUrlsToPreload = [...new Set(planetImageUrls)];

// Start preloading images immediately upon script execution.
// This allows the browser to fetch them in the background while the rest of the app initializes.
allImageUrlsToPreload.forEach(url => {
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