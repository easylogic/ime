---
title: 태국어 입력기
description: Windows, macOS, Linux, 모바일 태국어 IME, 자음·모음·성조 조합, composition
---

태국어 입력기는 **자음·모음·성조**를 키 시퀀스로 입력하면 OS IME가 **한 음절**로 조합한다. 플랫폼마다 연동 방식이 다르고, composition 이벤트가 발생할 수도, insertText만 올 수도 있다.

---

## 1. Windows

- **Windows**: "Thai" 키보드. 자음·모음·성조 순서로 입력. **TSF**로 조합 중(preedit)·commit을 앱에 전달.
- 브라우저는 CompositionEvent 또는 insertText로 전달. 환경에 따라 다름.

---

## 2. macOS

- **시스템 환경설정 → 키보드 → 입력 소스**에서 "Thai" 또는 "Thai - Pattachote" 등 추가.
- **NSTextInputClient**: setMarkedText(preedit), insertText(commit). 브라우저가 composition 이벤트 또는 insertText로 전달.

---

## 3. Linux

- **IBus**, **Fcitx**에서 태국어 키보드 사용. 조합 문자열·commit은 프레임워크가 앱에 전달. (상세는 [Linux IME](/docs/reference/linux-ime) 참고.)

---

## 4. 모바일

- **Android/iOS**: 태국어 키보드 선택. 자음·모음·성조 조합 지원. composition 이벤트 또는 insertText로 전달. 호출 횟수·data는 환경에 따라 다를 수 있음.

---

## 5. 에디터에서의 주의

- **커서·삭제·선택**: [태국어 조합 원리](/docs/thai/combination)에서 다룬 대로 **그래핀 클러스터** 단위로 처리하는 것이 좋다. 코드 유닛/코드 포인트 단위만 쓰면 한 음절이 쪼개질 수 있다.
- **단어 경계**: 단어 사이 공백이 없을 수 있으므로, 단어 단위 선택·삭제 시 **Intl.Segmenter** (granularity: `'word'`, locale: `'th'`) 등을 고려한다.
