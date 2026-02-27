---
title: 히브리어 입력기
description: Windows, macOS, Linux, 모바일 히브리어 IME, RTL·니쿠드, composition
---

히브리어 입력기는 **히브리어 키보드**에서 자음·니쿠드(모음 기호)를 입력하고, **로마자 전환**·**니쿠드 on/off**를 지원한다. OS·플랫폼마다 연동 방식이 다르고, composition 이벤트가 발생할 수도, insertText만 올 수도 있다.

---

## 1. Windows

- **Windows**: "Hebrew" 키보드. **TSF**로 조합 중(preedit)·commit을 앱에 전달.
- 니쿠드 입력 시 composition이 발생할 수 있고, 발생하지 않고 insertText만 올 수 있다. 브라우저는 CompositionEvent 또는 insertText로 전달.

---

## 2. macOS

- **시스템 환경설정 → 키보드 → 입력 소스**에서 "Hebrew" 추가.
- **NSTextInputClient**: setMarkedText(preedit), insertText(commit). 브라우저가 composition 이벤트 또는 insertText로 전달.

---

## 3. Linux

- **IBus**, **Fcitx**에서 히브리어 키보드 사용. (상세는 [Linux IME](/docs/reference/linux-ime) 참고.)
- 조합 문자열·commit은 프레임워크가 앱에 전달.

---

## 4. 모바일

- **Android/iOS**: 히브리어 키보드. 니쿠드·로마자 전환. composition 이벤트 또는 insertText로 전달. 환경에 따라 다름.

---

## 5. 에디터에서의 주의

- **RTL**: [히브리어 조합 원리](/docs/hebrew/combination)에서 다룬 대로 **논리 오프셋**·**bidi runs**로 커서·선택을 처리한다.
- **니쿠드**: 데드 키·결합 문자와 동일하게, composition 없이 insertText만 오는 환경에 대비해 `!isComposing && inputType === 'insertText'` 시 commit 처리.
