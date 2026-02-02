---
title: 중국어 입력기
description: Windows, macOS, Linux, 모바일 중국어 IME와 플랫폼별 연동
---

중국어 입력기는 **병음(Pinyin)** 또는 **주음(注音)** 등으로 한자 후보를 만든 뒤, 사용자가 후보를 선택해 commit한다. OS·플랫폼마다 연동 방식이 다르다.

## Windows

- **Microsoft Pinyin** 등 내장. 한/영 전환으로 IME 전환.
- **TSF**: 조합 중(병음 또는 한자 후보)·commit을 앱에 전달. 브라우저는 CompositionEvent로 페이지에 전달.

## macOS

- **시스템 환경설정 → 키보드 → 입력 소스**에서 "简体中文" 또는 "繁體中文" 추가. 병음·주음 선택.
- **NSTextInputClient**: setMarkedText(preedit), insertText(commit).

## Linux

- **IBus**, **Fcitx** 등에서 **Pinyin**, **Bopomofo** 엔진 사용.
- 조합 문자열·commit은 프레임워크가 앱에 전달.

## 모바일

- Android/iOS 중국어 키보드(병음 풀 쿼티·9키·手写 등). (상세는 "모바일 중국어 키보드" 참고.)
- composition 이벤트로 preedit·commit 전달. 호출 횟수·data는 환경에 따라 다를 수 있음.

## 입력기별 조합 차이

- **병음 vs 주음**: 입력 방식만 다르고, 최종 commit은 한자(간체/번체)로 동일.
- **간체/번체**: IME 설정에 따라 후보 집합이 다름. commit 문자열만 신뢰하면 된다.
