import { AbsoluteFill, Audio, Sequence, interpolate, useVideoConfig } from "remotion";
import { AspectFrame } from "./components/AspectFrame";
import type { Orientation } from "./timeline";
import { promoAudio, promoScenes, TOTAL_FRAMES } from "./timeline";
import { SceneProblem } from "./scenes/SceneProblem";
import { SceneReveal } from "./scenes/SceneReveal";
import { SceneFeatures } from "./scenes/SceneFeatures";
import { SceneShowcase } from "./scenes/SceneShowcase";
import { SceneFounders } from "./scenes/SceneFounders";
import { SceneClimax } from "./scenes/SceneClimax";
import { SceneEndCard } from "./scenes/SceneEndCard";

export type PromoVideoProps = {
  sourceOrientation: Orientation;
  targetOrientation: Orientation;
  width?: number;
  height?: number;
  fps?: number;
};

export const PromoVideo: React.FC<PromoVideoProps> = ({
  sourceOrientation,
  targetOrientation,
}) => {
  const { fps } = useVideoConfig();

  const bgmVolume = (frame: number): number => {
    const { fadeInFrames, fadeOutFrames, baseVolume, duckVolume } = promoAudio;
    const fadeIn = interpolate(frame, [0, fadeInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fadeOut = interpolate(
      frame,
      [TOTAL_FRAMES - fadeOutFrames, TOTAL_FRAMES],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const narrationActive = promoScenes.some((scene) => {
      if (!scene.narrationUrl) return false;
      const startFrame = Math.round(scene.start * fps);
      const endFrame = Math.round((scene.start + scene.duration) * fps);
      return frame >= startFrame && frame < endFrame;
    });
    const targetVolume = narrationActive ? duckVolume : baseVolume;
    return Math.min(fadeIn, fadeOut) * targetVolume;
  };

  const renderScene = (sceneId: string, durationInFrames: number) => {
    const scene = promoScenes.find((s) => s.id === sceneId)!;
    switch (scene.kind) {
      case "problem":
        return <SceneProblem scene={scene} durationInFrames={durationInFrames} />;
      case "reveal":
        return <SceneReveal scene={scene} durationInFrames={durationInFrames} />;
      case "features":
        return <SceneFeatures scene={scene} durationInFrames={durationInFrames} />;
      case "showcase":
        return <SceneShowcase scene={scene} durationInFrames={durationInFrames} />;
      case "founders":
        return <SceneFounders scene={scene} durationInFrames={durationInFrames} />;
      case "climax":
        return <SceneClimax scene={scene} durationInFrames={durationInFrames} />;
      case "endcard":
        return <SceneEndCard scene={scene} durationInFrames={durationInFrames} />;
      default:
        return null;
    }
  };

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {promoAudio.backgroundMusicUrl ? (
        <Audio
          src={promoAudio.backgroundMusicUrl}
          volume={bgmVolume}
          endAt={TOTAL_FRAMES}
        />
      ) : null}
      <AspectFrame
        sourceOrientation={sourceOrientation}
        targetOrientation={targetOrientation}
      >
        <AbsoluteFill style={{ background: "#020617" }}>
          {promoScenes.map((scene) => {
            const startFrame = Math.round(scene.start * fps);
            const durationInFrames = Math.round(scene.duration * fps);
            return (
              <Sequence
                key={scene.id}
                from={startFrame}
                durationInFrames={durationInFrames}
              >
                {scene.narrationUrl ? (
                  <Audio
                    src={scene.narrationUrl}
                    volume={1}
                    endAt={durationInFrames}
                  />
                ) : null}
                {renderScene(scene.id, durationInFrames)}
              </Sequence>
            );
          })}
        </AbsoluteFill>
      </AspectFrame>
    </AbsoluteFill>
  );
};