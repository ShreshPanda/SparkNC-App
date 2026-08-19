import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

interface AnimationContextValue {
  reduceMotion: boolean;
  timing: {
    micro: number;
    nav: number;
    sheet: number;
    celebration: number;
  };
}

const AnimationContext = createContext<AnimationContextValue>({
  reduceMotion: false,
  timing: { micro: 150, nav: 250, sheet: 300, celebration: 1200 },
});

export function useAnimation() {
  return useContext(AnimationContext);
}

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((value) => {
      if (mounted) setReduceMotion(Boolean(value));
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      setReduceMotion(Boolean(value));
    });
    return () => {
      mounted = false;
      if (typeof (subscription as any)?.remove === 'function') {
        (subscription as any).remove();
      }
    };
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        reduceMotion,
        timing: { micro: reduceMotion ? 0 : 150, nav: reduceMotion ? 0 : 250, sheet: reduceMotion ? 0 : 300, celebration: reduceMotion ? 0 : 1200 },
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}
