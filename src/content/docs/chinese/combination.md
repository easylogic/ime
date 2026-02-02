---
title: 중국어 조합 원리
description: 병음·주음 등 로마자 입력, 한자 후보 선택, 조합 중·commit, composition 이벤트
---

중국어 IME는 **병음(Pinyin)** 또는 **주음(注音)** 등 로마자/기호 입력을 받아 **한자 후보**로 변환한다. 조합 중에는 **병음 문자열** 또는 **첫 번째 후보**가 preedit으로 보이고, 사용자가 후보를 선택하면 그때 **commit**된다.

---

## 1. 입력 방식

### 1.1 병음(Pinyin)

- **로마자 시퀀스**로 발음을 입력한다. 예: "zhong" → 中, 重 등 후보.
- **성조**: 숫자(1~4) 또는 별도 키로 성조를 넣어 후보를 좁힌다. IME에 따라 다름.
- **조합 중**: "z", "zh", "zhong"처럼 **병음 문자열**이 preedit으로 표시된다. 후보가 뜨면 **한자**가 preedit으로 바뀌는 IME도 있다.

### 1.2 주음(注音, Bopomofo)

- **주음 부호** 키보드로 입력. ㄓㄨㄥ → 中 등.
- 조합 중에는 주음 시퀀스 또는 한자 후보가 preedit으로 표시된다.

### 1.3 간체/번체

- **간체(简体)** 와 **번체(繁體)** 를 IME에서 전환할 수 있다. 같은 병음이라도 후보 집합이 다르다.
- commit되는 문자는 선택한 후보(간체 또는 번체 한자)이다.

---

## 2. 후보 선택과 commit

### 2.1 후보 목록

- 병음(또는 주음) 입력 후 **Space** 또는 **자동**으로 후보 목록이 뜬다.
- **숫자 키**(1, 2, 3, …) 또는 **마우스 클릭**으로 후보를 선택한다.
- **선택 확정** 시점에 **commit**된다. **compositionend**가 발생하고, data에 선택한 한자(또는 여러 글자)가 들어 있다.

### 2.2 조합 중(preedit)

- **compositionstart** 이후 **compositionend** 이전까지가 조합 중이다.
- **compositionupdate**의 data에는 "z", "zh", "zhong" 또는 "中"(첫 후보) 등이 올 수 있다. IME에 따라 **병음만** 보내거나 **한자 후보**를 보낸다.

### 2.3 commit 시점

- 후보 선택 확정(숫자 키·Enter·클릭).
- **취소**(Esc): compositionend의 data가 **빈 문자열**이다.

---

## 3. 유니코드·문자

- **한자**: CJK 통합 한자(U+4E00~U+9FFF 등). 간체·번체 모두 이 블록에 있다. 구분은 글자별로 다름.
- **병음 기호**: 로마자 + 성조 기호(ā, á, ǎ, à 등). U+00E0 대역 등.
- **주음 부호**: U+3100~U+312F (Bopomofo).

IME가 preedit으로 **병음 문자열**을 보낼지 **한자**를 보낼지는 IME마다 다르다. 에디터는 **CompositionEvent.data**만 신뢰하면 된다.

---

## 4. composition 이벤트 예시

- **"中" 입력(zhong + 후보 선택)**: compositionstart → compositionupdate("z") → … → compositionupdate("zhong") → compositionupdate("中" 또는 후보) → compositionend("中"). (상세는 "IME별 composition 이벤트 변화" 참고.)
- **취소**: compositionend의 data가 **""**.

---

## 5. 한글·일본어와의 차이

- **한글**: 자모 → 한 음절. commit은 스페이스·엔터·다음 자모.
- **일본어**: 로마자/가나 → 히라가나 → (선택) 변환으로 한자. commit은 Enter·후보 확정.
- **중국어**: 병음/주음 → 한자 후보 선택. commit은 **후보 선택 확정** 시점. preedit에는 병음 또는 한자가 올 수 있다.

공통점: **compositionstart ~ compositionend** 구간을 preedit으로만 표시하고, **compositionend** 시점의 data를 commit으로 문서에 반영하면 된다.
