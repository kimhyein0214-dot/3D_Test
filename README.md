# Pink Rocket 3D 피어싱 뷰어

메이크샵 상품 상세페이지에 iframe으로 넣는 단일 상품 착용 미리보기입니다. 귀 모델 02 하나와 네 착용 위치를 제공하며 장바구니·제품 조합 기능은 없습니다. 사용하지 않는 귀 모델 01/03과 썸네일은 현재 배포에서 제거했습니다.

## 공개 주소

- 뷰어: `https://kimhyein0214-dot.github.io/3D_Test/`
- iframe 시뮬레이터: `https://kimhyein0214-dot.github.io/3D_Test/simulator.html`

## 메이크샵 삽입 코드

```html
<div style="width:100%;max-width:1180px;margin:0 auto;">
  <iframe
    src="https://kimhyein0214-dot.github.io/3D_Test/"
    title="Pink Rocket 3D 피어싱 뷰어"
    loading="lazy"
    allowfullscreen
    style="display:block;width:100%;height:720px;border:0;overflow:hidden;">
  </iframe>
</div>
```

## 구현 및 레이아웃

- Three.js **0.180.0**, core/addons 동일 버전을 `assets/vendor/three/`에 로컬 저장했습니다. 번들러 없이 import map을 사용합니다.
- 데스크톱 최대 1180×720, 290px 컨트롤 + 나머지 3D 뷰포트. 768px 이하에서는 뷰포트 → 컨트롤 순서입니다.
- 모바일 뷰포트 `clamp(430px,55svh,540px)`, 버튼 최소 42px. 720px 높이 iframe에서 컨트롤을 사용할 수 있도록 간격을 압축했습니다.
- ResizeObserver, 부모 기준 렌더 크기, DPR 최대 2, Box3 정규화/카메라 fit, OrbitControls 회전·제한 확대/축소·초기화.
- 기본 카메라는 귀의 +Z 정면입니다. 첫 로딩·반응형 resize·정면·보기 초기화·제품 확대에 같은 정면 기준을 적용하며, 드래그 회전은 유지됩니다.
- Qwantani Morning (Pure Sky) 1K HDR 자연광 환경 반사 + 하늘 배경. 블러 **0.025**, ACES/sRGB, exposure 0.9. HDR 실패 시 연한 하늘색 배경과 기본 조명으로 표시합니다.
- 뷰포트 오른쪽 위 **배경 / 조명**에서 HDRI 회전 0–360°와 배경 블러 0–100% (0.5% 간격)를 실시간 조절합니다. 회전은 기본 HDR 방향에 대한 상대값으로 환경 반사와 하늘 배경에 함께 적용합니다. 블러는 배경에만 적용하며 귀·피어싱·큐빅 재질을 흐리지 않습니다. 기본값은 회전 0° / 블러 2.5%입니다.
- **배경 초기화**는 HDRI 설정만, **보기 초기화**는 귀 카메라만 초기화합니다. 설정은 현재 페이지 세션에서 유지되고 새로고침 시 기본값으로 시작합니다. HDR 실패 시 조절은 비활성화되고 상태 안내가 표시됩니다. 조절 패널은 상품 컨트롤의 높이를 늘리지 않는 접이식 overlay입니다.
- 귀 모델 02만 로딩합니다. 불필요한 귀 선택 영역과 화면의 PINK ROCKET/TRY-ON 표기는 제거했습니다. 로딩 실패와 WebGL 실패는 화면에 안내합니다.
- **Pretendard 1.3.9** 고딕 웹폰트 Regular/SemiBold를 프로젝트에 저장했습니다. SIL OFL 1.1 라이선스는 `assets/fonts/OFL.txt`에 포함했습니다.
- `canvas`만 `touch-action:none`입니다. 바깥 상세페이지 스크롤을 잠그지 않습니다.
- 기본 제품은 **바형 큐빅 피어싱**입니다. 은색 바·후면 볼·4발 세팅·라운드 커팅 CZ를 절차형 테스트 형상으로 생성합니다. 실제 판매 상품 GLB나 제작 치수는 아닙니다.
- 큐빅은 MeshPhysicalMaterial의 transmission 1 / IOR 2.15 / roughness 0.03 / dispersion 0.06을 사용합니다. 불투명도만 낮춘 표현이 아니라 투과·굴절·환경 반사입니다. 실시간 raster 재질이므로 실사 보석의 내부 다중 반사/caustics를 완전히 재현하지는 않습니다. 진주 재질은 불투명하게 유지합니다.
- **제품 확대**로 보석과 세팅을 가까이 확인하고 정면/보기 초기화로 귀 전체 화면을 복구합니다. 확대 중 위치/제품 전환과 resize에도 해당 제품을 다시 중심에 맞춥니다.
- 제품 선택 및 `?product=stud|spark|mini|cubic|pearl`로 기존 링 4종도 유지합니다. 한 번에 한 제품만 표시합니다. 바형 제품은 링과 구분한 네 위치의 local anchor를 사용합니다.
- 드롭다운 대신 **실제 3D 형상에서 렌더링한 상품 썸네일 카드**를 클릭해 착용합니다. PC 2열 그리드 / 모바일 5개 한 줄 목록이며 선택한 상품에는 테두리와 체크 표시가 있습니다. 상품 교체 시 착용 부위와 제품 확대 상태를 유지합니다. 키보드 Tab + Enter/Space로도 선택할 수 있습니다.
- `piercing-products.js`의 `products`가 상품 ID·이름·썸네일·anchor 종류를 관리하고 `createPiercing(id)`가 해당 테스트 3D 형상을 생성합니다. 썸네일은 256×256 PNG 5개, 합계 184,851 bytes입니다. 페이지에서 썸네일용 WebGL 렌더러를 추가 실행하지 않습니다.
- 현재는 **카탈로그형 선택 UI + 한 상품 전환**까지입니다. 여러 피어싱 동시 배치·조합 편집·삭제·장바구니는 아직 구현하지 않았습니다.

## 에셋 출처 / Attribution

- **Ear 02:** right ear extracted from Head (Sculpting) - Realistic by **Dan Ulrich**.
- Ear 02 is from the official [Human Base Meshes v1.4.1 bundle](https://www.blender.org/download/demo-files/#assets), **CC0**.
- [Pretendard](https://github.com/orioncactus/pretendard), **Kil Hyung-jin**, **SIL OFL 1.1**. Unmodified Regular/SemiBold webfont subsets.
- [Qwantani Morning (Pure Sky)](https://polyhaven.com/a/qwantani_morning_puresky), **Jarod Guest**, **CC0**. Local 1K HDR: 1,118,343 bytes.

Detailed sources, license evidence, dates, modifications and file sizes: [ASSET_SOURCES.md](./ASSET_SOURCES.md).

## 로컬 실행

```powershell
cd C:\2026_Work\3D_Test
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/` or `/simulator.html`. Do not test with `file://`.

## 다음 단계: 실제 상품 GLB

`piercing-products.js`의 `products`가 카탈로그 연결 지점이고 `createPiercing(id)`가 현재 테스트 피어싱 생성 지점입니다. 실제 상품을 연결할 때 이 부분을 상품별 GLTFLoader + 로딩/캐시 처리로 교체하고 `viewer.js`의 `attachPiercing()` local anchor 구조를 유지하세요. 상품 원점·방향·실측 scale을 먼저 정규화한 뒤 anchor를 재보정해야 합니다. `ear-models.js`는 네 위치의 모델별 position/rotation 또는 quaternion/scale을 관리합니다.

개발용 `?debug=anchors`에서 Shift+클릭으로 표면 좌표를 콘솔에 확인할 수 있으며 일반 UI에는 좌표가 표시되지 않습니다. `ear-models.js`의 `anchors`는 링, `studAnchors`는 바형 큐빅용으로 분리되어 있습니다.

## 메이크샵 담당자 적용 안내

대상 **상품의 상세설명 편집 화면에서 HTML/소스 편집 모드**로 전환한 후, 뷰어가 들어갈 설명 위치에 위 iframe 코드를 추가합니다. 기존 상세설명 HTML 전체를 지우거나 사이트 공통 head 영역에 넣지 않습니다. 사용 중인 관리자/스킨에 따라 메뉴 이름이 다를 수 있으므로 담당자가 상품 상세 HTML 편집 영역인지 확인해야 합니다.

PC/모바일 상세설명을 별도로 관리하면 양쪽에 적용하고, 테스트 상품에 먼저 저장 → 실제 상품 페이지 새로고침 → 모바일 확인 순서로 진행합니다. 저장 후 iframe 태그가 제거되면 해당 편집기의 HTML 허용 정책/스킨을 담당자에게 확인해야 합니다. 메이크샵 관리자 저장·실제 판매 페이지 검증은 별도 접근권한이 필요한 단계입니다.
