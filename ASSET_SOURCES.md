# Asset sources

Download / license verification date: 2026-09-17.

| Asset | Author | Source URL | License | Local file | Modified |
| ----- | ------ | ---------- | ------- | ---------- | -------- |
| Qwantani Morning (Pure Sky), 1K HDR | Jarod Guest | https://polyhaven.com/a/qwantani_morning_puresky | CC0 1.0 — https://polyhaven.com/license | assets/hdri/qwantani_morning_puresky_1k.hdr | No; original 1K HDR, 1,118,343 bytes; MD5 0458a3c3dcb2c4b6e19d469a16611335 |
| Head (Sculpting) - Realistic / extracted Ear 02 | Dan Ulrich; Blender Studio/community distribution | https://www.blender.org/download/demo-files/#assets | CC0 1.0, explicitly listed for Human Base Meshes v1.4.1 — https://creativecommons.org/publicdomain/zero/1.0/ | assets/models/ear-02.glb | Yes: complete right pinna and small attachment patch extracted from GEO-head_sculpting_realistic; planar posterior caps, smoothed border, neutral skin, centered/uniformly scaled, normals rebuilt; GLB conversion |
| Pretendard 1.3.9 Regular / SemiBold webfont subsets | Kil Hyung-jin and credited upstream contributors | https://github.com/orioncactus/pretendard/tree/v1.3.9 | SIL OFL 1.1 — https://github.com/orioncactus/pretendard/blob/v1.3.9/LICENSE | assets/fonts/Pretendard-Regular.subset.woff2 ; assets/fonts/Pretendard-SemiBold.subset.woff2 | No; official subsets, 267,096 and 268,752 bytes; full license at assets/fonts/OFL.txt |

Three.js core and addons are all vendored from **three@0.180.0** (MIT).
Their license is included at `assets/vendor/three/LICENSE`.

## Attribution and license evidence

Only Ear 02 is included in the current viewer. The official Blender demo-files asset entry identifies the Human Base Meshes v1.4.1 bundle as CC0. Its internal README also explicitly says all provided assets are public domain under CC0. The author is taken from the asset collection metadata in the .blend file. Supporting official project description: https://studio.blender.org/training/stylized-character-workflow/base-meshes/ . No unrelated rig asset was used.

Ear 01/03, their thumbnails and the unused Artec license were removed at the user's request. Earlier versions and license evidence remain recoverable in Git history.

All downloads were direct anonymous HTTP downloads; no Sketchfab login, paid plan, or runtime asset hotlink is required.

## Download files and optimization sizes

| Model | Original download | Extracted GLB before decimation | Final GLB | Final triangles |
| --- | --- | ---: | ---: | ---: |
| Ear 02 | Human Base Meshes v1.4.1 bundle, 50,643,039 bytes (shared download) | 157,264 bytes | 157,264 bytes | 6,972 |

Ear 02 is already well below the budget after extraction, so unnecessary decimation was avoided. The GLB embeds a neutral skin material and requires no external textures. Its retained thumbnail is an original render under the corresponding CC0 license. This example is not an anatomical fit measurement.

HDR download: https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_morning_puresky_1k.hdr . The actual asset detail page identifies Jarod Guest and CC0. Photo Studio 01 was replaced at the user's request and remains recoverable in Git history. Background pitch is adjusted for sky framing; the environment lighting keeps its natural vertical orientation.

The bar/stud, round faceted cubic-zirconia test stone, four-prong setting and back ball are procedural example geometry defined in viewer.js, not a downloaded jewelry asset or a dimensional specification for production. Existing ring examples remain available. No third-party jewelry mesh is bundled.

Blender bundle download: https://download.blender.org/demo/asset-bundles/human-base-meshes/human-base-meshes-bundle-v1.4.1.zip .
