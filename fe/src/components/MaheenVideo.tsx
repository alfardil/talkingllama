import { useEffect, useRef } from "react";

interface MaheenVideoProps {
  className?: string;
}

export function MaheenVideo({ className }: MaheenVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Function to handle video errors
    const handleError = () => {
      console.error("Error loading video");
    };

    // Add error handler
    video.addEventListener("error", handleError);

    // Cleanup
    return () => {
      video.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <div
      className={`relative w-full aspect-video rounded-base overflow-hidden border-2 border-main shadow-shadow ${className}`}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src="http://localhost:8000/api/tavus/conversations"
      />
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
    </div>
  );
}
