import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import type { PromoScene } from "../timeline";

type Props = { scene: PromoScene; durationInFrames: number };

export const SceneProblem: React.FC<Props> = ({ scene, durationInFrames }) => {
  const frame = useCurrentFrame();
  const progress = frame / durationInFrames;

  const bgScale = interpolate(frame, [0, durationInFrames], [1.05, 1.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const line1Opacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [15, 35], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const line2Opacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [70, 90], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const vignetteOpacity = interpolate(progress, [0, 0.5], [0.3, 0.7], {
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
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(2,6,23,${vignetteOpacity}) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 120px",
        }}
      >
        <div
          style={{
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
            fontSize: 52,
            fontWeight: 300,
            color: "#e2e8f0",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            letterSpacing: 0,
          }}
        >
          {scene.copy[0]}
        </div>
        <div
          style={{
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px)`,
            fontSize: 44,
            fontWeight: 600,
            color: "#94a3b8",
            textAlign: "center",
            marginTop: 24,
            fontFamily: "Inter, sans-serif",
            letterSpacing: 0,
          }}
        >
          {scene.copy[1]}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};