import { useEffect } from 'react';

/**
 * A Utility Hook that scrolls the window to the top 
 * whenever a specific value (like 'step' or 'tab') changes.
 */
const useScrollOnUpdate = (dependency) => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [dependency]); // Re-runs every time this value changes
};

export default useScrollOnUpdate;