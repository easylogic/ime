---
title: 모바일 중국어 키보드
description: 병음·9키·手写 레이아웃, 후보 선택, 이벤트·commit
---

모바일 중국어 키보드는 **병음 풀 쿼티**, **9키 병음**, **手写(필기)** 등 레이아웃이 있다. 조합 중에는 병음 또는 한자 후보가 preedit으로, 확정 시 commit으로 전달된다.

## 레이아웃

- **병음 풀 쿼티**: 영문 쿼티와 비슷. zhong 등 입력 후 한자 후보.
- **9키 병음**: 숫자 키에 자음·모음 배치. 연타·조합으로 병음 입력.
- **手写**: 터치로 글자 쓰기. 인식 결과가 후보로 뜨고 선택 시 commit.

## 조합·후보 선택

- **조합 중**: 병음 "z", "zh", "zhong" 등 또는 첫 번째 한자 후보가 preedit.
- **후보 목록**: Space 또는 자동으로 후보 표시. 숫자·스와이프로 선택.
- **commit**: 후보 확정 시 compositionend, data에 선택한 한자(또는 여러 글자).

## 이벤트·commit

- compositionstart → compositionupdate(병음 또는 한자) 반복 → compositionend(commit).
- 모바일에서는 compositionupdate 호출 횟수가 적거나 한 번에 긴 문자열이 올 수 있음. 에디터는 넘어온 data만 preedit/commit으로 처리하면 된다.
