import { MutableRefObject, useRef } from 'react';

/** Hook for programmaticall setting focus */
export const useFocus = (): [MutableRefObject<unknown>, () => void] => {
  const htmlElRef = useRef(null);
  const setFocus = () => {
    htmlElRef.current && htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus];
};
