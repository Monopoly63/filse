import { AbsoluteFill, Img, interpolate, useCurrentFrame, Easing } from "remotion";
import type { PromoScene } from "../timeline";

type Props = { scene: PromoScene; durationInFrames: number };

const FEATURE_ICONS: Record<string, string> = {
  Workspaces: "📁",
  Resources: "📄",
  "Study Chat": "💬",
  Flashcards: "🗂️",
  Quizzes: "✅",
  Certificates: "🏆",
  "Progress Tracking": "📈",
  "Interactive Quizzes": "❓",
};

export const SceneFeatures: React.FC<Props> = ({ scene, durationInFrames }) => {
  const frame = useCurrentFrame();

  const bgScale = interpolate(frame, [0, durationInFrames], [1.02, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {scene.backgroundImage && (
        <AbsoluteFill style={{ transform: `scale(${bgScale})` }}>
          <Img
            src={scene.backgroundImage}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
          />
        </AbsoluteFill>
      )}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, rgba(2,6,23,0.4) 0%, rgba(2,6,23,0.85) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            maxWidth: 1200,
          }}
        >
          {scene.copy.map((item, i) => {
            const delay = i * 12 + 10;
            const itemOpacity = interpolate(frame, [delay, delay + 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemY = interpolate(frame, [delay, delay + 18], [40, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            const itemScale = interpolate(frame, [delay, delay + 18], [0.85, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });

            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  transform: `translateY(${itemY}px) scale(${itemScale})`,
                  background: "rgba(30, 41, 59, 0.8)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: 16,
                  padding: "20px 32px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 28 }}>{FEATURE_ICONS[item] || "⚡"}</span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    fontFamily: "Inter, sans-serif",
                    letterSpacing: 0,
                  }}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};