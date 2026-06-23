import { AbsoluteFill, Img, interpolate, useCurrentFrame, Easing } from "remotion";
import type { PromoScene } from "../timeline";

type Props = { scene: PromoScene; durationInFrames: number };

export const SceneClimax: React.FC<Props> = ({ scene, durationInFrames }) => {
  const frame = useCurrentFrame();

  const bgScale = interpolate(frame, [0, durationInFrames], [1.0, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = interpolate(
    frame,
    [0, durationInFrames * 0.3, durationInFrames * 0.6, durationInFrames],
    [0, 0.15, 0.1, 0.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      {scene.backgroundImage && (
        <AbsoluteFill style={{ transform: `scale(${bgScale})` }}>
          <Img
            src={scene.backgroundImage}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }}
          />
        </AbsoluteFill>
      )}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, rgba(59,130,246,${glowPulse}) 0%, transparent 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 160px",
          gap: 20,
        }}
      >
        {scene.copy.map((line, i) => {
          const delay = i * 25 + 10;
          const lineOpacity = interpolate(frame, [delay, delay + 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const lineScale = interpolate(frame, [delay, delay + 20], [0.9, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const isMain = i === 0;
          return (
            <div
              key={i}
              style={{
                opacity: lineOpacity,
                transform: `scale(${lineScale})`,
                fontSize: isMain ? 52 : 36,
                fontWeight: isMain ? 700 : 400,
                color: isMain ? "#ffffff" : "#cbd5e1",
                textAlign: "center",
                fontFamily: "Inter, sans-serif",
                letterSpacing: isMain ? -1 : 0,
              }}
            >
              {line}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};