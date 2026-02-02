---
title: 기존 프로젝트 소개
description: 한글/IME 관련 오픈소스, OS·에디터의 IME 처리 원리
---

한글 입력 엔진·입력기·에디터에서 IME를 어떻게 다루는지 참고할 수 있는 프로젝트와 링크를 정리했다.

## 한글 입력 엔진·라이브러리

| 프로젝트 | 설명 | 저장소·링크 |
|----------|------|-------------|
| **libhangul** | 한글 조합 알고리즘(2벌/3벌)을 제공하는 C 라이브러리. HangulInputContext API로 키 입력 → 자모 시퀀스 → 완성형 변환. LGPL-2.1. | [github.com/libhangul/libhangul](https://github.com/libhangul/libhangul) |
| **ibus-hangul** | IBus용 한글 엔진. libhangul을 사용. Linux에서 한글 입력 시 자주 쓰인다. GPL-2.0. | [github.com/libhangul/ibus-hangul](https://github.com/libhangul/ibus-hangul) |
| **fcitx-hangul** | Fcitx용 한글 엔진. libhangul 기반. | Fcitx 프로젝트 내 한글 모듈 |
| **nabi** | XIM 기반 한글 입력기. libhangul 사용. “The Easy Hangul XIM”. | [github.com/libhangul/nabi](https://github.com/libhangul/nabi) |
| **나랏글** | 오픈소스 한글 입력기. 레이아웃·조합 방식이 나랏글만의 특성이 있음. | 나랏글 공식 사이트·저장소 검색 |
| **구름(Gureum)** | macOS용 한글 입력기. libhangul 또는 자체 조합 로직 사용. | [github.com/gureum/gureum](https://github.com/gureum/gureum) |

각 프로젝트의 “조합 원리”는 libhangul을 쓰는 경우 유니코드 한글 완성형 공식(0xAC00 + 초성×588 + 중성×28 + 종성)과 2벌/3벌 키 매핑 테이블을 따른다. 나랏글·구름 등은 자체 레이아웃·규칙이 있을 수 있으므로 해당 프로젝트 문서를 참고하면 된다.

## OS·플랫폼 IME

| 플랫폼 | 연동 방식 | 참고 |
|--------|-----------|------|
| **Windows** | TSF(Text Services Framework), 구형 IMM32 | MSDN Text Services Framework |
| **macOS** | Input Method Kit, Cocoa NSTextInputClient | Apple Developer Input Method Kit |
| **Chromium** | 브라우저가 OS IME와 연동해 composition 이벤트 생성 | Chromium IME 브릿지 코드(IME 관련 디렉터리) |

앱은 보통 “키 코드”가 아니라 “조합 중 문자열(preedit)”과 “확정 문자열(commit)”만 받는다. OS IME가 조합을 수행하고, 그 결과를 플랫폼 API로 앱에 전달한다.

## 에디터·에디터 라이브러리

| 프로젝트 | IME 관련 동작 | 참고 |
|----------|----------------|------|
| **ProseMirror** | prosemirror-view에서 DOM 입력·composition 이벤트 처리. 조합 중 구간을 별도로 유지하고, compositionend 시점에 문서에 반영. | [prosemirror.net](https://prosemirror.net), prosemirror-view 소스 |
| **Slate** | React 기반 에디터. composition 이벤트를 구독해 조합 중 노드/선택 영역 처리. | Slate 문서·소스 내 composition 관련 코드 |
| **Lexical** | Meta의 에디터 프레임워크. IME/composition 처리 모듈이 있음. | Lexical 문서·소스 |
| **CodeMirror 6** | 입력 처리가 에디터 코어에 포함. composition 이벤트로 조합 중 입력과 commit 구분. | CodeMirror 6 문서·소스 |
| **Monaco** | VS Code 에디터 엔진. OS IME와 연동해 composition 처리. | Monaco/VS Code 소스 |

공통 원리는 “compositionstart → compositionupdate 반복 → compositionend” 흐름을 구독하고, 조합 중인 구간을 임시로만 표시하다가 compositionend 시점에 commit 문자열을 문서에 반영하는 것이다. undo는 보통 “조합 중에는 스택에 넣지 않고, commit 시 한 번에 넣는” 방식으로 한다.

## 참고 링크

- **유니코드 한글**: [Unicode Hangul Syllables (U+AC00)](https://www.unicode.org/charts/PDF/UAC00.pdf), [Hangul Jamo](https://en.wikipedia.org/wiki/Hangul_Jamo_(Unicode_block))
- **웹 입력 이벤트**: [MDN CompositionEvent](https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent), [W3C UI Events](https://w3c.github.io/uievents/), [Input Events Level 2](https://www.w3.org/TR/input-events-2/)
- **구현 코드·상세**: [IME·한글 구현 코드 예시](/reference/code-examples/), [IME 구현 상세](/reference/ime-implementation-details/), [한글: libhangul API](/korean/libhangul-api/)
