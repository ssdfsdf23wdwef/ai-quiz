import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onReset?: () => void; // Optional callback to reset app state
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
    errorInfo: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error("ErrorBoundary: getDerivedStateFromError caught an error:", error);
    return { hasError: true, error, errorInfo: undefined };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary: componentDidCatch caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    console.log("ErrorBoundary: handleRetry called.");
    if (this.props.onReset) {
      console.log("ErrorBoundary: Calling onReset prop.");
      try {
        this.props.onReset();
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      } catch (resetError) {
        console.error("ErrorBoundary: Error occurred during onReset execution:", resetError);
        window.location.reload();
      }
    } else {
      console.warn("ErrorBoundary: No onReset handler provided. Reloading page.");
      window.location.reload();
    }
  }

  public render() {
    if (this.state.hasError) {
      const errorName = this.state.error?.name || "Hata";
      const errorMessageText = this.state.error?.message || "Bilinmeyen bir hata oluştu.";
      const errorStack = this.state.errorInfo?.componentStack || this.state.error?.stack;
      
      return (
        <div style={{
          position: 'fixed', // Ensure it's fixed
          top: '0',
          left: '0',
          width: '100vw', // Full viewport width
          height: '100vh', // Full viewport height
          backgroundColor: '#0f172a', // Even darker for contrast: secondary-900
          color: '#e2e8f0', // secondary-200
          padding: '20px',
          border: '1px solid #334155', // secondary-700
          borderRadius: '0px', // No radius if full screen
          textAlign: 'center',
          fontFamily: 'sans-serif', // Basic font
          boxSizing: 'border-box',
          zIndex: 9999998, // Extremely high z-index, but just below global error handler
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto', // Allow scrolling if content is too long
        }}>
          <div style={{maxWidth: '700px', width: '90%'}}> {/* Inner container for content */}
            <h2 style={{ 
              color: '#f8fafc', // white
              fontSize: '1.6em', 
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg aria-hidden="true" style={{width: '28px', height: '28px', marginRight: '12px', fill: '#f43f5e' /* red-500 */}} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.216 3.031-1.742 3.031H4.42c-1.526 0-2.492-1.697-1.742-3.031l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1.75-2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd"></path></svg>
              Uygulamada Bir Sorun Oluştu (React Sınırı)
            </h2>
            <div style={{
              backgroundColor: '#1e293b', // secondary-800
              padding: '15px',
              borderRadius: '6px',
              marginBottom: '20px',
              textAlign: 'left',
            }}>
              <p style={{ color: '#fecaca' /* red-200 */, marginBottom: '8px', fontWeight: 'bold' }}>
                {errorName}: {errorMessageText}
              </p>
              {errorStack && (
                <details style={{ marginBottom: '10px' }}>
                  <summary style={{ color: '#60a5fa' /* blue-400 */, cursor: 'pointer', outline: 'none' }}>
                    Hata Detayları (Geliştiriciler İçin)
                  </summary>
                  <pre style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    backgroundColor: '#020617', // black
                    color: '#94a3b8', // secondary-400
                    padding: '10px',
                    marginTop: '8px',
                    borderRadius: '4px',
                    maxHeight: '200px', // Reduced height for better overall layout
                    overflowY: 'auto',
                    fontSize: '0.85em',
                    border: '1px solid #334155' // secondary-700
                  }}>
                    {errorStack}
                  </pre>
                </details>
              )}
            </div>
            <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.9em' }}>
              Lütfen bu sorunu geliştirme ekibine bildirin. Tarayıcınızın konsolunu kontrol etmek de yardımcı olabilir.
            </p>
            
            {this.props.onReset && (
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#0ea5e9', // primary-500
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1em',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease',
                  marginRight: '10px',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')} // primary-600
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0ea5e9')} // primary-500
                title="Uygulamayı sıfırlamayı dene"
              >
                Tekrar Dene / Ana Sayfaya Dön
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 25px',
                backgroundColor: this.props.onReset ? '#64748b' : '#ef4444', // secondary-500 or red-500
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: '500',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = this.props.onReset ? '#475569' : '#dc2626')} // secondary-600 or red-600
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = this.props.onReset ? '#64748b' : '#ef4444')}
              title="Sayfayı yeniden yükle"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;