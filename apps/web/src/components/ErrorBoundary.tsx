import { Component, type ReactNode } from "react";

/** Surfaces render errors instead of silently unmounting the tree (graceful degradation). */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[100dvh] bg-[#0b1220] p-10 text-white">
          <h1 className="text-xl font-semibold">Something rendered wrong</h1>
          <pre className="mt-3 max-w-2xl overflow-auto rounded-lg bg-white/10 p-4 text-sm text-amber-200">
            {String(this.state.error?.message)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
