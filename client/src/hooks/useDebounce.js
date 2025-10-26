// client/src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce any value.
 * @param {any} value - The value to debounce (e.g., a search term)
 * @param {number} delay - The delay in milliseconds
 * @returns {any} The debounced value
 */
function useDebounce(value, delay) {
  // State to hold the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Set up a timer to update the debounced value after the delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // This is the cleanup function:
      // If the value changes again (e.g., user types another letter),
      // this will clear the *previous* timer before setting a new one.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-run if value or delay changes
  );

  return debouncedValue;
}

export default useDebounce;