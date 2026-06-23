import { AbsoluteFill, Img, interpolate, useCurrentFrame, Easing } from "remotion";
import type { PromoScene } from "../timeline";

type Props = { scene: PromoScene; durationInFrames: number };

export const SceneShowcase: React.FC<Props> = ({ scene, durationInFrames }) => {
  const frame = useCurrentFrame();

  const bgScale = interpolate(frame, [0, durationInFrames], [1.0, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleOpacity = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleX = interpolate(frame, [5, 25], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const panelX = interpolate(frame, [0, durationInFrames], [0, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          background: "linear-gradient(135deg, rgba(2,6,23,0.7) 0%, rgba(15,23,42,0.85) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "80px 120px",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            opacity: titleOpacity,
            transform: `translateX(${titleX}px)`,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: "Inter, sans-serif",
              letterSpacing: -1,
              marginBottom: 24,
            }}
          >
            {scene.title}
          </div>
          {scene.copy.map((item, i) => {
            const delay = i * 15 + 30;
            const itemOpacity = interpolate(frame, [delay, delay + 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemX = interpolate(frame, [delay, delay + 20], [-20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  transform: `translateX(${itemX}px)`,
                  fontSize: 28,
                  fontWeight: 500,
                  color: "#94a3b8",
                  fontFamily: "Inter, sans-serif",
                  letterSpacing: 0,
                  padding: "8px 0",
                  borderLeft: `3px solid ${scene.accent}`,
                  paddingLeft: 16,
                  marginBottom: 8,
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `translateX(${panelX}px)`,
          }}
        >
          <div
            style={{
              width: 500,
              height: 320,
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: 20,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: 40,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.1)",
            }}
          >
            {scene.copy.map((item, i) => {
              const delay = i * 18 + 40;
              const barWidth = interpolate(frame, [delay, delay + 30], [0, 100], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              });
              return (
                <div
                  key={i}
                  style={{
                    width: "100%",
                    marginBottom: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      color: "#cbd5e1",
                      fontFamily: "Inter, sans-serif",
                      letterSpacing: 0,
                    }}
                  >
                    {item}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: 6,
                      background: "rgba(51, 65, 85, 0.6)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${scene.accent}, #60a5fa)`,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};