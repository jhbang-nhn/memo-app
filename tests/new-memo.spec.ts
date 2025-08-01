import { test, expect } from '@playwright/test';

test('새 메모 작성 시나리오', async ({ page }) => {
  // 1. 페이지 접속
  await page.goto('/');

  // 2. "새 메모" 버튼 클릭
  await page.getByRole('button', { name: '새 메모' }).click();

  // "새 메모 작성" 폼(모달)이 나타날 때까지 명시적으로 기다림
  const newMemoModal = page.getByRole('heading', { name: '새 메모 작성' });
  await expect(newMemoModal).toBeVisible({ timeout: 10000 });

  // 3. 폼 필드 채우기
  const memoTitle = `Playwright 테스트 메모 - ${Date.now()}`;
  const memoContent = `이 메모는 Playwright 자동 테스트를 통해 작성되었습니다.`;
  const memoTag = 'E2E-Test';

  await page.getByPlaceholder('제목 *').fill(memoTitle);
  await page.getByLabel('카테고리').selectOption({ label: '업무' });
  await page.getByPlaceholder('메모 내용을 마크다운으로 작성하세요...').fill(memoContent);
  await page.getByPlaceholder('태그를 입력하고 Enter를 누르세요').fill(memoTag);
  await page.getByRole('button', { name: '추가' }).click();
  
  // 4. "저장하기" 버튼 클릭
  await page.getByRole('button', { name: '저장하기' }).click();

  // 모달이 사라질 때까지 기다림
  await expect(newMemoModal).not.toBeVisible({ timeout: 10000 });

  // 5. 새 메모가 목록 최상단에 표시되는지 확인
  // 목록이 리프레시될 때까지 잠시 기다릴 수 있음
  await page.waitForTimeout(1000); 

  const newMemoInList = page.locator('article').first();
  
  await expect(newMemoInList.getByRole('heading', { name: memoTitle })).toBeVisible();
  await expect(newMemoInList.getByText('업무')).toBeVisible();
  await expect(newMemoInList.getByText(memoContent)).toBeVisible();
  await expect(newMemoInList.getByText(`#${memoTag}`)).toBeVisible();
});
