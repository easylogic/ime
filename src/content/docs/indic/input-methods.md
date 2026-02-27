---
title: 인도계 문자 입력기
description: Windows, macOS, Linux, 모바일 인도어 IME, 로마자 변환·자음·matra·연자, composition
---

인도계 문자(힌디·벵골·타밀·텔루구 등) 입력기는 **로마자 → 인도 문자** 변환(IME) 또는 **인도어 키보드**에서 자음·모음(matra) 순서로 입력한다. OS·플랫폼마다 연동 방식이 다르고, composition 이벤트가 발생할 수도, insertText만 올 수도 있다.

---

## 1. Windows

- **Windows**: "Hindi", "Bengali", "Tamil", "Telugu" 등 키보드. **TSF**로 조합 중(preedit)·commit을 앱에 전달.
- **Google Input Tools** 등 서드파티 IME로 로마자→데바나가리 변환. 브라우저는 CompositionEvent 또는 insertText로 전달.

---

## 2. macOS

- **시스템 환경설정 → 키보드 → 입력 소스**에서 "Hindi", "Bengali" 등 추가.
- **NSTextInputClient**: setMarkedText(preedit), insertText(commit). 브라우저가 composition 이벤트 또는 insertText로 전달.

---

## 3. Linux

- **IBus**, **Fcitx**에서 힌디(Devanagari)·벵골·타밀 등 엔진 사용. (상세는 [Linux IME](/docs/reference/linux-ime) 참고.)
- 조합 문자열·commit은 프레임워크가 앱에 전달.

---

## 4. 모바일

- **Android/iOS**: 힌디·벵골·타밀 등 키보드. 로마자 변환 또는 자음·matra 조합. composition 이벤트 또는 insertText로 전달. 환경에 따라 다름.

---

## 5. 에디터에서의 주의

- **커서·삭제·선택**: [인도계 문자 조합 원리](/docs/indic/combination)에서 다룬 대로 **그래핀 클러스터** 단위로 처리. **Intl.Segmenter** (granularity: `'grapheme'`, locale: `'hi'` 등) 사용을 권장.
- **정규화**: 저장·검색 시 NFC 또는 NFD 중 하나로 통일하면 비교·검색이 안정된다.
