---
title: 용어 정리
description: preedit, commit, composition, TSF, NSTextInputClient 등 IME 관련 용어 정의
---

IME·한글 입력 문서에서 자주 쓰이는 용어를 한 페이지에 정리했다.

---

## A–C

### commit (커밋)

IME가 **확정한 최종 문자열**. 사용자가 스페이스·엔터로 음절을 확정하거나, 다음 자모 입력으로 이전 글자가 확정될 때 IME가 앱에 넘기는 문자열이다. 앱은 이 문자열을 **문서에 반영**한다. 웹에서는 **compositionend** 이벤트의 **CompositionEvent.data** 에 commit 문자열이 들어 있다(취소 시에는 빈 문자열).

### composition (조합)

IME가 **아직 확정하지 않은 입력**을 처리하는 구간. “조합 중”이면 사용자가 자모·로마자·병음 등을 입력하고 있고, IME가 그걸 한 글자·한 문절로 바꾸기 전 상태다. 웹에서는 **compositionstart** 가 발생한 뒤 **compositionend** 가 발생하기 전까지를 “조합 중”으로 본다.

### compositionend

조합이 **끝날 때** 발생하는 이벤트. commit이면 **CompositionEvent.data** 에 확정 문자열이 들어 있고, 취소(Esc·포커스 잃음)면 **data** 가 빈 문자열이다.

### compositionstart

조합 **세션이 시작될 때** 발생하는 이벤트. 한글 IME에서 첫 자모를 입력할 때 등. **CompositionEvent.data** 는 조합으로 **대체될** 기존 선택 영역의 문자열(없으면 빈 문자열).

### compositionupdate

조합 **중 문자열이 바뀔 때** 발생하는 이벤트. **CompositionEvent.data** 에 **현재 조합 중인 문자열**(preedit)이 들어 있다.

### 코드 포인트 (code point)

유니코드에서 한 문자에 부여한 번호. 범위는 U+0000~U+10FFFF. 인코딩(UTF-8, UTF-16)과 구분된다. UTF-16에서는 BMP(U+0000~U+FFFF)는 코드 유닛 1개, 보조 평면(U+10000~U+10FFFF)은 서로게이트 쌍(코드 유닛 2개)으로 표현된다. 상세는 [유니코드 기본](/docs/reference/unicode-basics) 참고.

---

## E–I

### EditContext API

캔버스·커스텀 렌더링 위에서 편집과 IME를 지원하기 위한 웹 API. **characterboundsupdate** 로 문자 경계를 OS에 알려 주고, **compositionstart** / **compositionupdate** / **compositionend** 를 구독해 조합을 처리한다. 실험 단계이며 모든 브라우저에서 지원되지 않는다.

### IME (Input Method Editor, 입력기)

키보드 입력을 **조합해** 한글·일본어·중국어 등 문자를 만드는 소프트웨어. “키 하나 = 문자 하나”가 아닌, **키 시퀀스 → 조합 중 문자열(preedit) → 확정 문자열(commit)** 로 동작한다.

### insertCompositionText

**InputEvent.inputType** 값 중 하나. IME가 **조합으로** 텍스트를 삽입할 때 사용한다. iOS Safari 등에서는 이 inputType이 발생하지 않는 경우가 있다.

### isComposing

**KeyboardEvent** / **InputEvent** 의 속성. `true` 이면 해당 키 이벤트가 **IME 조합 중**에 발생한 것이다. 단축키 처리 시 `isComposing === true` 이면 해당 키를 단축키로 쓰지 않고 IME에 넘기는 것이 좋다.

---

## N–P

### NSTextInputClient

macOS에서 앱이 IME와 연동할 때 구현하는 **프로토콜**. **setMarkedText** 로 preedit을 받고, **insertText** 로 commit을 받는다. 브라우저가 이 프로토콜을 구현하고, 그 결과를 **CompositionEvent** 로 웹 페이지에 전달한다.

### preedit (조합 중 문자열)

IME가 **아직 확정하지 않은** 문자열. 화면에만 “임시로” 보여 주고, 문서에는 반영하지 않는다. 사용자가 스페이스·엔터로 확정하거나 다음 자모를 입력하면 preedit이 commit으로 바뀌어 문서에 반영된다. 웹에서는 **compositionupdate** 의 **CompositionEvent.data** 가 preedit이다.

---

## T–V

### TSF (Text Services Framework)

Windows에서 IME와 앱이 연동하는 **프레임워크**. TSF 매니저·텍스트 서비스(IME)·앱이 COM 인터페이스(ITfContext, ITfComposition, ITfEditSession 등)로 조합 문자열·commit을 주고받는다.

### VK_PROCESSKEY / keyCode 229

IME가 **키 입력을 처리 중**일 때 **keydown** 등에서 반환되는 키 코드. Windows에서는 **VK_PROCESSKEY**(229). Safari 등에서 **isComposing** 이 기대대로 동작하지 않을 때 **keyCode === 229** 로 “조합 중” 여부를 보완하는 fallback으로 쓴다.

---

## S

### 서로게이트 쌍 (surrogate pair)

UTF-16에서 U+10000~U+10FFFF를 표현하기 위해 사용하는 **두 개의 16비트 코드 유닛**. High surrogate(U+D800~U+DBFF) + Low surrogate(U+DC00~U+DFFF). JavaScript의 **String**은 코드 유닛 단위이므로, 보조 평면 문자 한 개가 **length** 2가 될 수 있다. 서로게이트를 반으로 쪼개면 깨진 문자가 나오므로, 커서·삭제·substring 시 코드 포인트 또는 그래핀 단위로 처리해야 한다. 상세는 [유니코드 기본](/docs/reference/unicode-basics) 참고.

---

## 한글 관련

### L, V, T (초성·중성·종성 인덱스)

한글 완성형 음절을 계산할 때 쓰는 **인덱스**. L=초성(0~18), V=중성(0~20), T=종성(0~27, 0=받침 없음). 공식: `S = 0xAC00 + (L×588) + (V×28) + T`.

### libhangul

한글 조합 알고리즘(2벌·3벌)과 한자 검색을 제공하는 **C 라이브러리**(LGPL-2.1). **HangulInputContext** 로 키 입력을 받아 preedit·commit 문자열을 돌려준다. ibus-hangul, fcitx-hangul, nabi, macOS 구름 등이 사용한다.

### 완성형 (Hangul Syllables)

유니코드 **U+AC00~U+D7A3** 블록. 한 음절을 **한 코드 포인트**로 표현한다. L, V, T 인덱스로 `S = 0xAC00 + (L×588) + (V×28) + T` 로 계산한다.

### 조합형 (Hangul Jamo)

유니코드 **U+1100~U+11FF** 블록. 초성·중성·종성 **자모 시퀀스**로 음절을 표현한다. NFD 정규화·옛한글 등에서 사용한다.
