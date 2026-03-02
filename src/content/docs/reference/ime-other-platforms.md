---
title: 다른 플랫폼 IME
description: Electron, React Native 등에서 IME·composition 다루기 요약
---

웹 브라우저가 아닌 **Electron**·**React Native** 등에서 IME를 다룰 때 **composition 이벤트** 유무와 주의점을 요약한다. 상세는 각 플랫폼 공식 문서를 참고한다.

---

## 1. Electron

- **구조**: Electron 앱은 **Chromium** 기반이므로, **웹뷰(또는 메인 창)** 안의 **HTML 입력 요소**에서는 **브라우저와 동일하게** **CompositionEvent**·**InputEvent**가 발생한다.
- **처리**: [에디터 IME 구현 가이드](/docs/editor/implementation-notes)와 동일하게 **compositionstart**·**compositionupdate**·**compositionend**와 **input**(insertText)을 처리하면 된다. OS별 차이(Windows TSF, macOS NSTextInputClient)는 Chromium이 흡수한다.
- **주의**: **nodeIntegration**·**contextIsolation** 등 보안 설정에 따라 이벤트 동작이 바뀌지는 않으나, **input** 요소가 **포커스**를 받을 수 있는지(창·웹뷰 설정)는 확인한다. **native 입력**이 아닌 **웹 콘텐츠** 내 입력이면 웹 IME 문서를 그대로 적용하면 된다.
- **참고**: [Electron 문서](https://www.electronjs.org/docs/latest/), [Chromium IME](https://chromium.googlesource.com/chromium/src/+/main/ui/base/ime/)

---

## 2. React Native

- **구조**: React Native는 **네이티브 입력 컴포넌트**(iOS UITextField/UITextView, Android EditText)를 사용한다. **웹의 CompositionEvent**와 동일한 이벤트가 **노출되지 않을 수 있다**.
- **동작**: 플랫폼별로 **onChangeText**·**onCompositionStart** 등이 제공되는지, **조합 중**과 **commit**을 구분할 수 있는지 **React Native 문서·버전**을 확인한다. 일부 시나리오에서는 **한 번에 최종 문자열만** 전달될 수 있다.
- **웹뷰 사용 시**: React Native **WebView** 안에 **contenteditable** 또는 **input**을 두고 IME를 처리하면, 웹과 동일한 composition 이벤트를 쓸 수 있다. 단 WebView 성능·접근성은 별도로 검토한다.
- **참고**: [React Native TextInput](https://reactnative.dev/docs/textinput), [React Native WebView](https://github.com/react-native-webview/react-native-webview)

---

## 3. CLI·터미널

- **터미널**에서는 **줄 단위** 입력이 많고, **OS/터미널이 IME**를 처리한 뒤 **한 줄**이 완성되면 앱에 전달되는 경우가 많다. **composition 이벤트**와 같은 **중간 상태**를 앱이 받지 않는 환경이 많다.
- **ncurses**·**readline** 등은 플랫폼별로 **편집 버퍼**·**preedit**을 다루는 API가 다를 수 있다. IME 상세는 해당 라이브러리·OS 입력 스택 문서를 참고한다.
- **웹 IME 가이드**는 **브라우저·웹뷰** 환경을 전제로 하므로, CLI 전용 요약은 이 문서 범위 밖이다.

---

## 4. 참고

- [에디터 IME 구현 가이드](/docs/editor/implementation-notes) — 웹 composition 처리
- [IME 구현 상세](/docs/reference/ime-implementation-details) — Windows TSF, macOS NSTextInputClient, Linux IBus/Fcitx
- [Linux IME 연동](/docs/reference/linux-ime) — Linux에서의 IME 연동
