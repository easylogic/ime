---
title: 접근성(IME·보조 기술)
description: IME 조합 중 preedit의 접근성 트리 노출, 스크린 리더·보조 기술과의 관계, 에디터 권장 사항
---

IME로 **조합 중인 문자열(preedit)** 과 **확정된 문자열(commit)** 이 **스크린 리더·보조 기술**에 어떻게 전달되는지, 그리고 에디터가 **접근성을 고려해** 조합 구간을 어떻게 다루면 좋은지 정리한다. 명세·플랫폼별 동작은 환경에 따라 다르므로, 가능한 범위만 구체적으로 기술한다.

---

## 1. 조합 중(preedit)의 접근성 트리 노출

### 1.1 브라우저·OS 동작

- **접근성 트리**(Accessibility Tree)는 보조 기술(스크린 리더 등)이 **요소의 역할·이름·값·상태**를 읽을 때 사용한다.
- **input**·**textarea** 또는 **contenteditable** 요소에 **조합 중인 텍스트**가 있을 때, 브라우저와 OS가 그 내용을 **접근성 트리에 어떻게 반영하는지**는 **구현에 따라 다르다**.
- 일부 환경에서는 **preedit이 "값"의 일부**로 노출되어 스크린 리더가 **조합 중 문자열을 읽을 수 있다**. 일부 환경에서는 **조합이 끝난(commit된) 값만** 노출되고, 조합 중에는 **이전 값 또는 빈 값**만 읽힐 수 있다.
- **실시간 영역(Live Region)** 으로 preedit 구간을 마크하면, 변경 시 **알림**을 받을 수 있으나, IME 조합 구간을 **live region으로만** 처리하는 방식은 명세에서 권장하는 패턴이 아니며, 브라우저가 **자동으로** preedit을 접근성 트리에 넣는 방식과 충돌할 수 있다.

### 1.2 에디터가 할 수 있는 것

- **조합 구간**을 **문서 모델에 반영하지 않고** "화면에만" 표시하는 것은 IME 동작과 맞다. 이때 **해당 구간이 DOM에서 어떻게 표현되는지**(예: 별도 span, `aria-hidden` 여부)에 따라 **스크린 리더가 읽는 내용**이 달라질 수 있다.
- **일반적인 권장**: **compositionstart ~ compositionend** 구간을 **하나의 편집 단위**로 두고, **포커스·선택 영역**이 조합 문자열 **밖으로 나가지 않게** 하는 것이 **입력 경험**과 **접근성** 모두에 유리하다. 조합 중에 커서가 조합 문자열을 쪼개면, 스크린 리더가 **불완전한 조각**을 읽을 수 있다.
- **aria 속성**: `role="textbox"` 또는 `role="combobox"` 등에 **aria-describedby**·**aria-label**로 힌트를 줄 수 있으나, **preedit 자체**를 aria로 노출하는 공식 패턴은 Input Events·ARIA 명세에 정의되어 있지 않다. **실무에서는** 브라우저가 제공하는 **기본 접근성 트리**를 신뢰하고, **에디터는 조합 구간을 하나의 단위로 유지**하는 데 집중하는 것이 안전하다.

---

## 2. commit 후 접근성

- **compositionend**로 **commit**이 끝나면, 해당 문자열은 **문서(또는 input value)** 에 반영된다. 이 시점부터는 **일반 텍스트**와 동일하게 접근성 트리의 **값**으로 노출된다.
- **스크린 리더**는 보통 **값 변경**을 **알림**으로 읽어 준다. **commit 한 번**이 **한 번의 변경**으로 인식되므로, **조합 중에는 문서에 반영하지 않고** **commit 시점에만 반영**하는 구현이 **"한 번에 한 단위"**로 읽히는 데 유리하다.

---

## 3. 키보드·포커스

- **조합 중**에 **Tab**으로 포커스를 옮기면, 일부 환경에서는 **compositionend**가 발생하지 않을 수 있다(Safari blur 이슈 등). [트러블슈팅](/docs/reference/troubleshooting)의 **blur 시 조합 상태 정리**를 적용하면, **포커스가 나갈 때** preedit을 정리해 **접근성 트리와 실제 문서**가 어긋나지 않게 할 수 있다.
- **단축키** 처리 시 **isComposing** 또는 **keyCode 229**를 확인해 **조합 중에는** 단축키를 먹지 않고 IME에 넘기면, **스크린 리더 사용자**가 IME 조합을 끝낸 뒤 단축키를 쓸 수 있다.

---

## 4. 참고

- [에디터 IME 구현 가이드](/docs/editor/implementation-notes) — 조합 구간·commit 처리.
- [트러블슈팅](/docs/reference/troubleshooting) — blur 시 composition 정리, isComposing 처리.
- [W3C Input Events Level 2](https://www.w3.org/TR/input-events-2/) — inputType, getTargetRanges.
- ARIA: [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/), [Live Regions](https://www.w3.org/WAI/ARIA/apg/practices/notifications/).
