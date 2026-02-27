---
title: 중국어 심화
description: 倉頡·五筆(형태 입력), 手寫(수필), 双拼(쌍핀), 문절 단위 commit
---

중국어 IME는 **병음·주음** 외에 **倉頡(창지)·五筆(오필)** 같은 **형태 기반 입력**, **手寫(수필)** **손글씨 인식**, **双拼(쌍핀)** 같은 **약어 병음**을 지원한다. 입력 방식에 따라 **preedit·compositionupdate** 빈도·**commit 시점**이 다르고, **문절 단위 commit**이 발생할 수 있다.

---

## 1. 倉頡(창지) / 五筆(오필)

### 1.1 동작

- **형태 기반 입력**: 한자의 **부수·획**에 해당하는 키 시퀀스로 한자를 찾는다. 로마자 발음이 아닌 **형태 코드**를 입력.
- **조합 중**: 후보가 **preedit**으로 올 수 있다. **compositionupdate**의 **data**에 **한자 후보**(또는 코드)가 오는 패턴은 병음 IME와 유사하나, **update 횟수**·**후보 표시 방식**은 IME마다 다를 수 있다.
- **commit**: 후보 선택 확정 시 **compositionend**가 발생하고, **data**에 선택한 한자(또는 여러 글자)가 들어 있다. 에디터는 병음과 동일하게 **compositionend.data**를 commit하면 된다.

### 1.2 에디터 대응

- 병음·주음과 **동일한 처리**로 충분하다. 조합 중 preedit만 표시하고, **compositionend** 시 **data**를 문서에 반영. **compositionend.data**가 **한 글자**가 아니라 **여러 글자**일 수 있으므로 길이 제한을 두지 않는다.

---

## 2. 手寫(수필, 손글씨 인식)

- **손글씨 인식**이 IME에 포함된 경우, 사용자가 그린 글자를 인식해 **후보**로 보여 주고, 선택 시 **commit**된다.
- 이때는 **조합 세션**이 짧고, **compositionstart** → **compositionupdate**(후보) → **compositionend**(선택한 글자)가 발생하거나, **composition 없이 insertText**만 올 수 있다. (모바일에서 흔함.)
- 에디터는 [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)에 따라, **composition이 오면** 조합 구간으로, **오지 않으면** `!isComposing && inputType === 'insertText'`로 처리하면 된다.

---

## 3. 双拼(쌍핀)

- **双拼**은 **병음의 약어 조합**이다. 성모·운모를 각각 **한 키**로 줄여서 입력. 예: "zh" + "ong" → 한 키 + 한 키.
- **compositionupdate** **빈도**·**commit 시점**은 병음과 유사하다. 키 시퀀스만 짧아질 뿐, **composition 3종**과 **insertText** 처리 방식은 그대로 적용하면 된다.

---

## 4. 문절 단위 commit

- **일본어**와 마찬가지로, **한 문절·한 구문**을 한 번에 선택해 commit하는 경우가 있다. **compositionend.data**에 **긴 문자열**(여러 한자)이 들어 온다.
- [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)의 "compositionend.data가 긴 문자열인 경우"와 동일하게, **전체 문자열**을 **하나의 undo 단위**로 commit한다. **compositionend.data**가 한 글자라고 가정하지 않는다.

```javascript
el.addEventListener('compositionend', (e) => {
  if (e.data) {
    commit(e.data);  // "東京都渋谷区" 같은 긴 문자열 가능
  }
  isComposing = false;
});
```

---

## 5. 참고

- [중국어 조합 원리](/docs/chinese/combination) — 병음·주음·후보 선택·commit.
- [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases) — 긴 문자열 commit, composition 없이 insertText.
- [키보드·IME 조합별 차이](/docs/reference/keyboard-ime-combinations).
