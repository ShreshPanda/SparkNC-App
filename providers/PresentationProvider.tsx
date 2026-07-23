import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type PresentationContextValue = {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (value: boolean) => void;
};

const PresentationContext = createContext<PresentationContextValue | undefined>(undefined);

export function PresentationProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  const toggle = useCallback(() => setEnabled((current) => !current), []);

  const value = useMemo(() => ({ enabled, toggle, setEnabled }), [enabled, toggle]);

  return <PresentationContext.Provider value={value}>{children}</PresentationContext.Provider>;
}

export function usePresentation() {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentation must be used within PresentationProvider');
  }
  return context;
}
