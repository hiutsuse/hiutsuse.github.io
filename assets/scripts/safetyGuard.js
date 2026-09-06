'use strict';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('verify-btn').addEventListener('click', async () => {
    // await fetch('/verify', { method: 'POST' });
    // ページ遷移なしでオーバーレイを消す→本文取得
    const guardBox = document.getElementById('safetyGuard');
    document.body.style.overflow = "visible";
    // loadContent();

    // 1. アニメーション用のクラスを追加
    guardBox.classList.add('deleted');

    // 2. アニメーション終了後に要素を削除
    guardBox.addEventListener('transitionend', () => {
      guardBox.remove();
    }, { once: true }); // { once: true } でイベントを1回だけ実行
  });
  document.getElementById('back-btn').addEventListener('click', async () => {
    window.location.assign('URL');
  });
});