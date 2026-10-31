import 'react-router';
import type { NavigateOptions, To } from 'react-router';

// This app uses BrowserRouter, whose navigation is synchronous. React Router 7
// also supports async data routers, so narrow the shared type to our router mode.
declare module 'react-router' {
  interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
    (delta: number): void;
  }
}
