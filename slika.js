/* ============================================================
   Slika — vizualni izvozi: slika pobjednika (canvas, za
   dijeljenje) i stranica za ispis QR kodova stolova.
   Bez vanjskih biblioteka; QR slike generira api.qrserver.com.
   ============================================================ */
window.Slika = (function () {

  /* ---------- slika pobjednika (za dijeljenje) ---------- */
  function fitFont(ctx, text, maxWidth, startSize, weight, family) {
    let size = startSize;
    do {
      ctx.font = weight + ' ' + size + 'px ' + family;
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 2;
    } while (size > 18);
    return size;
  }

  function drawPodiumCanvas(champ, second, third) {
    const W = 1080, H = 1080, FAM = '-apple-system, "Segoe UI", Roboto, sans-serif';
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');

    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#1d6b41'); g.addColorStop(0.55, '#0d3d25'); g.addColorStop(1, '#092b1a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.07; ctx.fillStyle = '#fff';
    ctx.font = '520px ' + FAM; ctx.fillText('♠', W / 2, H / 2 + 30);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#cfe5d8'; ctx.font = '700 40px ' + FAM;
    ctx.fillText('🃏  E F D   B E L A  🃏', W / 2, 95);
    ctx.fillStyle = '#fff'; ctx.font = '800 70px ' + FAM;
    ctx.fillText('Pobjednici turnira', W / 2, 175);

    ctx.font = '160px ' + FAM; ctx.fillText('🏆', W / 2, 350);

    ctx.fillStyle = '#ffd54a'; ctx.font = '700 34px ' + FAM;
    ctx.fillText('1. MJESTO', W / 2, 470);
    let s = fitFont(ctx, champ, W - 140, 78, '800', FAM);
    ctx.fillStyle = '#fff'; ctx.font = '800 ' + s + 'px ' + FAM;
    ctx.fillText(champ, W / 2, 540);

    ctx.fillStyle = '#cfd6dd'; ctx.font = '700 30px ' + FAM;
    ctx.fillText('🥈  2. MJESTO', W / 2, 690);
    s = fitFont(ctx, second, W - 200, 54, '700', FAM);
    ctx.fillStyle = '#fff'; ctx.font = '700 ' + s + 'px ' + FAM;
    ctx.fillText(second, W / 2, 745);

    if (third) {
      ctx.fillStyle = '#e3b07a'; ctx.font = '700 30px ' + FAM;
      ctx.fillText('🥉  3. MJESTO', W / 2, 855);
      s = fitFont(ctx, third, W - 200, 54, '700', FAM);
      ctx.fillStyle = '#fff'; ctx.font = '700 ' + s + 'px ' + FAM;
      ctx.fillText(third, W / 2, 910);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '400 28px ' + FAM;
    ctx.fillText(new Date().toLocaleDateString('hr-HR'), W / 2, H - 48);

    return c;
  }

  function shareWinners(champ, second, third) {
    const canvas = drawPodiumCanvas(champ, second, third);
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], 'efd-bela-pobjednici.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'EFD Bela', text: '🏆 Pobjednici turnira!' }).catch(() => {});
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'efd-bela-pobjednici.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    }, 'image/png');
  }

  /* ---------- QR kodovi po stolu (stranica za ispis) ---------- */
  function qrSrc(data, size) {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size +
      '&margin=8&data=' + encodeURIComponent(data);
  }

  /* tables: [{url, name1, name2}], r: index kola (0-based) */
  function printRoundQR(r, tables) {
    const cards = tables.map((t, i) =>
      '<div class="qrp">' +
      '<div class="t">Stol ' + (i + 1) + '</div>' +
      '<div class="n">' + t.name1 + '<br><span>vs</span><br>' + t.name2 + '</div>' +
      '<img src="' + qrSrc(t.url, 320) + '" alt="QR">' +
      '<div class="k">' + (r + 1) + '. kolo · skeniraj i upiši partiju</div>' +
      '</div>'
    ).join('');
    const w = window.open('', '_blank');
    if (!w) { alert('Skočni prozor je blokiran — dopusti ga pa probaj ponovno.'); return; }
    w.document.write(
      '<!doctype html><html lang="hr"><head><meta charset="utf-8">' +
      '<title>QR za stolove · ' + (r + 1) + '. kolo</title><style>' +
      'body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;margin:0;padding:14px;color:#1b2a22}' +
      'h1{font-size:1.1rem;color:#0d3d25;text-align:center;margin:0 0 12px}' +
      '.qrp{page-break-inside:avoid;display:inline-block;width:46%;box-sizing:border-box;' +
      'border:2px solid #0d3d25;border-radius:14px;margin:1%;padding:16px;text-align:center;vertical-align:top}' +
      '.qrp .t{font-size:1.7rem;font-weight:800;color:#0d3d25}' +
      '.qrp .n{margin:8px 0;font-weight:700;font-size:1.05rem}.qrp .n span{color:#6b7c72;font-weight:500}' +
      '.qrp img{width:320px;height:320px;max-width:100%}' +
      '.qrp .k{color:#6b7c72;font-size:.85rem;margin-top:6px}' +
      '@media print{button{display:none}}' +
      '</style></head><body>' +
      '<h1>♠ EFD Bela — QR kodovi stolova (' + (r + 1) + '. kolo)</h1>' +
      '<div style="text-align:center;margin-bottom:10px"><button onclick="window.print()">🖨️ Ispiši</button></div>' +
      cards + '</body></html>');
    w.document.close();
  }

  return { drawPodiumCanvas, shareWinners, qrSrc, printRoundQR };
})();
