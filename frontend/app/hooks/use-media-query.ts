import React, { useState, useEffect } from "react";

type BreakpointKeys = "isMobile" | "isTablet" | "isDesktop";
type BreakpointState = { [key in BreakpointKeys]?: boolean };

const breakpoints: { [key in BreakpointKeys]: string } = {
  isMobile: "(max-width: 767px)",
  isTablet: "(min-width: 768px) and (max-width: 1023px)",
  isDesktop: "(min-width: 1024px)",
};

export function useBreakpoints(): BreakpointState {
  const [currentBreakpoints, setCurrentBreakpoints] = useState<BreakpointState>(
    {}
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryLists: { [key in BreakpointKeys]?: MediaQueryList } = {};
    const keys = Object.keys(breakpoints) as BreakpointKeys[];

    const updateBreakpoints = () => {
      const newBreakpoints = keys.reduce<BreakpointState>((acc, key) => {
        acc[key] = mediaQueryLists[key]?.matches ?? false;
        return acc;
      }, {});

      if (
        JSON.stringify(newBreakpoints) !== JSON.stringify(currentBreakpoints)
      ) {
        setCurrentBreakpoints(newBreakpoints);
      }
    };

    keys.forEach((key) => {
      mediaQueryLists[key] = window.matchMedia(breakpoints[key]);
      mediaQueryLists[key]?.addEventListener("change", updateBreakpoints);
    });

    updateBreakpoints();

    return () => {
      keys.forEach((key) => {
        mediaQueryLists[key]?.removeEventListener("change", updateBreakpoints);
      });
    };
  }, []);

  return currentBreakpoints;
}
