---
title: 키보드·IME 조합별 차이
description: OS 기본 IME vs 서드파티, 모바일 키보드 앱별, 언어별 composition 차이
---

**키보드**(물리·OS에서 선택한 레이아웃)와 **IME**(조합 알고리즘·commit 타이밍)는 조합에 따라 **composition 이벤트 호출 횟수**, **preedit 노출 방식**, **commit 시점**이 달라진다. "IME별 composition 이벤트" 문서는 IME·시나리오별 이벤트 예시를, 이 문서는 **구체적인 키보드·IME 조합**에서의 차이를 다룬다.

---

## 1. OS 기본 IME vs 서드파티 IME

### 1.1 Windows 한글

- **Microsoft 한글(기본)**: TSF 연동. compositionstart → compositionupdate(1회~자모마다) → compositionend. commit 타이밍은 스페이스·엔터·다음 자모 입력 시.
- **구글 입력기(한글)**: TSF 기반. 조합 중 preedit 노출·compositionupdate 횟수가 Windows 기본과 다를 수 있음.
- **기타 서드파티 한글 IME**: TSF 또는 IMM32. commit 타이밍·preedit에 빈 문자열이 오는 경우 등 구현에 따라 다름.

같은 브라우저(예: Chrome)라도 **Windows 기본 한글**과 **구글 입력기 한글**을 바꾸면, 같은 "가" 입력에서 **compositionupdate** 호출 횟수나 **data**에 "ㄱ"이 오는지 "가"만 오는지가 달라질 수 있다.

### 1.2 macOS 한글

- **시스템 한글(2벌식/3벌식)**: NSTextInputClient 연동. composition 3종 발생. 브라우저가 이를 CompositionEvent로 전달.
- **서드파티**: macOS에서 한글을 쓰는 서드파티 IME가 있으면, 동일하게 NSTextInputClient 경로이지만 조합 결과·update 횟수가 다를 수 있다.

### 1.3 일본어·중국어

- **Windows**: Microsoft IME(일본어), Microsoft Pinyin(중국어) vs 구글 일본어/중국어 입력기 등. 변환(変換) 후보 선택 시 compositionupdate 호출 횟수·data 내용이 IME마다 다름.
- **macOS**: 시스템 일본어/중국어 입력 소스. 동작은 브라우저가 NSTextInputClient를 어떻게 처리하느냐에 따라 composition 이벤트로 전달됨.

---

## 2. 모바일 키보드 앱별 차이

### 2.1 Android 한글

- **Gboard 한글**: InputConnection으로 preedit·commit 전달. 브라우저(Chrome 등)가 composition 이벤트로 페이지에 전달. compositionupdate 호출 횟수는 데스크톱보다 적거나 한 번에 긴 문자열이 올 수 있음.
- **삼성 키보드(한글)**: 동일하게 InputConnection. 호출 횟수·타이밍이 Gboard와 다를 수 있음.
- **나랏글 등**: 조합 방식(천지인·쿼티 등)에 따라 commit 타이밍이 다름. 에디터는 compositionend의 data만 신뢰하면 됨.

### 2.2 iOS 한글

- **시스템 한글 키보드**: UITextInput 프로토콜로 preedit·commit 전달. Safari·Chrome iOS가 composition 이벤트로 전달. compositionupdate 횟수는 OS·브라우저 버전에 따라 다름.
- **서드파티 키보드**: 앱 확장 키보드도 UITextInput 경로를 타지만, 조합 중 노출·commit 시점이 시스템 키보드와 다를 수 있음.

### 2.3 모바일 일본어·중국어

- **Gboard 일본어/중국어**, **iOS 기본 일본어/중국어** 등: 변환·후보 선택 시 composition 이벤트로 전달. 모바일에서는 **한 번에 문절·문장 단위**로 commit되는 경우가 있어, compositionend의 data가 긴 문자열일 수 있음.

---

## 3. 언어별 키보드 전환 시 이벤트 차이

같은 브라우저(예: Chrome)에서 **입력 소스만** 바꿀 때(한글 → 일본어 → 중국어 등), **composition 이벤트 순서**와 **data** 내용이 달라진다.

| 언어 전환 | 조합 방식 | compositionupdate에 오는 내용 예 | commit 시점 |
|-----------|-----------|----------------------------------|-------------|
| 한글      | 자모 → 음절 | "ㄱ", "가" 또는 "가"만           | 스페이스·엔터·다음 자모 |
| 일본어    | 로마자 → 가나, 変換 → 한자 | "ｋ", "か", 후보 한자 등 | Enter·다음 문자·후보 확정 |
| 중국어    | 병음 → 한자 후보 | "z", "zh", "zhong", "中" 등 | 후보 선택 확정 |
| 아랍어    | 키 → 문자  | 조합이 있으면 preedit; 없으면 insertText만 | compositionend 또는 insertText |
| 유럽권    | 데드 키·Compose | "´", "é" 또는 composition 없이 "é" | compositionend 또는 insertText |

에디터는 **언어를 구분하지 않고** "compositionstart ~ compositionend 구간 = 조합 중", "compositionend.data = commit"으로만 처리하면, 키보드·IME 조합이 바뀌어도 동일한 로직으로 동작한다.

---

## 4. 조합별 확인 방법

- **로그**: `compositionstart` / `compositionupdate` / `compositionend` / `input` 에 `console.log` 또는 브레이크포인트를 걸어, 타겟 **OS + 브라우저 + IME(또는 키보드 앱)** 조합에서 **호출 횟수**와 **data**를 기록한다.
- **동일 시나리오**: 예를 들어 한글 "가" 입력(ㄱ → ㅏ → 스페이스)을 고정하고, Windows 기본 한글 / 구글 입력기 한글 / macOS 한글 / Gboard 한글 / 삼성 키보드 한글 등에서 각각 로그를 비교하면 차이가 드러난다.

---

## 5. 에디터 구현에 주는 함의

- **조합에 의존하지 않기**: 특정 IME·키보드에서 "update 2번 온다" 등에 의존하지 않고, **compositionupdate가 0번이든 여러 번이든** "마지막 compositionupdate의 data" 또는 "compositionend 직전 preedit"만 preedit으로 두고, **compositionend의 data**만 commit으로 사용한다.
- **composition 없을 때**: 데드 키·아랍어 등에서 composition 없이 **insertText**만 오면, **input**/ **beforeinput** 의 insertText를 commit으로 처리한다.
- **긴 commit**: 모바일에서 후보 선택 시 **compositionend.data**가 문장 단위로 올 수 있으므로, 에디터는 commit 문자열 길이에 제한을 두지 않는 편이 안전하다.
