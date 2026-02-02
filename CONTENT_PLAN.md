# IME 가이드 사이트 — 상세 콘텐츠 계획

문서 작성 시 이 계획을 기준으로 섹션·항목을 채운다. 구체적 사실과 동작만 기술하고, "업계 표준" 등 모호한 표현은 사용하지 않는다.

---

## 1. 가이드 (공통)

### 1.1 IME란 — `src/content/docs/guide/what-is-ime.md`

| 섹션 | 내용 |
|------|------|
| **IME 정의** | Input Method Editor(입력기)란 무엇인지. 키 입력을 문자로 변환하는 계층. OS/플랫폼이 제공하는 입력 처리 단계. |
| **에디터에서 중요한 이유** | 에디터가 IME를 무시하면 생기는 현상: 조합 중 글자가 깨짐, 커서 위치 틀어짐, 한 번에 한 글자만 들어감, undo/redo 꼬임. 왜 에디터는 composition 이벤트를 따로 처리해야 하는지. |
| **composition vs commit** | composition: 아직 확정되지 않은 조합 중 문자열. commit: 사용자가 확정한 문자열이 문서에 반영되는 시점. 두 개념의 구분과 이벤트·API에서의 대응. |

**채울 하위 항목**

- IME가 처리하는 입력의 범위(알파벳 직접 입력 vs 한글/일본어/중국어 등 조합 입력).
- "에디터"의 범위: 텍스트 필드, contenteditable, 코드 에디터, IDE 등에서 공통으로 필요한 IME 처리.

---

### 1.2 IME 구조 — `src/content/docs/guide/ime-architecture.md`

| 섹션 | 내용 |
|------|------|
| **전체 흐름** | 키 이벤트 → OS/플랫폼 IME → 앱(브라우저/에디터)으로 전달되는 경로. 입력 컨텍스트(Input Context)가 무엇이고, 누가 소유하는지. |
| **플랫폼별 차이** | Windows(TSF, IMM32), macOS(Input Method Kit, NSTextInputClient), Linux(XIM, IBus, Fcitx), 웹(브라우저가 OS IME와 어떻게 연동하는지). 각 플랫폼에서 "조합 중 문자열"이 앱에 전달되는 방식. |
| **웹/브라우저** | `beforeinput`, `compositionstart`/`compositionupdate`/`compositionend`, `input` 이벤트가 어떤 순서로 발생하는지. 브라우저별 차이(Chrome, Firefox, Safari, Edge)가 있다면 구체 사례. |
| **입력 컨텍스트와 포커스** | 포커스가 다른 요소로 이동할 때 composition이 취소되는지, 플랫폼별 동작. |

**채울 하위 항목**

- OS IME와 앱 사이의 프로토콜/API 이름(플랫폼별).
- 브라우저 개발자 도구로 확인할 수 있는 이벤트 순서 예시.

---

### 1.3 글자 조합 — `src/content/docs/guide/composition.md`

| 섹션 | 내용 |
|------|------|
| **composition 이벤트** | `compositionstart`: 조합 시작. `compositionupdate`: 조합 중 문자열 변경. `compositionend`: 조합 종료(commit 또는 취소). 각 이벤트가 발생하는 조건과 시점. |
| **이벤트 데이터** | `CompositionEvent.data`: 현재 조합 중 문자열. `CompositionEvent.data`가 빈 문자열인 경우(조합 취소 등). `InputEvent.data`, `inputType`과의 관계. |
| **beforeinput / input** | `beforeinput`의 `inputType`: `insertCompositionText` vs `insertText` 등. composition 중에는 어떤 inputType이 오는지. `input` 이벤트와 composition 이벤트의 발생 순서. |
| **선택 영역·커서** | 조합 중일 때 `selectionStart`/`selectionEnd` 또는 Selection API로 얻는 범위가 무엇을 가리키는지. 조합 영역과 커서 위치의 관계. |
| **취소와 commit** | 사용자가 Esc를 누르거나 다른 곳을 클릭할 때: `compositionend`가 발생하는지, `data`가 빈 문자열인지. 스페이스/엔터로 한글 음절 확정 시 이벤트 순서. |

**채울 하위 항목**

- W3C/WHATWG 명세에서 정의한 composition 이벤트 동작 요약.
- 실제 로그 예시(키 입력 → 이벤트 순서 → data 값).

---

### 1.4 키보드/IME별 차이 — `src/content/docs/guide/keyboard-ime-differences.md`

| 섹션 | 내용 |
|------|------|
| **차이가 나는 이유** | 키보드 레이아웃(물리 키)과 IME(조합 알고리즘)는 별개. 같은 키 시퀀스라도 IME에 따라 조합 결과가 다름. |
| **한글** | 2벌식, 3벌식, 모바일(천지인, 쿼티 등). 각각 어떤 키 시퀀스로 어떤 자모/글자가 나오는지. 조합 단계 수, commit 시점 차이. (상세는 한글 섹션에서.) |
| **일본어** | 로마자 입력 → 히라가나/가타카나 변환. 조합 중 표시(変換中). 한 번에 commit되는 단위(문절 등). |
| **중국어** | 병음 등 로마자 입력 → 한자 후보 선택. 조합 중 문자열과 확정 문자열의 구분. |
| **에디터 구현에 주는 함의** | IME에 따라 `compositionupdate` 호출 횟수, `data` 길이, commit 타이밍이 다름. 에디터는 IME 중립적으로 composition 이벤트만 처리하면 됨. |

**채울 하위 항목**

- 각 언어/입력기별 "조합 중 문자열" 예시(실제 문자열, 유니코드).
- 키보드 드라이버 vs IME vs 앱의 책임 경계.

---

---

## 2. 한글

### 2.1 한글 조합 원리 — `src/content/docs/korean/combination.md`

| 섹션 | 내용 |
|------|------|
| **자모 구조** | 초성, 중성, 종성. 자모의 개수와 유니코드 블록. |
| **조합 규칙** | 초성+중성, (초성+중성)+종성. 유효한 조합만 허용하는지, 잘못된 조합 시 IME 동작. |
| **유니코드 표현** | **조합형(Hangul Jamo)**: U+1100~U+11FF. **완성형(Hangul Syllables)**: U+AC00~U+D7A3. **호환 자모**: U+3131~U+318E. 각 블록의 용도와 변환 관계. |
| **NFD/NFC와 한글** | 유니코드 정규화에서 한글 완성형/조합형이 어떻게 매핑되는지. NFC vs NFD 시 바이트/코드 포인트 차이. |
| **조합 중 vs 완성** | IME가 내부적으로 "조합 중인 자모 시퀀스"를 어떻게 완성형/조합형으로 변환해 `compositionupdate`의 `data`로 보내는지(플랫폼/입력기별로 다를 수 있음). |

**채울 하위 항목**

- 초성/중성/종성 목록과 유니코드 코드 포인트 표.
- 완성형 한 글자 = 초성·중성·종성 인덱스로 계산하는 공식(유니코드 명세).

---

### 2.2 한글 입력기 — `src/content/docs/korean/input-methods.md`

| 섹션 | 내용 |
|------|------|
| **Windows** | Windows 한글 IME(IME 모드 전환, 한/영 키). TSF(Text Services Framework)와의 관계. 조합 중 문자열이 앱에 전달되는 방식. |
| **macOS** | macOS 한글 입력 소스. NSTextInputClient 프로토콜과 조합 문자열. 한/영 전환 키. |
| **Linux** | IBus, Fcitx 등에서 한글 엔진(예: libhangul). XIM vs IBus/Fcitx. |
| **모바일(개요)** | Android/iOS 한글 키보드. 천지인, 쿼티, 나랏글 등. (상세는 모바일 한글 키보드에서.) |
| **입력기별 조합 차이** | 2벌식 vs 3벌식: 같은 키라도 조합 결과가 다른 예. commit 시점(스페이스, 다음 자모 입력 시 등) 차이. |

**채울 하위 항목**

- 플랫폼별 "한글 IME" 설정 경로, 사용하는 라이브러리/프로토콜 이름.
- 웹에서 동일한 한글 입력 시 브라우저/OS 조합으로 인한 차이 가능 여부.

---

### 2.3 모바일 한글 키보드 — `src/content/docs/korean/mobile-keyboard.md`

| 섹션 | 내용 |
|------|------|
| **레이아웃** | 천지인(3×4 + 모드), 10키 쿼티, 풀 쿼티. 각 레이아웃에서 자모/글자 매핑. |
| **제스처** | 스와이프로 모드 전환 또는 문자 선택. 롱프레스로 대체 문자. |
| **조합 방식** | 연타(같은 키 여러 번), 동시 조합(초성+중성 동시에). 천지인에서 초성·중성·종성 선택 순서와 조합 결과. |
| **이벤트·commit** | 모바일 브라우저/앱에서 `compositionstart`/`compositionupdate`/`compositionend`가 데스크톱과 같은지, 다른지. 가상 키보드가 보내는 이벤트 특이점. |
| **입력기 앱별 차이** | Gboard, 삼성 키보드, 나랏글 등: 조합 알고리즘·commit 타이밍 차이가 있다면 구체 사례. |

**채울 하위 항목**

- 천지인 자모 배치도(참고용).
- 모바일에서 "조합 중 문자열"이 여러 개의 composition 이벤트로 나뉘는지, 한 번에 오는지.

---

### 2.4 한글 입력기 구현 — `src/content/docs/korean/implementation.md`

| 섹션 | 내용 |
|------|------|
| **구현할 것** | 키 입력 → 자모 시퀀스 → 완성형 한 글자(또는 조합형)로 변환. 조합 중 문자열을 composition 이벤트로 앱에 전달. |
| **2벌식 키 매핑** | 자판 키와 초성/중성/종성 자모 매핑 테이블. 쌍자모(ㄲ, ㄸ 등) 처리: 같은 키 두 번 vs 별도 키. |
| **조합 알고리즘** | 현재 자모 시퀀스(초성, 초성+중성, 초성+중성+종성) 상태. 유니코드 완성형 계산: `0xAC00 + (초성인덱스×588 + 중성인덱스×28 + 종성인덱스)`. 잘못된 조합(예: 종성만) 시 동작. |
| **상태와 commit** | 조합 중(preedit) vs 확정(commit). 스페이스/엔터/다음 자모 입력 시 commit 시점. Esc/포커스 잃을 때 취소. |
| **라이브러리 활용** | **libhangul**: 구조, API(HangulInput, hangul_* 함수), 2벌/3벌 지원. **JavaScript/웹**: 유사 로직을 JS로 구현할 때 참고할 수식·테이블. |
| **미니 구현 예제** | 최소 동작: 2벌식 키 → 자모 → 완성형 한 글자. 웹에서는 `document.execCommand` 또는 `insertText`/composition 이벤트 시뮬레이션 불가이므로, 데스크톱(또는 브라우저 확장)에서 composition 문자열을 앱에 넘기는 흐름만 설명해도 됨. |

**채울 하위 항목**

- 2벌식 자모–키 매핑 표(참고).
- libhangul 소스 위치, 빌드/연동 방법.
- 유니코드 한글 음절 공식(유니코드 명세 인용).

---

## 2.5 일본어 — `src/content/docs/japanese/combination.md`

로마자→히라가나/가타카나, 変換(변환), 조합 중·commit, composition 이벤트. (본문 작성됨.)

## 2.6 중국어 — `src/content/docs/chinese/combination.md`

병음/주음, 한자 후보 선택, 조합 중·commit, composition 이벤트. (본문 작성됨.)

## 2.7 아랍어 — `src/content/docs/arabic/combination.md`

문맥형(이솔레이션·초·중·종형), Joining Type, RTL, composition. (본문 작성됨.)

## 2.8 유럽권 — `src/content/docs/european/combination.md`

데드 키·악센트·Compose, NFC/NFD, composition 유무. (본문 작성됨.)

---

## 3. 참고

### 3.1 IME별 composition 이벤트 — `src/content/docs/reference/composition-events-by-ime.md`

한글·일본어·중국어·유럽권 IME에 따른 compositionstart/update/end 타이밍과 CompositionEvent.data 예제. (이미 본문 작성됨.)

### 3.2 한글/IME 관련 프로젝트 — `src/content/docs/reference/projects.md`

| 섹션 | 내용 |
|------|------|
| **한글 입력 엔진·라이브러리** | **libhangul**: 한글 조합 엔진, 2벌/3벌, API 요약. **ibus-hangul**, **fcitx-hangul**: Linux에서 libhangul을 쓰는 입력기. **나랏글**: 오픈소스 한글 입력기, 구조·레이아웃·조합 방식. 각 프로젝트 저장소·라이선스·어떤 원리로 조합하는지(테이블/공식). |
| **OS·플랫폼 IME** | **Windows**: TSF, IMM32. **macOS**: Input Method Kit, Cocoa NSTextInputClient. **Chromium**: IME 브릿지 코드 위치, OS IME와 웹 composition 이벤트 연결 방식. 개요 수준. |
| **에디터·에디터 라이브러리** | **ProseMirror**: composition 이벤트 처리 방식, 조합 중 노드/마크 처리. **Slate**: composition 관련 코드 위치, 전략. **Lexical**: IME/composition 처리. **CodeMirror 6**, **Monaco**: composition/IME 대응 방식. 각각 "어떤 원리로 되어 있는지"(이벤트 흐름, 조합 구간 표시, undo 전략) 요약. |
| **참고 링크** | 위 프로젝트 공식 문서·소스 링크. IME/한글 조합 관련 명세(유니코드 한글, W3C input events) 링크. |

**채울 하위 항목**

- 각 에디터에서 composition 관련 이슈/PR 번호(참고용).
- libhangul vs 나랏글 vs OS 내장 한글 IME: 조합 결과 차이가 있다면 구체 예.

---

## 4. 에디터 구현

### 4.1 에디터 구현 시 고려사항 — `src/content/docs/editor/implementation-notes.md`

| 섹션 | 내용 |
|------|------|
| **이벤트 처리 순서** | `compositionstart` → (조합 중) `compositionupdate` 반복 → `compositionend`. 그 전후에 `beforeinput`/`input`이 어떻게 끼어드는지. 에디터가 조합 중인 구간을 "임시 노드" 또는 "composition 노드"로 다루는 방식. |
| **DOM/Selection** | contenteditable 또는 가상 DOM: 조합 중인 구간을 어떻게 표시할지. `getSelection()`, `selectionStart`/`selectionEnd` 업데이트 시점. composition 중 selection 변경 시 주의점. |
| **undo/redo** | 조합 중인 입력을 undo 스택에 넣지 않거나, `compositionend` 시점에 한 번에 넣는 방식. 조합 중 Undo 키 입력 시 IME 취소 vs 에디터 undo 동작 구분. |
| **플랫폼/브라우저 차이** | 동일 로직으로 Chrome/Firefox/Safari/Edge에서 테스트할 때 차이가 나는 이벤트/동작 목록. 필요한 경우 플랫폼별 분기. |
| **체크리스트** | 에디터가 IME를 올바르게 지원하기 위해 확인할 항목: composition 이벤트 구독, 조합 구간 시각화, 커서 위치 유지, commit 시 문서 반영, undo/redo 동작. |

**채울 하위 항목**

- `insertCompositionText` vs `insertText` 처리 차이.
- composition 중 백스페이스: IME가 한 자모 삭제 vs 에디터가 한 문자 삭제 — 누가 처리하는지.

---

## 작성 순서 권장

1. **가이드**: what-is-ime → composition → ime-architecture → keyboard-ime-differences  
2. **한글**: combination → input-methods → mobile-keyboard → implementation  
3. **일본어·중국어·아랍어·유럽권**: 각 카테고리 하위 combination  
4. **참고**: reference/composition-events-by-ime, reference/projects  
5. **에디터 구현**: implementation-notes  

각 문서는 이 계획의 해당 섹션을 채우되, 부족한 항목은 "채울 하위 항목"을 참고해 보완한다.
