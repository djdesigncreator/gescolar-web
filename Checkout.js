/* Gescolar · janela de pagamento (checkout M-Pesa / e-Mola) — v5.22
   GSCheckout.abrir(url, { titulo, valor, embed, aoFechar })  → mostra o checkout num iframe de 400 × 450 por cima da página
   (embed:false = o fornecedor proíbe iframes: a janela mostra um botão que abre o checkout num separador novo)
   GSCheckout.fechar()                                  → fecha (chamado quando o pagamento é confirmado)
   GSCheckout.aberto()                                  → true se a janela está aberta
   A confirmação vem sempre do servidor (webhook): a página continua a perguntar o estado e fecha esta janela quando fica pago. */
(function(){
  var CSS = '.gsck-ov{position:fixed;inset:0;z-index:9000;background:rgba(5,12,22,.72);display:flex;align-items:center;justify-content:center;padding:12px}' +
    '.gsck-bx{background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.35);overflow:hidden;width:424px;max-width:100%;color:#0B2A4A;font-family:inherit}' +
    '.gsck-h{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #E1E7F0}' +
    '.gsck-h b{flex:1;font-size:15px;line-height:1.25}.gsck-h small{display:block;font-weight:500;color:#5B6B82;font-size:12.5px}' +
    '.gsck-x{border:0;background:#F2F5FA;color:#0B2A4A;width:34px;height:34px;border-radius:9px;font-size:20px;line-height:1;cursor:pointer}' +
    '.gsck-f{display:flex;justify-content:center;padding:12px;background:#F7F9FC}' +
    '.gsck-f iframe{width:400px;height:450px;max-width:100%;border:0;border-radius:10px;background:#fff}' +
    '.gsck-p{display:flex;align-items:center;gap:8px;justify-content:center;padding:10px 14px 14px;font-size:13px;color:#5B6B82}' +
    '.gsck-alt{display:block;text-align:center;font-size:13px;color:#0A64DC;padding:2px 14px 0;text-decoration:underline;cursor:pointer;background:none;border:0;width:100%;font-family:inherit}' +
    '.gsck-sep{padding:26px 22px;text-align:center}.gsck-sep p{font-size:14.5px;line-height:1.45;color:#3B4B62;margin:0 0 16px}' +
    '.gsck-go{display:inline-block;background:#0A64DC;color:#fff;border:0;border-radius:12px;padding:14px 22px;font:700 16px inherit;cursor:pointer;text-decoration:none}' +
    '.gsck-p i{width:9px;height:9px;border-radius:50%;background:#0A64DC;animation:gsckP 1.2s infinite}@keyframes gsckP{50%{opacity:.25}}' +
    '@media (max-width:440px){.gsck-ov{padding:0;align-items:stretch}.gsck-bx{border-radius:0;width:100%;display:flex;flex-direction:column}.gsck-f{flex:1;padding:8px}.gsck-f iframe{width:100%;height:100%;min-height:450px}}';
  var el = null, aoFechar = null;
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function css(){
    if (document.getElementById('gsck-css')) return;
    var s = document.createElement('style'); s.id = 'gsck-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  function fechar(manual){
    if (!el) return;
    el.remove(); el = null;
    var f = aoFechar; aoFechar = null;
    if (manual && f) try { f(); } catch (e) {}
  }
  function abrir(url, op){
    op = op || {}; css(); fechar(false);
    aoFechar = op.aoFechar || null;
    el = document.createElement('div'); el.className = 'gsck-ov';
    el.innerHTML = '<div class="gsck-bx" role="dialog" aria-modal="true" aria-label="Pagamento">' +
      '<div class="gsck-h"><b>' + esc(op.titulo || 'Pagamento') + (op.valor ? '<small>' + esc(op.valor) + '</small>' : '') + '</b>' +
      '<button class="gsck-x" type="button" aria-label="Fechar">×</button></div>' +
      (op.embed === false
        ? '<div class="gsck-sep"><p>A página de pagamento abre num separador novo. Pague lá e volte a esta página: ela fecha sozinha quando o pagamento for confirmado.</p><a class="gsck-go" href="' + esc(url) + '" target="_blank" rel="noopener">Abrir a página de pagamento</a></div>'
        : '<div class="gsck-f"><iframe src="' + esc(url) + '" allow="payment" referrerpolicy="no-referrer-when-downgrade"></iframe></div>' +
          '<a class="gsck-alt" href="' + esc(url) + '" target="_blank" rel="noopener">A página não aparece? Abrir num separador novo</a>') +
      '<div class="gsck-p"><i></i><span>Esta janela fecha sozinha quando o pagamento for confirmado.</span></div></div>';
    document.body.appendChild(el);
    el.querySelector('.gsck-x').onclick = function(){ fechar(true); };
    if (op.embed === false) { try { var w = window.open(url, '_blank', 'noopener'); } catch (e) {} }
  }
  window.GSCheckout = { abrir: abrir, fechar: function(){ fechar(false); }, aberto: function(){ return !!el; } };
})();
