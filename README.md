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
- Photo Studio 01 1K HDR 환경 반사 + 배경 블러 **0.15** (기존 0.65에서 감소), ACES/sRGB. 물체의 재질이나 조명 선명도는 변경하지 않았습니다. HDR 실패 시 웜그레이 배경과 기본 조명으로 표시합니다.
- 귀 모델 02만 로딩합니다. 불필요한 귀 선택 영역과 화면의 PINK ROCKET/TRY-ON 표기는 제거했습니다. 로딩 실패와 WebGL 실패는 화면에 안내합니다.
- **Pretendard 1.3.9** 고딕 웹폰트 Regular/SemiBold를 프로젝트에 저장했습니다. SIL OFL 1.1 라이선스는 `assets/fonts/OFL.txt`에 포함했습니다.
- `canvas`만 `touch-action:none`입니다. 바깥 상세페이지 스크롤을 잠그지 않습니다.
- 기존 테스트 피어싱 4종은 접힌 테스트 메뉴 및 `?product=spark|mini|cubic|pearl`로 유지합니다. 한 번에 한 제품만 표시합니다.

## 에셋 출처 / Attribution

- **Ear 02:** right ear extracted from Head (Sculpting) - Realistic by **Dan Ulrich**.
- Ear 02 is from the official [Human Base Meshes v1.4.1 bundle](https://www.blender.org/download/demo-files/#assets), **CC0**.
- [Pretendard](https://github.com/orioncactus/pretendard), **Kil Hyung-jin**, **SIL OFL 1.1**. Unmodified Regular/SemiBold webfont subsets.
- [Photo Studio 01](https://polyhaven.com/a/photo_studio_01), **Sergej Majboroda**, **CC0**. Local 1K HDR: 1,597,273 bytes.

Detailed sources, license evidence, dates, modifications and file sizes: [ASSET_SOURCES.md](./ASSET_SOURCES.md).

## 로컬 실행

```powershell
cd C:\2026_Work\3D_Test
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/` or `/simulator.html`. Do not test with `file://`.

## 다음 단계: 실제 상품 GLB

`viewer.js`의 `makePiercing()`이 현재 테스트 피어싱을 생성하는 연결 지점입니다. 이 함수를 상품별 GLTFLoader + 로딩/캐시 처리로 교체하고 `attachPiercing()`의 모델별 local anchor 부착 구조를 유지하세요. 상품 원점·방향·실측 scale을 먼저 정규화한 뒤 anchor를 재보정해야 합니다. `ear-models.js`는 네 위치의 모델별 position/rotation 또는 quaternion/scale을 관리합니다.

개발용 `?debug=anchors`에서 Shift+클릭으로 표면 좌표를 콘솔에 확인할 수 있으며 일반 UI에는 좌표가 표시되지 않습니다.

## 메이크샵 담당자 적용 안내

대상 **상품의 상세설명 편집 화면에서 HTML/소스 편집 모드**로 전환한 후, 뷰어가 들어갈 설명 위치에 위 iframe 코드를 추가합니다. 기존 상세설명 HTML 전체를 지우거나 사이트 공통 head 영역에 넣지 않습니다. 사용 중인 관리자/스킨에 따라 메뉴 이름이 다를 수 있으므로 담당자가 상품 상세 HTML 편집 영역인지 확인해야 합니다.

PC/모바일 상세설명을 별도로 관리하면 양쪽에 적용하고, 테스트 상품에 먼저 저장 → 실제 상품 페이지 새로고침 → 모바일 확인 순서로 진행합니다. 저장 후 iframe 태그가 제거되면 해당 편집기의 HTML 허용 정책/스킨을 담당자에게 확인해야 합니다. 메이크샵 관리자 저장·실제 판매 페이지 검증은 별도 접근권한이 필요한 단계입니다.
