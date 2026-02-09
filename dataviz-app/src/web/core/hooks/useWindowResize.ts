import { useState, useEffect, useRef } from "react";

export const useWindowResize = (callback?: (width: number) => void) => {
  const [width, setWidth] = useState(window.innerWidth);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWidth(newWidth);
      callbackRef.current?.(newWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};