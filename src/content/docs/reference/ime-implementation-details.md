---
title: IME 구현 상세
description: Windows TSF, macOS NSTextInputClient, 웹 EditContext API 구조
---

앱이 IME와 연동하려면 플랫폼별로 **조합 중 문자열(preedit)** 과 **확정 문자열(commit)** 을 주고받는 API를 사용한다. 아래는 Windows TSF, macOS NSTextInputClient, 웹 EditContext의 구조와 역할을 정리한 것이다. 실제 구현 시 각 플랫폼 공식 문서와 샘플 코드를 참고해야 한다.

---

## 1. Windows: Text Services Framework (TSF)

### 1.1 구성 요소

TSF는 **애플리케이션**, **텍스트 서비스(IME 등)**, **TSF 매니저** 세 가지로 나뉜다.

| 구성 요소 | 역할 |
|-----------|------|
| **TSF 매니저** | OS가 제공. 애플리케이션과 텍스트 서비스 간 통신을 중개. |
| **텍스트 서비스** | IME. COM 인프로세스 서버. TSF에 등록하고, 문서 텍스트를 읽고 쓴다. |
| **애플리케이션** | TSF 인식 앱. 문서·선택 영역을 TSF에 노출하고, 조합 중 구간·commit을 받는다. |

앱은 "키 코드"를 직접 받지 않고, TSF를 통해 **조합 중인 구간(composition)** 과 **commit할 문자열**을 받는다. 브라우저는 이 정보를 DOM/selection과 연결해 **CompositionEvent** 로 페이지에 전달한다.

### 1.2 앱 측: 문서·컨텍스트 노출

- **ITfDocumentMgr**, **ITfContext**: 앱이 편집 중인 문서의 "컨텍스트"를 TSF에 제공. 커서 위치·선택 영역이 여기서 관리된다.
- **ITfContextComposition**: 조합(composition)을 시작·종료. **StartComposition** 으로 조합 구간을 만들고, IME가 그 구간의 내용을 preedit으로 갱신한다.
- **ITfEditSession**: 텍스트를 읽거나 쓸 때 사용. **ITfContext::RequestEditSession** 으로 편집 세션을 요청하고, **DoEditSession** 안에서 **ITfRange** 로 텍스트를 가져오거나 넣는다.
- **ITfInsertAtSelection**: 커서 위치에 문자열을 삽입할 때 사용. IME가 commit 문자열을 문서에 넣을 때 이 인터페이스를 쓸 수 있다.

### 1.3 IME(텍스트 서비스) 측

- **ITfComposition**: 조합 구간을 나타냄. IME가 **StartComposition** 으로 만든 구간의 내용을 **SetText** 등으로 갱신하고, commit 시 해당 구간을 최종 문자열로 교체한 뒤 **EndComposition** 한다.
- **ITfEditSession::DoEditSession**: TSF 매니저가 호출. IME는 여기서 **TfEditCookie** 를 받아 문서의 **ITfRange** 를 읽고 쓰며 preedit·commit을 반영한다.

자세한 API는 Microsoft Docs의 [Text Services Framework](https://learn.microsoft.com/en-us/windows/win32/tsf/architecture), [ITfContextComposition::StartComposition](https://learn.microsoft.com/en-us/windows/win32/api/msctf/nf-msctf-itfcontextcomposition-startcomposition), [ITfEditSession](https://learn.microsoft.com/en-us/windows/win32/api/msctf/nf-msctf-itfeditsession-doeditsession) 등을 참고한다. 샘플 IME는 [microsoft/Windows-driver-samples](https://github.com/microsoft/Windows-driver-samples) 등에서 TSF 관련 예제를 찾을 수 있다.

---

## 2. macOS: Input Method Kit / NSTextInputClient

### 2.1 NSTextInputClient 프로토콜

Cocoa 앱은 **NSTextInputClient** 프로토콜을 구현한 객체(보통 **NSTextView** 또는 커스텀 뷰)를 IME에 제공한다. IME는 이 객체를 통해 preedit·commit을 전달한다.

| 메서드 | 역할 |
|--------|------|
| **setMarkedText(_:selectedRange:replacementRange:)** | IME가 **조합 중 문자열(preedit)** 을 갱신할 때 호출. 앱은 해당 구간을 "marked"로 표시하고, 문서에 반영하지 않는다. |
| **insertText(_:replacementRange:)** | IME가 **commit** 할 문자열을 넣을 때 호출. 앱은 이 문자열을 문서에 반영한다. |
| **selectedRange**, **setSelectedRange** | 선택 영역(커서·선택). IME가 preedit을 넣을 위치를 알 때 사용. |
| **attributedSubstring(forProposedRange:actualRange:)** | IME가 주변 텍스트를 필요로 할 때 호출. |
| **firstRect(forCharacterRange:actualRange:)** | IME 후보 창 등을 띄울 위치. 해당 문자 범위의 화면 좌표를 반환. |

### 2.2 동작 흐름

1. 사용자가 IME로 입력 시작 → IME가 **setMarkedText** 를 호출해 preedit 전달. 앱은 그 구간만 "marked"로 그린다.
2. 조합이 갱신될 때마다 **setMarkedText** 가 반복 호출된다.
3. 사용자가 확정(Enter·스페이스 등) → IME가 **insertText** 를 호출해 commit 문자열 전달. 앱은 marked 구간을 이 문자열로 교체하고 문서에 반영한다.
4. 취소 시 **insertText** 에 빈 문자열이 오거나, **setMarkedText** 로 구간을 비우는 방식으로 처리할 수 있다.

브라우저(Safari, Chrome macOS)는 이 프로토콜을 구현하고, 그 결과를 **CompositionEvent** (compositionstart / compositionupdate / compositionend)로 웹 페이지에 전달한다.

Apple 문서: [Input Method Kit](https://developer.apple.com/documentation/inputmethodkit), [NSTextInputClient](https://developer.apple.com/documentation/appkit/nstextinputclient).

---

## 3. 웹: EditContext API

### 3.1 목적

**EditContext** API는 **contenteditable** 이나 **input** 이 아닌, **캔버스·커스텀 렌더링** 위에서 편집과 IME를 지원하기 위한 것이다. OS가 IME 후보 창 위치를 알려면 "문자 단위 경계(character bounds)"가 필요한데, DOM이 없으면 브라우저가 자동으로 계산하지 못하므로, 앱이 **updateCharacterBounds()** 로 위치를 알려 준다.

### 3.2 주요 API

| API | 역할 |
|-----|------|
| **EditContext** | 편집 컨텍스트. 요소에 `element.editContext = new EditContext()` 로 연결. |
| **compositionstart / compositionupdate / compositionend** | DOM의 CompositionEvent와 유사. EditContext에 리스너를 붙여 조합 시작·갱신·종료를 처리. |
| **textformatupdate** | IME가 조합 중 텍스트에 서식(밑줄 등)을 적용하려 할 때 발생. 앱이 해당 구간 스타일을 갱신. |
| **characterboundsupdate** | OS가 문자 경계를 요청할 때 발생. 앱은 **updateCharacterBounds()** 를 호출해 각 문자(또는 조합 구간)의 사각형 좌표를 전달. |
| **updateText() / updateSelection()** | EditContext 내부 텍스트·선택 상태를 앱이 갱신. |

### 3.3 사용 시 주의

- **updateCharacterBounds()** 는 **characterboundsupdate** 핸들러 안에서 **동기적으로** 호출하는 것이 좋다. 그렇지 않으면 IME 후보 창 위치가 어긋날 수 있다.
- EditContext API는 **실험 단계**이며, 모든 브라우저에서 지원되지 않는다. [MDN EditContext](https://developer.mozilla.org/en-US/docs/Web/API/EditContext), [W3C EditContext](https://w3c.github.io/edit-context/) 참고.

---

## 4. Linux: XIM, IBus, Fcitx

- **XIM (X Input Method)**: 레거시. X11 환경에서 키 이벤트와 preedit·commit을 주고받는 프로토콜.
- **IBus**: 입력기 프레임워크. **ibus-hangul** 등 엔진이 libhangul로 조합을 수행하고, 앱(또는 툴킷)과 **DBus** 등으로 preedit·commit을 전달한다.
- **Fcitx**: 또 다른 입력기 프레임워크. Fcitx 5에서 한글 등은 **fcitx-hangul** 이 libhangul을 사용한다.

GTK, Qt 등은 각각 IBus/Fcitx와 연동하는 코드를 갖고 있고, 브라우저(Chromium, Firefox)는 이 툴킷 또는 자체 브릿지를 통해 composition 이벤트를 생성한다. 웹 개발자는 대부분 **composition 이벤트** 만 처리하면 되고, Linux 전용 IME를 만드는 경우에만 IBus/Fcitx API 문서를 참고하면 된다.

---

## 5. 조합 구현이 서로 다른 이유

브라우저·플랫폼·IME마다 **beforeinput / inputType / composition 이벤트**가 다른 이유는 **레이어가 다르고 책임이 다르기** 때문이다.

### 5.1 플랫폼 API 차이

- **Windows**: TSF/IMM32가 **조합 구간·commit**을 관리한다. 앱은 ITfContext/ITfComposition을 통해 **텍스트 범위** 단위로 통신한다.
- **macOS**: NSTextInputClient가 **setMarkedText / insertText** 로만 통신한다. “조합 중 문자열”은 **marked text** 로만 관리된다.
- **Linux**: IBus/Fcitx가 DBus 등으로 **preedit/commit**을 전달한다. 툴킷/브라우저가 이를 DOM 이벤트로 변환한다.

API가 다르면 **composition 이벤트와 inputType 매핑 방식**도 달라진다.

### 5.2 브라우저 구현 차이

- **Chrome/Edge/Firefox/Safari**는 **OS IME 결과를 DOM 이벤트로 바꾸는 로직**이 서로 다르다.
- 같은 플랫폼에서도 **compositionstart/ update/ end의 발생 순서**, **beforeinput의 inputType**, **input의 중복 발생** 등이 브라우저마다 다를 수 있다.
- 일부 브라우저는 **beforeinput을 생략**하거나 **non-cancelable**로 보내는 경우가 있다.

### 5.3 IME/키보드 앱 차이

- 모바일 IME는 **자동 수정·추천·삭제**를 **inputType**으로만 전달할 수 있다(예: insertReplacementText, deleteBackwardWord).
- 한글 IME도 **자모 단위** vs **완성형 단위**로 compositionupdate를 보내는 방식이 다르다.
- 동일 IME라도 **설정(자동 완성/스페이스 확정)**에 따라 commit 타이밍이 달라진다.

### 5.4 결과적으로 생기는 차이

- **composition 없이 insertText만** 오는 환경이 존재한다(특히 iOS Safari).
- **deleteBackwardWord** 같은 inputType이 **composition 이벤트 없이**만 오는 경우가 있다.
- **첫 글자부터 composition이 아닌** 경우가 있다(한글 등).

즉, 구현은 **composition 이벤트 우선 + inputType 보조**로 두고, **composition이 없을 때 inputType만으로 처리**하는 구조가 가장 안전하다.

---

## 6. 참고 링크

- **Windows TSF**: [Architecture (Text Services Framework)](https://learn.microsoft.com/en-us/windows/win32/tsf/architecture), [Input Method Editors (IME)](https://learn.microsoft.com/en-us/windows/apps/develop/input/input-method-editors)
- **macOS**: [Input Method Kit](https://developer.apple.com/documentation/inputmethodkit), [NSTextInputClient](https://developer.apple.com/documentation/appkit/nstextinputclient)
- **웹 EditContext**: [MDN EditContext](https://developer.mozilla.org/en-US/docs/Web/API/EditContext), [Using the EditContext API](https://developer.mozilla.org/en-US/docs/Web/API/EditContext_API/Guide)
- **inputType 상세**: [inputType 상세](/reference/inputtype/)
