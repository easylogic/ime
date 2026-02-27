---
title: 베트남어 입력기
description: Windows, macOS, Linux, 모바일 베트남어 IME, Telex/VNI/VIQR, composition·insertText
---

베트남어 입력기는 **Telex**, **VNI**, **VIQR** 등 방식으로 로마자 시퀀스를 ă, â, ệ 같은 확장 문자·성조 문자로 바꾼다. OS·플랫폼마다 지원하는 입력법과 **composition 이벤트** 발생 여부가 다르다.

---

## 1. Windows

- **Windows 10 이상**: "Tiếng Việt" 키보드. **Telex**, **VNI** 등 방식 선택 가능.
- **TSF**: 조합 중(preedit)·commit을 앱에 전달. 브라우저는 CompositionEvent 또는 insertText로 전달. Telex로 "aa" 입력 시 composition이 발생할 수 있고, 환경에 따라 insertText만 올 수 있다.
- **VIQR**: 별도 레이아웃 또는 서드파티 IME로 지원.

---

## 2. macOS

- **시스템 환경설정 → 키보드 → 입력 소스**에서 "Vietnamese" 또는 "Vietnamese UniKey" 등 추가.
- **UniKey** 등 서드파티 IME를 쓰면 Telex/VNI/VIQR 선택 가능.
- **NSTextInputClient**: setMarkedText(preedit), insertText(commit). 브라우저가 composition 이벤트 또는 insertText로 전달.

---

## 3. Linux

- **IBus**, **Fcitx**에서 베트남어(UniKey 호환 등) 엔진 사용. Telex/VNI 지원.
- 조합 문자열·commit은 프레임워크가 앱에 전달. 브라우저는 composition 이벤트 또는 insertText로 전달. (상세는 [Linux IME](/docs/reference/linux-ime) 참고.)

---

## 4. 모바일

- **Android/iOS**: 베트남어 키보드 선택 시 Telex·VNI 스타일 조합을 지원하는 키보드가 있다. Gboard 등에서 베트남어 지원.
- composition 이벤트 발생 여부·insertText만 오는지는 OS·키보드 앱에 따라 다르다. 에디터는 **composition이 오면** 조합 구간으로, **오지 않으면** insertText로 처리하면 된다.

---

## 5. 입력법별 차이

| 입력법 | 확장·성조 표현 | composition 발생 가능성 |
|--------|----------------|-------------------------|
| Telex  | aa→ă, ow→ơ, af→à 등 | IME에 따라 composition 또는 insertText |
| VNI    | a6→â, o6→ô, 숫자로 성조 | 동일 |
| VIQR   | (+), (-) 등 ASCII | 데드 키와 유사, 환경에 따라 다름 |

에디터는 [베트남어 조합 원리](/docs/vietnamese/combination)에서 정한 대로 **composition 3종**과 **insertText** 둘 다 처리하면 된다.
