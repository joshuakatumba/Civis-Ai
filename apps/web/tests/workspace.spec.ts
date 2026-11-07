import { test, expect } from '@playwright/test';
import { randomUUID, randomBytes } from 'node:crypto';

test('FAKE – development only: signup, email verification, both modes and conversation controls', async ({ page, request }) => {
  const email = `FAKE-${randomUUID()}@example.invalid`;
  const password = randomBytes(24).toString('hex');
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A clearer place to begin.' })).toBeVisible();
  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.getByLabel('Name', { exact: true }).fill('FAKE – development only');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.locator('#consent').check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Verify your email' })).toBeVisible();
  const mail = await request.get('http://localhost:58025/api/v1/messages');
  const messages = (await mail.json()).messages as { ID: string; To: { Address: string }[] }[];
  const delivery = messages.find(message => message.To.some(to => to.Address.toLowerCase() === email.toLowerCase()));
  expect(delivery).toBeTruthy();
  const detail = await request.get(`http://localhost:58025/api/v1/message/${delivery!.ID}`);
  const body = await detail.json() as { HTML: string; Text: string };
  const link = (body.HTML + body.Text).match(/https?:\/\/[^\s"<>]*\/auth\/verify-email[^\s"<>]*/)?.[0];
  expect(link).toBeTruthy();
  await page.goto(link!.replace(/&amp;/g, '&'));
  await page.getByRole('button', { name: 'Verify email', exact: true }).click();
  await expect(page.getByText('20 of 20 free prompts left')).toBeVisible();
  await page.screenshot({ path: '/tmp/civis-workspace.png', fullPage: true });
  await page.getByLabel('Message', { exact: true }).fill('FAKE – development only research');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('19 of 20 free prompts left')).toBeVisible();
  await expect(page.getByText('A development response', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Helpful response' }).click();
  await page.getByRole('button', { name: 'Drafting', exact: true }).click();
  await page.getByLabel('Message', { exact: true }).fill('FAKE – development only drafting');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('18 of 20 free prompts left')).toBeVisible();
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  await page.getByRole('button', { name: 'Open sidebar' }).click();
  await page.getByRole('button', { name: 'FAKE – development only 18 of 20 free prompts left' }).click();
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A clearer place to begin.' })).toBeVisible();
  await page.getByRole('link', { name: 'Log in', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('18 of 20 free prompts left')).toBeVisible();
});

test('public pages, mobile layout and PWA assets', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.goto('/legal/terms');
  await expect(page.getByText('FAKE – development only', { exact: true })).toBeVisible();
  expect((await request.get('/manifest.webmanifest')).status()).toBe(200);
  expect((await request.get('/sw.js')).status()).toBe(200);
});

test('FAKE – development only: browser password reset', async ({ page, request }) => {
  const email = `FAKE-${randomUUID()}@example.invalid`;
  const password = randomBytes(24).toString('hex');
  await request.post('http://localhost:58000/auth/signup', {
    headers: { rid: 'emailpassword', 'st-auth-mode': 'header' },
    data: { formFields: [{ id: 'email', value: email },
      { id: 'password', value: randomBytes(24).toString('hex') }] },
  });
  await page.goto('/auth/reset-password');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Check your email for the next step.')).toBeVisible();
  const mail = await request.get('http://localhost:58025/api/v1/messages');
  const messages = (await mail.json()).messages as { ID: string; To: { Address: string }[] }[];
  const delivery = messages.find(message => message.To.some(to => to.Address.toLowerCase() === email.toLowerCase()));
  expect(delivery).toBeTruthy();
  const detail = await request.get(`http://localhost:58025/api/v1/message/${delivery!.ID}`);
  const body = await detail.json() as { HTML: string; Text: string };
  const link = (body.HTML + body.Text).match(/https?:\/\/[^\s"<>]*\/auth\/reset-password[^\s"<>]*/)?.[0];
  expect(link).toBeTruthy();
  await page.goto(link!.replace(/&amp;/g, '&'));
  await expect(page.getByRole('heading', { name: 'Choose a new password' })).toBeVisible();
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Password updated. You can sign in.')).toBeVisible();
  await page.getByRole('link', { name: 'Sign in', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('20 of 20 free prompts left')).toBeVisible();
});
