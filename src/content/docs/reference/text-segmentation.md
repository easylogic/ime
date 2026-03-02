---
title: 텍스트 세그멘테이션
description: UAX #29 그래핀·단어·문장 경계, Intl.Segmenter, 에디터에서의 적용
---

"한 글자"·"한 단어" 경계를 구할 때 **유니코드 UAX #29(Unicode Text Segmentation)** 와 **Intl.Segmenter** API를 사용한다. IME·에디터에서 **커서 이동**·**한 글자 삭제**·**선택**을 올바르게 하려면 **그래핀 클러스터** 단위를 써야 한다.

---

## 1. UAX #29 요약

**UAX #29 (Unicode Text Segmentation)** 는 텍스트를 **그래핀 클러스터**·**단어**·**문장**으로 나누는 규칙을 정의한다.

- **그래핀 클러스터(Grapheme Cluster)**: 사용자가 "한 글자"로 인식하는 단위. **기준 문자 + 결합 문자**(예: e + combining acute → é), **이모지 + variation selector**, **ZWJ 시퀀스**(👨‍👩‍👧‍👦) 등 **여러 코드 포인트**가 한 클러스터가 될 수 있다.
- **단어(Word)**: 언어별로 단어 경계 규칙이 다르다. 태국어처럼 **단어 사이 공백이 없는** 언어도 있다.
- **문장(Sentence)**: 문장 경계. 에디터에서는 주로 **그래핀**·**단어**를 쓴다.

코드 유닛(UTF-16)이나 **코드 포인트** 단위만으로는 "한 글자"를 정확히 나눌 수 없다. **그래핀 클러스터** 경계를 사용해야 한다. [유니코드 기본](/docs/reference/unicode-basics), [이모지](/docs/reference/emoji) 참고.

---

## 2. Intl.Segmenter

**Intl.Segmenter** 는 JavaScript에서 **그래핀**·**단어**·**문장** 경계를 얻을 때 사용한다.

```javascript
// 그래핀 클러스터 단위 (한 글자)
const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
for (const seg of segmenter.segment('한글😀é')) {
  console.log(seg.segment); // "한", "글", "😀", "é"
}

// 단어 단위 (locale에 따라 다름)
const wordSegmenter = new Intl.Segmenter('en', { granularity: 'word' });
for (const seg of wordSegmenter.segment('Hello world')) {
  console.log(seg.segment, seg.isWordLike);
}
```

- **granularity**: `'grapheme'` | `'word'` | `'sentence'`
- **locale**: `'ko'`, `'th'`, `'hi'` 등. 단어 경계는 locale에 따라 다르다.
- **segment(문자열)**: 반복 가능 객체. 각 세그먼트의 `segment`, `index`, `input`, `isWordLike`(word일 때) 등 제공.

**브라우저 지원**: Chrome 87+, Firefox 125+, Safari 15.4+ 등. 지원하지 않는 환경에서는 **polyfill** 또는 **코드 포인트** 단위 폴백을 고려한다.

---

## 3. 에디터에서의 적용

- **커서 이동**: "한 글자" 단위로 이동할 때 **그래핀 클러스터** 경계를 사용한다. `Intl.Segmenter('xx', { granularity: 'grapheme' }).segment(str)`로 반복해 `index`를 모으면 경계 오프셋을 얻을 수 있다.
- **한 글자 삭제**: Backspace/Delete 시 삭제할 범위를 **그래핀** 단위로 정한다. 코드 유닛 1개만 지우면 서로게이트가 깨지고, 코드 포인트 1개만 지우면 결합 문자가 쪼개질 수 있다.
- **선택**: 드래그로 "한 글자" 선택 시 **그래핀** 경계에 맞추면, 이모지·결합 문자가 반만 선택되는 일을 줄일 수 있다.
- **태국어·인도계 문자**: [태국어 조합 원리](/docs/thai/combination), [인도계 문자 조합 원리](/docs/indic/combination)에서 다룬 대로, **한 음절**이 여러 코드 포인트이므로 **그래핀** 단위가 필수다.

---

## 4. 참고

- [유니코드 기본](/docs/reference/unicode-basics) — 코드 포인트, 서로게이트, 그래핀 개념
- [이모지](/docs/reference/emoji) — 여러 코드 포인트가 한 글자, Intl.Segmenter 사용
- [UAX #29 Unicode Text Segmentation](https://unicode.org/reports/tr29/)
- [MDN Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)
