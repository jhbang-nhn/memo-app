# E2E 테스트 시나리오: 마크다운 렌더링 확인

## 목적

메모 내용에 사용된 마크다운 문법이 저장 후 상세 보기 화면에서 올바르게 렌더링되는지 확인합니다.

## 시나리오 단계

1. "새 메모" 버튼을 클릭하여 새 메모 작성 폼을 엽니다.
2. "제목" 입력란에 "마크다운 렌더링 테스트"와 같이 식별 가능한 제목을 입력합니다.
3. "내용" 입력란에 다음과 같이 다양한 마크다운 문법을 포함한 텍스트를 작성합니다.
   - `# 제목 1`
   - `## 제목 2`
   - `- 순서 없는 목록`
   - `1. 순서 있는 목록`
   - `**굵은 글씨**`
   - `*기울임체*`
   - `~~취소선~~`
   - "\`인라인 코드\`"
   - "```\n코드 블록\n```"
   - `> 인용문`
   - `[링크](https://www.example.com)`
4. "저장하기" 버튼을 클릭하여 메모를 저장합니다.
5. 메모 목록에서 방금 생성한 "마크다운 렌더링 테스트" 메모를 클릭합니다.
6. 메모 상세 보기 화면에서 마크다운으로 작성한 내용이 각각의 스타일에 맞게 올바르게 표시되는지 육안으로 확인합니다. (예: 제목은 큰 글씨, 목록은 불릿/숫자, 코드 블록은 배경색이 적용되었는지 등)
