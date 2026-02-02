---
title: 아랍어 입력기 구현
description: 키→문자 매핑, RTL·bidi 처리, 문맥형은 폰트/렌더러
---

아랍어 IME를 구현하려면 **키→문자(유니코드 코드 포인트)** 매핑과 **RTL(오른쪽→왼쪽)·bidi** 처리를 구분해야 한다. 문맥형(이솔레이션·초·중·종형) 선택은 IME가 아니라 **폰트·렌더러**가 한다. 웹에서는 OS IME를 쓰는 것이 보통이다.

## 구현할 것 요약

1. **키 매핑**: 물리 키(또는 키 코드) → 아랍 문자 **유니코드 코드 포인트**(U+0600~U+06FF 등). 문맥형은 별도 코드가 아니라 같은 코드가 위치에 따라 다른 모양으로 그려진다.
2. **조합 중(preedit)**: 타슈킬·결합 부호를 조합하는 IME는 preedit 구간을 두고, composition 이벤트로 전달.
3. **commit**: 확정 시 해당 문자열을 문서에 반영. compositionend의 data 또는 insertText의 data.
4. **RTL**: 텍스트는 **논리 순서**로 저장. 표시 시 **유니코드 UAX #9(양방향 알고리즘)** 으로 runs를 나누고, RTL run은 오른쪽→왼쪽으로 그린다. 커서·선택은 논리 오프셋으로 다룬다.

## 문맥형(Contextual Forms)

- **IME 역할**: IME는 **기본 코드 포인트**만 보낸다. 예: "ب" = U+0628. 어두형·어중형·어말형은 **같은 코드**다.
- **폰트·렌더러 역할**: 유니코드 **Joining_Type**(UAX #9, ArabicShaping)과 주변 문자에 따라 **문맥형**을 골라 그린다. IME 구현에서는 문맥형 테이블을 만들 필요가 없다.

## RTL·bidi

- **논리 순서**: 메모리·편집은 항상 논리 순서(유니코드 코드 포인트 순서). 커서 오프셋도 논리 오프셋.
- **시각적 배치**: bidi 알고리즘으로 LTR/RTL runs를 나누고, RTL run은 오른쪽부터 그린다. 커서 위치를 논리 오프셋 → 시각적 x 좌표로 변환해 그리면 된다.
- **혼합 텍스트**: 아랍어+숫자+영문이 섞여 있으면 UAX #9에 따라 runs가 나뉜다. 에디터는 이 runs를 적용해 그리면 된다.

## 상태와 commit

- **조합 중**: 타슈킬 등 조합이 있는 IME만 해당. preedit만 표시.
- **commit**: compositionend의 data 또는 insertText. 문서에 반영 후 상태 초기화.
- **취소**: Esc·포커스 잃음. preedit 제거.

## 라이브러리·참고

- **유니코드 UAX #9**: Unicode Bidirectional Algorithm. bidi runs 계산.
- **ArabicShaping**: Joining_Type·문맥형 참고. 폰트/렌더러에서 사용.
- 웹에서는 OS IME 결과(composition 이벤트 또는 insertText)만 처리하면 되므로, 자체 아랍어 IME 구현은 특수 환경(임베디드 등)에서만 필요하다.
