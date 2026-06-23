import { AbsoluteFill, Img, interpolate, useCurrentFrame, Easing } from "remotion";
import type { PromoScene } from "../timeline";

type Props = { scene: PromoScene; durationInFrames: number };

export const SceneFounders: React.FC<Props> = ({ scene, durationInFrames }) => {
  const frame = useCurrentFrame();

  const bgScale = interpolate(frame, [0, durationInFrames], [1.0, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headerY = interpolate(frame, [5, 25], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const card1Opacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const card1X = interpolate(frame, [30, 50], [-60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const card2Opacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const card2X = interpolate(frame, [45, 65], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const badgeGlow = interpolate(frame, [50, 70, 90, 110], [0, 15, 10, 15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {scene.backgroundImage && (
        <AbsoluteFill style={{ transform: `scale(${bgScale})` }}>
          <Img
            src={scene.backgroundImage}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }}
          />
        </AbsoluteFill>
      )}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, rgba(15,23,42,0.6) 0%, rgba(2,6,23,0.9) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
        }}
      >
        <div
          style={{
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
            fontSize: 36,
            fontWeight: 300,
            color: "#94a3b8",
            fontFamily: "Inter, sans-serif",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Built By
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 60 }}>
          <div
            style={{
              opacity: card1Opacity,
              transform: `translateX(${card1X}px)`,
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: 20,
              padding: "40px 48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              boxShadow: `0 0 ${badgeGlow}px rgba(59,130,246,0.3)`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 28,
                color: "#fff",
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#ffffff",
                fontFamily: "Inter, sans-serif",
                letterSpacing: 0,
              }}
            >
              Mousa Al-Awad
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: "#64748b",
                fontFamily: "Inter, sans-serif",
                letterSpacing: 0,
              }}
            >
              Lead Developer & Co-Founder
            </div>
          </div>
          <div
            style={{
              opacity: card2Opacity,
              transform: `translateX(${card2X}px)`,
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              borderRadius: 20,
              padding: "40px 48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              boxShadow: `0 0 ${badgeGlow}px rgba(34,197,94,0.3)`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 28,
                color: "#fff",
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#ffffff",
                fontFamily: "Inter, sans-serif",
                letterSpacing: 0,
              }}
            >
              Abdulmoin Hablas
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: "#64748b",
                fontFamily: "Inter, sans-serif",
                letterSpacing: 0,
              }}
            >
              CTO & Co-Founder
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};