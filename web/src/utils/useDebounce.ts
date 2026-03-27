import { useCallback, useRef } from "react";

export const useDebounce = <T extends (...args: unknown[]) => void>(
  callback: T,
  timeout = 100,
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current || 0);

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, timeout);
    },
    [callback, timeout],
  );

  return debouncedCallback;
};
