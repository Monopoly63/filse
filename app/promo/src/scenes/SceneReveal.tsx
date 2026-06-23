import { AbsoluteFill, Img, interpolate, useCurrentFrame, Easing } from "remotion";
import type { PromoScene } from "../timeline";

type Props = { scene: PromoScene; durationInFrames: number };

export const SceneReveal: React.FC<Props> = ({ scene, durationInFrames }) => {
  const frame = useCurrentFrame();

  const bgScale = interpolate(frame, [0, durationInFrames], [1.0, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoScale = interpolate(frame, [0, 25], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [30, 50], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowIntensity = interpolate(frame, [0, 20, 40, durationInFrames], [0, 30, 20, 15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {scene.backgroundImage && (
        <AbsoluteFill style={{ transform: `scale(${bgScale})` }}>
          <Img
            src={scene.backgroundImage}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      )}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 60%)",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            fontSize: 96,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            letterSpacing: -2,
            textShadow: `0 0 ${glowIntensity}px rgba(59,130,246,0.8), 0 0 ${glowIntensity * 2}px rgba(59,130,246,0.4)`,
          }}
        >
          {scene.copy[0]}
        </div>
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontSize: 28,
            fontWeight: 400,
            color: "#94a3b8",
            textAlign: "center",
            marginTop: 16,
            fontFamily: "Inter, sans-serif",
            letterSpacing: 1,
          }}
        >
          {scene.copy[1]}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};