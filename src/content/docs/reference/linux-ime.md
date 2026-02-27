---
title: Linux IME 연동
description: IBus, Fcitx 연동 구조, preedit·commit 전달, 브라우저가 composition으로 넘기는 방식
---

Linux에서 IME는 **IBus** 또는 **Fcitx** 같은 **입력기 프레임워크**를 통해 앱에 **preedit**·**commit**을 전달한다. 웹 에디터는 **브라우저**가 이 정보를 **CompositionEvent**로 변환하므로, 대부분 **composition 이벤트**만 처리하면 된다. Linux 전용 IME를 만들거나 **composition이 다르게 오는 퀴크**를 파악할 때 아래 구조를 참고한다.

---

## 1. IBus

### 1.1 구조

- **IBus**는 **D-Bus** 기반 입력기 프레임워크다. **입력기 엔진**(한글: ibus-hangul, 일본어: ibus-mozc 등)이 **조합**을 수행하고, **IBus 데몬**이 **앱(클라이언트)**과 **엔진** 사이에서 **preedit·commit**을 중개한다.
- **앱(툴킷)**은 **IBusInputContext**를 통해 **CommitText**, **UpdatePreeditText** 등 시그널을 받는다. **preedit**은 문자열·속성(밑줄 등)·커서 위치로 전달된다.

### 1.2 브라우저

- **Chromium**: Linux에서 **IBus** 또는 **Fcitx**를 사용한다. 툴킷(GTK 등) 또는 자체 브릿지로 **preedit·commit**을 받아 **CompositionEvent**(compositionstart / compositionupdate / compositionend)로 페이지에 전달한다.
- **Firefox**: 마찬가지로 IBus/Fcitx와 연동해 composition 이벤트를 생성한다.
- **결과**: 웹 페이지에서는 **OS별 차이**가 브라우저가 흡수되므로, **composition 3종 + insertText** 처리만 하면 Linux에서도 동작한다. 다만 **composition이 발생하지 않고 insertText만** 오는 조합(특정 엔진·설정)이 있을 수 있으므로, [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)의 "composition 없이 insertText만 오는 경우" 대응이 필요하다.

---

## 2. Fcitx / Fcitx 5

### 2.1 구조

- **Fcitx**는 **InputContext** 단위로 **preedit**·**commit**을 앱에 전달한다. **Fcitx 5**에서는 **fcitx-hangul** 등 엔진이 **libhangul**로 조합을 수행하고, **InputContext**의 **CommitString**, **UpdatePreedit** 등 콜백으로 앱에 넘긴다.
- **X11**과 **Wayland** 모두 지원한다. Wayland에서는 **text-input** 프로토콜 등으로 IME와 클라이언트가 통신할 수 있다.

### 2.2 브라우저

- Chromium·Firefox는 **Fcitx**를 지원한다. **preedit·commit**을 받아 **CompositionEvent**로 변환. 웹 개발자 입장에서는 **IBus**와 동일하게 **composition 이벤트**만 처리하면 된다.

---

## 3. XIM (레거시)

- **XIM (X Input Method)**는 **X11** 시대의 입력기 프로토콜이다. **키 이벤트**를 IME에 넘기고, **preedit·commit** 문자열을 받는 방식. **현재** 대부분의 데스크톱 환경은 **IBus** 또는 **Fcitx**를 쓰며, XIM은 레거시 앱용으로만 남아 있다.
- 웹 브라우저는 **XIM**을 직접 쓰지 않고 **IBus/Fcitx** 경로를 사용한다.

---

## 4. 에디터 구현자 관점

- **웹**: Linux에서 **composition 이벤트**가 **Windows/macOS와 동일한 순서**로 오는지 여부는 **브라우저 구현**에 따른다. **composition 없이 insertText만** 오는 엔진·설정이 있으면 [트러블슈팅](/docs/reference/troubleshooting)의 "composition 없이 insertText" 대응으로 처리한다.
- **네이티브 앱**: GTK는 **GtkIMContext**(IBus 연동), Qt는 **QPlatformInputContext**로 IBus/Fcitx와 연동한다. 각 툴킷 문서 참고.
- **참고**: [IME 구현 상세](/docs/reference/ime-implementation-details) §4에도 Linux 요약이 있다.

---

## 5. 참고 링크

- **IBus**: [ibus project](https://github.com/ibus/ibus), [ibus-hangul](https://github.com/libhangul/ibus-hangul)
- **Fcitx**: [Fcitx](https://fcitx-im.org/), [Fcitx 5](https://github.com/fcitx/fcitx5)
- [브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks) — 환경별 composition·insertText 차이.
