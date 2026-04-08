---
title: 브라우저 IME 버그 인덱스
description: WebKit·Firefox 등 IME 관련 알려진 버그 ID, 증상, 회피 방법
---

IME 관련 **알려진 브라우저 버그**를 버그 ID와 함께 정리했다. 이슈 추적·회피 방법·관련 문서 링크를 한곳에서 찾을 수 있다. 상세 동작은 [브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks)를 참고한다.

---

## 1. WebKit (Safari / iOS Safari)

### 1.1 Bug 261764 — iOS 딕테이션 시 composition 이벤트 미발생

| 항목 | 값 |
|------|-----|
| **링크** | [WebKit Bug 261764](https://bugs.webkit.org/show_bug.cgi?id=261764) |
| **상태** | OPEN (2026-02 기준 미해결) |
| **영향** | iOS Safari. 딕테이션(음성 입력) 시 compositionstart/update/end **발생하지 않음**. input(insertText)만 옴. |
| **회피** | `!isComposing && e.inputType === 'insertText'` 시 **e.data**를 바로 commit. [트러블슈팅 §2](/docs/reference/troubleshooting), [composition 시나리오](/docs/reference/composition-edge-cases) §4. |
| **관련** | [브라우저·플랫폼별 차이 §1.1](/docs/reference/browser-platform-quirks), [음성 입력·딕테이션과 입력 경로](/docs/reference/voice-dictation-input) |

### 1.2 Bug 165004 — keydown과 composition 이벤트 순서

| 항목 | 값 |
|------|-----|
| **링크** | [WebKit Bug 165004](https://bugs.webkit.org/show_bug.cgi?id=165004) |
| **상태** | OPEN |
| **영향** | Safari. keydown과 composition 이벤트 **순서**가 명세와 다를 수 있음. |
| **회피** | keydown에서 **isComposing**·**keyCode 229** 확인해 조합 중에는 단축키를 넘김. [트러블슈팅 §4](/docs/reference/troubleshooting). |
| **관련** | [브라우저·플랫폼별 차이](/docs/reference/browser-platform-quirks) |

### 1.3 Bug 164369 — blur 시 compositionend 미발생

| 항목 | 값 |
|------|-----|
| **링크** | [WebKit Bug 164369](https://bugs.webkit.org/show_bug.cgi?id=164369) |
| **상태** | OPEN |
| **영향** | Safari (macOS). 포커스를 잃을 때(blur) **compositionend**가 **발생하지 않음**. |
| **회피** | **blur** 리스너에서 `isComposing === true`이면 조합 상태 강제 정리(preedit 제거 또는 commit). [트러블슈팅 §5](/docs/reference/troubleshooting), [composition 시나리오](/docs/reference/composition-edge-cases) §9. |
| **관련** | [브라우저·플랫폼별 차이](/docs/reference/browser-platform-quirks) |

---

## 2. Firefox (Mozilla)

### 2.1 Bug 1675313 — Enter 시 조기 compositionend

| 항목 | 값 |
|------|-----|
| **링크** | [Mozilla Bug 1675313](https://bugzilla.mozilla.org/show_bug.cgi?id=1675313) |
| **상태** | 확인 시 Bugzilla 참고 |
| **영향** | Firefox. 조합 중 **Enter**를 누르면 **compositionend**가 **조기** 발생할 수 있음. |
| **회피** | compositionend 시 **e.data**를 commit하는 동작은 유지. Enter로 인한 조기 종료도 동일하게 처리. [트러블슈팅 §7](/docs/reference/troubleshooting) 테스트 매트릭스. |
| **관련** | [브라우저·플랫폼별 차이](/docs/reference/browser-platform-quirks) |

---

## 3. 참고

- [브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks) — 각 환경별 상세 동작
- [트러블슈팅](/docs/reference/troubleshooting) — 증상별 해결·테스트 매트릭스
- [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases) — 예외 시나리오
- [IME 테스트·디버깅 가이드](/docs/reference/ime-testing) — 재현·로깅
