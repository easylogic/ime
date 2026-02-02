---
title: IME별 composition 이벤트 변화
description: 한글·일본어·중국어 등 IME에 따른 compositionstart/update/end 타이밍과 data 예제
---

IME에 따라 **compositionstart**, **compositionupdate**, **compositionend**의 **발생 시점**과 **CompositionEvent.data** 값이 다르다. 아래는 각 IME에서의 **대표적인 이벤트 순서와 data 예시**다. 실제 동작은 OS·브라우저·IME 버전에 따라 달라질 수 있으므로, 에디터 구현 시에는 **이벤트로 넘어온 문자열만 신뢰**하고, 필요하면 타겟 환경에서 로그로 확인하는 것이 좋다.

---

## 1. 공통: 이벤트 의미

| 이벤트 | 의미 | `CompositionEvent.data` |
|--------|------|--------------------------|
| **compositionstart** | 조합 세션 시작. IME가 “조합 중” 모드로 들어감. | 조합으로 **대체될** 기존 선택 영역의 문자열. 없으면 빈 문자열. |
| **compositionupdate** | 조합 중 문자열이 바뀜. | **현재 조합 중인** 문자열(preedit). |
| **compositionend** | 조합 종료(commit 또는 취소). | commit이면 **확정된 최종** 문자열; 취소면 **빈 문자열**. |

---

## 2. 한글 IME (2벌식): “가” 입력

### 2.1 시나리오

사용자가 **ㄱ** → **ㅏ** 순서로 눌러 “가”를 만든 뒤, **스페이스**로 확정한다.

### 2.2 이벤트 순서 예시(한 가지 패턴)

IME·브라우저에 따라 **compositionupdate 호출 횟수**와 **data에 오는 문자열**이 다를 수 있다.

**패턴 A: 자모마다 compositionupdate**

| 순서 | 이벤트 | data | 비고 |
|------|--------|------|------|
| 1 | compositionstart | "" | 조합 시작 |
| 2 | compositionupdate | "ㄱ" | ㄱ 입력 직후. 일부 IME는 “ㄱ”을 preedit으로 보냄. |
| 3 | compositionupdate | "가" | ㅏ 입력 직후. (L,V,T)=(0,0,0) → 완성형 “가”. |
| 4 | compositionend | "가" | 스페이스로 commit. |

**패턴 B: 완성형만 compositionupdate**

| 순서 | 이벤트 | data | 비고 |
|------|--------|------|------|
| 1 | compositionstart | "" | 조합 시작 |
| 2 | compositionupdate | "가" | ㅏ 입력 직후. “ㄱ” 단계는 data에 안 보내고 “가”만 보내는 IME도 있음. |
| 3 | compositionend | "가" | 스페이스로 commit. |

**패턴 C: compositionupdate가 한 번만**

| 순서 | 이벤트 | data | 비고 |
|------|--------|------|------|
| 1 | compositionstart | "" | 조합 시작 |
| 2 | compositionupdate | "가" | ㅏ 입력 시. “ㄱ” 입력 시에는 compositionupdate가 발생하지 않을 수도 있음. |
| 3 | compositionend | "가" | 스페이스로 commit. |

### 2.3 “각” 입력 예시(ㄱ → ㅏ → ㄱ)

| 순서 | 이벤트 | data (예시) | 비고 |
|------|--------|-------------|------|
| 1 | compositionstart | "" | |
| 2 | compositionupdate | "ㄱ" 또는 "가" | ㄱ, ㅏ 입력에 따라 다름. |
| 3 | compositionupdate | "가" | ㅏ 입력 후. |
| 4 | compositionupdate | "각" | ㄱ(종성) 입력 후. |
| 5 | compositionend | "각" | 스페이스 또는 다음 자모로 commit. |

### 2.4 취소( Esc )

| 순서 | 이벤트 | data | 비고 |
|------|--------|------|------|
| 1 | compositionstart | "" | |
| 2 | compositionupdate | "가" (또는 중간 상태) | |
| 3 | compositionend | **""** | 취소 시 data는 **빈 문자열**. |

---

## 3. 일본어 IME (로마자 → 히라가나): “か” 입력

### 3.1 시나리오

사용자가 **k** → **a** 순서로 눌러 “か”(히라가나)를 만든 뒤, **Enter** 또는 **다음 키**로 확정한다.

### 3.2 이벤트 순서 예시

| 순서 | 이벤트 | data (예시) | 비고 |
|------|--------|-------------|------|
| 1 | compositionstart | "" | 로마자 “k” 입력 시 조합 시작. |
| 2 | compositionupdate | "ｋ" 또는 "か" | IME에 따라 “반각 로마자” 또는 “히라가나”가 올 수 있음. |
| 3 | compositionupdate | "か" | “a” 입력 후 “か”로 변환. |
| 4 | compositionend | "か" | Enter 또는 다음 문자 입력으로 commit. |

일본어 IME는 **변환(変換)** 전에는 “조합 중”이고, **Enter**로 변환 확정 시 commit된다. 변환 후 **再変換** 시에는 별도 composition 세션이 시작될 수 있다.

### 3.3 “変換中” (변환 후보 선택 중)

| 순서 | 이벤트 | data (예시) | 비고 |
|------|--------|-------------|------|
| 1 | compositionstart | "" | Space로 변환 시작. |
| 2 | compositionupdate | "漢字" (선택 중인 후보) | 후보가 바뀔 때마다 compositionupdate. |
| 3 | compositionend | "漢字" | Enter로 후보 확정 = commit. |

---

## 4. 중국어 IME (병음): “中” 입력

### 4.1 시나리오

사용자가 **z** **h** **o** **n** **g** 순서로 눌러 병음 “zhong”을 입력한 뒤, **숫자 키** 또는 **클릭**으로 후보 “中”을 선택해 확정한다.

### 4.2 이벤트 순서 예시

| 순서 | 이벤트 | data (예시) | 비고 |
|------|--------|-------------|------|
| 1 | compositionstart | "" | 첫 글자(예: z) 입력 시. |
| 2 | compositionupdate | "z" | |
| 3 | compositionupdate | "zh" | |
| 4 | compositionupdate | "zho" | |
| 5 | compositionupdate | "zhon" | |
| 6 | compositionupdate | "zhong" | |
| 7 | compositionupdate | "中" (또는 후보 목록의 첫 항목) | 후보가 뜨면 data에 한자 또는 병음이 올 수 있음. |
| 8 | compositionend | "中" | 후보 선택 확정 = commit. |

중국어 IME는 **조합 중에는 병음 문자열**, **후보 선택 후에는 한자**가 data로 올 수 있다. IME에 따라 compositionupdate 호출 횟수와 data 내용(병음 vs 한자)이 다르다.

---

## 5. 유럽권(데드 키·악센트): “é” 입력

### 5.1 시나리오

사용자가 **acute accent(´) 데드 키**를 누른 뒤 **e**를 눌러 “é”를 만든다.

### 5.2 이벤트 순서 예시

일부 환경에서는 **composition 이벤트 없이** 바로 “é”(U+00E9)가 **insertText**로 들어올 수 있다. composition을 쓰는 경우 예시는 다음과 같다.

| 순서 | 이벤트 | data (예시) | 비고 |
|------|--------|-------------|------|
| 1 | compositionstart | "" | 데드 키 입력 시. |
| 2 | compositionupdate | "´" 또는 "" | 데드 키만 눌렀을 때. |
| 3 | compositionend | "é" | “e” 입력 시 조합 완료·commit. |

브라우저·OS에 따라 **composition 없이** `beforeinput`/`input`만 오고, `inputType`이 `insertText`, `data`가 “é”인 경우도 있다. 에디터는 **composition 이벤트가 오면** 조합 구간으로 처리하고, **오지 않으면** 일반 `insertText`로 처리하면 된다.

---

## 6. IME별 차이 요약

| IME | compositionupdate 호출 | data에 오는 내용 | commit 시점 |
|-----|------------------------|------------------|-------------|
| **한글(2벌식)** | 자모마다 1회 ~ 완성형만 1회 | “ㄱ”, “가” 또는 “가”만 | 스페이스·엔터·다음 자모 |
| **일본어(로마자)** | 로마자/히라가나 변환 시 | “ｋ”, “か” 등 | Enter·다음 문자 |
| **일본어(변환)** | 후보 변경 시 | 선택 중인 한자 등 | Enter로 후보 확정 |
| **중국어(병음)** | 글자마다 또는 후보 표시 시 | “z”, “zh”, … “中” | 후보 선택 확정 |
| **유럽권(데드 키)** | 없을 수 있음 | “é” 등 완성 문자 | 다음 키 입력 시 |

---

## 7. 에디터 구현 시 활용

- **IME 중립 처리**: “조합 중인지”는 **compositionstart 이후 compositionend 이전**으로만 판단하고, **compositionupdate의 data**를 preedit으로만 표시한다.
- **commit**: **compositionend** 시점의 **data**가 비어 있지 않으면 commit 문자열로 문서에 반영한다.
- **취소**: compositionend의 data가 **빈 문자열**이면 preedit만 제거하고 commit하지 않는다.
- **실제 타이밍 확인**: 타겟 OS·브라우저·IME 조합에서 **addEventListener("compositionupdate", e => console.log(e.data))** 등으로 로그를 남겨, 위 예시와 비교해 보면 된다.
