---
title: 한글 입력기
description: Windows, macOS, Linux, 모바일 한글 IME와 플랫폼별 연동·입력기별 조합 차이
---

한글 입력기는 OS·플랫폼마다 다른 프레임워크 위에서 동작한다. 앱은 “조합 중 문자열(preedit)”과 “확정 문자열(commit)”만 받으면 되지만, 강의·디버깅·호환성 확인을 위해 각 플랫폼의 연동 방식과 입력기별 조합 차이를 알아 두는 것이 좋다.

---

## 1. Windows

### 1.1 한글 IME

- Windows에 **한글 입력기**가 내장되어 있다. 한/영 키(또는 설정한 단축키)로 IME 전환.
- 조합 중인 문자열(preedit)과 확정된 문자열(commit)은 **TSF** 또는 구형 **IMM32** API를 통해 앱에 전달된다.

### 1.2 TSF(Text Services Framework)

- Windows Vista 이후 IME 연동의 **주된 방식**이다.
- **ITfComposition**, **ITfCompositionView** 등으로 “조합 중인 구간”의 위치·내용을 앱에 알려 준다.
- **ITfEditSession**, **ITfInsertAtSelection** 등으로 IME가 commit할 문자열을 문서에 넣는다.
- 앱(또는 브라우저)은 TSF를 통해 “지금 조합 중인 텍스트”와 “지금 확정된 텍스트”를 받아, 웹에서는 `CompositionEvent`의 `data`와 `compositionend` 시점의 commit으로 페이지에 전달한다.

### 1.3 IMM32

- 구형 API. 레거시 앱에서만 사용. **ImmSetCompositionString**, **WM_IME_COMPOSITION** 등으로 preedit·commit을 주고받는다.
- 새로 만드는 앱은 TSF를 쓰는 것이 좋다.

### 1.4 조합 중 문자열 전달

- TSF가 “조합 중인 구간”의 **문자열**과 **커서 위치**를 앱에 넘긴다. 앱은 해당 구간을 **임시로만** 표시하고, IME가 commit을 알리면 그 구간을 commit 문자열로 교체한다.
- 브라우저는 이 정보를 받아 `compositionstart` → `compositionupdate`(data 갱신) → `compositionend`(commit)로 페이지에 전달한다.

---

## 2. macOS

### 2.1 한글 입력 소스

- **시스템 환경설정 → 키보드 → 입력 소스**에서 “한국어” 또는 “2벌식”/“3벌식” 등을 추가한다.
- 한/영 전환은 보통 **Caps Lock** 또는 **Control+Space** 등으로 한다.

### 2.2 Input Method Kit / NSTextInputClient

- Cocoa 앱은 **NSTextInputClient** 프로토콜을 구현하면, IME가 그 객체를 통해 조합 문자열·commit을 전달한다.
- **insertText(_:replacementRange:)**: IME가 **commit**할 문자열을 넣을 때 호출된다. 앱은 이 문자열을 문서에 반영한다.
- **setMarkedText(_:selectedRange:replacementRange:)**: IME가 **preedit(조합 중 문자열)**을 갱신할 때 호출된다. 앱은 해당 구간을 “marked”로 표시하고, `insertText`가 올 때까지 문서에 반영하지 않는다.

### 2.3 웹

- Safari·Chrome 등 브라우저가 NSTextInputClient를 구현하고, OS IME 결과를 받아 **CompositionEvent**로 페이지에 넘긴다. 페이지는 `compositionstart`/`compositionupdate`/`compositionend`와 `data`만 처리하면 된다.

---

## 3. Linux

### 3.1 입력기 프레임워크

- **XIM(X Input Method)**: 레거시. X11 환경에서 예전에 쓰이던 방식.
- **IBus**: 현역 입력기 프레임워크. 많은 배포판에서 기본으로 사용.
- **Fcitx**: 또 다른 현역 프레임워크. Fcitx 5 등이 널리 쓰인다.

### 3.2 한글 엔진

- **ibus-hangul**, **fcitx-hangul**: Linux에서 한글 입력을 제공하는 엔진. 둘 다 **libhangul**을 사용해 한글 조합(2벌/3벌)을 수행한다.
- **libhangul**: 한글 조합 알고리즘을 제공하는 C 라이브러리. (상세는 “한글 입력기 구현” 참고.)
- **nabi**: XIM 기반 한글 입력기. libhangul 사용.

### 3.3 조합 문자열·commit 전달

- IBus/Fcitx가 앱(또는 툴킷)과 프로토콜로 preedit·commit을 주고받는다. GTK, Qt 등은 이 프로토콜을 구현해 IME 결과를 위젯에 반영한다.
- 브라우저(Chromium, Firefox 등)는 이 연동을 통해 조합 문자열·commit을 받고, **CompositionEvent**로 페이지에 전달한다.

---

## 4. 모바일(개요)

- **Android**: OS가 **Input Method Service**를 제공. 한글 키보드 앱(천지인, 쿼티, Gboard, 삼성 키보드 등)이 조합을 수행하고, **InputConnection**을 통해 앱에 preedit·commit을 전달한다.
- **iOS**: **UITextInput** 프로토콜으로 IME와 앱이 소통한다. `setMarkedText`/`insertText`에 해당하는 동작으로 preedit·commit이 전달된다.
- 모바일 브라우저도 `compositionstart`/`compositionupdate`/`compositionend`를 보내지만, **호출 횟수**나 **commit 타이밍**이 데스크톱과 다를 수 있어, 실제 기기에서 한글 입력을 테스트하는 것이 좋다. (상세는 “모바일 한글 키보드” 참고.)

---

## 5. 유니코드와 한글 입력

### 5.1 유니코드 한글 블록

한글 IME는 세 가지 유니코드 블록을 사용한다:

| 블록 | 범위 | 문자 수 | 용도 |
|------|------|---------|------|
| **Hangul Jamo** | U+1100–U+11FF | 256 | 조합용 자모 (초성 U+1100–U+1112, 중성 U+1161–U+1175, 종성 U+11A8–U+11C2) |
| **Hangul Compatibility Jamo** | U+3130–U+318F | 96 | 호환용 자모 (독립 표기, 키캡 표시 등) |
| **Hangul Syllables** | U+AC00–U+D7AF | 11,172 | 완성형 음절 (가–힣) |

### 5.2 키보드 키 → 유니코드 변환 흐름

```
물리 키 (예: 'r')
    ↓
키보드 레이아웃 (2벌식/3벌식)
    ↓
논리적 자모 (예: ㄱ, L=0)
    ↓
유니코드 코드포인트
    ├─ preedit: Jamo (U+1100) 또는 Compatibility (U+3131)
    └─ commit: Syllable (U+AC00–) 또는 Jamo/Compatibility
```

### 5.3 IME별 유니코드 출력 차이

| IME/플랫폼 | preedit 시 | commit 시 |
|------------|-----------|----------|
| **Windows 한글 IME** | Hangul Syllables (U+AC00–) | Hangul Syllables |
| **macOS 한글 입력 소스** | Hangul Syllables | Hangul Syllables |
| **Linux ibus-hangul** | Hangul Jamo (U+1100–) 또는 Syllables | Hangul Syllables |
| **fcitx-hangul** | Hangul Jamo 또는 Syllables | Hangul Syllables |

**참고**: preedit 중 IME가 보내는 문자열이 Jamo인지 Syllables인지는 IME 구현에 따라 다르다. 앱은 commit된 최종 문자열만 신뢰하면 된다.

### 5.4 완성형 음절 계산

IME가 초성(L), 중성(V), 종성(T) 인덱스를 조합하여 완성형 음절 코드포인트를 계산한다:

```
S = 0xAC00 + (L × 588) + (V × 28) + T
```

예시:
- "가" = 0xAC00 + (0 × 588) + (0 × 28) + 0 = **U+AC00**
- "각" = 0xAC00 + (0 × 588) + (0 × 28) + 1 = **U+AC01**
- "힣" = 0xAC00 + (18 × 588) + (20 × 28) + 27 = **U+D7A3**

### 5.5 호환용 자모 vs 조합용 자모

| 구분 | Compatibility Jamo (U+3130–) | Jamo (U+1100–) |
|------|------------------------------|----------------|
| **용도** | 독립 표기, UI/키캡 표시 | 음절 조합 |
| **예: ㄱ** | U+3131 | U+1100 (초성), U+11A8 (종성) |
| **NFD 정규화** | 그대로 유지 | 그대로 유지 |
| **NFC 정규화** | 그대로 유지 | 완성형으로 결합 가능 |

브라우저·에디터에서 한글을 처리할 때, **NFC(정규화된 합성)** 형태를 사용하면 완성형 음절(U+AC00–)을 얻고, **NFD(정규화된 분해)** 형태를 사용하면 Jamo 시퀀스(U+1100–)를 얻는다.

---

## 6. 입력기별 조합 차이

### 6.1 2벌식 vs 3벌식

- **2벌식**: 자음(왼손)·모음(오른손)을 나눠 배치. **초성+중성+종성** 순서로 같은 자음 키가 “초성”으로 쓰였다가 “종성”으로 쓰인다. 키 매핑과 조합 순서는 “한글 입력기 구현” 문서의 2벌식 섹션 참고.
- **3벌식**: **초성 전용·중성 전용·종성 전용** 벌을 따로 둔다. 같은 키라도 “지금 어떤 벌인지”에 따라 초성/중성/종성으로 해석된다. 2벌식과 키 배열·조합 결과가 다르다.

같은 키 시퀀스(예: “ㄱ”“ㅏ”“ㄱ”)를 넣어도 2벌식 IME는 “각”, 3벌식 IME는 다른 결과가 나올 수 있다. 에디터는 IME가 **commit한 문자열**만 신뢰하면 된다.

### 6.2 commit 시점

- **스페이스**: 현재 조합 중인 음절을 확정하고 공백을 넣는 방식이 많다.
- **엔터**: 현재 음절 확정 + 줄바꿈.
- **다음 자모 입력**: “현재 음절 확정 + 새 자모로 조합 시작”. 예: “가” 조합 중에 “ㄴ”을 누르면 “가”가 commit되고 “ㄴ”이 초성으로 시작.
- **다음 모음 입력**: “현재 음절 확정 + (종성→초성 변환 + 새 모음)”. 예: “간” 조합 중에 “ㅏ”를 누르면 “간”이 commit되고 “ㄴ”이 다음 글자 초성이 되어 “나” 조합이 시작될 수 있다.

입력기 설정(또는 입력기 종류)에 따라 위 동작이 조금씩 다를 수 있다.

### 6.3 웹에서의 차이

- 동일한 한글 입력이라도 **OS·브라우저** 조합에 따라 `compositionupdate` 호출 횟수, `data`에 오는 문자열(완성형 한 글자 vs 여러 글자)이 다를 수 있다.
- 에디터는 **이벤트로 넘어온 문자열만** 신뢰하고, “어떤 IME를 쓰는지”를 구분하지 않아도 된다.
