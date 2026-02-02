// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	site: 'https://ime.realerror.com',
	base: '/',
	integrations: [
		mermaid({ autoTheme: true }),
		starlight({
			title: 'IME 가이드',
			description: '에디터 개발 시 필요한 IME(입력기) 구조와 글자 조합 가이드',
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
				replacesTitle: false,
			},
			customCss: ['./src/styles/custom.css'],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/easylogic/ime' }],
			head: [
				{
					tag: 'meta',
					attrs: {
						property: 'og:image',
						content: 'https://ime.realerror.com/og-image.png',
					},
				},
			],
			sidebar: [
				{
					label: '가이드',
					items: [
						{ label: 'IME란', slug: 'guide/what-is-ime' },
						{ label: 'IME 구조', slug: 'guide/ime-architecture' },
						{ label: '글자 조합', slug: 'guide/composition' },
						{ label: '글자 조합 방식·알고리즘', slug: 'guide/composition-algorithms' },
						{ label: '키보드/IME별 차이', slug: 'guide/keyboard-ime-differences' },
					],
				},
				{
					label: '한글',
					items: [
						{ label: '조합 원리', slug: 'korean/combination' },
						{ label: '조합 규칙(겹모음·겹받침)', slug: 'korean/combination-rules' },
						{ label: '2벌식 알고리즘', slug: 'korean/2-set-algorithm' },
						{ label: '3벌식 알고리즘', slug: 'korean/3-set-algorithm' },
						{ label: '한글 입력기', slug: 'korean/input-methods' },
						{ label: '모바일 한글 키보드', slug: 'korean/mobile-keyboard' },
						{ label: '한글 입력기 구현', slug: 'korean/implementation' },
						{ label: 'libhangul API', slug: 'korean/libhangul-api' },
					],
				},
				{
					label: '일본어',
					items: [
						{ label: '조합 원리', slug: 'japanese/combination' },
						{ label: '일본어 입력기', slug: 'japanese/input-methods' },
						{ label: '모바일 일본어 키보드', slug: 'japanese/mobile-keyboard' },
						{ label: '일본어 입력기 구현', slug: 'japanese/implementation' },
					],
				},
				{
					label: '중국어',
					items: [
						{ label: '조합 원리', slug: 'chinese/combination' },
						{ label: '중국어 입력기', slug: 'chinese/input-methods' },
						{ label: '모바일 중국어 키보드', slug: 'chinese/mobile-keyboard' },
						{ label: '중국어 입력기 구현', slug: 'chinese/implementation' },
					],
				},
				{
					label: '아랍어',
					items: [
						{ label: '조합 원리', slug: 'arabic/combination' },
						{ label: '아랍어 입력기', slug: 'arabic/input-methods' },
						{ label: '모바일 아랍어 키보드', slug: 'arabic/mobile-keyboard' },
						{ label: '아랍어 입력기 구현', slug: 'arabic/implementation' },
					],
				},
				{
					label: '유럽권',
					items: [
						{ label: '조합 원리', slug: 'european/combination' },
						{ label: '유럽권 입력기', slug: 'european/input-methods' },
						{ label: '모바일 유럽권 키보드', slug: 'european/mobile-keyboard' },
						{ label: '유럽권 입력기 구현', slug: 'european/implementation' },
					],
				},
				{
					label: '참고',
					items: [
						{ label: '브라우저·플랫폼별 IME 동작 차이', slug: 'reference/browser-platform-quirks' },
						{ label: 'composition 시나리오별 처리 규칙', slug: 'reference/composition-edge-cases' },
						{ label: 'inputType 상세', slug: 'reference/inputtype' },
						{ label: 'IME별 composition 이벤트', slug: 'reference/composition-events-by-ime' },
						{ label: '키보드·IME 조합별 차이', slug: 'reference/keyboard-ime-combinations' },
						{ label: 'KeyboardEvent.isComposing', slug: 'reference/is-composing' },
						{ label: 'IME·한글 구현 코드 예시', slug: 'reference/code-examples' },
						{ label: 'IME 구현 상세', slug: 'reference/ime-implementation-details' },
						{ label: '용어 정리', slug: 'reference/glossary' },
						{ label: '트러블슈팅', slug: 'reference/troubleshooting' },
						{ label: '기존 프로젝트 소개', slug: 'reference/projects' },
					],
				},
				{
					label: '에디터 구현',
					items: [
						{ label: '고려사항', slug: 'editor/implementation-notes' },
						{ label: 'IME 처리 코드 예시', slug: 'editor/code-examples' },
					],
				},
			],
		}),
	],
});
