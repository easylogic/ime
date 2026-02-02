---
title: 아랍어 입력기
description: Windows, macOS, Linux, 모바일 아랍어 IME와 플랫폼별 연동, RTL
---

아랍어 입력기는 OS·플랫폼마다 다른 프레임워크 위에서 동작한다. 키→문자 매핑과 RTL(오른쪽→왼쪽) 처리가 핵심이다. 앱은 조합 중 문자열(preedit)과 확정 문자열(commit)만 받으면 되지만, RTL·bidi를 지원하려면 플랫폼별 연동 방식을 알아 두는 것이 좋다.

## Windows

- **아랍어 키보드**: Windows 내장. 언어 전환으로 IME 전환.
- **TSF**: 조합 중(preedit)·commit을 앱에 전달. 브라우저는 CompositionEvent로 페이지에 넘긴다.
- **RTL**: 텍스트는 논리 순서로 저장되고, 표시 시 RTL로 배치. TSF가 커서·선택을 논리 오프셋으로 전달.

## macOS

- **시스템 환경설정 → 키보드 → 입력 소스**에서 "العربية" 등 아랍어 추가.
- **NSTextInputClient**: setMarkedText(preedit), insertText(commit). 브라우저가 composition 이벤트로 전달.
- **RTL**: NSTextInputClient와 함께 bidi 정보가 전달된다. 에디터는 논리 오프셋과 시각적 커서를 구분해 처리.

## Linux

- **IBus**, **Fcitx** 등에서 아랍어 키보드 레이아웃 사용.
- 조합 문자열·commit은 프레임워크가 앱에 전달. 브라우저는 composition 이벤트로 페이지에 전달.
- **RTL**: 폰트·렌더러가 유니코드 UAX #9(양방향 알고리즘)에 따라 문맥형·방향을 처리.

## 모바일

- Android/iOS 아랍어 키보드(풀 쿼티·RTL 레이아웃). (상세는 "모바일 아랍어 키보드" 참고.)
- composition 이벤트로 preedit·commit 전달. 호출 횟수·data는 환경에 따라 다를 수 있음.
- **RTL**: 모바일 OS가 키보드 레이아웃·커서를 RTL로 표시. 앱은 논리 오프셋으로 편집하면 된다.

## 입력기별 조합 차이

- **문맥형**: 아랍어는 한글처럼 "자모→음절"이 아니라, **키→문자(코드 포인트)** 매핑이다. 문맥형(이솔레이션·초·중·종형) 선택은 **폰트·렌더러**가 한다. IME는 기본 코드 포인트만 보낸다.
- **타슈킬 등**: 결합 부호(타슈킬)를 넣는 IME는 composition 이벤트를 쓸 수 있다. 단순 키 매핑만 하면 insertText만 올 수 있다.
