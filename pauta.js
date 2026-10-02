/* Gescolar · editor de pautas (usado em professor.html e direccao.html)
   GSPauta.montar(elemento, pauta, { guardar: function(grelha, publicado){ return Promise<{ok, erro, grelha, publicado}> }, aviso: function(texto){} })
   pauta = { turma:{nome}, disciplina:{nome,cor}, trimestre, estudantes:[{id,nome,numero}], grelha:{colunas,notas}, publicado, actualizado_por, regras:{aprovacao} }
   Média do trimestre: MT = (2 x MACS + ACP) / 3 ; sem ACP, MT = MACS */
(function(){
'use strict';
var CSS = '' +
'.gp-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:12px}' +
'.gp-top h3{margin:0;font-size:18px}' +
'.gp-top .gp-sub{color:var(--muted);font-size:13px;margin-top:2px}' +
'.gp-acts{display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
'.gp-wrap{overflow:auto;border:1px solid var(--line);border-radius:12px;background:var(--surface);max-height:70vh}' +
'.gp{border-collapse:separate;border-spacing:0;width:100%;font-size:14px}' +
'.gp th,.gp td{padding:6px 8px;border-bottom:1px solid var(--line);white-space:nowrap;text-align:center;background:var(--surface)}' +
'.gp thead th{position:sticky;top:0;z-index:2;font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:700;background:var(--surface)}' +
'.gp th.nm,.gp td.nm{position:sticky;left:0;z-index:1;text-align:left;min-width:170px;max-width:220px;overflow:hidden;text-overflow:ellipsis;border-right:1px solid var(--line)}' +
'.gp thead th.nm{z-index:3}' +
'.gp td.nm b{font-weight:600;font-size:14px}' +
'.gp td.nm small{display:block;color:var(--muted);font-family:var(--f-mono);font-size:11px}' +
'.gp th.col{cursor:pointer}' +
'.gp th.col:hover{color:var(--blue)}' +
'.gp th.acp{color:var(--ink)}' +
'.gp input{width:54px;height:34px;border:1px solid var(--line);border-radius:7px;text-align:center;font:600 14px var(--f-mono);background:var(--surface);color:var(--ink)}' +
'.gp input:focus{outline:2px solid var(--blue);outline-offset:-1px}' +
'.gp input.neg{color:var(--bad)}' +
'.gp input.mau{border-color:var(--bad);background:var(--bad-soft)}' +
'.gp td.calc{font:700 14px var(--f-mono);min-width:56px}' +
'.gp td.mt{font-size:15px}' +
'.gp .neg{color:var(--bad)}' +
'.gp .pos{color:var(--ok)}' +
'.gp-foot{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;font-size:13.5px;color:var(--muted)}' +
'.gp-foot b{color:var(--ink);font-family:var(--f-mono)}' +
'.gp-err{background:var(--bad-soft);color:var(--bad);border-radius:8px;padding:10px 12px;font-size:14px;font-weight:600;margin-bottom:10px}' +
'.gp-pub{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 12px;border:1px solid var(--line);border-radius:9px;font-weight:600;font-size:14px;cursor:pointer;background:var(--surface);color:var(--ink)}' +
'@media print{.gp-acts,.gp-hint{display:none!important}.gp-wrap{max-height:none;overflow:visible;border:0}.gp input{border:0;width:auto}}';
function estilo(){ if(document.getElementById('gp-css')) return; var s=document.createElement('style'); s.id='gp-css'; s.textContent=CSS; document.head.appendChild(s); }
function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function r1(n){ return Math.round(n*10)/10; }
function fmt(n){ return n==null||isNaN(n) ? '—' : String(r1(n)).replace('.',','); }
function ler(v){ v=String(v==null?'':v).trim().replace(',','.'); if(v==='') return null; var n=Number(v); return (isFinite(n) && n>=0 && n<=20) ? r1(n) : NaN; }
function medias(cols, linha){
  var acs=[], acp=null;
  cols.forEach(function(c){ var v=linha[c.id]; if(typeof v!=='number') return; if(c.tipo==='ACP') acp=v; else acs.push(v); });
  var macs = acs.length ? r1(acs.reduce(function(a,b){ return a+b; },0)/acs.length) : null;
  var mt = (macs!==null && acp!==null) ? r1((2*macs+acp)/3) : (macs!==null ? macs : acp);
  return { macs:macs, acp:acp, mt:mt, completa: macs!==null && acp!==null };
}
var TRI=['','1º trimestre','2º trimestre','3º trimestre'];

var NIV={A:['Adquirido','ok'],E:['Em aquisição','warn'],N:['Não adquirido','bad']};
/* Escolinha: avaliação descritiva (A adquirido · E em aquisição · N não adquirido + observação) */
function montarDescritiva(el, P, op){
  estilo(); op=op||{};
  var G={modo:'descritiva', notas:JSON.parse(JSON.stringify((P.grelha&&P.grelha.notas)||{}))}, pub=!!P.publicado, sujo=false, aGuardar=false;
  function marcarSujo(){ sujo=true; var b=el.querySelector('[data-gp=save]'); if(b) b.textContent='Guardar *'; if(op.sujo) op.sujo(true); }
  function desenhar(erro){
    el.innerHTML='<div class="gp-top"><div><h3>'+esc(P.disciplina.nome)+' · '+esc(P.turma.nome)+'</h3><div class="gp-sub">'+TRI[P.trimestre]+' · avaliação descritiva · '+P.estudantes.length+' crianças'+(P.actualizado_por?' · última gravação: '+esc(P.actualizado_por):'')+'</div></div>'+
      '<div class="gp-acts"><label class="gp-pub"><input type="checkbox" data-gp="pub"'+(pub?' checked':'')+'> Publicar às famílias</label><button class="btn" type="button" data-gp="print">Imprimir</button><button class="btn pri" type="button" data-gp="save">Guardar'+(sujo?' *':'')+'</button></div></div>'+
      (erro?'<div class="gp-err">'+esc(erro)+'</div>':'')+
      (P.estudantes.length? '<div class="gp-wrap"><table class="gp" style="width:100%"><thead><tr><th class="nm" style="max-width:none;position:static;white-space:normal">Crianças</th></tr></thead><tbody>'+
        P.estudantes.map(function(e,ri){ var l=G.notas[e.id]||{};
          return '<tr><td class="nm" style="max-width:none;min-width:0;position:static;white-space:normal"><div style="display:flex;align-items:center;gap:8px;justify-content:space-between;flex-wrap:wrap"><div style="min-width:0"><b>'+esc(e.nome)+'</b><small>'+esc(e.numero)+'</small></div>'+
            '<div style="white-space:nowrap">'+['A','E','N'].map(function(k){ return '<button type="button" class="btn sm" data-r="'+ri+'" data-n="'+k+'" title="'+NIV[k][0]+'" style="min-width:38px;margin:0 2px;'+(l.n===k?'background:var(--'+(NIV[k][1]==='ok'?'ok':NIV[k][1]==='warn'?'warn':'bad')+');border-color:transparent;color:#fff':'')+'">'+k+'</button>'; }).join('')+'</div></div>'+
            '<input data-o="'+ri+'" maxlength="400" value="'+esc(l.o||'')+'" placeholder="Observação (opcional)" style="display:block;width:100%;margin-top:8px;text-align:left;font:400 14px var(--f-body);height:34px;padding:0 8px;border:1px solid var(--line,#DDE3EC);border-radius:8px"></td></tr>'; }).join('')+'</tbody></table></div>' : '<div class="gp-err" style="background:var(--surface2,#EEF2F8);color:var(--muted)">Esta turma ainda não tem crianças matriculadas.</div>')+
      '<div class="gp-foot" data-gp="foot"></div><p class="gp-hint small muted" style="margin:10px 0 0">A = adquirido · E = em aquisição · N = não adquirido. A observação aparece às famílias no portal.</p>';
    rodape(); ligar();
  }
  function rodape(){ var c={A:0,E:0,N:0}, n=0; P.estudantes.forEach(function(e){ var l=G.notas[e.id]; if(l&&l.n){ c[l.n]++; n++; } }); var f=el.querySelector('[data-gp=foot]'); if(f) f.innerHTML='<span>Avaliadas: <b>'+n+'/'+P.estudantes.length+'</b></span><span>Adquirido: <b>'+c.A+'</b></span><span>Em aquisição: <b>'+c.E+'</b></span><span>Não adquirido: <b>'+c.N+'</b></span>'; }
  function ligar(){
    Array.prototype.forEach.call(el.querySelectorAll('[data-n]'),function(b){ b.onclick=function(){ var e=P.estudantes[+b.getAttribute('data-r')], l=G.notas[e.id]=G.notas[e.id]||{}, k=b.getAttribute('data-n'); l.n = l.n===k ? '' : k; if(!l.n) delete l.n; marcarSujo(); desenhar(); }; });
    Array.prototype.forEach.call(el.querySelectorAll('[data-o]'),function(i){ i.oninput=function(){ var e=P.estudantes[+i.getAttribute('data-o')], l=G.notas[e.id]=G.notas[e.id]||{}; l.o=i.value; marcarSujo(); }; });
    el.querySelector('[data-gp=pub]').onchange=function(){ pub=this.checked; marcarSujo(); };
    el.querySelector('[data-gp=print]').onclick=function(){ window.print(); };
    el.querySelector('[data-gp=save]').onclick=function(){ if(aGuardar) return; aGuardar=true; var b=this; b.disabled=true; b.textContent='A guardar…';
      op.guardar(G,pub).then(function(r){ aGuardar=false; if(!r||!r.ok){ desenhar((r&&r.erro)||'Não foi possível guardar.'); return; } G={modo:'descritiva',notas:(r.grelha&&r.grelha.notas)||{}}; pub=!!r.publicado; sujo=false; if(op.sujo) op.sujo(false); desenhar(); if(op.aviso) op.aviso(pub?'Avaliação guardada e publicada às famílias':'Avaliação guardada (ainda não publicada)'); }); };
  }
  desenhar();
  return { sujo:function(){ return sujo; } };
}

/* Ensino superior e técnico: pauta semestral (frequência, exame, recorrência) */
var SEM=['','1º semestre','2º semestre'];
var EST_SEM={sem:['Sem notas','muted'],dispensado:['Dispensado','ok'],excluido:['Excluído','bad'],admitido:['Admitido a exame','info'],aprovado:['Aprovado','ok'],recorrencia:['Vai à recorrência','warn'],reprovado:['Reprovado','bad']};
function mediasSem(cols, n, R){
  R=R||{}; var ap=R.aprovacao||10, disp=R.dispensa||14, adm=R.admissao||10, p=(R.peso_exame||50)/100;
  var fs=[]; cols.forEach(function(c){ if(c.tipo==='F' && typeof n[c.id]==='number') fs.push(n[c.id]); });
  var freq=fs.length? r1(fs.reduce(function(a,b){ return a+b; },0)/fs.length) : null;
  var ex=typeof n.ex==='number'?n.ex:null, rc=typeof n.rc==='number'?n.rc:null, o={freq:freq, exame:ex, recorrencia:rc, final:null, estado:'sem'};
  if(freq===null) return o;
  if(Math.round(freq)>=disp){ o.estado='dispensado'; o.final=freq; }
  else if(Math.round(freq)<adm){ o.estado='excluido'; o.final=freq; }
  else { var e=rc!==null?rc:ex; if(e===null) o.estado='admitido'; else { o.final=r1(freq*(1-p)+e*p); o.estado=Math.round(o.final)>=ap?'aprovado':(rc!==null?'reprovado':'recorrencia'); } }
  return o;
}
function montarSemestral(el, P, op){
  estilo(); op=op||{};
  var R=P.regras||{}, aprov=R.aprovacao||10;
  var G=JSON.parse(JSON.stringify(P.grelha||{})); G.modo='semestral'; G.notas=G.notas||{}; G.colunas=G.colunas||[];
  var pub=!!P.publicado, sujo=false, aGuardar=false;
  function F(){ return G.colunas.filter(function(c){ return c.tipo==='F'; }); }
  function todas(){ return F().concat([{id:'ex',tipo:'EX',nome:'Exame'},{id:'rc',tipo:'RC',nome:'Recorrência'}]); }
  function marcarSujo(v){ sujo=v; var b=el.querySelector('[data-gp=save]'); if(b) b.textContent='Guardar'+(sujo?' *':''); if(op.sujo) op.sujo(sujo); }
  function proxId(){ var n=1; while(G.colunas.some(function(c){ return c.id==='a'+n; })) n++; return 'a'+n; }
  function desenhar(erro){
    var cols=todas(), nF=F().length;
    el.innerHTML='<div class="gp-top"><div><h3>'+esc(P.disciplina.nome)+' · '+esc(P.turma.nome)+'</h3><div class="gp-sub">'+SEM[P.trimestre]+' · '+P.estudantes.length+' estudantes'+(P.disciplina.creditos?' · '+P.disciplina.creditos+' créditos':'')+(P.actualizado_por?' · última gravação: '+esc(P.actualizado_por):'')+'</div></div>'+
      '<div class="gp-acts"><button class="btn sm" type="button" data-gp="addf"'+(nF>=8?' disabled':'')+'>+ Teste/Trabalho</button>'+
      '<label class="gp-pub"><input type="checkbox" data-gp="pub"'+(pub?' checked':'')+'> Publicar aos estudantes</label><button class="btn" type="button" data-gp="print">Imprimir</button>'+
      '<button class="btn pri" type="button" data-gp="save">Guardar'+(sujo?' *':'')+'</button></div></div>'+
      (erro?'<div class="gp-err">'+esc(erro)+'</div>':'')+
      (P.estudantes.length? '<div class="gp-wrap"><table class="gp"><thead><tr><th class="nm">Estudante</th>'+
        cols.map(function(c,i){ return c.tipo==='F'?'<th class="col" data-col="'+i+'" title="Clique para mudar o nome ou tirar a coluna">'+esc(c.nome)+'</th>':'<th class="acp">'+esc(c.nome)+'</th>'; }).join('')+
        '<th>Freq.</th><th>Final</th><th>Situação</th></tr></thead><tbody>'+
        P.estudantes.map(function(e,ri){ var l=G.notas[e.id]||{};
          return '<tr data-e="'+esc(e.id)+'"><td class="nm"><b>'+esc(e.nome)+'</b><small>'+esc(e.numero)+'</small></td>'+
            cols.map(function(c,ci){ var v=l[c.id]; return '<td><input inputmode="decimal" maxlength="4" data-r="'+ri+'" data-c="'+ci+'" value="'+(typeof v==='number'?String(v).replace('.',','):'')+'"'+(typeof v==='number'&&v<aprov?' class="neg"':'')+' aria-label="'+esc(c.nome)+' de '+esc(e.nome)+'"></td>'; }).join('')+
            '<td class="calc" data-m="freq"></td><td class="calc mt" data-m="fin"></td><td data-m="sit"></td></tr>'; }).join('')+'</tbody></table></div>'
        : '<div class="gp-err" style="background:var(--surface2,#EEF2F8);color:var(--muted)">Esta turma ainda não tem estudantes inscritos.</div>')+
      '<div class="gp-foot" data-gp="foot"></div>'+
      '<p class="gp-hint small muted" style="margin:10px 0 0">Frequência = média dos testes e trabalhos. Com '+(R.dispensa||14)+' ou mais fica dispensado; abaixo de '+(R.admissao||10)+' fica excluído. Admitido: Final = '+(100-(R.peso_exame||50))+'% frequência + '+(R.peso_exame||50)+'% exame. A recorrência substitui o exame.</p>';
    P.estudantes.forEach(function(e){ linha(e.id); }); rodape(); ligar();
  }
  function linha(eid){
    var tr=el.querySelector('tr[data-e="'+String(eid).replace(/["\\]/g,'\\$&')+'"]'); if(!tr) return;
    var m=mediasSem(G.colunas, G.notas[eid]||{}, R), s=EST_SEM[m.estado]||EST_SEM.sem;
    tr.querySelector('[data-m=freq]').textContent=fmt(m.freq);
    var f=tr.querySelector('[data-m=fin]'); f.textContent=fmt(m.final); f.className='calc mt '+(m.final==null?'':(Math.round(m.final)>=aprov?'pos':'neg'));
    tr.querySelector('[data-m=sit]').innerHTML='<span class="pill '+s[1]+'">'+s[0]+'</span>';
    var exame=m.estado!=='dispensado' && m.estado!=='excluido' && m.freq!==null;
    Array.prototype.forEach.call(tr.querySelectorAll('input'),function(i){ var c=todas()[+i.getAttribute('data-c')]; if(c.tipo==='EX'||c.tipo==='RC'){ var vazio=i.value===''; i.style.opacity=(exame||!vazio)?'1':'.35'; } });
  }
  function rodape(){
    var f=el.querySelector('[data-gp=foot]'); if(!f) return; var c={}; P.estudantes.forEach(function(e){ var m=mediasSem(G.colunas,G.notas[e.id]||{},R); c[m.estado]=(c[m.estado]||0)+1; });
    f.innerHTML=['dispensado','admitido','aprovado','recorrencia','reprovado','excluido'].map(function(k){ return '<span>'+EST_SEM[k][0]+': <b>'+(c[k]||0)+'</b></span>'; }).join('');
  }
  function ligar(){
    Array.prototype.forEach.call(el.querySelectorAll('input[data-r]'),function(inp){
      inp.oninput=function(){ var ri=+inp.getAttribute('data-r'), c=todas()[+inp.getAttribute('data-c')], e=P.estudantes[ri], v=ler(inp.value);
        inp.classList.toggle('mau', isNaN(v)); inp.classList.toggle('neg', typeof v==='number' && !isNaN(v) && v<aprov);
        var l=G.notas[e.id]=G.notas[e.id]||{}; if(v===null||isNaN(v)) delete l[c.id]; else l[c.id]=v; linha(e.id); rodape(); marcarSujo(true); };
      inp.onkeydown=function(ev){ var ri=+inp.getAttribute('data-r'), ci=+inp.getAttribute('data-c'), alvo=null;
        if(ev.key==='Enter'||ev.key==='ArrowDown') alvo=[ri+1,ci]; else if(ev.key==='ArrowUp') alvo=[ri-1,ci]; if(!alvo) return; ev.preventDefault();
        var n=el.querySelector('input[data-r="'+alvo[0]+'"][data-c="'+alvo[1]+'"]'); if(n){ n.focus(); n.select(); } };
      inp.onfocus=function(){ inp.select(); };
    });
    Array.prototype.forEach.call(el.querySelectorAll('th[data-col]'),function(th){ th.onclick=function(){ var c=todas()[+th.getAttribute('data-col')]; if(!c||c.tipo!=='F') return;
      var tem=P.estudantes.some(function(e){ return typeof (G.notas[e.id]||{})[c.id]==='number'; });
      var nome=window.prompt('Nome da avaliação (ex.: Teste 1, Trabalho, Mini-teste).\nEscreva APAGAR para tirar a coluna'+(tem?' e as notas dela':'')+'.', c.nome);
      if(nome==null) return; nome=nome.trim();
      if(nome.toUpperCase()==='APAGAR'){ if(F().length===1){ if(op.aviso) op.aviso('A pauta precisa de pelo menos um teste ou trabalho.'); return; }
        G.colunas=G.colunas.filter(function(x){ return x.id!==c.id; }); Object.keys(G.notas).forEach(function(k){ delete G.notas[k][c.id]; }); marcarSujo(true); desenhar(); return; }
      if(nome){ c.nome=nome.slice(0,16); marcarSujo(true); desenhar(); } }; });
    var a=el.querySelector('[data-gp=addf]'); if(a) a.onclick=function(){ G.colunas=F().concat([{id:proxId(),tipo:'F',nome:'Avaliação '+(F().length+1)}]); marcarSujo(true); desenhar(); };
    el.querySelector('[data-gp=pub]').onchange=function(){ pub=this.checked; marcarSujo(true); };
    el.querySelector('[data-gp=print]').onclick=function(){ window.print(); };
    el.querySelector('[data-gp=save]').onclick=function(){ if(aGuardar) return;
      if(el.querySelector('input.mau')){ desenhar('Há notas inválidas (a vermelho). As notas vão de 0 a 20.'); return; }
      var b=this; aGuardar=true; b.disabled=true; b.textContent='A guardar…';
      G.colunas=todas();
      op.guardar(G,pub).then(function(r){ aGuardar=false;
        if(!r||!r.ok){ b.disabled=false; G.colunas=F(); desenhar((r&&r.erro)||'Não foi possível guardar.'); return; }
        G=JSON.parse(JSON.stringify(r.grelha)); G.notas=G.notas||{}; G.colunas=(G.colunas||[]).filter(function(c){ return c.tipo==='F'; }); pub=!!r.publicado; P.publicado=pub;
        marcarSujo(false); desenhar(); if(op.aviso) op.aviso(pub?'Pauta guardada e publicada aos estudantes':'Pauta guardada (ainda não publicada)'); }); };
  }
  G.colunas=F();
  desenhar();
  return { sujo:function(){ return sujo; } };
}

function montar(el, P, op){
  if(P.modo==='descritiva' || (P.grelha && P.grelha.modo==='descritiva')) return montarDescritiva(el, P, op);
  if(P.modo==='semestral' || (P.grelha && P.grelha.modo==='semestral')) return montarSemestral(el, P, op);
  estilo(); op=op||{};
  var aprov = (P.regras && P.regras.aprovacao) || 10;
  var G = JSON.parse(JSON.stringify(P.grelha||{colunas:[],notas:{}}));
  G.notas = G.notas || {};
  var pub = !!P.publicado, sujo=false, aGuardar=false;
  function marcarSujo(v){ sujo=v; var b=el.querySelector('[data-gp=save]'); if(b) b.textContent = 'Guardar'+(sujo?' *':''); if(op.sujo) op.sujo(sujo); }
  function proxId(){ var n=1; while(G.colunas.some(function(c){ return c.id==='acs'+n; })) n++; return 'acs'+n; }
  function ordenar(){ G.colunas.sort(function(a,b){ return (a.tipo==='ACP')-(b.tipo==='ACP'); }); }

  function desenhar(erro){
    ordenar();
    var cols=G.colunas;
    el.innerHTML =
      '<div class="gp-top"><div><h3>'+esc(P.disciplina.nome)+' · '+esc(P.turma.nome)+'</h3><div class="gp-sub">'+TRI[P.trimestre]+' · '+P.estudantes.length+' estudantes'+(P.actualizado_por?' · última gravação: '+esc(P.actualizado_por):'')+'</div></div>'+
      '<div class="gp-acts"><button class="btn sm" type="button" data-gp="addacs"'+(cols.length>=10?' disabled':'')+'>+ ACS</button>'+
      (cols.some(function(c){ return c.tipo==='ACP'; })?'':'<button class="btn sm" type="button" data-gp="addacp">+ ACP</button>')+
      '<label class="gp-pub"><input type="checkbox" data-gp="pub"'+(pub?' checked':'')+'> Publicar às famílias</label>'+
      '<button class="btn" type="button" data-gp="print">Imprimir</button>'+
      '<button class="btn pri" type="button" data-gp="save">Guardar'+(sujo?' *':'')+'</button></div></div>'+
      (erro?'<div class="gp-err">'+esc(erro)+'</div>':'')+
      (P.estudantes.length ? '<div class="gp-wrap"><table class="gp"><thead><tr><th class="nm">Estudante</th>'+
        cols.map(function(c,i){ return '<th class="col'+(c.tipo==='ACP'?' acp':'')+'" data-col="'+i+'" title="Clique para mudar o nome ou tirar a coluna">'+esc(c.nome)+'</th>'; }).join('')+
        '<th>MACS</th><th>MT</th><th>Situação</th></tr></thead><tbody>'+
        P.estudantes.map(function(e,ri){ var l=G.notas[e.id]||{};
          return '<tr data-e="'+esc(e.id)+'"><td class="nm"><b>'+esc(e.nome)+'</b><small>'+esc(e.numero)+'</small></td>'+
            cols.map(function(c,ci){ var v=l[c.id]; return '<td><input inputmode="decimal" maxlength="4" data-r="'+ri+'" data-c="'+ci+'" value="'+(typeof v==='number'?String(v).replace('.',','):'')+'"'+(typeof v==='number'&&v<aprov?' class="neg"':'')+' aria-label="'+esc(c.nome)+' de '+esc(e.nome)+'"></td>'; }).join('')+
            '<td class="calc" data-m="macs"></td><td class="calc mt" data-m="mt"></td><td data-m="sit"></td></tr>'; }).join('')+
        '</tbody></table></div>' : '<div class="gp-err" style="background:var(--surface2,#EEF2F8);color:var(--muted)">Esta turma ainda não tem estudantes matriculados.</div>')+
      '<div class="gp-foot" data-gp="foot"></div>'+
      '<p class="gp-hint small muted" style="margin:10px 0 0">Notas de 0 a 20 (pode usar vírgula: 12,5). Enter ou ↓ passa ao estudante seguinte. MT = (2 × MACS + ACP) ÷ 3.</p>';
    P.estudantes.forEach(function(e){ linha(e.id); });
    rodape();
    ligar();
  }
  function linha(eid){
    var tr=el.querySelector('tr[data-e="'+cssId(eid)+'"]'); if(!tr) return;
    var m=medias(G.colunas, G.notas[eid]||{});
    tr.querySelector('[data-m=macs]').textContent=fmt(m.macs);
    var mt=tr.querySelector('[data-m=mt]'); mt.textContent=fmt(m.mt); mt.className='calc mt '+(m.mt==null?'':(Math.round(m.mt)>=aprov?'pos':'neg'));
    tr.querySelector('[data-m=sit]').innerHTML = m.mt==null ? '<span class="pill muted">Sem notas</span>' : !m.completa ? '<span class="pill warn">Parcial</span>' : Math.round(m.mt)>=aprov ? '<span class="pill ok">Positiva</span>' : '<span class="pill bad">Negativa</span>';
  }
  function cssId(s){ return String(s).replace(/["\\]/g,'\\$&'); }
  function rodape(){
    var f=el.querySelector('[data-gp=foot]'); if(!f) return;
    var mts=[], com=0; P.estudantes.forEach(function(e){ var m=medias(G.colunas,G.notas[e.id]||{}); if(m.mt!=null){ mts.push(m.mt); com++; } });
    var pos=mts.filter(function(x){ return Math.round(x)>=aprov; }).length;
    f.innerHTML='<span>Com notas: <b>'+com+'/'+P.estudantes.length+'</b></span><span>Média da turma: <b>'+(mts.length?fmt(mts.reduce(function(a,b){return a+b;},0)/mts.length):'—')+'</b></span><span>Positivas: <b>'+pos+'</b></span><span>Negativas: <b>'+(mts.length-pos)+'</b></span>'+(mts.length?'<span>Aproveitamento: <b>'+Math.round(pos*100/mts.length)+'%</b></span>':'');
  }
  function ligar(){
    Array.prototype.forEach.call(el.querySelectorAll('input[data-r]'),function(inp){
      inp.oninput=function(){
        var ri=+inp.getAttribute('data-r'), ci=+inp.getAttribute('data-c'), e=P.estudantes[ri], c=G.colunas[ci], v=ler(inp.value);
        inp.classList.toggle('mau', isNaN(v)); inp.classList.toggle('neg', typeof v==='number' && !isNaN(v) && v<aprov);
        var l=G.notas[e.id]=G.notas[e.id]||{};
        if(v===null || isNaN(v)) delete l[c.id]; else l[c.id]=v;
        linha(e.id); rodape(); marcarSujo(true);
      };
      inp.onkeydown=function(ev){
        var ri=+inp.getAttribute('data-r'), ci=+inp.getAttribute('data-c'), alvo=null;
        if(ev.key==='Enter'||ev.key==='ArrowDown') alvo=[ri+1,ci]; else if(ev.key==='ArrowUp') alvo=[ri-1,ci];
        if(!alvo) return; ev.preventDefault();
        var n=el.querySelector('input[data-r="'+alvo[0]+'"][data-c="'+alvo[1]+'"]'); if(n){ n.focus(); n.select(); }
      };
      inp.onfocus=function(){ inp.select(); };
    });
    Array.prototype.forEach.call(el.querySelectorAll('th[data-col]'),function(th){ th.onclick=function(){ coluna(+th.getAttribute('data-col')); }; });
    var a=el.querySelector('[data-gp=addacs]'); if(a) a.onclick=function(){ var id=proxId(); G.colunas.push({id:id,tipo:'ACS',nome:'ACS '+id.slice(3)}); marcarSujo(true); desenhar(); };
    var p=el.querySelector('[data-gp=addacp]'); if(p) p.onclick=function(){ G.colunas.push({id:'acp',tipo:'ACP',nome:'ACP'}); marcarSujo(true); desenhar(); };
    el.querySelector('[data-gp=pub]').onchange=function(){ pub=this.checked; marcarSujo(true); };
    el.querySelector('[data-gp=print]').onclick=function(){ window.print(); };
    el.querySelector('[data-gp=save]').onclick=guardar;
  }
  function coluna(i){
    var c=G.colunas[i]; if(!c) return;
    var tem=P.estudantes.some(function(e){ return typeof (G.notas[e.id]||{})[c.id]==='number'; });
    var nome=window.prompt('Nome da coluna (ex.: ACS 1, Teste, Trabalho).\nEscreva APAGAR para tirar a coluna'+(tem?' e as notas dela':'')+'.', c.nome);
    if(nome==null) return; nome=nome.trim();
    if(nome.toUpperCase()==='APAGAR'){
      if(G.colunas.length===1){ if(op.aviso) op.aviso('A pauta precisa de pelo menos uma coluna.'); return; }
      G.colunas.splice(i,1); Object.keys(G.notas).forEach(function(k){ delete G.notas[k][c.id]; }); marcarSujo(true); desenhar(); return;
    }
    if(nome){ c.nome=nome.slice(0,16); marcarSujo(true); desenhar(); }
  }
  function guardar(){
    if(aGuardar) return;
    if(el.querySelector('input.mau')){ desenhar('Há notas inválidas (a vermelho). As notas vão de 0 a 20.'); return; }
    var b=el.querySelector('[data-gp=save]'); aGuardar=true; b.disabled=true; b.textContent='A guardar…';
    op.guardar(G, pub).then(function(r){
      aGuardar=false;
      if(!r || !r.ok){ b.disabled=false; desenhar((r&&r.erro)||'Não foi possível guardar.'); return; }
      G=JSON.parse(JSON.stringify(r.grelha)); G.notas=G.notas||{}; pub=!!r.publicado; P.publicado=pub;
      marcarSujo(false); desenhar();
      if(op.aviso) op.aviso(pub ? 'Notas guardadas e publicadas às famílias' : 'Notas guardadas (ainda não publicadas)');
    });
  }
  desenhar();
  return { sujo:function(){ return sujo; } };
}
window.GSPauta = { montar:montar, medias:medias, mediasSem:mediasSem, fmt:fmt, TRI:TRI, SEM:SEM, NIV:NIV, EST_SEM:EST_SEM };
})();
