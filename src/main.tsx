import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css';

// Error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          backgroundColor: '#FEE2E2',
          border: '1px solid #EF4444',
          borderRadius: '8px'
        }}>
          <h1 style={{ color: '#B91C1C' }}>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <pre style={{
            backgroundColor: '#FECACA',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple fallback component
const FallbackApp = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'white'
    }}>
      <h1 style={{ color: '#3B82F6', fontSize: '2.5rem', marginBottom: '1rem' }}>TalentSol</h1>
      <p style={{ color: '#4b5563', fontSize: '1.25rem', marginBottom: '2rem' }}>The Modern Recruiting Platform</p>
      <button
        style={{
          backgroundColor: '#3B82F6',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.375rem',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Log in
      </button>
    </div>
  );
};

// Try to load the App component, but use the FallbackApp if it fails
const AppWithErrorHandling = () => {
  try {
    const App = React.lazy(() => import('./App.tsx'));
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <App />
      </React.Suspense>
    );
  } catch (error) {
    console.error("Failed to load App component:", error);
    return <FallbackApp />;
  }
};

// Get the root element
const rootElement = document.getElementById('root');

// Render the app with error handling
if (rootElement) {
  try {
    createRoot(rootElement).render(
      <ErrorBoundary>
        <AppWithErrorHandling />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Failed to render app:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; margin: 20px; background-color: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px;">
        <h1 style="color: #B91C1C;">Failed to render application</h1>
        <p>${error instanceof Error ? error.message : String(error)}</p>
      </div>
    `;
  }
} else {
  console.error("Could not find root element");
  document.body.innerHTML = `
    <div style="padding: 20px; margin: 20px; background-color: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px;">
      <h1 style="color: #B91C1C;">Could not find root element</h1>
      <p>The application could not be mounted because the root element was not found.</p>
    </div>
  `;
}
