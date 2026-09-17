# Asset sources

Download / license verification date: 2026-09-17.

| Asset | Author | Source URL | License | Local file | Modified |
| ----- | ------ | ---------- | ------- | ---------- | -------- |
| Photo Studio 01, 1K HDR | Sergej Majboroda | https://polyhaven.com/a/photo_studio_01 | CC0 1.0 — https://polyhaven.com/license | assets/hdri/photo_studio_01_1k.hdr | No; original 1K HDR, 1,597,273 bytes |
| Ear (scan) / Ear 01 | Artec Group inc. / Artec 3D | https://www.artec3d.com/3d-models/ear | Downloaded archive: CC BY 3.0 Unported — https://creativecommons.org/licenses/by/3.0/ ; current asset page: CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ | assets/models/ear-01.glb | Yes: surrounding scan cropped, mirrored to match the other right ears, neutral skin material, centered/uniformly scaled, normals rebuilt, decimated to 14,000 triangles; GLB conversion |
| Head (Sculpting) - Realistic / extracted Ear 02 | Dan Ulrich; Blender Studio/community distribution | https://www.blender.org/download/demo-files/#assets | CC0 1.0, explicitly listed for Human Base Meshes v1.4.1 — https://creativecommons.org/publicdomain/zero/1.0/ | assets/models/ear-02.glb | Yes: complete right pinna and small attachment patch extracted from GEO-head_sculpting_realistic; planar posterior caps, smoothed border, neutral skin, centered/uniformly scaled, normals rebuilt; GLB conversion |
| Head - Stylized / extracted Ear 03 | Julien Kaspar; Blender Studio/community distribution | https://www.blender.org/download/demo-files/#assets | CC0 1.0, explicitly listed for Human Base Meshes v1.4.1 — https://creativecommons.org/publicdomain/zero/1.0/ | assets/models/ear-03.glb | Yes: right ear sculpt face set extracted from GEO-head_stylized; subdivided, attachment capped, neutral skin, centered/uniformly scaled, normals rebuilt; GLB conversion |

Three.js core and addons are all vendored from **three@0.180.0** (MIT).
Their license is included at `assets/vendor/three/LICENSE`.

## Attribution and license evidence

Ear 01 is adapted from **“Ear” by Artec Group inc.**, under CC BY 3.0 Unported as included in the downloaded OBJ archive. The current Artec asset detail page links to CC BY 4.0; we preserve the original archive license verbatim in `assets/licenses/artec-ear-original-license.txt` and do not silently relabel it. Both are attribution licenses, not NC licenses. The adaptation is not endorsed by Artec.

Ear 02 and Ear 03 are extracted from **two different original head meshes**, not three scale variants of one ear. The official Blender demo-files asset entry identifies the Human Base Meshes v1.4.1 bundle as CC0. Its internal README also explicitly says all provided assets are public domain under CC0. Authors are taken from the respective asset collection metadata in the .blend file. Supporting official project description: https://studio.blender.org/training/stylized-character-workflow/base-meshes/ . No Rain rig or unrelated CC BY rig asset was used.

All downloads were direct anonymous HTTP downloads; no Sketchfab login, paid plan, or runtime asset hotlink is required.

## Download files and optimization sizes

| Model | Original download | Extracted GLB before decimation | Final GLB | Final triangles |
| --- | --- | ---: | ---: | ---: |
| Ear 01 | `ear_obj.zip`, source OBJ 5,100,580 bytes | 909,264 bytes | 258,112 bytes | 14,000 |
| Ear 02 | Human Base Meshes v1.4.1 bundle, 50,643,039 bytes (shared download) | 157,264 bytes | 157,264 bytes | 6,972 |
| Ear 03 | Same bundle, distinct stylized head mesh | 201,604 bytes | 201,604 bytes | 7,894 |

Ear 02/03 are already well below the budget after extraction, so unnecessary decimation was avoided. All GLBs embed a neutral skin material and require no external textures. Thumbnails are original renders of these adapted meshes and carry the corresponding model license. The scan remains a surface scan with a narrow attachment edge; these examples are not anatomical fit measurements.

HDR download: https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/photo_studio_01_1k.hdr .

OBJ download: https://cdn.artec3d.com/content-hub-3dmodels/ear_obj.zip .

Blender bundle download: https://download.blender.org/demo/asset-bundles/human-base-meshes/human-base-meshes-bundle-v1.4.1.zip .
