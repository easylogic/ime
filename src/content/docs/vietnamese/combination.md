---
title: 베트남어 조합 원리
description: Telex/VNI/VIQR, 로마자+성조(ă, â, ệ 등), 데드 키·composition/insertText, 에디터 대응
---

베트남어는 **로마자**에 **성조·발음 구별 기호**가 붙은 문자(ă, â, ê, ô, ơ, ư, ệ, ằ 등)를 사용한다. 이 문자들은 **Telex**, **VNI**, **VIQR** 등 **입력법**에 따라 키 시퀀스가 정해지며, OS/IME에 따라 **composition 이벤트**가 발생할 수도, **insertText**만 올 수도 있다.

---

## 1. 문자 구성

### 1.1 기본 로마자 + 확장 문자

- **기본 로마자**: a, e, i, o, u, y와 자음. 베트남어에서 **추가로 쓰는 문자**:
  - **ă** (U+0103), **â** (U+00E2), **ê** (U+00EA), **ô** (U+00F4), **ơ** (U+01A1), **ư** (U+01B0)
  - **đ** (U+0111)
- **성조**: 6종. 결합 부호(combining character) 또는 미리 조합된(precomposed) 한 코드 포인트로 표현된다.
  - 예: **ệ** = e + hook above + dot below, 또는 U+1EC7 (LATIN SMALL LETTER E WITH CIRCUMFLEX AND DOT BELOW).

### 1.2 유니코드: NFC vs NFD

- **NFC**: 한 글자를 **한 코드 포인트**로. 예: ệ = U+1EC7.
- **NFD**: **기준 문자 + 결합 문자** 시퀀스. 예: e (U+0065) + U+0302 + U+0323.

문자열 비교·검색 시 [유럽권 조합 원리](/docs/european/combination)와 마찬가지로 **NFC** 또는 **NFD** 중 하나로 **정규화**하는 것이 좋다.

---

## 2. 입력법: Telex, VNI, VIQR

### 2.1 Telex

- **로마자 2타**로 확장 문자·성조를 나타낸다. 키는 **보통 문자 키**만 사용.
- 예: **aa** → ă, **oo** → ô, **ee** → ê, **uw** → ư, **ow** → ơ, **dd** → đ.
- 성조: **f** = huyền(̀), **s** = sắc(́), **r** = hỏi(̉), **x** = ngã(̃), **j** = nặng(̣). 예: **af** → à, **as** → á.

### 2.2 VNI

- **숫자**로 성조·확장을 나타낸다.
- 예: **a1** → á, **a2** → à, **a6** → â, **o6** → ô. **1~5**는 성조, **6, 7, 8** 등은 모양(â, ă, ơ 등)에 쓰인다.

### 2.3 VIQR

- **ASCII 부호**로 성조·확장을 나타낸다.
- 예: **+** after vowel → 성조, **(** → ơ, **)** → ư. 키보드에 특수문자가 필요하다.

---

## 3. 데드 키·composition·insertText

### 3.1 데드 키 방식

- OS에서 **데드 키**(악센트만 누르는 키) + **문자**로 ệ 등을 넣는 경우, [유럽권 조합 원리](/docs/european/combination)와 동일하게 동작할 수 있다.
- **compositionstart** → **compositionupdate** → **compositionend**(commit)가 **발생하는** 환경이 있고, **발생하지 않고** **inputType insertText**만 오는 환경도 있다.

### 3.2 Telex/VNI 방식 (IME 조합)

- Telex/VNI는 **여러 키**를 누르면 IME가 **로마자 시퀀스**를 **한 글자(ă, ệ 등)**로 바꾼다.
- 이때 **compositionstart** → **compositionupdate**(중간 결과) → **compositionend**(최종 글자)가 발생할 수 있다.
- 환경에 따라 **composition 없이** 조합 결과가 **insertText** 한 번으로만 올 수도 있다.

### 3.3 에디터 대응

- **composition 이벤트가 오면**: 조합 구간을 preedit으로만 표시하고, **compositionend**의 data를 문서에 반영.
- **composition 없이 insertText만 오면**: [트러블슈팅](/docs/reference/troubleshooting)과 [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)에 따라, `!isComposing && inputType === 'insertText'`일 때 **data**를 바로 commit.

```javascript
el.addEventListener('input', (e) => {
  if (!isComposing && e.inputType === 'insertText' && e.data) {
    commit(e.data);
  }
});
```

---

## 4. 참고

- [유럽권 조합 원리](/docs/european/combination) — 데드 키, NFC/NFD, composition 유무.
- [브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks) — 환경별 composition/insertText 차이.
- [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases) — composition 없이 insertText만 오는 경우.
