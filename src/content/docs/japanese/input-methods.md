---
title: 일본어 입력기
description: Windows, macOS, Linux, 모바일 일본어 IME와 플랫폼별 연동
---

일본어 입력기는 OS·플랫폼마다 다른 프레임워크 위에서 동작한다. 로마자→히라가나·변환(変換)·commit은 composition 이벤트로 전달된다.

## Windows

- **Microsoft IME**: Windows 내장. 한/영 전환으로 IME 전환.
- **TSF**: 조합 중(preedit)·commit을 앱에 전달. 브라우저는 `CompositionEvent`로 페이지에 넘긴다.
- **変換/無変換 키**: 변환(히라가나→한자), 무변환(히라가나↔가타카나) 등.

## macOS

- **시스템 환경설정 → 키보드 → 입력 소스**에서 "日本語" 추가. 로마자·가나 직접 전환 가능.
- **NSTextInputClient**: `setMarkedText`(preedit), `insertText`(commit). 브라우저가 이를 composition 이벤트로 전달.

## Linux

- **IBus**, **Fcitx** 등에서 일본어 엔진(anthy, mozc 등) 사용.
- 조합 문자열·commit은 프레임워크가 앱에 전달하고, 브라우저는 composition 이벤트로 페이지에 전달.

## 모바일

- Android/iOS 일본어 키보드(로마자·12키 가나 등). (상세는 "모바일 일본어 키보드" 참고.)
- composition 이벤트는 OS·앱에 따라 호출 횟수·타이밍이 다를 수 있다.

## 입력기별 조합 차이

- **로마자 vs 가나 직접**: 같은 "か"도 로마자(k+a)와 가나 직접 입력은 IME 내부 처리 경로가 다를 수 있다.
- **commit 시점**: Enter, 다음 문자 입력, 変換 후 Enter 등. 에디터는 compositionend의 data만 신뢰하면 된다.
