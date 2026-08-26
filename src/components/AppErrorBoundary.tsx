import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Clunk entered its safe recovery screen.", error, info);
  }

  override render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="error-screen">
        <div className="model-badge">Bounded washer guidance</div>
        <h1>Clunk stopped safely.</h1>
        <p>
          The shared repair state could not be displayed. No further instructions are available
          until the page is reloaded.
        </p>
        <button
          className="button button--dark"
          type="button"
          onClick={() => window.location.reload()}
        >
          Reload Clunk
        </button>
      </main>
    );
  }
}
