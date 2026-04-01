'use strict';

{
  // 目次があるかチェック
  const toc = document.querySelector('.toc');
  if (toc) {
    // 目次の生成
    const headings = document.querySelectorAll('h2');
    const navList = document.querySelector('nav ol');

    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      heading.id = id;
      
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = heading.textContent;
      
      li.appendChild(a);
      navList.appendChild(li);
    });
  };

  // コードヘッダーの生成
  document.querySelectorAll('.code-block').forEach(block => {
    const lang = block.dataset.lang;
    const copy = block.dataset.copy === 'true';
    if (lang || copy) {
      const header = document.createElement('div');
      header.className = 'code-header';
      if (lang) {
        const langDiv = document.createElement('div');
        langDiv.className = 'lang';
        langDiv.textContent = lang;
        header.appendChild(langDiv);
      }
      if (copy) {
        const copyDiv = document.createElement('div');
        copyDiv.className = 'copy';
        copyDiv.innerHTML = '<i class="bi bi-copy"></i>';
        copyDiv.addEventListener('click', () => {
          const code = block.querySelector('pre code').innerText;
          navigator.clipboard.writeText(code).then(() => {
            copyDiv.innerHTML = '<i class="bi bi-check"></i>';
            setTimeout(() => {
              copyDiv.innerHTML = '<i class="bi bi-copy"></i>';
            }, 2000);
          });
        });
        header.appendChild(copyDiv);
      }
      block.insertBefore(header, block.firstChild);
    }
  });

  // highlight.jsの適用
  document.querySelectorAll('pre code').forEach(block => {
    const raw = block.innerHTML;

    // dedent処理
    const lines = raw.split('\n').filter(l => l.trim());
    const indent = lines[0].match(/^\s*/)[0].length;
    const dedented = raw
      .split('\n')
      .map(l => l.slice(indent))
      .join('\n')
      .trim();

    block.innerHTML = dedented;

    // highlight
    hljs.highlightElement(block);
  });
  document.querySelectorAll('span code').forEach(el => {
    hljs.highlightElement(el);
  });

  // spoilerのクリックイベント
  document.querySelectorAll('.spoiler').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('opened');
    });
  });

  // peke隠し
  document.querySelectorAll('.peke').forEach(el => {
    const len = el.textContent.split('').reduce((count, char) => {
      return count + (/[^\x00-\x7F]/.test(char) ? 1 : 0.5);
    }, 0);
    el.dataset.redact = '×'.repeat(len);
  });
  // はてな隠し
  document.querySelectorAll('.unknown').forEach(el => {
    const len = el.textContent.split('').reduce((count, char) => {
      return count + (/[^\x00-\x7F]/.test(char) ? 2 : 1);
    }, 0);
    el.dataset.redact = '?'.repeat(len);
  });

  // highlightのカスタム属性を反映
  document.querySelectorAll('.highlight[data-highcol]').forEach(el => {
    var color = el.dataset.highcol;
    if (color[0] !== '#'){
      color = `var(--c-${color})`;
    }
    el.style.cssText = `
        background: repeating-linear-gradient(-45deg,
        ${color} 0, ${color} 3px,
        transparent 3px, transparent 6px);
        background-repeat: no-repeat;
        background-position: left bottom;
        background-size: 100% 30%;
        padding: 0 .5rem;`;
  });

  document.querySelectorAll('.color[data-col]').forEach(el => {
    console.log(el.dataset.col);
    var color = el.dataset.col;
    if (color[0] !== '#'){
      color = `var(--c-${color})`;
    }
    el.style.color = color;
  });

  document.querySelectorAll('.fsz[data-size]').forEach(el => {
    console.log(el.dataset.size);
    var size = el.dataset.size;
    el.style.fontSize = size;
  });

  document.addEventListener('DOMContentLoaded', function() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    document.getElementById('share-hatena').href = `https://b.hatena.ne.jp/add?mode=confirm&url=${url}&title=${title}`;
    
    document.getElementById('share-x').href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
    
    document.getElementById('share-line').href = `https://social-plugins.line.me/lineit/share?url=${url}`;
  });

  // スクロールさせる
  document.querySelectorAll('.latest, .recommended, .most-popular').forEach(section => {
    const scrollArea = section.querySelector('.boxes');
    const btns       = section.querySelectorAll('.scr-btn');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const dir    = btn.dataset.dir;
        const amount = 180; /* 1回のスクロール量px */

        scrollArea.scrollBy({
          left: dir === 'right' ? amount : -amount,
          behavior: 'smooth'
        });
      });
    });

    const updateElements = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollArea;
      const atLeft  = Math.ceil(scrollLeft) === 0;
      const atRight = Math.ceil(scrollLeft + clientWidth) >= scrollWidth;
      
      section.querySelector('[data-dir="left"]')
        .toggleAttribute('disabled', atLeft);
      section.querySelector('[data-dir="right"]')
        .toggleAttribute('disabled', atRight);

      section.querySelector('.box-wrapper').classList.toggle('at-left', atLeft);
      section.querySelector('.box-wrapper').classList.toggle('at-right', atRight);
    };

    scrollArea.addEventListener('scroll', updateElements, { passive: true });
    updateElements(); // 初期状態
  });

  
}