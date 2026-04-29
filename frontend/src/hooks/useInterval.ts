import { useEffect, useRef } from "react";

/** React hook-safe version of interval().
 * Source: https://usehooks-ts.com/react-hook/use-timeout
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallbackRef = useRef(callback);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallbackRef.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    const id = setInterval(() => savedCallbackRef.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}

export default useInterval;
