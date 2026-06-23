import { interpolate } from "remotion";

type AppDemoFrameProps = {
  accent: string;
  progress: number;
  variant: "workflow" | "dashboard" | "content";
};

const labelsByVariant: Record<AppDemoFrameProps["variant"], string[]> = {
  workflow: ["Input", "Analyze", "Build", "Ship"],
  dashboard: ["Signals", "Metrics", "Insights", "Actions"],
  content: ["Brief", "Assets", "Draft", "Publish"],
};

const supportNotes = [
  "Keep the browser window dominant.",
  "Focus with crop or highlight inside that frame.",
  "Use copy as support, not as the main block.",
];

export const AppDemoFrame: React.FC<AppDemoFrameProps> = ({
  accent,
  progress,
  variant,
}) => {
  const labels = labelsByVariant[variant];
  const activeStep = Math.min(labels.length - 1, Math.floor(progress * labels.length));
  const panelScale = interpolate(progress, [0, 0.2], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "1.36fr 0.64fr",
        gap: 34,
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          transform: `scale(${panelScale})`,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(15, 23, 42, 0.78)",
          borderRadius: 30,
          padding: 28,
          boxShadow: "0 36px 110px rgba(0, 0, 0, 0.44)",
          display: "grid",
          gridTemplateRows: "auto 1fr",
        }}
      >
        <div
          style={{
            height: 56,
            display: "flex",
            gap: 10,
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            marginBottom: 28,
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#fb7185" }} />
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#facc15" }} />
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#4ade80" }} />
          <div style={{ marginLeft: 18, color: "#94a3b8", fontSize: 18, fontWeight: 700 }}>
            app-demo
          </div>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          {labels.map((label, index) => {
            const isActive = index <= activeStep;
            return (
              <div
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "42px 1fr 88px",
                  alignItems: "center",
                  gap: 16,
                  padding: 18,
                  borderRadius: 18,
                  background: isActive
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.055)",
                  color: "#f8fafc",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: isActive ? accent : "rgba(148,163,184,0.35)",
                    color: "#020617",
                    fontSize: 20,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ fontSize: 24, fontWeight: 850 }}>{label}</div>
                <div
                  style={{
                    color: isActive ? accent : "#64748b",
                    fontSize: 17,
                    fontWeight: 900,
                    textAlign: "right",
                    textTransform: "uppercase",
                  }}
                >
                  {isActive ? "Live" : "Next"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          alignSelf: "center",
          display: "grid",
          gap: 22,
          maxWidth: 420,
        }}
      >
        <div
          style={{
            color: accent,
            fontSize: 20,
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          Product demo adapter
        </div>
        <div
          style={{
            color: "#f8fafc",
            fontSize: 46,
            lineHeight: 1.02,
            fontWeight: 900,
          }}
        >
          Keep the page demo large and let copy support the frame.
        </div>
        <div
          style={{
            color: "#cbd5e1",
            fontSize: 22,
            lineHeight: 1.42,
            fontWeight: 500,
          }}
        >
          Import real components here when they can render with fixtures, or keep
          a Remotion-native recreation when the app is too coupled to live services.
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {supportNotes.map((note) => (
            <div
              key={note}
              style={{
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.09)",
                background: "rgba(255,255,255,0.045)",
                padding: "14px 16px",
                color: "#e2e8f0",
                fontSize: 18,
                lineHeight: 1.3,
                fontWeight: 600,
              }}
            >
              {note}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
