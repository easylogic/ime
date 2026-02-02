---
title: KeyboardEvent.isComposing
description: IME 조합 중 키 이벤트의 isComposing 의미와 단축키·에디터 처리
---

**KeyboardEvent.isComposing** 은 해당 **keydown** / **keyup** 이 **IME 조합 중**에 발생했는지를 나타낸다. `true`이면 "아직 한 글자로 확정되지 않은 입력 중" 상태이므로, 에디터·앱에서는 **단축키로 사용하지 않고** IME에 넘기는 것이 좋다. 그렇지 않으면 한글 "ㄱ" 입력 중 Ctrl+B가 굵게 만들기로 먹어 버리는 등 **조합이 깨지는** 버그가 난다.

---

## 1. isComposing의 의미

- **키 이벤트**(keydown, keyup)에서 **isComposing === true** 이면: 그 키 입력이 **IME 조합 세션 안**에서 발생한 것이다. 즉, compositionstart가 발생한 뒤 compositionend가 발생하기 전의 **조합 중** 상태에서 누른 키다.
- **isComposing === false** 이면: IME 조합 중이 아니거나, 이미 조합이 끝난 뒤의 키 입력이다.

예: 한글 2벌식에서 **ㄱ** → **ㅏ** 순서로 "가"를 입력할 때, **ㄱ**을 누르는 keydown, **ㅏ**를 누르는 keydown 모두 **isComposing === true** 로 올 수 있다. **스페이스**로 "가"를 확정한 뒤의 keydown은 **isComposing === false** 이다.

---

## 2. 사용처: 단축키 처리

### 2.1 왜 막아야 하는가

- **한글 조합 중 "ㄱ"** 에서 사용자가 **Ctrl+B**를 누르면: **ㄱ**이 아직 확정되지 않은 상태다. 이때 **Ctrl+B**를 "굵게" 단축키로 처리하면, **ㄱ**이 문서에 남고 B만 입력되거나, 조합이 취소되거나, 예측하기 어려운 동작이 된다.
- **일본어 변환 중** Space/Enter를 "단축키"로 처리하면: IME의 변환·확정이 깨진다.

그래서 **keydown** (또는 keyup)에서 **단축키 후보**(Ctrl+B, Ctrl+S, Enter로 전송 등)를 처리할 때, **isComposing === true** 이면 **그 키를 단축키로 쓰지 않고** IME에 넘긴다.

### 2.2 구현 예시(개념)

```text
keydown 핸들러:
  if (event.isComposing === true)
    return;  // 단축키 처리하지 않음. IME에 맡김.
  if (event.ctrlKey && event.key === 'b')
    doBold();
```

- **Esc** 는 예외로 둘 수 있다: IME 조합 취소용으로 쓰이므로, isComposing이 true여도 Esc는 앱에서 "취소"로 처리하지 않고 IME에 넘기는 경우가 많다. (이미 IME가 compositionend(data: "")로 취소를 알린다.)

---

## 3. composition 이벤트와의 관계

- **compositionstart** 가 발생하면 그 다음 keydown/keyup부터 **isComposing** 이 **true** 로 올 수 있다.
- **compositionend** 가 발생하면 그 다음 keydown/keyup부터 **isComposing** 이 **false** 로 온다.
- **composition 이벤트가 아예 오지 않는** 환경(데드 키만 insertText 등)에서는 **isComposing** 이 **false** 인 채로 **insertText**가 온다.

에디터는 "조합 중인지"를 **compositionstart ~ compositionend** 구간으로 판단하고, **키보드 단축키**만 **isComposing** 으로 걸러도 된다. 두 가지를 같이 쓰면: 조합 중에는 preedit을 composition 이벤트로 처리하고, 조합 중 키 입력은 isComposing으로 단축키에서 제외한다.

---

## 4. 브라우저별 지원

- **Chrome, Firefox, Safari, Edge**: **KeyboardEvent.isComposing** 을 지원한다. 한글·일본어·중국어 등 IME 조합 중 keydown/keyup에 `true`가 설정된다.
- **Safari(macOS)**: 이벤트 순서 퀴크로 조합 중에도 isComposing이 기대대로 true가 아닐 수 있어, **keyCode === 229** 로 IME 조합 중 여부를 보완하는 fallback이 널리 쓰인다. [브라우저·플랫폼별 IME 동작 차이](/reference/browser-platform-quirks/) 참고.
- **구형 브라우저**: 지원하지 않으면 **undefined** 이거나 **false** 만 올 수 있다. 이 경우 **compositionstart가 발생했는지**를 앱에서 플래그로 두고, compositionstart ~ compositionend 구간에서는 단축키를 막는 방식으로 보완할 수 있다.

| 브라우저 | isComposing 지원 | 비고 |
|----------|-------------------|------|
| Chrome   | 지원              | IME 조합 중 true |
| Firefox  | 지원              | 동일 |
| Safari   | 지원              | 동일 |
| Edge     | 지원              | Chromium 계열 |

---

## 5. 에디터 구현 시 요약

- **단축키 처리**: keydown(또는 keyup)에서 **event.isComposing === true** 이면 **해당 키를 단축키/특수 동작으로 쓰지 않고** IME에 넘긴다.
- **조합 중 판단**: "지금 조합 중인지"는 **compositionstart 이후 compositionend 이전**으로 두고, preedit은 **compositionupdate.data**로 처리한다.
- **fallback**: isComposing을 지원하지 않는 환경에서는 **compositionstart가 발생한 뒤** 플래그를 켜고, **compositionend**에서 플래그를 끄고, 그 구간에서는 단축키를 막는 방식으로 동일한 동작을 만들 수 있다.
