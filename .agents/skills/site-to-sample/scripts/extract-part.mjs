#!/usr/bin/env node
// 使い方:
//   node extract-part.mjs <URL>              モード1: 候補ブロック一覧を出力
//   node extract-part.mjs <URL> "<selector>"  モード2: 指定セレクタのHTML/CSS/JSを抽出
//
// 初回実行時にブラウザ本体が無い場合は `npx playwright install chromium` が必要。

import { chromium } from 'playwright';

const [, , url, selector] = process.argv;

if (!url) {
  console.error('使い方: node extract-part.mjs <URL> [CSSセレクタ]');
  process.exit(1);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  if (!selector) {
    await listCandidates(page);
  } else {
    await extractTarget(page, selector);
  }
} finally {
  await browser.close();
}

// ---- モード1: 候補ブロック一覧 ----
async function listCandidates(page) {
  const candidates = await page.evaluate(() => {
    function cssPath(el) {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts = [];
      let node = el;
      while (node && node.nodeType === 1 && node !== document.body) {
        let part = node.tagName.toLowerCase();
        if (node.id) { part = `#${CSS.escape(node.id)}`; parts.unshift(part); break; }
        const parent = node.parentElement;
        if (parent) {
          const index = Array.from(parent.children).indexOf(node) + 1;
          part += `:nth-child(${index})`;
        }
        parts.unshift(part);
        node = node.parentElement;
      }
      return `body > ${parts.join(' > ')}`;
    }

    const seen = new Set();
    const results = [];

    function addCandidate(el) {
      if (!el || seen.has(el)) return;
      seen.add(el);
      const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      results.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        classes: Array.from(el.classList),
        selector: cssPath(el),
        text,
      });
    }

    document.querySelectorAll('header, nav, footer').forEach(addCandidate);

    const container = document.querySelector('main') || document.body;
    Array.from(container.children).forEach((el) => {
      if (['SCRIPT', 'STYLE', 'LINK', 'NOSCRIPT'].includes(el.tagName)) return;
      const text = (el.textContent || '').trim();
      if (el.childElementCount > 0 || text.length > 40) addCandidate(el);
    });

    document.querySelectorAll('section').forEach(addCandidate);

    return results;
  });

  console.log(`=== CANDIDATES (${candidates.length}) ===`);
  candidates.forEach((c, i) => {
    const label = c.id ? `#${c.id}` : (c.classes.length ? `.${c.classes.join('.')}` : '(no id/class)');
    console.log(`[${i + 1}] <${c.tag}> ${label}`);
    console.log(`    selector: ${c.selector}`);
    if (c.text) console.log(`    text: "${c.text}"`);
  });
  console.log('\n次にモード2で対象を確定してください: node extract-part.mjs <URL> "<上記のselector>"');
}

// ---- モード2: 対象パーツの抽出 ----
async function extractTarget(page, targetSelector) {
  const found = await page.evaluate((sel) => !!document.querySelector(sel), targetSelector);
  if (!found) {
    console.error(`セレクタに一致する要素が見つかりません: ${targetSelector}`);
    process.exit(1);
  }

  const { html, tokens } = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const classes = new Set();
    const ids = new Set();
    [el, ...el.querySelectorAll('*')].forEach((node) => {
      node.classList.forEach((c) => classes.add(c));
      if (node.id) ids.add(node.id);
    });
    return {
      html: el.outerHTML,
      tokens: { classes: Array.from(classes), ids: Array.from(ids) },
    };
  }, targetSelector);

  console.log('=== TARGET SELECTOR ===');
  console.log(targetSelector);
  console.log('\n=== TARGET HTML ===');
  console.log(html);

  const sources = await page.evaluate(() => {
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) => ({
      type: 'link', href: l.href,
    }));
    const inlineStyles = Array.from(document.querySelectorAll('style')).map((s, i) => ({
      type: 'inline', index: i, text: s.textContent,
    }));
    const inlineScripts = Array.from(document.querySelectorAll('script:not([src])')).map((s, i) => ({
      type: 'inline', index: i, text: s.textContent,
    }));
    const externalScripts = Array.from(document.querySelectorAll('script[src]')).map((s) => ({
      type: 'src', src: s.src,
    }));
    return { stylesheets, inlineStyles, inlineScripts, externalScripts };
  });

  const cssBlocks = [];
  for (const sheet of sources.stylesheets) {
    const text = await fetchText(page, sheet.href);
    cssBlocks.push({ label: sheet.href, text });
  }
  for (const style of sources.inlineStyles) {
    cssBlocks.push({ label: `inline <style> #${style.index + 1}`, text: style.text });
  }

  console.log('\n=== MATCHED CSS RULES ===');
  for (const block of cssBlocks) {
    const matched = extractMatchingRules(block.text, tokens);
    if (matched.trim()) {
      console.log(`--- from ${block.label} ---`);
      console.log(matched);
    }
  }

  console.log('\n=== SCRIPTS (フィルタなし・全文) ===');
  const MAX_CHARS = 200_000;
  for (const s of sources.inlineScripts) {
    console.log(`--- inline script #${s.index + 1} ---`);
    console.log(truncate(s.text, MAX_CHARS));
  }
  for (const s of sources.externalScripts) {
    const text = await fetchText(page, s.src);
    console.log(`--- external script: ${s.src} ---`);
    console.log(truncate(text, MAX_CHARS));
  }
}

async function fetchText(page, url) {
  try {
    const res = await page.request.get(url);
    return await res.text();
  } catch (e) {
    return `/* 取得失敗: ${url} (${e.message}) */`;
  }
}

function truncate(text, max) {
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n/* ...${text.length - max}文字省略... */`;
}

// 単純なCSSブロック分割器（@media/@supportsは再帰的に中身を評価する）
function extractMatchingRules(css, tokens) {
  if (!css) return '';
  const blocks = splitBlocks(css);
  const out = [];
  for (const block of blocks) {
    if (block.prelude.startsWith('@media') || block.prelude.startsWith('@supports')) {
      const inner = extractMatchingRules(block.body, tokens);
      if (inner.trim()) out.push(`${block.prelude} {\n${indent(inner)}\n}`);
    } else if (block.prelude.startsWith('@')) {
      // @font-face / @keyframes などはそのまま判定対象外（呼び出し側で個別に扱う想定）
      continue;
    } else if (selectorMatches(block.prelude, tokens)) {
      out.push(`${block.prelude} {\n${indent(block.body)}\n}`);
    }
  }
  return out.join('\n');
}

function selectorMatches(prelude, tokens) {
  const selectors = prelude.split(',').map((s) => s.trim());
  return selectors.some((sel) => {
    const classHit = tokens.classes.some((c) => new RegExp(`\\.${escapeReg(c)}(?![-\\w])`).test(sel));
    const idHit = tokens.ids.some((id) => new RegExp(`#${escapeReg(id)}(?![-\\w])`).test(sel));
    return classHit || idHit;
  });
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function indent(text) {
  return text.split('\n').map((l) => `  ${l}`).join('\n');
}

function splitBlocks(css) {
  const blocks = [];
  let depth = 0;
  let preludeStart = 0;
  let bodyStart = -1;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      if (depth === 0) {
        const prelude = css.slice(preludeStart, i).trim().replace(/\/\*[\s\S]*?\*\//g, '').trim();
        bodyStart = i + 1;
        blocks.push({ prelude, bodyStart, depth: 1 });
      }
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        const current = blocks[blocks.length - 1];
        current.body = css.slice(current.bodyStart, i);
        delete current.bodyStart;
        delete current.depth;
        preludeStart = i + 1;
      }
    }
  }
  return blocks.filter((b) => b.body !== undefined);
}
