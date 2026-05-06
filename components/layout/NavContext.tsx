'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface NavContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const NavContext = createContext<NavContextValue>({
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function NavProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <NavContext.Provider value={{ mobileOpen, setMobileOpen }}>{children}</NavContext.Provider>;
}

export function useNav() {
  return useContext(NavContext);
}
