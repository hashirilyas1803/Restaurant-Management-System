import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // Access the current location (URL path)
  const { pathname } = useLocation();

  useEffect(() => {
    // Every time the pathname changes, snap to the top
    window.scrollTo(0, 0);
  }, [pathname]);

  // This component renders nothing; it's purely for logic
  return null;
};

export default ScrollToTop;