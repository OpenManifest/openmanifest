import * as React from 'react';

interface IDefaultErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface IDefaultErrorBoundaryState {
  error?: Error;
}
export default class ErrorBoundary extends React.Component<
  IDefaultErrorBoundaryProps,
  IDefaultErrorBoundaryState
> {
  constructor(props) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  public componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error(error, errorInfo);
  }

  public render() {
    const { fallback, children } = this.props;
    const { error } = this.state;
    if (error) {
      return fallback;
    }
    return children;
  }
}
