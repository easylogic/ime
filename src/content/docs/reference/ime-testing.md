---
title: IME 테스트·디버깅 가이드
description: 테스트 매트릭스, 시나리오 체크리스트, 로깅·재현, 참고 문서 연결
---

IME를 **어디까지 테스트해야 하는지**와 **문제 발생 시 어떻게 재현·디버깅할지**를 정리했다. [트러블슈팅](/docs/reference/troubleshooting)과 [브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks)와 함께 참고한다.

---

## 1. 테스트 매트릭스

OS × 브라우저 × IME(한글/일본어/중국어) 조합에서 **예상 동작**을 확인할 때 아래 표를 기준으로 한다. 실제 동작은 버전·설정에 따라 다를 수 있다.

| OS | 브라우저 | 한글 | 일본어 | 중국어 | 비고 |
|----|----------|------|-------|-------|------|
| Windows | Chrome | composition 정상 | composition 정상 | composition 정상 | |
| Windows | Firefox | composition 정상 | Enter 시 조기 compositionend (Bug 1675313) | 동일 | |
| macOS | Safari | 이벤트 순서 역전, blur 시 compositionend 없음 | 동일 | 동일 | [버그 인덱스](/docs/reference/browser-ime-bugs) 참고 |
| macOS | Chrome | composition 정상 | composition 정상 | composition 정상 | |
| iOS | Safari | composition 불규칙, 딕테이션 시 composition 없음 | 동일 | 동일 | insertText 폴백 필수 |
| Android | Chrome | keyCode 229, composition 환경에 따라 다름 | 동일 | 동일 | |

---

## 2. 시나리오 체크리스트

아래 시나리오는 **한 번씩** 확인하는 것이 좋다. 실패 시 [트러블슈팅](/docs/reference/troubleshooting)과 [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)을 참고한다.

- [ ] **한글(또는 일본어·중국어) 조합**: ㄱ → ㅏ → 스페이스 시 한 글자 "가"가 문서에 한 번만 들어가는가? 조합 중에는 preedit만 보이고 문서에 반영되지 않는가?
- [ ] **조합 중 커서 이동**: 조합 중에 화살표 키로 커서를 옮기면 조합이 깨지거나 커서가 preedit 안에만 있는가? (구현에 따라 다름)
- [ ] **조합 중 Enter**: 조합 중 Enter를 누르면 IME가 확정 처리하고, 에디터는 전송·제출하지 않는가?
- [ ] **조합 중 Esc**: Esc로 조합 취소 시 preedit만 사라지고 문서는 그대로인가?
- [ ] **blur 시 조합 취소**: 조합 중에 다른 요소로 포커스를 옮기면(Safari) preedit이 사라지거나 commit되고, 조합 상태가 정리되는가?
- [ ] **붙여넣기**: Ctrl+V로 붙여넣기 시 한글·일본어·중국어가 깨지지 않고 들어가는가?
- [ ] **iOS 딕테이션**: (iOS Safari) 음성 입력 시 composition 없이 insertText만 와도 텍스트가 들어가는가?
- [ ] **데드 키(é 등)**: 유럽어 악센트 문자 입력 시 composition이 있든 없든 한 글자로 들어가는가?
- [ ] **composition 없이 insertText**: iOS Safari 한글 등에서 composition 없이 insertText만 올 때 한 번에 commit되는가?

---

## 3. 로깅·재현

문제를 재현할 때 **어떤 이벤트가 어떤 순서로 오는지** 확인하려면 아래 코드로 로깅한다. [트러블슈팅 §6](/docs/reference/troubleshooting)에도 동일한 요지가 있다.

```javascript
const events = ['compositionstart', 'compositionupdate', 'compositionend'];
events.forEach(name => {
  el.addEventListener(name, e => console.log(name, JSON.stringify(e.data)));
});

el.addEventListener('input', e =>
  console.log('input', e.inputType, JSON.stringify(e.data))
);

el.addEventListener('keydown', e =>
  console.log('keydown', e.key, e.keyCode, e.isComposing)
);
```

- **composition 3종**: `data` 값과 발생 순서 확인.
- **input**: `inputType`, `data` 확인. composition 없이 `insertText`만 오는지 확인.
- **keydown**: `isComposing`, `keyCode === 229` 여부 확인.

문제가 발생한 **OS·브라우저·IME·언어**와 **재현 단계**를 기록해 두면, [브라우저 IME 버그 인덱스](/docs/reference/browser-ime-bugs)와 대조하거나 이슈 보고 시 활용할 수 있다.

---

## 4. 참고 문서

- [트러블슈팅](/docs/reference/troubleshooting) — 증상별 원인·해결·디버깅 코드
- [브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks) — 환경별 구체적 동작
- [브라우저 IME 버그 인덱스](/docs/reference/browser-ime-bugs) — 알려진 버그·회피 방법
- [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases) — 예외 시나리오별 처리
- [구현 체크리스트](/docs/editor/implementation-checklist) — 구현 누락 점검
