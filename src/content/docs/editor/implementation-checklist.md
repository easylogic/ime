---
title: 구현 체크리스트
description: IME 쪽 구현이 빠지지 않았는지 항목별로 점검
---

에디터·입력 필드에서 **IME를 올바르게 처리했는지** 아래 항목을 확인한다. 각 항목은 [에디터 IME 구현 가이드](/docs/editor/implementation-notes) 또는 [트러블슈팅](/docs/reference/troubleshooting)과 연결된다.

---

## 1. composition 이벤트 구독

- [ ] **compositionstart** · **compositionupdate** · **compositionend** 세 이벤트를 모두 구독하고 있는가?
- [ ] **compositionstart** 시 `isComposing = true`, 조합 구간 시작 위치를 저장하는가?
- [ ] **compositionend** 시 `isComposing = false`, `e.data`가 있으면 commit, 없으면 취소로 처리하는가?

→ 상세: [에디터 IME 구현 가이드 §1](/docs/editor/implementation-notes)

---

## 2. preedit은 표시만, commit만 문서 반영

- [ ] **compositionupdate**의 `e.data`는 **화면에만** 표시하고, **문서 모델에는 반영하지 않는가**?
- [ ] **문서에 반영**하는 시점은 **compositionend**이고, 그때만 `e.data`를 commit하는가?

→ 한글이 깨져 들어가는 경우: [트러블슈팅 §1](/docs/reference/troubleshooting)

---

## 3. keydown에서 조합 중에는 단축키·Enter 무시

- [ ] **keydown** 처리 시 `e.isComposing === true`이면 **단축키·Enter**를 먹지 않고 IME에 넘기는가?
- [ ] Safari 등에서는 **keyCode === 229**일 때도 IME 입력 중으로 보고 넘기는가?

→ 조합 중 Enter 전송·단축키 문제: [트러블슈팅 §3, §4](/docs/reference/troubleshooting)

---

## 4. composition 없이 오는 insertText 처리

- [ ] **input** 이벤트에서 `!isComposing && e.inputType === 'insertText' && e.data`일 때 **바로 commit**하는가?
- [ ] iOS Safari 딕테이션·한글, 데드 키(é) 등 composition 없이 insertText만 오는 환경을 커버하는가?

→ compositionend가 안 오는 경우: [트러블슈팅 §2](/docs/reference/troubleshooting), [composition 시나리오](/docs/reference/composition-edge-cases)

---

## 5. blur 시 조합 상태 정리

- [ ] **blur** 리스너에서 `isComposing === true`이면 **조합 상태를 강제로 정리**(preedit 제거 또는 commit)하는가?
- [ ] Safari는 blur 시 compositionend를 발생시키지 않으므로 이 처리가 필요하다.

→ 포커스 잃었는데 조합 상태 안 풀림: [트러블슈팅 §5](/docs/reference/troubleshooting)

---

## 6. (선택) 붙여넣기·파일명 NFC 정규화

- [ ] **macOS**에서 붙여넣기·파일명 처리 시 한글이 **자소 분리**(NFD)로 올 수 있음을 고려하는가?
- [ ] 필요 시 `str.normalize('NFC')`를 적용하는가?

→ 상세: [macOS 한글 자소 분리](/docs/reference/mac-hangul-decomposition)

---

## 참고

- [에디터 IME 구현 가이드](/docs/editor/implementation-notes) — 전체 구현·예외 케이스
- [트러블슈팅](/docs/reference/troubleshooting) — 증상별 해결
- [IME 테스트·디버깅 가이드](/docs/reference/ime-testing) — 테스트 시나리오·로깅
