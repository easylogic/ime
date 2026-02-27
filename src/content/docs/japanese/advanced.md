---
title: 일본어 심화
description: 再変換(재변환), 予測変換(예측 변환), ローマ字テーブル 차이, 半角/全角
---

일본어 IME의 **再変換(재변환)**·**予測変換(예측 변환)**·**ローマ字テーブル** 차이·**半角/全角** 전환은 composition 이벤트 호출 횟수·preedit 내용·commit 시점에 영향을 준다. 에디터는 결과 문자열만 올바르게 반영하면 되지만, 테스트·퀴크 문서에서 IME별 차이를 명시할 때 참고할 수 있다.

---

## 1. 再変換(재변환)

### 1.1 동작

- **이미 확정된 문절**을 선택한 뒤 **변환 키**를 다시 누르면, 그 구간을 **다시 한자 후보**로 변환할 수 있다. 이를 **再変換**이라 한다.
- IME가 **선택 영역**을 "조합으로 대체할 구간"으로 잡고, **compositionstart**가 **기존 텍스트 구간**을 대체하는 형태로 동작할 수 있다.
- **compositionend** 시 **data**에 **긴 문자열**(한 문절 전체)이 올 수 있다. [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)의 "compositionend.data가 긴 문자열인 경우"와 동일하게, 한 글자라고 가정하지 않고 **전체 문자열**을 하나의 undo 단위로 commit하면 된다.

### 1.2 에디터 대응

- 재변환 시 **기존 문서 텍스트**가 **preedit 구간**으로 바뀌었다가 **compositionend**로 **새 문자열**로 교체된다. 에디터는 **compositionstart** 시 조합 구간을 만들고, **compositionend** 시 해당 구간을 **e.data**로 교체하면 된다. **replaceRange** 범위는 compositionstart 시점의 선택·커서 위치로 정한다.

---

## 2. 予測変換(예측 변환)

- **예측 변환**은 IME가 **문맥에 따라 후보**(문장 단위 등)를 제안하는 기능이다.
- 후보 선택 시 **compositionupdate** 호출 횟수·**data**에 **문장 단위**가 오는 경우가 있다. **compositionend**의 **data**가 **여러 글자**일 수 있으므로, 한 글자만 올 것이라고 가정하지 않는다.
- 에디터는 기존과 동일하게 **compositionend.data**를 **한 번에** commit·undo 스택에 넣으면 된다.

---

## 3. ローマ字テーブル(로마자 테이블) 차이

- **로마자 → 가나** 매핑은 IME·설정에 따라 다르다. 예: "la" → "ぁ"(작은 가나) vs "ら"(일반). "xtu" → "っ" 등.
- **에디터**는 **키 시퀀스**가 아니라 **preedit·commit 문자열**만 받으므로, 로마자 테이블 자체를 알 필요는 없다.
- **테스트·퀴크** 문서에서 "IME에 따라 **compositionupdate** 호출 횟수·**data**에 'ㄱ'이 오는지 '가'만 오는지가 다르다"고 적을 때, 일본어도 "IME·로마자 테이블에 따라 preedit 길이·횟수가 다르다"고 명시하면 된다. [키보드·IME 조합별 차이](/docs/reference/keyboard-ime-combinations) 참고.

---

## 4. 半角/全角(반각/전각)

- **반각**: ASCII 폭(1바이트 폭) 문자. **전각**: 전각 폭(2바이트 폭) 문자. 일본어 IME에서 **無変換** 키 등으로 **히라가나 ↔ 전각 가타카나 ↔ 반각 가타카나**를 순환할 수 있다.
- **전환 시** **compositionupdate**가 발생할 수 있다. **inputType** 또는 **composition** 동작은 OS·IME에 따라 다르다. 에디터는 **composition 3종**과 **insertText**를 모두 처리하면 반각/전각 전환 결과도 올바르게 반영된다.

---

## 5. 참고

- [일본어 조합 원리](/docs/japanese/combination) — 기본 조합·변환·commit.
- [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases) — 긴 문자열 commit, 처리 우선순위.
- [키보드·IME 조합별 차이](/docs/reference/keyboard-ime-combinations).
