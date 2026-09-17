# Pink Rocket 3D Viewer iframe test

메이크샵 상품 상세페이지에서 외부 3D/인터랙티브 뷰어를 iframe으로 삽입할 수 있는지 확인하기 위한 테스트 프로젝트입니다.

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

현재 프로토타입은 Three.js가 아닌 Canvas 2D 구현입니다. iframe 허용 여부를 확인한 다음 실제 Three.js/GLB 뷰어로 교체할 예정입니다.
