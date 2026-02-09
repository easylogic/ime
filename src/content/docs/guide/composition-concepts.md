---
title: 글자 조합 개념
description: preedit, commit, insert, replace, replacement range 등 조합·편집에서 쓰는 개념 정리
---

IME와 에디터가 글자를 “조합”할 때 사용하는 개념들을 한곳에 정리했다. preedit·commit뿐 아니라 **insert(삽입)·replace(교체)·replacement range(대체 범위)** 등이 어떻게 쓰이는지 구분하면, 이벤트·API·inputType을 이해하기 쉽다. 아래 개념은 **한글·일본어·중국어·아랍어·유럽권** 등 모든 IME에 공통으로 적용된다.

---

## 1. preedit (조합 중 문자열)

**preedit**은 IME가 **아직 확정하지 않은** 문자열이다. 화면에만 임시로 보여 주고, **문서 모델에는 반영하지 않는다**.

- 웹: **compositionstart** 이후 **compositionupdate**의 **CompositionEvent.data**가 preedit이다.
- macOS: **setMarkedText(_:selectedRange:replacementRange:)** 로 전달된다. 앱은 해당 구간을 “marked”로 표시한다.
- Windows TSF: 조합 구간(composition range)의 내용이 preedit이다.

언어별 예: **한글**은 조합 중인 자모·음절(예: "ㄱ", "가"). **일본어**는 로마자→가나 조합 중 "か" 또는 変換(한자 변환) 중인 문절. **중국어**는 병음 "zhong" 또는 후보 선택 중인 한자. **유럽권**은 데드 키만 눌렀을 때 부호 "´" 등. **아랍어**는 키→문자 조합이 있을 때 해당 문자열. 사용자가 확정(스페이스·엔터·다음 입력 등)하거나 취소(Esc·포커스 이탈)하면 preedit은 **commit**으로 바뀌어 문서에 반영되거나, 구간만 제거된다.

---

## 2. commit (확정)

**commit**은 IME가 **확정한 최종 문자열**이다. 앱은 이 문자열을 **문서에 반영**해야 한다.

- 웹: **compositionend**가 발생할 때 **CompositionEvent.data**에 commit 문자열이 들어 있다(취소 시에는 빈 문자열).
- macOS: **insertText(_:replacementRange:)** 로 전달된다. 앱은 **replacement range**(조합 구간)를 이 문자열로 **교체**하고 문서에 반영한다.
- Windows TSF: IME가 조합 구간을 commit 문자열로 **교체**한 뒤 **EndComposition** 한다.

언어별 예: **한글** "가", **일본어** "か" 또는 変換 확정 "漢字", **중국어** "中", **유럽권** "é"(데드 키+e), **아랍어** 해당 코드 포인트 문자열. 동작 관점에서는 commit이 “삽입”이 아니라 **기존 조합 구간을 그 문자열로 replace(교체)**하는 경우가 많다. 아래 replace·replacement range와 연결된다.

---

## 3. insert (삽입)

**insert**는 **커서 위치에** 새 텍스트를 **넣는** 동작이다. 기존 문자를 지우지 않고, 그 자리에 새 문자가 들어간다.

- **insertText**: 일반 텍스트 삽입. **영문** 직접 입력, **아랍어** 키→문자로 composition 없이 들어오는 입력, **유럽권** 데드 키 완성 "é"가 composition 없이 한 번에 올 때 등. Input Events Level 2의 **inputType** 값.
- **insertCompositionText**: IME 조합으로 텍스트가 삽입되는 경우. **한글·일본어·중국어** 등 조합 중 **compositionupdate**마다 브라우저가 이 inputType을 붙일 수 있다(iOS Safari 등에서는 발생하지 않을 수 있음).

에디터 구현 시 “커서 위치에 문자열 삽입”이면 insert다. 단, **이미 조합 구간이 있는 상태**에서 들어오는 조합 갱신은 “그 구간 전체를 새 preedit으로 교체”하는 **replace**에 가깝다.

---

## 4. replace (교체)

**replace**는 **이미 있는 텍스트 범위**를 **새 문자열로 바꾸는** 동작이다.

- **commit 시**: 조합 구간(preedit이 차지하던 범위)을 **commit 문자열로 교체**한다. “preedit 구간 → commit 문자열”이 한 번의 replace이며, **한글·일본어·중국어·유럽권·아랍어** 모두 동일하다. 예: 한글 "가" 확정, 일본어 変換에서 "か" → "漢", 중국어 후보 선택 "zhong" → "中", 데드 키 "é" 확정.
- **insertReplacementText**: Input Events Level 2의 **inputType** 값. **자동 수정(autocorrect)·추천 후보 탭** 등으로 “특정 범위를 새 텍스트로 바꿀 때” 사용된다(모바일·언어 무관). **getTargetRanges()**로 교체할 범위를 얻을 수 있다(지원 환경에서).

replace는 “범위 A를 문자열 B로 교체”이므로, **어떤 범위를 바꿀지(replacement range)**가 항상 정의된다.

---

## 5. replacement range (대체 범위)

**replacement range**는 **preedit 또는 commit이 적용되는 문서 상의 범위**다. “조합 구간”이 곧 이 범위이며, **한글·일본어·중국어·유럽권·아랍어** 모두 동일한 방식으로 동작한다.

- **compositionstart** 시: **CompositionEvent.data**는 “조합으로 **대체될** 기존 선택 영역의 문자열”이다. 즉, 사용자가 텍스트를 선택한 뒤 IME를 켜면, 그 **선택 영역**이 replacement range가 되고, preedit/commit이 그 구간을 대체한다.
- **compositionstart** 시 선택이 없으면: 조합 구간은 **커서 위치에서 길이 0**으로 시작하고, **compositionupdate**마다 preedit 길이만큼 확장된다. commit 시 그 전체 구간이 commit 문자열로 교체된다.
- macOS: **setMarkedText(_:selectedRange:replacementRange:)** 의 **replacementRange**가 “marked text가 대체하는 문서 범위”다. **insertText(_:replacementRange:)** 의 **replacementRange**는 “commit 문자열로 대체할 범위”(보통 방금까지의 marked 구간)다.

에디터는 “지금 조합 중인 구간”을 replacement range로 잡고, **compositionupdate**에서는 그 구간 전체를 새 preedit으로 바꾸고, **compositionend**에서는 그 구간을 commit 문자열로 바꾸면 된다. [글자 조합](/docs/guide/composition) 문서의 “조합 중 선택 영역·커서”와 연결된다.

---

## 6. delete (삭제)

**delete**는 **기존 텍스트를 없애는** 동작이다. IME “조합”과 직접 대응되는 개념은 아니지만, **inputType**으로 함께 전달되며 에디터가 처리해야 한다.

- **deleteContentBackward**: 커서 앞 1단위 삭제(Backspace).
- **deleteContentForward**: 커서 뒤 1단위 삭제(Delete).
- **deleteWordBackward** / **deleteWordForward**: 단어 단위 삭제.
- **deleteByCut**: 잘라내기. **deleteByDrag**: 드래그로 삭제.

조합 중에는 IME가 Backspace를 “조합 취소” 또는 “조합 단위 삭제”로 처리할 수 있어, **compositionupdate**만 오고 **deleteContentBackward**는 오지 않을 수 있다. **한글**은 자모 하나 삭제, **일본어**는 로마자 한 글자 또는 変換 취소, **중국어**는 병음 한 글자 또는 후보 취소 등 IME마다 동작이 다르다. [inputType 상세](/docs/reference/inputtype) 참고.

---

## 7. joining / conjoining (연결)

“여러 요소가 한 단위로 연결된다”는 의미의 **joining(연결)** 은 한글만의 개념이 아니다. 스크립트마다 방식이 다르다.

- **한글**: 유니코드에서는 **conjoining**이라는 말을 쓴다. 한글 자모 L(초성)·V(중성)·T(종성)를 **순서대로 나열**하면 한 음절로 해석되며, “기준 문자 + 결합 부호”가 아니다. [한글 조합 원리](/docs/korean/combination)에서 다룬다.
- **아랍어·시리아어 등**: 유니코드 **Joining_Type**(UAX #9)으로 “글자가 이웃과 연결되는지”를 정한다. 같은 코드 포인트가 **위치**(단독·어두·어중·어말)에 따라 다른 모양으로 그려진다. **문맥형** 선택은 폰트·렌더러가 하며, IME는 기본 코드 포인트만 보낸다. [아랍어 조합 원리](/docs/arabic/combination)에서 다룬다.

위의 **replace**·**replacement range**는 “문서 상의 텍스트 구간을 preedit/commit으로 **교체**한다”는 의미이고, “자모·글자가 한 단위로 연결된다”는 joining/conjoining과는 다른 층위다.

---

## 정리

| 개념 | 의미 | 웹/API에서의 대응 |
|------|------|-------------------|
| **preedit** | 조합 중 문자열, 문서에 반영 안 함 | compositionupdate의 data, setMarkedText |
| **commit** | 확정 문자열, 문서에 반영 | compositionend의 data, insertText |
| **insert** | 커서 위치에 새 텍스트 삽입 | insertText, insertCompositionText (inputType) |
| **replace** | 기존 범위를 새 문자열로 교체 | commit 시 조합 구간 교체, insertReplacementText (inputType) |
| **replacement range** | preedit/commit이 적용되는 문서 상의 범위 | 조합 구간, setMarkedText/insertText의 replacementRange |
| **delete** | 기존 텍스트 삭제 | deleteContentBackward 등 (inputType) |

이벤트·inputType 처리 시 “지금 오는 게 insert인지, replace인지, 조합 구간 교체인지”를 위 개념으로 구분하면 된다. 상세 이벤트 흐름은 [글자 조합](/docs/guide/composition), [inputType 상세](/docs/reference/inputtype), [IME 구현 상세](/docs/reference/ime-implementation-details)를 참고하면 된다. 언어별 조합 방식(preedit·commit 시점, 상태 전이 등)은 [글자 조합 방식·알고리즘](/docs/guide/composition-algorithms)과 각 언어 문서([한글](/docs/korean/combination), [일본어](/docs/japanese/combination), [중국어](/docs/chinese/combination), [아랍어](/docs/arabic/combination), [유럽권](/docs/european/combination))를 참고하면 된다.
