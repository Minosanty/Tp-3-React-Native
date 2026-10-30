// Polyfill for environments where native modules might be missing in Expo Go
try {
  const g = globalThis as any;
  if (g && typeof g === "object") {
    // Note: g.expo is a read-only JSI host object in Hermes/Expo Go, so never reassign g.expo = ...
    if (g.expo && g.expo.modules) {
      if (!g.expo.modules.ExpoTopicSubscriptionModule) {
        try {
          g.expo.modules.ExpoTopicSubscriptionModule = {
            subscribeToTopicAsync: async () => null,
            unsubscribeFromTopicAsync: async () => null,
            addListener: () => ({ remove: () => {} }),
            removeListeners: () => {},
          };
        } catch {
          // If modules object is sealed by JSI, silently continue
        }
      }
    }
  }
} catch {
  // Silent fallback
}

export {};
