# Viewer QA — 2026-09-17

## Current revision: single Ear 02 / simplified UI

Ear 01/03 are removed from the current deployment. Their tests below are historical results for the original three-ear revision, not current UI controls. Current behavior uses only Ear 02, four location chips and front/reset controls; visible branding and model choice UI are removed. Pretendard 1.3.9 Regular/SemiBold webfonts are self-hosted, and HDR background blur is reduced from 0.65 to 0.15 without changing lighting.

Current checks: desktop 1180×720 / mobile 390×844; font loading, four locations, reset, iframe rendering, no document horizontal overflow. Physical device GPU testing and MakeShop admin save verification remain outstanding.

## Historical local HTTP browser verification (three-ear revision)

Environment: isolated Chromium browser on Windows, HTTP server at `http://127.0.0.1:8765/`. Mobile sizes and native touch input are emulated; this is not a physical iPhone/Android GPU benchmark.

| Check | Result |
| --- | --- |
| 1180×720 desktop | 290px controls / remaining viewport, actual render and buttons checked |
| 768×844 tablet | Viewport first, controls below; document scrollWidth = 768 |
| 390×844 mobile | Viewport 464px, controls bottom 753px; document scrollWidth = 390 |
| 720px iframe, narrow 336px inner width | Viewport 430px; controls bottom 719px; inner/outer horizontal overflow absent (model cards have their own allowed horizontal scroller) |
| Three distinct ears × four positions | All 12 states rendered and visually inspected; local anchors differ per model |
| Initial lazy load | Only ear-01.glb requested initially; other ears fetched on first selection and reused |
| Model changes | Preserve selected location; latest selection wins asynchronous loading race |
| Mouse drag / native wheel | Camera rotates; wheel reaches bounded min/max distances |
| Native touch drag / two-touch pinch | Rotation and both zoom directions change the camera within limits |
| Reset immediately after rotation | Damping residue cleared; default camera remains unchanged after reset |
| DPR 3 emulation | Renderer pixel ratio capped at 2 |
| HDRI | Environment active, background blurriness 0.65, exposure 0.85; metal reflection visible |
| Model loading failure | Aborted ear-02 request gives visible error; retry successfully loads requested ear-02 |
| HDRI failure | Aborted HDR request leaves working ear with warm background/basic lights and visible notice |
| WebGL context loss | Visible failure; retry reload restores working renderer |
| Repeated ear switches | After all ears cached: 18 renderer geometries / 4 textures; unchanged after 12 additional switches. JS heap fell back to about 19 MB after GC in that test; not a browser-wide memory guarantee |
| iframe simulator | Native input selects all ears/four positions, rotates, zooms and resets within the iframe |
| Syntax / paths | Node syntax checks pass, git diff --check passes; local HTML/modules/HDR/GLB/thumb HTTP requests return 200 |
| Normal-path console | No page errors or console errors after clean reload; failure-injection warnings are expected and were checked separately |

## Remaining production checks

- The remaining Ear 02 is a sample mesh, not a calibrated anatomical measurement system.
- Test on physical iPhone/Android hardware before production rollout; desktop emulation cannot establish actual mobile GPU performance or device thermal behavior.
- MakeShop admin save/iframe sanitization and the actual commercial product page require the responsible operator's access. The simulator is not proof of a successful MakeShop admin save.
- Real product GLB orientation, dimensions and per-ear attachment need calibration when replacing `makePiercing()` in `viewer.js`.
- Deployment/public URL verification is performed after push and reported separately with the deployed commit SHA.
