import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import type { PromoScene } from "../timeline";

type Props = { scene: PromoScene; durationInFrames: number };

export const SceneEndCard: React.FC<Props> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const logoOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [5, 25], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const taglineOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const featuresOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const featuresY = interpolate(frame, [40, 55], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlOpacity = interpolate(frame, [65, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowIntensity = interpolate(frame, [0, 30, 60, durationInFrames], [0, 20, 15, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 50%)`,
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "Inter, sans-serif",
            letterSpacing: -2,
            textShadow: `0 0 ${glowIntensity}px rgba(59,130,246,0.6)`,
          }}
        >
          Shairley
        </div>
        <div
          style={{
            opacity: taglineOpacity,
            fontSize: 24,
            fontWeight: 400,
            color: "#94a3b8",
            fontFamily: "Inter, sans-serif",
            letterSpacing: 1,
          }}
        >
          Where Excellence Meets Learning
        </div>
        <div
          style={{
            opacity: featuresOpacity,
            transform: `translateY(${featuresY}px)`,
            fontSize: 20,
            fontWeight: 500,
            color: "#64748b",
            fontFamily: "Inter, sans-serif",
            letterSpacing: 0,
            marginTop: 24,
          }}
        >
          Organize. Collaborate. Achieve.
        </div>
        <div
          style={{
            opacity: ctaOpacity,
            fontSize: 28,
            fontWeight: 600,
            color: "#3b82f6",
            fontFamily: "Inter, sans-serif",
            letterSpacing: 0,
            marginTop: 32,
          }}
        >
          Start Today
        </div>
        <div
          style={{
            opacity: urlOpacity,
            fontSize: 18,
            fontWeight: 400,
            color: "#475569",
            fontFamily: "Inter, sans-serif",
            letterSpacing: 0,
            marginTop: 12,
          }}
        >
          shairley.vercel.app
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};