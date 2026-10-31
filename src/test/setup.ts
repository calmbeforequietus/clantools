import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") {
  if (!globalThis.localStorage || typeof globalThis.localStorage.getItem !== "function") {
    try {
      Object.defineProperty(globalThis, "localStorage", {
        value: window.localStorage,
        writable: true,
        configurable: true,
      });
    } catch {
      // ignore
    }
  }
}

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
