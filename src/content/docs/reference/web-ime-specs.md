---
title: 웹 IME 명세 요약
description: Input Events Level 2·UI Events에서 composition·beforeinput·inputType의 요구사항과 선택 사항
---

웹에서 IME 조합은 **CompositionEvent**(UI Events)와 **InputEvent**/**beforeinput**(Input Events Level 2)로 다룬다. 이 문서는 **명세에서 요구하는 것**과 **구현에 맡기는 것(선택·재량)**을 정리해, 에디터 구현 시 **어디까지 보장되고 어디서 브라우저 차이가 나는지** 참고할 수 있게 한다.

---

## 1. CompositionEvent (UI Events)

### 1.1 정의

- **CompositionEvent**는 **UI Events** 명세에서 정의한다. **compositionstart**, **compositionupdate**, **compositionend** 세 가지가 있다.
- **사용자가 IME를 통해 간접적으로 텍스트를 입력할 때** 발생한다(MDN·명세). **data** 속성에 **조합으로 대체될 기존 문자열**(compositionstart), **현재 조합 중 문자열**(compositionupdate), **확정된 문자열 또는 빈 문자열**(compositionend)이 들어 있다.

### 1.2 명세가 말하는 것

- **compositionstart**: 조합 세션이 **시작될 때** 발생. **data**는 조합으로 **대체될** 기존 선택 영역의 텍스트(없으면 빈 문자열).
- **compositionupdate**: 조합 **중 내용이 바뀔 때** 발생. **data**는 **현재 조합 중인 문자열**(preedit).
- **compositionend**: 조합이 **끝날 때** 발생. **data**는 **commit**이면 확정 문자열, **취소**면 빈 문자열.

이 **의미**는 명세가 정하고, **발생 시점·횟수**(예: compositionupdate가 몇 번 오는지)는 **IME·OS·브라우저**에 따라 다르다.

### 1.3 명세가 강제하지 않는 것

- **compositionstart 없이 compositionend만** 오는 경우를 명세가 **금지하지 않는다**. 레거시 IME나 상태 꼬임에서 발생할 수 있으므로, 에디터는 **compositionend만** 와도 **data**가 있으면 commit으로 처리하는 것이 안전하다.
- **compositionupdate가 0번**인 경우(compositionstart 직후 compositionend만 오는 경우)도 **가능**하다. [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases) 참고.

---

## 2. Input Events Level 2: beforeinput / inputType

### 2.1 beforeinput

- **beforeinput**은 **편집 가능한 요소의 내용이 바뀌기 직전**에 발생한다. **InputEvent.inputType**으로 **삽입·삭제·서식** 등을 구분한다.
- **명세**: IME 조합으로 텍스트가 삽입될 때는 **insertCompositionText** 등의 inputType이 정의되어 있다. **조합 종료(commit)** 시 **insertText** 또는 **insertCompositionText** 등이 올 수 있다.

### 2.2 명세가 강제하지 않는 것

- **beforeinput이 발생하지 않을 수 있다**. MDN 등에는 "IME, 자동 완성, 비밀번호 관리자 등"에서 **beforeinput이 생략**될 수 있다고 적혀 있다.
- **beforeinput이 non-cancelable**일 수 있다. 즉, **preventDefault()**가 동작하지 않는 환경이 있다.
- **insertCompositionText** 대신 **insertText**만 오는 구현이 **허용**되는지 여부는 명세 문구에 따라 다르나, **실제로** iOS Safari 등에서는 **insertCompositionText** 없이 **insertText**만 오므로, 에디터는 **composition 이벤트**와 **insertText** 둘 다 처리해야 한다.

### 2.3 getTargetRanges()

- **beforeinput**에서 **getTargetRanges()**로 **영향받는 범위**를 얻을 수 있다. **insertReplacementText**, **deleteWordBackward** 등에서 **교체·삭제할 구간**을 지정할 때 쓰인다.
- **명세**: 지원이 **선택**일 수 있고, **모든 브라우저·환경**에서 사용 가능하지 않다. 없으면 **커서·선택**으로 범위를 직접 계산해야 한다. [inputType 상세](/docs/reference/inputtype) §4.2 참고.

---

## 3. 이벤트 순서

- **명세**는 **compositionstart → compositionupdate(들) → compositionend** 순서를 전제한다. **beforeinput**·**input**이 그 **전후**에 어떻게 끼어드는지는 **Input Events Level 2** 문구에 세부가 나와 있으나, **정확한 순서**가 **강제**되지는 않는다.
- **실제 브라우저**에서는 **compositionend 직후 input**이 같은 내용으로 **한 번 더** 오는 경우(Safari 등), **Enter** 시 **compositionend가 조기** 발생하는 경우(Firefox 버그) 등이 있다. [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases), [브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks) 참고.
- **결론**: **구현은 composition 3종을 우선** 처리하고, **composition이 없을 때** **inputType·insertText**로 처리하는 구조가 **명세와 실제 동작 모두**에 맞다.

---

## 4. 에디터 구현 시 대응 원칙

| 명세/동작 | 에디터 대응 |
|-----------|-------------|
| compositionstart ~ compositionend | 조합 구간을 preedit으로만 표시, **compositionend.data**만 문서에 반영 |
| composition 없이 insertText | `!isComposing && inputType === 'insertText'` 시 **data**를 commit |
| compositionend.data가 빈 문자열 | 취소로 간주, preedit만 제거 |
| compositionend.data가 긴 문자열 | 한 글자 가정 금지, 전체를 하나의 undo 단위로 commit |
| beforeinput 없음 | **input** 이벤트로 동일 처리 |
| getTargetRanges() 없음 | 커서·선택으로 범위 직접 계산 |
| blur 시 compositionend 없음 | **blur** 리스너에서 **isComposing**이면 조합 상태 강제 정리 |

---

## 5. 참고 문서

- [글자 조합](/docs/guide/composition) — composition 이벤트 흐름, beforeinput/input과의 관계.
- [inputType 상세](/docs/reference/inputtype) — inputType 목록, 환경별 차이, 명세의 한계.
- [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases) — 예외 시나리오별 처리.
- [W3C UI Events](https://w3c.github.io/uievents/) — CompositionEvent.
- [W3C Input Events Level 2](https://www.w3.org/TR/input-events-2/) — beforeinput, inputType, getTargetRanges.
