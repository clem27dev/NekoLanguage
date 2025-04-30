import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom CSS variables for neko theme colors
document.documentElement.style.setProperty('--neko-primary', '#FF6B6B');
document.documentElement.style.setProperty('--neko-secondary', '#4ECDC4');
document.documentElement.style.setProperty('--neko-accent', '#FFD166');
document.documentElement.style.setProperty('--neko-dark', '#1A1A2E');
document.documentElement.style.setProperty('--neko-light', '#F7F7F9');
document.documentElement.style.setProperty('--neko-gray', '#6C757D');

// Add Poppins and Source Code Pro fonts
const fontsLink = document.createElement('link');
fontsLink.rel = 'stylesheet';
fontsLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&family=Inter:wght@300;400;500&display=swap';
document.head.appendChild(fontsLink);

// Add custom styles
const style = document.createElement('style');
style.textContent = `
  .font-poppins {
    font-family: 'Poppins', sans-serif;
  }
  .font-code {
    font-family: 'Source Code Pro', monospace;
  }
  .font-inter {
    font-family: 'Inter', sans-serif;
  }
  body {
    font-family: 'Inter', sans-serif;
  }
`;
document.head.appendChild(style);

// Set page title
document.title = "nekoScript - Langage de programmation en français";

createRoot(document.getElementById("root")!).render(<App />);
