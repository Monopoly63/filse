import "./index.css";
import { Composition } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { z } from "zod";
import { PromoVideo } from "./PromoVideo";
import { FPS, getPromoTotalSeconds } from "./timeline";

const orientation = z.enum(["landscape", "portrait", "square"]);

const promoSchema = z.object({
  sourceOrientation: orientation,
  targetOrientation: orientation,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  fps: z.number().positive().optional(),
});

type PromoSchema = z.infer<typeof promoSchema>;

const buildCalculateMetadata = (defaults: {
  width: number;
  height: number;
  fps: number;
}): CalculateMetadataFunction<PromoSchema> => {
  return ({ props }) => {
    const width = props.width ?? defaults.width;
    const height = props.height ?? defaults.height;
    const fps = props.fps ?? defaults.fps;
    const totalSeconds = getPromoTotalSeconds();
    return {
      props: { ...props, width, height, fps },
      width,
      height,
      fps,
      durationInFrames: Math.max(1, Math.round(fps * totalSeconds)),
    };
  };
};

const TOTAL_FRAMES = FPS * getPromoTotalSeconds();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoLandscape"
        component={PromoVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        schema={promoSchema}
        defaultProps={
          {
            sourceOrientation: "landscape",
            targetOrientation: "landscape",
          } satisfies PromoSchema
        }
        calculateMetadata={buildCalculateMetadata({
          width: 1920,
          height: 1080,
          fps: FPS,
        })}
      />
      <Composition
        id="PromoPortrait"
        component={PromoVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        schema={promoSchema}
        defaultProps={
          {
            sourceOrientation: "landscape",
            targetOrientation: "portrait",
          } satisfies PromoSchema
        }
        calculateMetadata={buildCalculateMetadata({
          width: 1080,
          height: 1920,
          fps: FPS,
        })}
      />
      <Composition
        id="PromoSquare"
        component={PromoVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1080}
        schema={promoSchema}
        defaultProps={
          {
            sourceOrientation: "landscape",
            targetOrientation: "square",
          } satisfies PromoSchema
        }
        calculateMetadata={buildCalculateMetadata({
          width: 1080,
          height: 1080,
          fps: FPS,
        })}
      />
    </>
  );
};
