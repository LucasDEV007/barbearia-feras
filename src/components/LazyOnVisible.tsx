import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

interface LazyOnVisibleProps {
  children: ReactNode;
  minHeightMobile: number;
  minHeightDesktop: number;
  bgClass?: string;
  rootMargin?: string;
}

const LazyOnVisible = ({
  children,
  minHeightMobile,
  minHeightDesktop,
  bgClass = "",
  rootMargin = "600px",
}: LazyOnVisibleProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const minHeight = isMobile ? minHeightMobile : minHeightDesktop;

  const placeholder = (
    <div
      ref={ref}
      className={bgClass}
      style={{ minHeight: `${minHeight}px` }}
      aria-hidden="true"
    />
  );

  if (!visible) return placeholder;

  return (
    <Suspense fallback={placeholder}>
      <div style={{ animation: "lazyFadeIn 150ms ease-out" }}>{children}</div>
    </Suspense>
  );
};

export default LazyOnVisible;