'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initToc();
  initCodeHeaders();
  initHighlightJs();
  initSpoiler();
  initRedact();
  initCustomStyles();
  initShareLinks();
  initLazyImages();
  initTable();
});

/**
 * 目次(TOC)の自動生成
 * - section > h2/h3 を走査してリンク付きの目次を組み立てる
 * - 見出しにIDが無ければ自動採番（section番号 + 見出し種別 + 連番）
 */
function initToc() {
  const tocs = document.querySelectorAll('.toc');
  if (tocs.length === 0) return;

  const sections = document.querySelectorAll('section');

  tocs.forEach(toc => {
    const tocList = toc.querySelector('ul');
    if (!tocList) return;

    sections.forEach((section, sIndex) => {
      section.id = section.id || `section-${sIndex + 1}`;
      const sectionIndex = sIndex + 1;

      const h2Items = buildTocItems(section.querySelectorAll('h2'), 'toc-h2', `index-sec${sectionIndex}-head`);
      const h3Items = buildTocItems(section.querySelectorAll('h3'), 'toc-h3', `index-sec${sectionIndex}-subhead`);

      // 見出しが無いsectionは空のtoc-sectionを作らない
      if (h2Items.length === 0 && h3Items.length === 0) return;

      const sectionBlock = document.createElement('div');
      sectionBlock.className = 'toc-section';
      [...h2Items, ...h3Items].forEach(li => sectionBlock.appendChild(li));

      tocList.appendChild(sectionBlock);
    });
  });
}

/**
 * 見出し要素の配列から <li><a href="#id">見出し文</a></li> の配列を作る
 * idPrefix には既に section番号+見出し種別 まで含めておき、連番だけ末尾に付与する
 */
function buildTocItems(headings, liClassName, idPrefix) {
  return Array.from(headings).map((heading, index) => {
    heading.id = heading.id || `${idPrefix}_${index + 1}`;

    const li = document.createElement('li');
    li.className = liClassName;

    const a = document.createElement('a');
    a.href = `#${heading.id}`;
    a.textContent = heading.textContent;

    li.appendChild(a);
    return li;
  });
}

/**
 * コードブロックのヘッダー（言語表示・コピー機能）を生成
 */
function initCodeHeaders() {
  document.querySelectorAll('.code-block').forEach(block => {
    const lang = block.dataset.lang;
    const copy = block.dataset.copy === 'true';
    if (!lang && !copy) return;

    const header = document.createElement('div');
    header.className = 'code-header';

    if (lang) {
      const langDiv = document.createElement('div');
      langDiv.className = 'lang';
      langDiv.textContent = lang;
      header.appendChild(langDiv);
    }

    if (copy) {
      header.appendChild(buildCopyButton(block));
    }

    block.insertBefore(header, block.firstChild);
  });
}

function buildCopyButton(block) {
  const copyDiv = document.createElement('div');
  copyDiv.className = 'copy';
  copyDiv.innerHTML = '<i class="bi bi-copy"></i>';

  copyDiv.addEventListener('click', () => {
    const codeEl = block.querySelector('pre code');
    if (!codeEl) return;

    navigator.clipboard.writeText(codeEl.innerText).then(() => {
      copyDiv.innerHTML = '<i class="bi bi-check"></i>';
      setTimeout(() => {
        copyDiv.innerHTML = '<i class="bi bi-copy"></i>';
      }, 2000);
    });
  });

  return copyDiv;
}

/**
 * highlight.js の適用（pre codeはdedentしてからハイライト、span codeはそのままハイライト）
 */
function initHighlightJs() {
  document.querySelectorAll('pre code').forEach(block => {
    block.innerHTML = dedent(block.innerHTML);
    hljs.highlightElement(block);
  });

  document.querySelectorAll('span code').forEach(el => {
    hljs.highlightElement(el);
  });
}

/**
 * 先頭行のインデント幅を基準に、共通の余分なインデントを取り除く
 */
function dedent(raw) {
  const lines = raw.split('\n').filter(l => l.trim());
  if (lines.length === 0) return raw.trim();

  const indent = lines[0].match(/^\s*/)[0].length;
  return raw
    .split('\n')
    .map(l => l.slice(indent))
    .join('\n')
    .trim();
}

/**
 * スポイラー要素のクリック開閉
 */
function initSpoiler() {
  document.querySelectorAll('.spoiler').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('opened');
    });
  });
}

/**
 * 伏字（peke / unknown）の文字数に応じた伏字文字列の生成
 */
function initRedact() {
  applyRedact('.peke', '×', { nonAscii: 1, ascii: 0.5 });
  applyRedact('.unknown', '?', { nonAscii: 2, ascii: 1 });
}

function applyRedact(selector, redactChar, weight) {
  document.querySelectorAll(selector).forEach(el => {
    const len = el.textContent.split('').reduce((count, char) => {
      return count + (/[^\x00-\x7F]/.test(char) ? weight.nonAscii : weight.ascii);
    }, 0);
    el.dataset.redact = redactChar.repeat(Math.round(len));
  });
}

/**
 * data属性からスタイルを反映する系（highlight背景・文字色・フォントサイズ）
 */
function initCustomStyles() {
  document.querySelectorAll('.highlight[data-highcol]').forEach(el => {
    const color = resolveColor(el.dataset.highcol);
    el.style.cssText = `
        background: ${color};
        margin: 0 .1rem;
        padding: 0 .3rem;`;
  });

  document.querySelectorAll('.color[data-col]').forEach(el => {
    el.style.color = resolveColor(el.dataset.col);
  });

  document.querySelectorAll('.fsz[data-size]').forEach(el => {
    el.style.fontSize = el.dataset.size;
  });
}

/**
 * "#xxxxxx" 形式ならそのまま、それ以外はCSS変数名として解決する
 */
function resolveColor(value) {
  return value[0] === '#' ? value : `var(--c-${value})`;
}

/**
 * SNSシェアリンクのhref生成
 */
function initShareLinks() {
  const links = document.querySelectorAll('.share-links a');
  if (links.length === 0) return;

  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);

  const shareUrlBuilders = {
    hatena: () => `https://b.hatena.ne.jp/add?mode=confirm&url=${url}&title=${title}`,
    x: () => `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    line: () => `https://social-plugins.line.me/lineit/share?url=${url}`,
  };

  links.forEach(link => {
    const platform = link.className.split('-')[1];
    const build = shareUrlBuilders[platform];
    if (build) link.href = build();
  });
}

/**
 * .container 内画像の遅延読み込み（IntersectionObserver）
 */
function initLazyImages() {
  const images = document.querySelectorAll('.container img');
  if (images.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '100px' });

  images.forEach(img => {
    img.dataset.src = img.src;
    img.removeAttribute('src');
    observer.observe(img);
  });
}

function initTable() {
  const tables = document.querySelectorAll('article table');
  tables.forEach(table => {
    if(table.closest('.table-wrapper')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}