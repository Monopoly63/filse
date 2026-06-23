import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import type { Orientation } from "../timeline";

type AspectFrameProps = {
  sourceOrientation: Orientation;
  targetOrientation: Orientation;
  children: ReactNode;
};

const aspectRatioCss: Record<Orientation, string> = {
  landscape: "16 / 9",
  portrait: "9 / 16",
  square: "1 / 1",
};

const aspectRatioNumber: Record<Orientation, number> = {
  landscape: 16 / 9,
  portrait: 9 / 16,
  square: 1,
};

export const AspectFrame: React.FC<AspectFrameProps> = ({
  sourceOrientation,
  targetOrientation,
  children,
}) => {
  let innerStyle: CSSProperties;

  if (sourceOrientation === targetOrientation) {
    innerStyle = { width: "100%", height: "100%" };
  } else {
    const sourceRatio = aspectRatioNumber[sourceOrientation];
    const targetRatio = aspectRatioNumber[targetOrientation];
    innerStyle =
      sourceRatio > targetRatio
        ? { width: "100%", aspectRatio: aspectRatioCss[sourceOrientation] }
        : { height: "100%", aspectRatio: aspectRatioCss[sourceOrientation] };
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          ...innerStyle,
          position: "relative",
          overflow: "hidden",
          background: "#050505",
        }}
      >
        {children}
      </div>
    </div>
  );
};
