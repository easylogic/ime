---
title: macOS 한글 자소 분리
description: macOS에서 한글이 자소로 분리되는 NFD 정규화 문제의 원인, 발생 조건, 해결 방법
---

macOS는 파일 시스템과 일부 텍스트 처리에서 유니코드 **NFD**(Normalization Form Decomposition)를 사용한다. 한글 음절은 NFD로 분해하면 초성·중성·종성 자모로 쪼개지므로, 다른 OS(Windows, Linux)에서 **NFC**(Normalization Form Composition)로 저장한 텍스트와 비교하면 불일치가 발생한다. 이 문제를 "한글 자소 분리" 또는 "한글 깨짐"이라고 부른다.

---

## 1. NFC와 NFD

유니코드는 같은 문자를 여러 코드 포인트 시퀀스로 표현할 수 있다. 정규화(normalization)는 이 시퀀스를 하나의 표준 형태로 통일하는 절차다.

| 정규화 형태 | 설명 | "한" 표현 |
|-------------|------|-----------|
| **NFC** (Composed) | 가능한 한 결합하여 하나의 코드 포인트로 | U+D55C (한) — 코드 포인트 1개 |
| **NFD** (Decomposed) | 가능한 한 분해하여 개별 자모로 | U+1112 (ㅎ) + U+1161 (ㅏ) + U+11AB (ㄴ) — 코드 포인트 3개 |

NFC에서 "한글"은 코드 포인트 2개(`U+D55C U+AE00`)다. NFD에서는 코드 포인트 6개(`U+1112 U+1161 U+11AB U+1100 U+1173 U+11AF`)가 된다.

두 형태는 사람 눈에는 같아 보이지만 **바이트 시퀀스가 다르다**. `===` 비교, 해시, 정규식 매칭 등에서 불일치가 발생한다.

---

## 2. macOS가 NFD를 쓰는 이유

macOS의 HFS+와 APFS 파일 시스템은 파일명을 저장할 때 NFD 변형(정확히는 Apple 고유의 NFD 변형)을 사용한다. 이는 `é`처럼 기본 문자 + 결합 문자로 표현되는 유럽 언어 문자를 일관되게 처리하기 위해 도입됐다. 한글 음절도 이 규칙의 적용을 받아 자모로 분해된다.

구체적으로 다음 상황에서 NFD가 나타난다.

- **파일명**: macOS에서 생성한 파일의 이름은 NFD로 저장된다. `ls`나 Finder에서는 정상적으로 보이지만, 바이트 수준에서는 NFC와 다르다.
- **클립보드**: macOS의 일부 앱에서 복사한 텍스트가 NFD로 전달될 수 있다.
- **터미널**: Terminal.app이나 iTerm2에서 한글 파일명을 다룰 때 NFD 형태가 그대로 노출된다.
- **Git**: macOS에서 커밋한 한글 파일명이 Linux/Windows에서 자소가 분리된 채 보인다.

---

## 3. 실제 발생 사례

### 파일명 비교 실패

Windows에서 만든 "이력서.pdf"(NFC)를 macOS로 옮기면, macOS 파일 시스템은 이를 NFD로 변환한다. 프로그램에서 파일명을 NFC 문자열과 비교하면 일치하지 않는다.

```javascript
const fromWindows = "이력서.pdf";       // NFC
const fromMacFS   = "이력서.pdf";       // NFD (눈에는 같아 보임)

fromWindows === fromMacFS;              // false
fromWindows.length;                     // 7
fromMacFS.length;                       // 13
```

### Git 파일명 문제

macOS와 Linux 사이에서 Git을 사용하면, 한글 파일명이 서로 다른 정규화 형태로 인식되어 같은 파일이 두 개로 보이거나 추적이 꼬일 수 있다.

```bash
# Git에서 한글 파일명 NFD 문제를 완화하는 설정
git config --global core.precomposeunicode true
```

`core.precomposeunicode`를 `true`로 설정하면 Git이 macOS 파일 시스템에서 읽은 NFD 파일명을 NFC로 변환해서 처리한다.

### 웹 애플리케이션 검색 불일치

사용자가 macOS에서 입력한 텍스트가 NFD로 전달되면, DB에 NFC로 저장된 데이터와 검색 시 일치하지 않는다. "한국어"를 검색해도 결과가 나오지 않을 수 있다.

---

## 4. NFD 자모의 코드 포인트 범위

NFD로 분해된 한글 자모는 **Hangul Jamo** 블록(U+1100~U+11FF)에 속한다. 일반적으로 키보드로 직접 입력하는 호환 자모(U+3131~U+3163)와는 다른 코드 포인트다.

| 종류 | 유니코드 범위 | 예시 |
|------|--------------|------|
| 한글 음절 (NFC) | U+AC00 ~ U+D7A3 | 한 = U+D55C |
| 초성 자모 (NFD) | U+1100 ~ U+1112 | ㅎ = U+1112 |
| 중성 자모 (NFD) | U+1161 ~ U+1175 | ㅏ = U+1161 |
| 종성 자모 (NFD) | U+11A8 ~ U+11C2 | ㄴ = U+11AB |
| 호환 자모 | U+3131 ~ U+3163 | ㅎ = U+314E |

NFD 자모(U+1100~U+11FF)가 문자열에 포함되어 있으면 자소 분리가 발생한 것으로 판단할 수 있다.

---

## 5. 감지 방법

문자열에 NFD 한글 자모가 섞여 있는지 확인하는 방법이다.

```javascript
function hasDecomposedHangul(str) {
  return /[\u1100-\u11FF\u3131-\u3163\uA960-\uA97C\uD7B0-\uD7C6\uD7CB-\uD7FB]/.test(str)
    && str !== str.normalize('NFC');
}

hasDecomposedHangul("한글");   // false (NFC)
hasDecomposedHangul("한글");   // true  (NFD — 눈에는 같아 보임)
```

가장 확실한 방법은 `str !== str.normalize('NFC')`를 비교하는 것이다.

---

## 6. 해결: NFC 정규화

자소 분리 문제의 해결은 텍스트를 **NFC로 정규화**하는 것이다.

### JavaScript

```javascript
const normalized = input.normalize('NFC');
```

### Python

```python
import unicodedata
normalized = unicodedata.normalize('NFC', text)
```

### Swift (macOS/iOS)

```swift
let normalized = text.precomposedStringWithCanonicalMapping  // NFC
```

### Java / Kotlin

```java
import java.text.Normalizer;
String normalized = Normalizer.normalize(text, Normalizer.Form.NFC);
```

### 적용 지점

정규화는 다음 지점에서 수행한다.

- **파일 업로드**: 서버가 파일명을 저장하기 전에 NFC 정규화
- **검색 입력**: 검색 쿼리를 DB에 보내기 전에 NFC 정규화
- **텍스트 비교**: 문자열 비교 전에 양쪽 모두 NFC 정규화
- **API 입력**: 클라이언트에서 받은 텍스트를 처리하기 전에 NFC 정규화

---

## 7. IME·에디터에서의 영향

macOS의 한글 IME 자체는 조합 결과를 NFC로 출력한다. `compositionend` 이벤트의 `data`는 NFC 형태의 한글 음절이다. 자소 분리는 IME 조합 과정이 아니라 **파일 시스템, 클립보드, 외부 소스에서 텍스트를 가져올 때** 발생한다.

에디터에서 주의할 지점은 다음과 같다.

- **붙여넣기**: macOS 앱에서 복사한 텍스트가 NFD일 수 있다. `paste` 이벤트에서 NFC 정규화를 적용한다.
- **파일 열기**: 파일명이 NFD로 되어 있으면, 에디터의 파일 탐색기에서 정렬·검색이 꼬일 수 있다.
- **드래그 앤 드롭**: 파일을 드래그해서 놓을 때 전달되는 파일명이 NFD일 수 있다.

```javascript
editor.addEventListener('paste', (e) => {
  const text = e.clipboardData.getData('text/plain');
  const normalized = text.normalize('NFC');
  insertText(normalized);
  e.preventDefault();
});
```

---

## 8. 참고

- 유니코드 정규화 명세: [UAX #15 — Unicode Normalization Forms](https://unicode.org/reports/tr15/)
- Apple 파일 시스템과 유니코드: [Apple Developer — File System Basics](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileSystemOverview/FileSystemOverview.html)
- 한글 음절 분해 알고리즘: [Unicode Standard — Hangul Syllable Decomposition](https://www.unicode.org/versions/Unicode15.0.0/ch03.pdf) (3.12절)
- [유니코드 기본](/docs/reference/unicode-basics) — NFC/NFD 정규화의 기초
- [트러블슈팅](/docs/reference/troubleshooting) — IME 관련 문제 해결
