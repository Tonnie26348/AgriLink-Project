import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'

console.log("AgriLink: Mounting Application...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("AgriLink: Failed to find the root element");
} else {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log("AgriLink: Render initiated");
}

