---
title: 음성 입력·딕테이션과 입력 경로
description: 키보드 IME·붙여넣기·음성·필기, 중간 결과 갱신·Web Speech API interim
---

웹 에디터는 “**키보드로 IME 조합**”만 가정하면 **딕테이션·붙여넣기·자동완성** 경로에서 텍스트가 빠진다. 이 문서는 **입력 경로**를 나누고, 각 경로에서 **composition 이벤트**가 오는지·**insertText**만 오는지 정리한다. iOS Safari 딕테이션은 [브라우저 IME 버그 인덱스 §1.1](/docs/reference/browser-ime-bugs)에 **사례**로 들어 있으며, 여기서는 **일반 분류**로 다룬다.

---

## 1. 입력 경로 분류

| 경로 | 설명 | 전형적인 웹 이벤트 |
|------|------|-------------------|
| **A. 키보드 + IME** | 물리/소프트 키보드에서 한글·일본어·중국어 등 **조합 입력** | `compositionstart` → `compositionupdate` → `compositionend`, `beforeinput`/`input`(insertCompositionText 등) |
| **B. 키보드 + 비조합** | 영문 직접 입력, IME 없음 | `beforeinput`/`input` `insertText`, composition 없음 |
| **C. 붙여넣기** | 클립보드에서 붙여넣기 | `beforeinput`/`input` `insertFromPaste` 등, composition 없음 |
| **D. 음성 입력·딕테이션** | OS·브라우저 음성으로 텍스트 삽입 | **가설 문자열이 반복 교체**되거나([§3](/docs/reference/voice-dictation-input#3-중간-결과가-계속-바뀌는-경우가설확정)), **composition 없이** `insertText` 등만 오는 경우가 많음 |
| **E. 필기·스타일러스 IME** | 필기 인식, 일부 모바일 키보드 확장 | IME에 따라 composition 또는 insertText |
| **F. 자동완성·치환** | 비밀번호 관리자, OS 자동완성 | `beforeinput` 생략·취소 불가인 경우가 있음([웹 IME 명세 요약 §2](/docs/reference/web-ime-specs)) |

에디터는 **A**만 처리하고 **D**를 놓치면, 딕테이션으로 말한 글자가 **문서에 안 들어가는** 증상이 난다.

---

## 2. 음성·딕테이션에서 왜 composition이 없을 수 있나

- 브라우저·OS는 **음성 인식 결과**를 “**이미 확정된 문자열**”로 한 번에 넣는 경로를 쓰는 경우가 있다. 이때 **조합 세션**이 없으므로 `compositionstart`가 없고, **`inputType === 'insertText'`** 와 `data`만 온다.
- WebKit 쪽 이슈: [Bug 261764](https://bugs.webkit.org/show_bug.cgi?id=261764) — iOS Safari에서 **딕테이션 시 composition 미발생**. 회피는 **insertText를 commit으로 처리**([트러블슈팅](/docs/reference/troubleshooting), [composition 시나리오](/docs/reference/composition-edge-cases)).

**다른 브라우저**에서도 음성 입력이 **composition 없이** 들어오는 사례가 보고되므로, **경로 이름**보다 **이벤트 패턴**으로 대응하는 것이 안전하다.

---

## 3. 중간 결과가 계속 바뀌는 경우(가설·확정)

말하는 동안 인식 엔진은 **후보 문장을 여러 번 고친다**. 화면에서는 글자가 **계속 바뀌는** 것처럼 보인다. 이는 IME **preedit**과 비슷하지만, 웹 표준에서는 보통 **`compositionupdate` 한 줄로 정리되지 않고**, 플랫폼마다 **삽입·삭제·교체** 이벤트 조합으로 나타난다.

### 3.1 동작을 나누는 개념

| 구분 | 설명 |
|------|------|
| **가설(중간, interim)** | 아직 확정되지 않은 인식 결과. 같은 위치의 문자열이 **덮어쓰기**되며 갱신될 수 있다. |
| **최종 확정(final)** | 인식이 끝난 조각. 이후로는 그 구간만큼은 **일반 텍스트**처럼 취급해도 된다. |

에디터는 **가설 구간**을 “조합 중”처럼 한 덩어리로 두고 갱신할지, **문서에 바로 반영**하면서 매번 범위를 교체할지 정해야 한다. 후자는 **`beforeinput`/`input`이 연속**으로 오고 **`deleteContentBackward`**·**`insertText`**·**교체**가 섞일 수 있음을 전제한다.

### 3.2 Web Speech API (`SpeechRecognition`)

- **`interimResults: true`**이면 `onresult`에서 **`SpeechRecognitionResult`**마다 **`isFinal`** 여부를 볼 수 있다. **`isFinal === false`**인 결과는 **같은 발화 구간**에 대해 **transcript가 바뀌며** 다시 올 수 있다.
- 앱이 DOM에 직접 넣는 패턴: **임시 구간**(예: 마지막 문장만)을 잡아 두고, interim이 올 때마다 **해당 범위를 통째로 교체**하고, `isFinal === true`이면 그때 **커밋**으로 고정한다. 이 경로는 **`input` 이벤트가 아니라 앱 코드**가 문서를 바꾸므로, 에디터의 **외부 변경·협업 동기화** 규칙과 맞출 필요가 있다.

### 3.3 OS·브라우저 딕테이션(웹 `contenteditable`·`input`)

- 플랫폼이 **한 번에 한 문장**만 넣는 경우도 있고, **짧은 구간이 반복 교체**되는 경우도 있다. **`insertReplacementText`**, **`deleteContentBackward` 후 `insertText`** 등 [inputType](/docs/reference/inputtype) 조합으로 올 수 있다.
- **`getTargetRanges()`**가 주어지면 **어느 구간이 교체 대상**인지 알 수 있지만, 지원하지 않는 환경에서는 **직전 삽입 길이**를 추적해 **가설 구간**을 에디터 내부에서만 관리하는 식으로 보완한다.

### 3.4 IME preedit와의 비교

- **유사점**: 사용자가 보기에는 “아직 확정 안 된 글자가 바뀐다.”
- **차이점**: IME는 **`compositionstart`~`compositionupdate`**로 모델이 잡히는 경우가 많고, 음성 가설은 **composition 없이** DOM만 바뀌거나, **앱이 Web Speech로 직접** 그린다. 그래서 **같은 “조합 중” 상태 머신**을 재사용하지 못할 수 있다.

---

## 4. 에디터 구현 원칙(경로 독립)

1. **조합 경로**: `compositionstart`~`compositionend`로 preedit·commit 처리([글자 조합](/docs/guide/composition)).
2. **비조합 삽입**: `!event.isComposing` 이고 `inputType === 'insertText'`(또는 환경에 맞는 타입)이면 **`data`를 commit**한다. [에디터 IME 구현 가이드 §iOS](/docs/editor/implementation-notes)의 insertText 폴백과 동일 계열이다.
3. **중복 방지**: 같은 삽입이 `compositionend`와 `input`으로 **두 번** 오는 브라우저가 있으므로, **한 번만 반영**하도록 idempotency·순서 규칙을 둔다([브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks)).

음성만 특수 케이스로 두지 않고, **“composition 없이 들어오는 텍스트 삽입”** 전부에 같은 처리를 적용하면 딕테이션·일부 붙여넣기·확장 입력을 함께 커버한다. 다만 **§3**처럼 **같은 위치가 반복 교체**되면, 단순히 `insertText`마다 append만 하면 **문장이 중복**될 수 있으므로 **가설 구간·교체 범위**를 구분한다.

---

## 5. 접근성·API

- **Web Speech API**(`SpeechRecognition`)는 **별도 스트림**으로 결과를 주고, 앱이 **DOM에 직접 삽입**하는 경우도 있다. 이 경우 **input 이벤트**가 아니라 **앱 코드**가 문서를 바꾸므로, 에디터의 **외부 변경 동기화** 규칙과 맞춰야 한다.
- **미디어 캡처**와 **텍스트 필드**는 서로 다른 권한·포커스 모델을 가진다. 딕테이션 중 **포커스가 입력 요소에 있는지**는 플랫폼마다 다르다.

---

## 6. 테스트 시나리오(요약)

- [ ] **iOS Safari**: 음성 입력(딕테이션) 켠 뒤 한글·영문 삽입 → `composition` 없이 `insertText`만 오는지 로그로 확인.
- [ ] **Android Chrome**: 동일.
- [ ] **데스크톱**: OS 음성 입력(지원 시)으로 필드에 넣었을 때 텍스트 누락 없음.
- [ ] **긴 문장**: 말하는 동안 **문자열이 여러 번 바뀌어도** 최종적으로 한 번만 남는지, **중복 삽입**이 없는지 확인.

상세 체크리스트는 [IME 테스트·디버깅 가이드](/docs/reference/ime-testing)를 따른다.

---

## 7. 참고

- [브라우저 IME 버그 인덱스](/docs/reference/browser-ime-bugs) — WebKit 딕테이션
- [브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks) — iOS Safari insertCompositionText 미사용
- [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases) — composition 없이 insertText
- [inputType 상세](/docs/reference/inputtype) — insertReplacementText, 삭제·교체 inputType
- [트러블슈팅](/docs/reference/troubleshooting) — 증상별
