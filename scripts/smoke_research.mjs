// External QA dependency only; no frontend dependency changes.
const { chromium } = await import(process.env.CIVIS_PLAYWRIGHT_MODULE || "playwright");
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const browser = await chromium.launch({headless:true, executablePath:process.env.CIVIS_CHROMIUM || undefined,args:['--no-sandbox']});
const page = await browser.newPage({acceptDownloads:true, viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror', e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('401'))errors.push(m.text());});
page.on('dialog', d=>d.accept());
try {
 await page.goto(process.env.CIVIS_WEB_URL || 'http://localhost:53000');
 await page.getByRole('button',{name:'Sign up',exact:true}).click();
 await page.getByLabel('Full name').fill('FAKE Browser');
 await page.getByLabel('Email',{exact:true}).fill(`FAKE-${crypto.randomUUID()}@example.invalid`);
 await page.getByLabel('Password',{exact:true}).fill('FAKE-a1-'+crypto.randomBytes(24).toString('hex'));
 await page.getByRole('button',{name:'Create account',exact:true}).click();
 await page.locator('.bar textarea').fill('Give one short factual statement from a retrieved employment source, without advice.');
 const stream=page.waitForResponse(r=>r.url().endsWith('/messages')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'Send',exact:true}).click();
 const response=await stream;
 assert.equal(response.status(),200);
 await page.locator('.msg.a p a[href^="https://ulii.org/akn/ug/"]').first().waitFor({timeout:130000});
 const count=await page.locator('.msg.a p a').count();
 assert.ok(count>0);
 await page.reload();
 await page.locator('.msg.a p a[href^="https://ulii.org/akn/ug/"]').first().waitFor({timeout:130000});
 assert.equal(await page.locator('.msg.a p a').count(),count);
 assert.deepEqual(errors,[]);
 console.log('PASS: live hosted Uganda retrieval/Groq verification, citation links, reload, no browser errors');
} finally {await browser.close();}
