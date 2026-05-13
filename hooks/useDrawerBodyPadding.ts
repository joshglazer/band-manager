import { useCallback } from 'react';

export function useDrawerBodyPadding() {
  return useCallback((node: HTMLDivElement | null) => {
    if (node) {
      document.body.style.paddingBottom = `${node.offsetHeight}px`;
    } else {
      document.body.style.paddingBottom = '';
    }
  }, []);
}
