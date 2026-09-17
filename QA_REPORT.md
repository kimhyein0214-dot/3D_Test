# Viewer QA — 2026-09-17

## Current revision: natural sky / bar-type CZ stud

Ear 01/03 are removed. Only Ear 02 is loaded. Current UI offers a default bar-type CZ stud plus the existing four ring examples, four location chips, front/product-close-up/reset controls. Visible branding/model choice UI remains removed; self-hosted Pretendard remains in use. The studio HDR was replaced with CC0 Qwantani Morning (Pure Sky), background blur 0.025, exposure 0.9. These are current results; three-ear tests below are historical, not current UI controls.

Current local HTTP Chromium checks (2026-09-17):

- Desktop 1180×720, tablet 768×844, mobile 390×844: actual render and controls checked; document horizontal overflow absent. All visible buttons are 42px tall. Mobile controls bottom is about 720px inside the 844px viewport.
- Stud at lobe/helix/conch/tragus: all rendered and inspected in product close-up. Separate stud local anchors are used; old ring anchors retained. This is illustrative fit, not anatomical calibration.
- All five product choices load; only one product is attached at a time. Transparent CZ uses transmission 1, IOR 2.15, roughness 0.03, dispersion 0.06, opacity 1. Pearl remains opaque.
- Native mouse wheel, touch drag and two-touch pinch change the camera within limits. Product close-up, position changes in close-up, front/reset and responsive resize work.
- 720px simulator iframe at 336px inner width: controls bottom 686px; outer width/scrollWidth 390/390, inner 336/336. Native clicks switch all four positions, product close-up/reset; native drag and wheel work inside iframe. Initial off-screen synthetic clicks were not counted as successful; checks were repeated after scrolling the iframe into view.
- Repeated product changes return to 25 renderer geometries / 5 textures for the stud, without monotonic resource growth in this short test. JS heap roughly 12–20MB in this desktop browser; not total browser memory or a physical mobile GPU benchmark.
- No page errors or console errors on normal paths. Three.js 0.180.0 RGBELoader emits its existing deprecation warning recommending HDRLoader; loading succeeds.

Physical device GPU testing and MakeShop admin save verification remain outstanding. Public deployment is checked after push and reported with its commit SHA.

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
