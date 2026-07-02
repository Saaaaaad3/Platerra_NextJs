"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * A `next/image` (used with `fill` inside a `relative` container) that shows a
 * pulsing skeleton until the image actually loads, then fades in — so we never
 * flash an empty box. Falls back to hiding the skeleton on error (e.g. a stale
 * URL) rather than pulsing forever.
 */
export default function SmartImage({ className = "", onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // If the image is already cached/complete before hydration, `onLoad` may never
  // fire — detect that on mount so the skeleton doesn't stick.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <>
      {!loaded && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-pulse bg-brand-on-surface/10"
        />
      )}
      <Image
        ref={ref}
        {...props}
        className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={() => setLoaded(true)}
      />
    </>
  );
}
