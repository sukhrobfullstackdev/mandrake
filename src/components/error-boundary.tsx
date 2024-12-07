'use client';

import { Component, ReactNode, isValidElement } from 'react';

type FallbackRenderer = (error: Error, reset: () => void) => React.ReactNode;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  prevScope: string;
}

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback: ReactNode | FallbackRenderer;
  scope?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, prevScope: props.scope || 'error-boundary' };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState) {
    if (state.prevScope !== props.scope) {
      return {
        hasError: false,
        error: undefined,
        prevScope: props.scope,
      };
    }

    return state;
  }

  componentDidCatch(error: Error) {
    monitoring.addError(error, {
      scope: this.props.scope,
    });
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError || !error) {
      return children;
    }

    if (isValidElement(fallback) || typeof fallback === 'string') {
      return fallback;
    } else if (typeof fallback === 'function') {
      return fallback(error, () => {
        this.setState({ hasError: false, error: undefined, prevScope: this.props.scope || 'error-boundary' });
      });
    }

    return null;
  }
}
