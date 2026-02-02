'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Note: ErrorBoundary is a class component and cannot use hooks.
// Translation strings are hardcoded per locale detection from document.documentElement.lang.
const errorMessages: Record<string, { message: string; refresh: string }> = {
  ko: { message: '예상치 못한 오류가 발생했어요', refresh: '새로고침' },
  en: { message: 'An unexpected error occurred', refresh: 'Refresh' },
  ja: { message: '予期せぬエラーが発生しました', refresh: '更新' },
  zh: { message: '发生了意外错误', refresh: '刷新' },
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center px-4">
              <p className="text-lg font-medium text-gray-700 mb-2">
                {(() => {
                  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'ko';
                  return errorMessages[lang]?.message || errorMessages.ko.message;
                })()}
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="text-violet-500 hover:underline text-sm"
              >
                {(() => {
                  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'ko';
                  return errorMessages[lang]?.refresh || errorMessages.ko.refresh;
                })()}
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
