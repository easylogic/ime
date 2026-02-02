---
title: 유럽권 입력기
description: Windows, macOS, Linux, 모바일 유럽어 IME와 플랫폼별 연동, 데드 키·Compose
---

유럽권 입력기는 **데드 키(dead key)** 와 **Compose 키**로 악센트·움라우트·세디유 등이 붙은 문자(é, ñ, ü, å 등)를 입력한다. OS·플랫폼마다 연동 방식이 다르고, composition 이벤트가 발생할 수도, insertText만 올 수도 있다.

## Windows

- **언어별 키보드**: 프랑스어, 스페인어, 독일어 등. 언어 전환으로 IME 전환.
- **데드 키**: 악센트 키만 누르면 문자를 찍지 않고, 다음 키와 합쳐 한 문자(예: é)를 만든다.
- **TSF**: 조합 중(preedit)·commit을 앱에 전달. 브라우저는 CompositionEvent 또는 insertText로 페이지에 전달. 환경에 따라 composition이 발생하지 않고 insertText만 올 수 있다.

## macOS

- **시스템 환경설정 → 키보드 → 입력 소스**에서 "U.S. Extended", "Français" 등 추가.
- **옵션 키 + 문자**: Option+e → acute accent 데드, 그다음 e → é. composition이 발생할 수 있다.
- **NSTextInputClient**: setMarkedText(preedit), insertText(commit). 브라우저가 composition 이벤트 또는 insertText로 전달.

## Linux

- **X11 Compose**: Compose 키 + 시퀀스(예: ~ + n → ñ). ~/.XCompose로 사용자 정의 가능.
- **IBus**, **Fcitx** 등에서 언어별 키보드·데드 키 사용.
- 조합 문자열·commit은 프레임워크가 앱에 전달. 브라우저는 composition 이벤트 또는 insertText로 페이지에 전달.

## 모바일

- Android/iOS에서 언어별 키보드(프랑스어, 스페인어 등) 선택. (상세는 "모바일 유럽권 키보드" 참고.)
- 롱프레스로 악센트 문자 선택. composition 이벤트 또는 insertText로 전달. 호출 횟수·data는 환경에 따라 다를 수 있음.

## 입력기별 조합 차이

- **데드 키 vs Compose**: 데드 키는 "부호 키 + 문자" 한 번에 한 문자. Compose는 "Compose + 시퀀스"로 한 문자.
- **composition 유무**: 데드 키 + 문자 입력 시 compositionstart → compositionupdate → compositionend가 발생하는 환경이 있고, 발생하지 않고 beforeinput/input만 오고 inputType이 insertText인 환경도 있다. 에디터는 composition이 오면 조합 구간으로, 오지 않으면 insertText로 처리하면 된다.
