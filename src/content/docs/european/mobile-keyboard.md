---
title: 모바일 유럽권 키보드
description: 언어별 레이아웃, 롱프레스·악센트 선택, 이벤트·commit
---

모바일 유럽권 키보드는 **언어별 레이아웃**(프랑스어, 스페인어, 독일어 등)을 쓰며, 악센트·움라우트·세디유가 붙은 문자(é, ñ, ü 등)는 **롱프레스** 또는 **전용 키**로 선택한다.

## 레이아웃

- **언어별 키보드**: 시스템에서 "Français", "Español", "Deutsch" 등 선택 시 해당 언어 자판으로 전환.
- **기본 키 + 롱프레스**: 예: e를 길게 누르면 é, è, ê, ë 등이 팝업으로 뜨고, 선택 시 해당 문자가 입력된다.
- **전용 악센트 키**: 일부 레이아웃에는 악센트 전용 키가 있어, 누른 뒤 e 등을 누르면 é가 되는 식이다.

## 제스처

- **롱프레스**: 같은 키에 다른 문자(악센트 변형·숫자) 선택.
- **스와이프**: 일부 키보드에서 방향에 따라 다른 문자.

## 조합·commit

- **데드 키 유사**: 롱프레스로 "é"를 선택하면, composition 이벤트가 발생할 수도 있고 insertText(é)만 올 수도 있다.
- **commit**: compositionend의 data 또는 input/insertText의 data가 확정 문자열.

## 이벤트·commit

- 모바일 브라우저에서 데드 키·롱프레스 입력 시 compositionstart → compositionupdate → compositionend가 발생하는 환경이 있고, 발생하지 않고 beforeinput/input만 오고 inputType이 insertText, data가 "é"인 환경도 있다.
- 에디터는 composition 이벤트가 오면 조합 구간으로 처리하고, 오지 않으면 일반 insertText로 처리하면 된다.
- **NFC/NFD**: commit 문자열이 미리 조합형(U+00E9)일 수도, 분해형(e + U+0301)일 수도 있다. 비교·검색 시 정규화(NFC 또는 NFD)를 적용하는 것이 좋다.
