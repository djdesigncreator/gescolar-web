/* Gescolar · planos de aula (usado em professor.html e direccao.html) — v5.18
   Modelo usado nas escolas moçambicanas: cabeçalho (unidade temática, tema, objectivos, meios, métodos…) e as quatro funções didácticas
   (Introdução e Motivação · Mediação e Assimilação · Domínio e Consolidação · Controlo e Avaliação).
   GSPlano.editor(el, { plano, pares, ia, api, aviso, voltar, escola, logotipo, professor })   — professor
   GSPlano.ver(el, plano, { escola, logotipo })                                                  — leitura (Direcção ou plano aprovado)
   GSPlano.imprimir(plano, { escola, logotipo })                                                 — abre a folha para imprimir ou guardar em PDF
   GSPlano.pill(estado) */
(function(){
'use strict';
var FUNCOES=['Introdução e Motivação','Mediação e Assimilação','Domínio e Consolidação','Controlo e Avaliação'];
var TEMPOS45=[5,25,10,5];
var TIPOS=['Introdução de nova matéria','Exercitação e consolidação','Revisão','Sistematização','Avaliação','Aula prática / laboratório'];
var ESTADOS={rascunho:['Rascunho','#5F6B7A','#EEF1F5'],submetido:['À espera do visto','#8A6D00','#FFF4D6'],aprovado:['Visto da Direcção','#0F6B41','#E3F5EC'],devolvido:['Devolvido','#C0392B','#FDE8E6']};
var CSS=''+
'.gpl-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:4px 0 14px}.gpl-top h3{margin:0;font:800 19px var(--f-display);flex:1;min-width:200px}'+
'.gpl-back{background:none;border:0;color:var(--blue);font:600 14px var(--f-body);cursor:pointer;padding:0}'+
'.gpl-pill{display:inline-block;font:700 12px var(--f-body);padding:3px 9px;border-radius:99px;white-space:nowrap}'+
'.gpl-sec{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:14px}'+
'.gpl-sec h4{margin:0 0 12px;font:800 15px var(--f-display)}'+
'.gpl-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}'+
'.gpl-f{display:block;font-weight:600;font-size:13.5px}.gpl-f small{font-weight:400;color:var(--muted)}'+
'.gpl-f input,.gpl-f select,.gpl-f textarea{display:block;width:100%;box-sizing:border-box;margin-top:5px;border:1px solid var(--line);border-radius:10px;padding:9px 11px;font:14.5px/1.4 var(--f-body);color:var(--ink);background:var(--surface)}'+
'.gpl-f input,.gpl-f select{height:42px;padding-top:0;padding-bottom:0}.gpl-f textarea{resize:vertical;min-height:70px}'+
'.gpl-f input:focus,.gpl-f select:focus,.gpl-f textarea:focus{outline:none;border-color:var(--blue)}'+
'.gpl-fase{border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:10px;background:var(--bg)}'+
'.gpl-fase-h{display:flex;align-items:center;gap:10px;margin-bottom:10px}.gpl-fase-h b{flex:1;font:800 14.5px var(--f-display)}'+
'.gpl-fase-h input{width:74px;height:36px;border:1px solid var(--line);border-radius:9px;padding:0 8px;font:600 14px var(--f-body);text-align:center}'+
'.gpl-n{flex:none;width:26px;height:26px;border-radius:8px;background:var(--navy);color:#fff;display:grid;place-items:center;font:800 13px var(--f-display)}'+
'.gpl-soma{font-size:13px;margin:-4px 2px 10px}'+
'.gpl-bar{position:sticky;bottom:0;z-index:5;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:10px;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;box-shadow:0 -8px 24px -16px rgba(0,0,0,.3)}'+
'@media (max-width:720px){.gpl-bar{bottom:calc(64px + env(safe-area-inset-bottom,0px))}}'+
'.gpl-msg{border-radius:12px;padding:12px 14px;margin-bottom:14px;font-size:14px;line-height:1.5}'+
'.gpl-err{color:#C0392B;font-size:13.5px;margin:0 2px 10px}'+
'.gpl-ia{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:var(--blue-soft,#E6F0FC);border-radius:12px;padding:10px 12px;margin-top:12px;font-size:13.5px}'+
'.gpl-ia span{flex:1;min-width:200px}'+
'.gpl-folha{background:#fff;color:#111;border:1px solid var(--line);border-radius:14px;padding:22px;overflow-x:auto}';

function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function dois(n){ return String(n).padStart(2,'0'); }
function dataPT(iso){ if(!iso) return '—'; var m=String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/); if(m) return m[3]+'/'+m[2]+'/'+m[1]; var d=new Date(iso); return isNaN(d)?'—':dois(d.getDate())+'/'+dois(d.getMonth()+1)+'/'+d.getFullYear(); }
function hojeISO(){ var d=new Date(); return d.getFullYear()+'-'+dois(d.getMonth()+1)+'-'+dois(d.getDate()); }
function linhas(t){ return esc(t||'').replace(/\n/g,'<br>'); }
function css(){ if(!document.getElementById('gpl-css')){ var s=document.createElement('style'); s.id='gpl-css'; s.textContent=CSS; document.head.appendChild(s); } }
function pill(e){ var x=ESTADOS[e]||ESTADOS.rascunho; return '<span class="gpl-pill" style="color:'+x[1]+';background:'+x[2]+'">'+x[0]+'</span>'; }
function triActual(){ var m=new Date().getMonth()+1; return m<=5?1:(m<=8?2:3); }
function vazio(){ return { trimestre:triActual(), licao:'', unidade:'', tema:'', tipo:'Introdução de nova matéria', duracao:45, objectivos:'', competencias:'', meios:'', metodos:'', bibliografia:'', observacoes:'',
  fases:FUNCOES.map(function(f,i){ return {funcao:f, tempo:TEMPOS45[i], conteudo:'', professor:'', aluno:'', metodos:'', meios:''}; }) }; }

/* ---------- folha (ecrã e impressão) ---------- */
function folhaHTML(p, op){
  op=op||{}; var d=p.dados||vazio();
  var cab=[['Escola',op.escola],['Disciplina',p.disciplina_nome],['Classe',p.classe||p.turma_nome],['Turma',p.turma_nome],['Professor(a)',p.professor_nome||op.professor],['Data',dataPT(p.data)],
    ['Trimestre',d.trimestre?d.trimestre+'.º':''],['Lição n.º',d.licao],['Duração',d.duracao+' minutos'],['Tipo de aula',d.tipo]];
  var td='border:1px solid #333;padding:6px 8px;vertical-align:top;font-size:12px;line-height:1.4';
  var th='border:1px solid #333;padding:6px 8px;background:#EEF1F5;font-size:11.5px;text-align:left';
  return '<div style="font-family:Arial,Helvetica,sans-serif;color:#111">'+
    '<div style="display:flex;align-items:center;gap:14px;border-bottom:2px solid #0B2A4A;padding-bottom:10px;margin-bottom:12px">'+(op.logotipo?'<img src="'+esc(op.logotipo)+'" style="max-width:60px;max-height:60px" alt="">':'')+
      '<div style="flex:1"><div style="font-size:15px;font-weight:800">'+esc(op.escola||'')+'</div><div style="font-size:20px;font-weight:800;letter-spacing:.04em;color:#0B2A4A">PLANO DE AULA</div></div>'+
      (p.estado==='aprovado'?'<div style="border:2px solid #0F6B41;color:#0F6B41;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;text-align:center">VISTO<br>'+esc(dataPT(p.visto_em))+'</div>':'')+'</div>'+
    '<table style="width:100%;border-collapse:collapse;margin-bottom:10px"><tbody>'+
      [0,2,4,6,8].map(function(i){ return '<tr>'+[cab[i],cab[i+1]].map(function(c){ return '<td style="'+td+';width:16%;background:#F7F9FC;font-weight:700">'+c[0]+'</td><td style="'+td+';width:34%">'+esc(c[1]||'')+'</td>'; }).join('')+'</tr>'; }).join('')+
      '<tr><td style="'+td+';background:#F7F9FC;font-weight:700">Unidade temática</td><td colspan="3" style="'+td+'">'+esc(d.unidade)+'</td></tr>'+
      '<tr><td style="'+td+';background:#F7F9FC;font-weight:700">Tema</td><td colspan="3" style="'+td+';font-weight:700">'+esc(d.tema)+'</td></tr>'+
    '</tbody></table>'+
    '<table style="width:100%;border-collapse:collapse;margin-bottom:10px"><tbody>'+
      '<tr><td style="'+td+';width:22%;background:#F7F9FC;font-weight:700">Objectivos específicos</td><td style="'+td+'">'+linhas(d.objectivos)+'</td></tr>'+
      (d.competencias?'<tr><td style="'+td+';background:#F7F9FC;font-weight:700">Competências</td><td style="'+td+'">'+linhas(d.competencias)+'</td></tr>':'')+
      '<tr><td style="'+td+';background:#F7F9FC;font-weight:700">Meios didácticos</td><td style="'+td+'">'+linhas(d.meios)+'</td></tr>'+
      '<tr><td style="'+td+';background:#F7F9FC;font-weight:700">Métodos</td><td style="'+td+'">'+linhas(d.metodos)+'</td></tr>'+
      (d.bibliografia?'<tr><td style="'+td+';background:#F7F9FC;font-weight:700">Bibliografia</td><td style="'+td+'">'+linhas(d.bibliografia)+'</td></tr>':'')+
    '</tbody></table>'+
    '<table style="width:100%;border-collapse:collapse;margin-bottom:10px"><thead><tr><th style="'+th+';width:13%">Função didáctica</th><th style="'+th+';width:6%">Tempo</th><th style="'+th+'">Conteúdo</th><th style="'+th+'">Actividades do professor</th><th style="'+th+'">Actividades do aluno</th><th style="'+th+';width:11%">Métodos</th><th style="'+th+';width:11%">Meios</th></tr></thead><tbody>'+
      d.fases.map(function(f){ return '<tr><td style="'+td+';font-weight:700">'+esc(f.funcao)+'</td><td style="'+td+';text-align:center">'+(f.tempo||'')+'\'</td><td style="'+td+'">'+linhas(f.conteudo)+'</td><td style="'+td+'">'+linhas(f.professor)+'</td><td style="'+td+'">'+linhas(f.aluno)+'</td><td style="'+td+'">'+linhas(f.metodos)+'</td><td style="'+td+'">'+linhas(f.meios)+'</td></tr>'; }).join('')+
    '</tbody></table>'+
    (d.observacoes?'<div style="font-size:12px;margin-bottom:10px"><b>Observações:</b> '+linhas(d.observacoes)+'</div>':'')+
    '<div style="display:flex;gap:30px;margin-top:26px;font-size:12px"><div style="flex:1;text-align:center"><div style="border-top:1px solid #333;padding-top:4px">O(A) Professor(a)'+(p.professor_nome?'<br><b>'+esc(p.professor_nome)+'</b>':'')+'</div></div>'+
      '<div style="flex:1;text-align:center"><div style="border-top:1px solid #333;padding-top:4px">Visto da Direcção Pedagógica'+(p.estado==='aprovado'&&p.visto_por?'<br><b>'+esc(p.visto_por)+'</b> · '+esc(dataPT(p.visto_em)):'')+'</div></div></div>'+
  '</div>';
}
function imprimir(p, op){
  var w=window.open('','_blank'); if(!w){ alert('O navegador bloqueou a janela. Permita janelas deste site e tente de novo.'); return; }
  w.document.write('<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>Plano de aula · '+esc((p.dados&&p.dados.tema)||'')+'</title><style>@page{size:A4 landscape;margin:12mm}body{margin:0;padding:14px}@media print{body{padding:0}.np{display:none}}</style></head><body>'+
    '<div class="np" style="font-family:Arial,sans-serif;margin-bottom:12px"><button onclick="window.print()" style="font:700 14px Arial;padding:10px 16px;border-radius:8px;border:0;background:#0A64DC;color:#fff;cursor:pointer">Imprimir / Guardar em PDF</button></div>'+
    folhaHTML(p, op)+'<script>setTimeout(function(){ window.print(); },400);<\/script></body></html>');
  w.document.close();
  try{ if(window.GSI18n) GSI18n.aplicar(w.document); }catch(e){}
}
function ver(el, p, op){ css(); el.innerHTML='<div class="gpl-folha">'+folhaHTML(p, op)+'</div>'; }

/* ---------- editor do professor ---------- */
function editor(el, op){
  css(); op=op||{};
  var p=op.plano||{ estado:'rascunho', data:hojeISO(), dados:vazio() };
  var d=JSON.parse(JSON.stringify(p.dados||vazio()));
  var pares=op.pares||[], sujo=false;
  var parSel=p.turma? p.turma+'|'+p.disciplina : (pares[0]? pares[0].turma+'|'+pares[0].disciplina : '');
  var bloqueado=p.estado==='aprovado';
  function aviso(t){ if(op.aviso) op.aviso(t); }
  function campo(k, rot, tipo, extra){ var v=d[k]==null?'':d[k];
    if(tipo==='area') return '<label class="gpl-f">'+rot+'<textarea data-k="'+k+'" rows="'+((extra&&extra.rows)||3)+'" placeholder="'+esc((extra&&extra.ph)||'')+'">'+esc(v)+'</textarea></label>';
    return '<label class="gpl-f">'+rot+'<input data-k="'+k+'" '+(tipo==='num'?'type="number" min="10" max="300"':'')+(extra&&extra.list?' list="'+extra.list+'"':'')+' value="'+esc(v)+'" placeholder="'+esc((extra&&extra.ph)||'')+'"></label>'; }
  function desenhar(){
    var somaT=d.fases.reduce(function(a,f){ return a+(Number(f.tempo)||0); },0);
    el.innerHTML='<div class="gpl-top"><button class="gpl-back" data-v>‹ Planos de aula</button></div>'+
      '<div class="gpl-top"><h3>'+(p.id?esc(d.tema||'Plano de aula'):'Novo plano de aula')+'</h3>'+pill(p.estado)+'</div>'+
      (p.estado==='devolvido'&&p.comentario?'<div class="gpl-msg" style="background:#FDE8E6"><b style="color:#C0392B">Devolvido pela Direcção</b>'+(p.visto_por?' ('+esc(p.visto_por)+')':'')+': '+linhas(p.comentario)+'<div class="small" style="margin-top:4px">Corrija e submeta outra vez.</div></div>':'')+
      (p.estado==='submetido'?'<div class="gpl-msg" style="background:#FFF4D6">Submetido à Direcção. Se mudar alguma coisa, o plano volta a rascunho e tem de o submeter outra vez.</div>':'')+
      '<div class="gpl-sec"><h4>Dados da aula</h4><div class="gpl-g">'+
        '<label class="gpl-f" style="grid-column:1/-1">Turma e disciplina<select data-par>'+pares.map(function(x){ var k=x.turma+'|'+x.disciplina; return '<option value="'+esc(k)+'"'+(k===parSel?' selected':'')+'>'+esc(x.turma_nome+' — '+x.disciplina_nome)+'</option>'; }).join('')+'</select></label>'+
        '<label class="gpl-f">Data da aula<input type="date" data-data value="'+esc(p.data||hojeISO())+'"></label>'+
        '<label class="gpl-f">Trimestre<select data-k="trimestre">'+[1,2,3].map(function(t){ return '<option value="'+t+'"'+(Number(d.trimestre)===t?' selected':'')+'>'+t+'.º trimestre</option>'; }).join('')+'</select></label>'+
        campo('licao','Lição n.º','',{ph:'Ex.: 12'})+
        campo('duracao','Duração (minutos)','num')+
        campo('tipo','Tipo de aula','',{list:'gpl-tipos'})+'<datalist id="gpl-tipos">'+TIPOS.map(function(t){ return '<option value="'+esc(t)+'">'; }).join('')+'</datalist>'+
        '<div style="grid-column:1/-1">'+campo('unidade','Unidade temática','',{ph:'Ex.: Números racionais'})+'</div>'+
        '<div style="grid-column:1/-1">'+campo('tema','Tema da aula','',{ph:'Ex.: Adição de fracções com o mesmo denominador'})+'</div>'+
      '</div>'+
      (op.ia?'<div class="gpl-ia"><span><b>Rascunho com IA (opcional).</b> Escreva o tema e a duração; a IA preenche os objectivos e as funções didácticas. Reveja e corrija tudo antes de submeter.</span><button class="btn sm" data-ia>✨ Preencher com IA</button></div>':'')+
      '</div>'+
      '<div class="gpl-sec"><h4>Objectivos e recursos</h4><div style="display:grid;gap:12px">'+
        campo('objectivos','Objectivos específicos <small>(um por linha: «- identificar…», «- resolver…»)</small>','area',{rows:4,ph:'- Identificar …\n- Resolver …'})+
        campo('competencias','Competências a desenvolver <small>(opcional)</small>','area',{rows:2})+
        '<div class="gpl-g">'+campo('meios','Meios didácticos','area',{rows:2,ph:'Quadro, giz, livro do aluno…'})+campo('metodos','Métodos','area',{rows:2,ph:'Elaboração conjunta, trabalho independente…'})+'</div>'+
        campo('bibliografia','Bibliografia <small>(opcional)</small>','area',{rows:2})+
      '</div></div>'+
      '<div class="gpl-sec"><h4>Funções didácticas</h4>'+
        '<div class="gpl-soma" style="color:'+(somaT===Number(d.duracao)?'var(--ok,#0F6B41)':'#C0392B')+'">Tempo das fases: <b>'+somaT+' min</b> de '+d.duracao+' min'+(somaT===Number(d.duracao)?' ✓':' — ajuste os tempos')+'</div>'+
        d.fases.map(function(f,i){ return '<div class="gpl-fase"><div class="gpl-fase-h"><span class="gpl-n">'+(i+1)+'</span><b>'+esc(f.funcao)+'</b><label class="small">min <input type="number" min="0" max="300" data-f="'+i+'" data-c="tempo" value="'+esc(f.tempo)+'"></label></div>'+
          '<div class="gpl-g">'+[['conteudo','Conteúdo'],['professor','Actividades do professor'],['aluno','Actividades do aluno']].map(function(c){ return '<label class="gpl-f">'+c[1]+'<textarea rows="3" data-f="'+i+'" data-c="'+c[0]+'">'+esc(f[c[0]])+'</textarea></label>'; }).join('')+
          '</div><div class="gpl-g" style="margin-top:10px">'+[['metodos','Métodos'],['meios','Meios']].map(function(c){ return '<label class="gpl-f">'+c[1]+'<input data-f="'+i+'" data-c="'+c[0]+'" value="'+esc(f[c[0]])+'"></label>'; }).join('')+'</div></div>'; }).join('')+
      '</div>'+
      '<div class="gpl-sec">'+campo('observacoes','Observações <small>(opcional)</small>','area',{rows:2})+'</div>'+
      '<div class="gpl-err" data-err></div>'+
      '<div class="gpl-bar">'+(p.id?'<button class="btn" data-del style="margin-right:auto;color:#C0392B">Apagar</button>':'')+
        '<button class="btn" data-pr>Imprimir</button><button class="btn" data-g>Guardar rascunho</button><button class="btn pri" data-s>Submeter à Direcção</button></div>';
    ligar();
  }
  function q(s){ return el.querySelector(s); }
  function qa(s){ return Array.prototype.slice.call(el.querySelectorAll(s)); }
  function ler(){
    qa('[data-k]').forEach(function(x){ var k=x.getAttribute('data-k'); d[k]=(k==='duracao'||k==='trimestre')?(Number(x.value)||0):x.value; });
    qa('[data-f]').forEach(function(x){ var i=+x.getAttribute('data-f'), c=x.getAttribute('data-c'); d.fases[i][c]=c==='tempo'?(Number(x.value)||0):x.value; });
    var ps=q('[data-par]'); if(ps) parSel=ps.value;
    var dt=q('[data-data]'); if(dt) p.data=dt.value;
  }
  function par(){ var k=parSel.split('|'); return {turma:k[0], disciplina:k[1]}; }
  function erroV(t){ var e=q('[data-err]'); if(e) e.textContent=t||''; }
  function ligar(){
    q('[data-v]').onclick=function(){ ler(); if(sujo && !confirm('Tem alterações por guardar. Sair mesmo assim?')) return; if(op.voltar) op.voltar(); };
    qa('input,textarea,select').forEach(function(x){ x.addEventListener('input',function(){ sujo=true; }); });
    qa('[data-c="tempo"],[data-k="duracao"]').forEach(function(x){ x.addEventListener('change',function(){ ler(); desenhar(); }); });
    q('[data-pr]').onclick=function(){ ler(); var x=par(), pr=(pares.filter(function(z){ return z.turma===x.turma&&z.disciplina===x.disciplina; })[0])||{};
      imprimir(Object.assign({}, p, {dados:d, turma_nome:pr.turma_nome, classe:pr.classe, disciplina_nome:pr.disciplina_nome, professor_nome:op.professor}), {escola:op.escola, logotipo:op.logotipo}); };
    q('[data-g]').onclick=function(){ guardar(false, this); };
    q('[data-s]').onclick=function(){ guardar(true, this); };
    var dl=q('[data-del]'); if(dl) dl.onclick=function(){ if(!confirm('Apagar este plano de aula?')) return; dl.disabled=true;
      op.api('/prof/plano-apagar',{id:p.id}).then(function(r){ dl.disabled=false; if(!r.ok){ erroV(r.erro); return; } aviso('Plano apagado'); sujo=false; if(op.voltar) op.voltar(); }); };
    var ia=q('[data-ia]'); if(ia) ia.onclick=function(){ ler(); if(String(d.tema||'').trim().length<3){ erroV('Escreva primeiro o tema da aula.'); var t=q('[data-k="tema"]'); if(t) t.focus(); return; }
      var temConteudo=d.objectivos || d.fases.some(function(f){ return f.conteudo||f.professor||f.aluno; });
      if(temConteudo && !confirm('A IA vai substituir os objectivos, os meios, os métodos e as funções didácticas que já escreveu. Continuar?')) return;
      ia.disabled=true; ia.textContent='A IA está a escrever…'; erroV('');
      var x=par();
      op.api('/prof/plano-ia',{turma:x.turma, disciplina:x.disciplina, tema:d.tema, unidade:d.unidade, tipo:d.tipo, duracao:d.duracao}).then(function(r){
        ia.disabled=false; ia.textContent='✨ Preencher com IA';
        if(!r.ok){ erroV(r.erro); return; }
        ['objectivos','competencias','meios','metodos','bibliografia'].forEach(function(k){ d[k]=r.dados[k]||''; }); d.fases=r.dados.fases; sujo=true; desenhar();
        aviso('Rascunho preenchido ('+r.usados+'/'+r.limite+' pedidos de IA este mês). Reveja tudo.'); });
    };
  }
  function guardar(submeter, b){
    ler(); erroV('');
    if(!parSel){ erroV('Não tem turmas e disciplinas atribuídas. Fale com a Direcção.'); return; }
    if(submeter && !confirm('Submeter este plano à Direcção para o visto?')) return;
    var x=par(); b.disabled=true;
    op.api('/prof/plano-guardar',{id:p.id, turma:x.turma, disciplina:x.disciplina, data:p.data, dados:d, submeter:submeter}).then(function(r){
      b.disabled=false;
      if(!r.ok){ erroV(r.erro); return; }
      p.id=r.id; p.estado=r.estado; p.turma=x.turma; p.disciplina=x.disciplina; p.dados=d; sujo=false;
      aviso(submeter?'Plano submetido à Direcção':'Rascunho guardado'); desenhar();
    });
  }
  if(bloqueado){
    el.innerHTML='<div class="gpl-top"><button class="gpl-back" data-v>‹ Planos de aula</button></div><div class="gpl-top"><h3>'+esc(d.tema||'Plano de aula')+'</h3>'+pill(p.estado)+'</div>'+
      '<div class="gpl-msg" style="background:#E3F5EC">Este plano tem o visto da Direcção'+(p.visto_por?' ('+esc(p.visto_por)+', '+esc(dataPT(p.visto_em))+')':'')+'. Já não pode ser mudado; pode fazer uma cópia para outra aula.'+(p.comentario?'<div style="margin-top:4px"><b>Comentário:</b> '+linhas(p.comentario)+'</div>':'')+'</div>'+
      '<div data-folha></div><div class="gpl-bar" style="margin-top:14px"><button class="btn" data-cp>Fazer uma cópia</button><button class="btn pri" data-pr>Imprimir</button></div>';
    ver(el.querySelector('[data-folha]'), p, {escola:op.escola, logotipo:op.logotipo});
    el.querySelector('[data-v]').onclick=function(){ if(op.voltar) op.voltar(); };
    el.querySelector('[data-pr]').onclick=function(){ imprimir(p, {escola:op.escola, logotipo:op.logotipo}); };
    el.querySelector('[data-cp]').onclick=function(){ editor(el, Object.assign({}, op, {plano:{estado:'rascunho', data:hojeISO(), turma:p.turma, disciplina:p.disciplina, dados:Object.assign(JSON.parse(JSON.stringify(d)),{licao:''})}})); aviso('Cópia criada: mude a data e guarde'); };
    return;
  }
  desenhar();
}
window.GSPlano={ editor:editor, ver:ver, imprimir:imprimir, pill:pill, folhaHTML:folhaHTML };
})();
