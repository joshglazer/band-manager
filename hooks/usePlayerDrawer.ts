import { useCallback, useEffect, useId, useState } from 'react';

const DRAWER_EVENT = 'player-drawer-open';

export function usePlayerDrawer() {
  const id = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent<{ id: string }>).detail?.id !== id) {
        setOpen(false);
      }
    };
    window.addEventListener(DRAWER_EVENT, handler);
    return () => window.removeEventListener(DRAWER_EVENT, handler);
  }, [id]);

  const openDrawer = useCallback(() => {
    window.dispatchEvent(new CustomEvent(DRAWER_EVENT, { detail: { id } }));
    setOpen(true);
  }, [id]);

  const closeDrawer = useCallback(() => setOpen(false), []);

  const drawerRef = useCallback((node: HTMLDivElement | null) => {
    document.body.style.paddingBottom = node ? `${node.offsetHeight}px` : '';
  }, []);

  return { open, openDrawer, closeDrawer, drawerRef };
}
