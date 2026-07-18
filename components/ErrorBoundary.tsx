import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      let details = null;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = `Firestore Error: ${parsed.error}`;
            details = (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-400 overflow-auto max-h-40">
                <pre>{JSON.stringify(parsed, null, 2)}</pre>
              </div>
            );
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900/50 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-black text-white uppercase italic mb-2">Application Error</h2>
            <p className="text-slate-400 text-sm mb-6">{errorMessage}</p>
            {details}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-emerald-500 text-black font-black uppercase italic rounded-xl hover:bg-emerald-400 transition-all active:scale-95"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
