# Remotion Promo Video Template

This template is for generating project promotional videos with Remotion.

Before following this runbook, read `promo-video-production` for the required end-to-end workflow and completion criteria.
Read `remotion-best-practices` for validation, render-command, and export-debugging rules. For final export, follow its *Render and export* section in the deployed `<workspace>/.atoms/skills/remotion-best-practices/SKILL.md`. Do not resolve that skill path relative to `app/promo` or your current `cwd`. This README is only the short template runbook; the detailed workflow and command rules live in those skill docs.

## Template Runbook

1. Inspect the project context and write `promo_storyboard.md` before generating assets or editing timeline code. For promo/remotion runs, `promo_storyboard.md` is the only planning artifact; do not create or maintain a separate `todo.md`.
2. If narration is used, lock narration timing in `promo_storyboard.md` first; then lock one global BGM track in the same file; only after that generate the remaining assets. Always use the exact URLs or paths returned by the tools.
3. Replace the starter `promoScenes`, `promoAudio`, and `src/scenes/*` implementations with storyboard-specific content.
   Use `src/scenes/` as the default scene implementation layer. If you change the runtime contract in `src/timeline.ts`, update `src/PromoVideo.tsx` and the affected `src/scenes/*` files in the same pass. Keep `src/app-demo/AppDemoFrame.tsx` as an optional adapter example, not the default runtime path.
4. Validate from `app/promo`:

```console
pnpm install
pnpm run verify:versions
pnpm run lint
pnpm run verify:compositions
```

5. After `verify:compositions` passes, read the *Render and export* section of `<workspace>/.atoms/skills/remotion-best-practices/SKILL.md`, then call `RemotionPromoRenderer.render` directly. Do not use `Terminal.run`, `pnpm run render*`, `pnpm run build`, or `pnpm exec remotion render` as the agent delivery path:

```xml
<RemotionPromoRenderer.render>
<promo_dir>/absolute/path/to/app/promo</promo_dir>
<width>1920</width>
<height>1080</height>
<source_orientation>landscape</source_orientation>
</RemotionPromoRenderer.render>
```

`verify:compositions` is a pre-render check only. After it passes, read the *Render and export* section of `<workspace>/.atoms/skills/remotion-best-practices/SKILL.md` and call `RemotionPromoRenderer.render` directly. Do not stop at "ready to export", and do not call `RoleZero.reply_to_human` or use `<end></end>` before the renderer succeeds.

`RemotionPromoRenderer.render` runs the matching smoke render first and continues to the full render only if smoke succeeds. Do not separately run `render:smoke*` as part of the normal agent workflow, and do not switch to CLI full-render commands after a successful smoke pass.

Do not use `pnpm run build` as validation. In this template it is a lower-level landscape render script, not a compile-only check.

Lower-level `render:smoke*`, `render:*`, `build`, and `still:*` scripts are for local/manual debugging only. Agent delivery must keep both smoke and full render inside `RemotionPromoRenderer.render`. `prewarm:browser` may download or verify Headless Chrome on the first browser-backed run.

## Template Facts

Three preset compositions are registered:

| Composition ID | Default size | Default fps | Default duration | Typical target |
| --- | --- | --- | --- | --- |
| `PromoLandscape` | 1920x1080 | 30 | 60s | 16:9 web / YouTube |
| `PromoPortrait` | 1080x1920 | 30 | 60s | 9:16 TikTok / Reels / Shorts |
| `PromoSquare` | 1080x1080 | 30 | 60s | 1:1 social feed |

- `src/timeline.ts` owns `promoScenes` and `getPromoTotalSeconds()`. Total duration is not a render-time prop; rewrite the scenes to change the final length.
- `src/Root.tsx` registers the preset compositions and uses `calculateMetadata` for prop-driven sizing.
- `src/PromoVideo.tsx` reads fps from `useVideoConfig()`, so fps overrides keep scene timing aligned.
- `sourceOrientation` describes how the storyboard content was designed; `targetOrientation` is derived from the export aspect.
- Layout is tuned for 1080p fixed pixel sizing. Review spacing and text scale before unusual export sizes.

## Common Pitfalls

- The `60s` values in the table are the starter default target, not a hard cap. Once the storyboard is locked, actual duration must come from `promo_storyboard.md` and `src/timeline.ts`.
- Keep `promo_storyboard.md`, measured audio timing, and `src/timeline.ts` in sync. Do not assume the table defaults override the locked scene timing.
- Do not shorten the locked video just because BGM came out short. Keep the scene timing and adapt the music with trim, minimal loop, or regeneration.
- If BGM fails or is omitted, narration timing still must be measured and written back before finalizing `src/timeline.ts`. Record the BGM omission/failure in `promo_storyboard.md` instead of falling back to fixed scene durations.
- The starter runtime is still coupled: `src/timeline.ts`, `src/PromoVideo.tsx`, and `src/scenes/*` share one runtime contract. If you rewrite `PromoScene` or `promoAudio`, update the sequencer and affected scene files together. A partial rewrite can still pass file writes but fail `tsc` during `pnpm run lint`.
- Cheap lint misses are avoidable: remove unused imports/vars while writing, omit `Sequence from={0}`, and keep motion purely frame-driven instead of relying on CSS `animation` / `transition`, timers, or other non-deterministic patterns.
- Do not rely on `AbsoluteFill` defaults for horizontal bands. It defaults to `display: flex` and `flexDirection: column`; set `flexDirection: "row"` explicitly or use another wrapper when building step strips, before/after rows, or two-column panels.

## Structure

- `src/index.ts` - entry point.
- `src/timeline.ts` - scene data and `getPromoTotalSeconds()`.
- `src/PromoVideo.tsx` - main Remotion composition.
- `src/Root.tsx` - composition registry and metadata wiring.
- `src/components/` - framing and shared layout helpers such as `AspectFrame`.
- `src/scenes/` - default scene implementation layer for storyboard-specific visuals.
- `src/app-demo/` - optional adapters/examples for real frontend components or product-like demos.

Keep the flat `src/` layout. Do not relocate these files under a subdirectory such as `src/remotion/`.

## Product Demos

If the promo is about another app/project already named in the request or earlier context, lock that source project root / frontend path in `promo_storyboard.md` before leaning on the starter demo adapters. After you switch into `app/promo`, keep using that same source path; do not conclude there is no source app just because the promo workspace lacks `app/frontend`.

Prefer importing independently renderable frontend components into `src/app-demo/`.

`src/app-demo/AppDemoFrame.tsx` is an optional fallback example, not the default storyboard pattern when a real source screen exists.

Before coding, add a compact product-demo shot table to `promo_storyboard.md` with `shot_type`, `source route/page`, `source files`, `viewport focus`, and `implementation mode`.

If one real page contains multiple beats, keep reusing that page with different crops, highlights, or scroll positions. Do not replace it with separate floating cards unless those cards already exist in the product UI.

For shots sourced from a real page, keep enough surrounding page context to make the screen recognizable. A viewport focus is a crop/highlight inside the page frame, not a detached panel on an empty background unless the real UI is already isolated that way.

For `ui-demo` shots, the real page or page crop should stay the main base layer for most of the shot. Abstract AI/tech backgrounds may support it, but should not replace the page and leave only one floating card.
A whole-page walkthrough does not mean the webpage has to fill the whole video frame. Prefer an embedded browser/app window with rounded corners, subtle chrome, shadow/glow, and an atmospheric outer background unless the shot truly needs a full-bleed crop.
Treat that embedded window as the dominant inset subject, not a decorative small panel; when one section matters, push the camera inside the same window instead of shrinking it to make room for large side copy.
If you add browser chrome or an address bar to that window, do not invent a domain. Use a verified public URL from the project, a non-URL page label, or leave the bar blank.

If several consecutive beats come from one real page workflow, keep that same page scaffold visible across those beats. A later submit/loading/success/result state should still be shown inside the real page frame, not as a centered button, spinner, toast, or result card over an abstract AI background.
Bad: an AI-generated result-showcase background with only a recreated result card in front. Good: keep the real page viewport in frame and emphasize the result area inside it.
If the core user journey happens on one page, prefer a camera-framed webpage walkthrough over isolated cards: show upload zone A fill, upload zone B fill, move or scroll to the real generate button if it sits lower on the page, then reveal loading and result in the real result area. Keep the same window shell across those beats and animate framing/highlights inside it.
For the final CTA/end card, do not draw a clickable-looking button. Use brand lockup, tagline, URL/handle, or plain end-card copy instead.

When the storyboard timing is locked, rewrite `promo_storyboard.md` to the real narration/BGM URLs, measured seconds, and final total duration. Do not leave placeholder `TBD` timing rows or an old total after `src/timeline.ts` has changed.

Use static fixtures and frame-driven state. Do not call live backend APIs during render.

If the real components are too coupled, recreate the key product moment with Remotion-native panels, cards, charts, and generated assets.
