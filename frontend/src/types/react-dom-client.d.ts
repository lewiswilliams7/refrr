declare module 'react-dom/client' {
  import * as React from 'react';

  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }

  export interface RootOptions {
    hydrate?: boolean;
    onRecoverableError?: (error: unknown) => void;
  }

  export function createRoot(
    container: Element | DocumentFragment,
    options?: RootOptions
  ): Root;

  export function hydrateRoot(
    container: Element | DocumentFragment,
    children: React.ReactNode,
    options?: RootOptions
  ): Root;
} 