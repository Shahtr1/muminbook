import { useEffect, useRef } from "react";

export const QuranReader = ({ chunks, fetchNextChunk }) => {
  const containerRef = useRef(null);
  const bottomSentinelRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log(entry.target);
          console.log("Intersecting:", entry.isIntersecting);

          // Only handling bottom sentinel for now
          if (
            entry.isIntersecting &&
            entry.target === bottomSentinelRef.current
          ) {
            console.log("✅ Fetching next chunk...");
            fetchNextChunk(); // 🔁 Enable this when ready
          }

          // 💤 Top sentinel logic disabled for now
          // if (entry.target === topSentinelRef.current) {
          //   console.log("Fetching previous chunk...");
          //   fetchPreviousChunk();
          // }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.1, // trigger when 10% of sentinel is visible
      },
    );

    // Delay observe until layout settles
    const timeout = setTimeout(() => {
      if (bottomSentinelRef.current) {
        observer.observe(bottomSentinelRef.current);
      }
    }, 100); // wait briefly for render

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [chunks, fetchNextChunk]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100vh", // more reliable than 100%
        overflowY: "auto",
        fontFamily: "ArabicFont",
        direction: "rtl",
        textAlign: "justify",
        fontSize: "30px",
      }}
    >
      {/* Top sentinel disabled for now */}
      {/* <div ref={topSentinelRef} style={{ height: "1px" }} /> */}

      {chunks.map((chunk) => (
        <span key={chunk.uuid}>
          {chunk.ayat} <span>﴿{chunk.uuid}﴾</span>{" "}
        </span>
      ))}

      <div
        ref={bottomSentinelRef}
        style={{
          height: "1px",
          display: "block",
          marginTop: "100px", // help it intersect properly
          background: "transparent",
        }}
      />
    </div>
  );
};
