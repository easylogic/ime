---
title: 모바일 아랍어 키보드
description: RTL 레이아웃, 풀 쿼티·축소 레이아웃, 이벤트·commit
---

모바일 아랍어 키보드는 **오른쪽→왼쪽(RTL)** 레이아웃이 기본이다. 키 배치와 조합 방식은 데스크톱과 비슷하나, 터치·제스처로 문자·타슈킬을 선택하는 방식이 다를 수 있다.

## 레이아웃

- **풀 쿼티**: 아랍 문자 풀 배열. RTL이므로 키보드가 오른쪽 정렬처럼 보이는 경우가 많다.
- **축소 레이아웃**: 키 수를 줄이고 롱프레스·팝업으로 추가 문자(타슈킬·숫자 등) 선택.
- **영문 전환**: 아랍어/영문 레이아웃 전환 시 방향(LTR/RTL)이 바뀐다. 에디터는 논리 오프셋만 유지하면 된다.

## 제스처

- **롱프레스**: 같은 키에 다른 문자(예: 어두형·어중형·어말형 변형) 또는 타슈킬 선택.
- **스와이프**: 일부 키보드에서 방향에 따라 다른 문자.

## 조합·commit

- **조합 중**: 타슈킬·특수 문자 조합이 있는 IME는 preedit으로 표시. 단순 키 매핑만 하면 composition 없이 insertText만 올 수 있다.
- **commit**: compositionend 시점의 data가 확정 문자열. composition이 없으면 input/insertText의 data가 commit.

## 이벤트·commit

- 모바일 브라우저도 compositionstart → compositionupdate → compositionend가 발생할 수 있다. 발생하지 않으면 beforeinput/input만 오고 inputType이 insertText인 경우가 있다.
- 에디터는 composition 이벤트가 오면 조합 구간으로 처리하고, 오지 않으면 일반 insertText로 처리하면 된다.
- **RTL**: 커서·선택은 논리 오프셋으로 전달된다. 화면에서는 bidi 알고리즘으로 시각적 위치를 계산해 표시하면 된다.
