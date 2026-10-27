/* Gescolar · folha de chamada (usada em professor.html e direccao.html) — v5.23
   GSChamada.montar(elemento, chamada, { guardar: function(marcas, sumario, sms){ return Promise<{ok, erro, faltas, atrasos, sms}> }, podeJustificar: bool, hoje: 'AAAA-MM-DD', aviso: fn, depois: fn })
   chamada = { turma:{nome}, disciplina:{nome,cor}, data, i, f, estudantes:[{id,nome,numero}], marcas:{estId:'F'|'A'|'J'}, sumario, feita, feita_por }
   O servidor continua a receber o mesmo: sem marca = presente · F = falta · A = atraso · J = falta justificada (só a Direcção).
   Na interface, numa chamada nova cada estudante começa «por marcar» (U): nada é dado como presente sem o professor ver.
   Antes de guardar aparece um resumo com quem faltou e quem chegou atrasado, para corrigir antes de confirmar. */
(function(){
'use strict';
var CSS = '' +
'.gc{--gc-p:var(--ok,#168A52);--gc-f:var(--bad,#C0392B);--gc-a:var(--warn,#B7791F);--gc-j:var(--blue,#0A64DC)}' +
'.gc-cab{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:12px}' +
'.gc-cab h3{margin:0;font-size:18px;line-height:1.25}' +
'.gc-info{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}' +
'.gc-info span{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;background:var(--surface2,#EEF2F8);border-radius:99px;padding:4px 11px;color:var(--ink)}' +
'.gc-info span.ok{background:var(--ok-soft,#E3F4EA);color:var(--gc-p)}.gc-info span.por{background:var(--warn-soft,#FFF4D6);color:var(--gc-a)}' +
'.gc-acc{display:flex;gap:8px;flex-wrap:wrap}' +
'.gc-cont{display:grid;grid-template-columns:repeat(auto-fit,minmax(72px,1fr));gap:8px;margin-bottom:10px}' +
'.gc-cont button{border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:9px 12px;text-align:left;cursor:pointer;font:inherit;color:var(--ink)}' +
'.gc-cont button b{display:block;font-size:22px;line-height:1.1;font-family:var(--f-display,inherit)}' +
'.gc-cont button small{font-size:12.5px;font-weight:700;color:var(--muted)}' +
'.gc-cont button.on{box-shadow:0 0 0 2px var(--ink) inset}' +
'.gc-cont .U b{color:var(--gc-a)}.gc-cont .P b{color:var(--gc-p)}.gc-cont .F b{color:var(--gc-f)}.gc-cont .A b{color:var(--gc-a)}.gc-cont .J b{color:var(--gc-j)}' +
'.gc-lista{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--surface)}' +
'.gc-it{display:flex;align-items:center;gap:12px;padding:10px 12px;border-bottom:1px solid var(--line);border-left:5px solid transparent}' +
'.gc-it:last-child{border-bottom:0}.gc-it[hidden]{display:none}' +
'.gc-it.U{border-left-color:#D3DBE6}.gc-it.P{border-left-color:var(--gc-p)}.gc-it.F{border-left-color:var(--gc-f);background:var(--bad-soft,#FDECEA)}.gc-it.A{border-left-color:var(--gc-a);background:var(--warn-soft,#FFF7E0)}.gc-it.J{border-left-color:var(--gc-j);background:var(--blue-soft,#E8F0FE)}' +
'.gc-av{width:38px;height:38px;flex:none;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:13px;color:#fff;background:#8A9BB3}' +
'.gc-it.P .gc-av{background:var(--gc-p)}.gc-it.F .gc-av{background:var(--gc-f)}.gc-it.A .gc-av{background:var(--gc-a)}.gc-it.J .gc-av{background:var(--gc-j)}' +
'.gc-nm{flex:1;min-width:0}' +
'.gc-nm b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
'.gc-nm small{display:block;font-size:12px;color:var(--muted)}' +
'.gc-nm small i{font-style:normal;font-weight:800}' +
'.gc-it.U .gc-nm small i{color:var(--gc-a)}.gc-it.P .gc-nm small i{color:var(--gc-p)}.gc-it.F .gc-nm small i{color:var(--gc-f)}.gc-it.A .gc-nm small i{color:var(--gc-a)}.gc-it.J .gc-nm small i{color:var(--gc-j)}' +
'.gc-bts{display:flex;gap:6px;flex:none}' +
'.gc-bts button{display:inline-flex;align-items:center;gap:6px;height:42px;min-width:44px;padding:0 12px;border:1.5px solid var(--line);border-radius:10px;background:var(--surface);color:var(--muted);font:700 14px var(--f-body,inherit);cursor:pointer}' +
'.gc-bts button svg{width:18px;height:18px;flex:none}' +
'.gc-bts button.P:hover{border-color:var(--gc-p);color:var(--gc-p)}.gc-bts button.F:hover{border-color:var(--gc-f);color:var(--gc-f)}.gc-bts button.A:hover{border-color:var(--gc-a);color:var(--gc-a)}.gc-bts button.J:hover{border-color:var(--gc-j);color:var(--gc-j)}' +
'.gc-bts button.on.P{background:var(--gc-p);border-color:var(--gc-p);color:#fff}.gc-bts button.on.F{background:var(--gc-f);border-color:var(--gc-f);color:#fff}.gc-bts button.on.A{background:var(--gc-a);border-color:var(--gc-a);color:#fff}.gc-bts button.on.J{background:var(--gc-j);border-color:var(--gc-j);color:#fff}' +
'.gc-vazio{padding:18px;text-align:center;color:var(--muted);font-size:14px}' +
'.gc-err{background:var(--bad-soft,#FDECEA);color:var(--bad,#C0392B);border-radius:10px;padding:10px 12px;font-size:14px;font-weight:600;margin-bottom:10px}' +
'.gc-baixo{display:flex;flex-direction:column;gap:10px;margin-top:14px}' +
'.gc-baixo textarea{width:100%;min-height:70px;border:1px solid var(--line);border-radius:10px;padding:10px;font:400 15px var(--f-body,inherit);background:var(--surface);color:var(--ink);resize:vertical;box-sizing:border-box}' +
'.gc-baixo label.chk{display:flex;gap:8px;align-items:flex-start;font-size:14px;font-weight:600;color:var(--ink)}' +
'.gc-barra{position:sticky;bottom:0;z-index:5;margin-top:12px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;box-shadow:0 -6px 20px rgba(11,42,74,.08)}' +
'.gc-barra .gc-res{font-size:13.5px;font-weight:700;color:var(--ink)}.gc-barra .gc-res em{font-style:normal;color:var(--gc-a)}' +
'.gc-barra .btn.pri{height:46px;justify-content:center;font-size:15px;min-width:180px}' +
'.gc-conf{border:2px solid var(--ink);border-radius:14px;padding:14px 16px;margin-top:12px;background:var(--surface)}' +
'.gc-conf h4{margin:0 0 8px;font-size:16px}' +
'.gc-conf ul{margin:0 0 10px;padding-left:18px;font-size:14px;line-height:1.5}' +
'.gc-conf .lin{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}' +
'.gc-conf .lin .btn{height:44px}' +
'@media (max-width:640px){.gc-cont button{padding:7px 9px}.gc-cont button b{font-size:19px}.gc-cont button small{font-size:11.5px}.gc-bts button span{display:none}.gc-bts button{padding:0;width:44px;justify-content:center}.gc-it{gap:9px;padding:9px 10px}.gc-av{width:32px;height:32px;font-size:12px}.gc-barra .btn.pri{width:100%}}';
var ICO = {
  P:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
  F:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  A:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  J:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></svg>'
};
var NOMES = { U:'Por marcar', P:'Presente', F:'Falta', A:'Atraso', J:'Justificada' };
var PLURAL = { U:'por marcar', P:'presentes', F:'faltas', A:'atrasos', J:'justificadas' };
function estilo(){ if(document.getElementById('gc-css')) return; var s=document.createElement('style'); s.id='gc-css'; s.textContent=CSS; document.head.appendChild(s); }
function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function iniciais(n){ var p=String(n||'?').trim().split(/\s+/); return ((p[0]||'?').charAt(0)+(p.length>1?p[p.length-1].charAt(0):'')).toUpperCase(); }
var DIAS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
function dataLonga(d){ var x=new Date(d+'T12:00:00Z'); return DIAS[x.getUTCDay()]+', '+d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4); }

function montar(el, C, op){
  estilo(); op=op||{};
  var M = {};   // estado na interface: U | P | F | A | J
  C.estudantes.forEach(function(e){ var m=(C.marcas||{})[e.id]; M[e.id] = m || (C.feita ? 'P' : 'U'); });
  var sumario=C.sumario||'', sujo=false, aGuardar=false, filtro='', confirmar=false, erroMsg='';
  var tipos = op.podeJustificar ? ['P','F','A','J'] : ['P','F','A'];
  var ehHoje = C.data===op.hoje;
  function conta(){ var c={U:0,P:0,F:0,A:0,J:0}; C.estudantes.forEach(function(e){ c[M[e.id]]++; }); return c; }
  function marcasServidor(){ var r={}; Object.keys(M).forEach(function(k){ if(M[k]==='F'||M[k]==='A'||M[k]==='J') r[k]=M[k]; }); return r; }
  function nomeDe(id){ var e=C.estudantes.filter(function(x){ return x.id===id; })[0]; return e?e.nome:''; }
  function linha(e){
    var t=M[e.id];
    return '<div class="gc-it '+t+'" data-e="'+esc(e.id)+'"'+(filtro&&filtro!==t?' hidden':'')+'><span class="gc-av">'+esc(iniciais(e.nome))+'</span>'+
      '<div class="gc-nm"><b>'+esc(e.nome)+'</b><small>'+(e.numero?'Nº '+esc(e.numero)+' · ':'')+'<i>'+NOMES[t]+'</i></small></div>'+
      '<div class="gc-bts">'+tipos.map(function(k){ return '<button type="button" class="'+k+(t===k?' on':'')+'" data-t="'+k+'" aria-pressed="'+(t===k)+'" title="'+NOMES[k]+'" aria-label="'+NOMES[k]+' · '+esc(e.nome)+'">'+ICO[k]+'<span>'+NOMES[k]+'</span></button>'; }).join('')+'</div></div>';
  }
  function desenhar(){
    var c=conta();
    el.innerHTML='<div class="gc">'+
      '<div class="gc-cab"><div><h3>'+esc(C.disciplina.nome)+' · '+esc(C.turma.nome)+'</h3>'+
        '<div class="gc-info"><span>📅 '+esc(dataLonga(C.data))+'</span><span>🕒 '+(C.i?esc(C.i)+'–'+esc(C.f):'Dia inteiro')+'</span>'+
        (C.feita?'<span class="ok">✓ Chamada feita'+(C.feita_por?' por '+esc(C.feita_por):'')+'</span>':'<span class="por">Chamada por fazer</span>')+'</div></div>'+
        '<div class="gc-acc">'+(c.U?'<button class="btn sm" type="button" data-gc="restantes">Marcar os '+c.U+' restantes como presentes</button>':'')+
        '<button class="btn sm" type="button" data-gc="todos">Todos presentes</button></div></div>'+
      (erroMsg?'<div class="gc-err">'+esc(erroMsg)+'</div>':'')+
      '<div class="gc-cont">'+['U','P','F','A'].concat(op.podeJustificar||c.J?['J']:[]).filter(function(k){ return k!=='U'||c.U||filtro==='U'; }).map(function(k){
        return '<button type="button" class="'+k+(filtro===k?' on':'')+'" data-f="'+k+'" title="Mostrar só '+PLURAL[k]+'"><b>'+c[k]+'</b><small>'+PLURAL[k]+'</small></button>'; }).join('')+'</div>'+
      (filtro?'<p class="small muted" style="margin:-2px 2px 8px">A mostrar só: '+PLURAL[filtro]+' · <a href="#" data-gc="tf">ver todos</a></p>':'')+
      (C.estudantes.length? '<div class="gc-lista">'+C.estudantes.map(linha).join('')+'</div>' : '<div class="gc-lista"><div class="gc-vazio">Esta turma ainda não tem estudantes.</div></div>')+
      '<div class="gc-baixo"><label style="font-size:13px;font-weight:600;color:var(--muted)">Sumário da aula (opcional)<textarea data-gc="sum" maxlength="1000" placeholder="Ex.: Equações do 2º grau. Exercícios 1 a 5 da página 42.">'+esc(sumario)+'</textarea></label>'+
        (ehHoje?'<label class="chk"><input type="checkbox" data-gc="sms" checked style="margin-top:3px"><span>Avisar por SMS os encarregados dos que faltaram<br><span class="small muted" style="font-weight:400">Cada encarregado recebe um SMS só uma vez por aula.</span></span></label>':'')+
        (op.podeJustificar?'':'<p class="small muted" style="margin:0">As faltas justificadas são marcadas pela Direcção.</p>')+'</div>'+
      (confirmar?resumoHTML(c):'<div class="gc-barra"><span class="gc-res">'+(c.P+c.A)+' presentes · '+c.F+' faltas · '+c.A+' atrasos'+(c.U?' · <em>'+c.U+' por marcar</em>':'')+'</span>'+
        '<button class="btn pri" type="button" data-gc="rever">'+(C.feita?'Guardar alterações':'Guardar chamada')+(sujo?' *':'')+'</button></div>')+
      '</div>';
    ligar();
  }
  function lista(t){ return C.estudantes.filter(function(e){ return M[e.id]===t; }).map(function(e){ return esc(e.nome); }); }
  function resumoHTML(c){
    var f=lista('F'), a=lista('A'), j=lista('J');
    return '<div class="gc-conf"><h4>Confirme a chamada de '+esc(C.turma.nome)+' · '+esc(dataLonga(C.data))+'</h4><ul>'+
      '<li><b style="color:var(--gc-p)">'+(c.P+c.A)+' presentes</b> de '+C.estudantes.length+'</li>'+
      '<li><b style="color:var(--gc-f)">'+c.F+' falta'+(c.F===1?'':'s')+'</b>'+(f.length?': '+f.join(', '):'')+'</li>'+
      '<li><b style="color:var(--gc-a)">'+c.A+' atraso'+(c.A===1?'':'s')+'</b>'+(a.length?': '+a.join(', '):'')+'</li>'+
      (j.length?'<li><b style="color:var(--gc-j)">'+c.J+' justificada'+(c.J===1?'':'s')+'</b>: '+j.join(', ')+'</li>':'')+
      '</ul><div class="lin"><button class="btn" type="button" data-gc="corrigir">Corrigir</button><button class="btn pri" type="button" data-gc="save">Confirmar e guardar</button></div></div>';
  }
  function ligar(){
    Array.prototype.forEach.call(el.querySelectorAll('.gc-it'),function(row){
      var id=row.getAttribute('data-e');
      Array.prototype.forEach.call(row.querySelectorAll('[data-t]'),function(b){ b.onclick=function(){
        M[id]=b.getAttribute('data-t'); sujo=true; confirmar=false; erroMsg='';
        if(filtro==='U' && !conta().U) filtro='';
        var y=window.scrollY; desenhar(); window.scrollTo(0,y);
      }; });
    });
    Array.prototype.forEach.call(el.querySelectorAll('[data-f]'),function(b){ b.onclick=function(){ var k=b.getAttribute('data-f'); filtro=filtro===k?'':k; desenhar(); }; });
    var tf=el.querySelector('[data-gc=tf]'); if(tf) tf.onclick=function(ev){ ev.preventDefault(); filtro=''; desenhar(); };
    var td=el.querySelector('[data-gc=todos]'); if(td) td.onclick=function(){
      var n=C.estudantes.filter(function(e){ return M[e.id]==='F'||M[e.id]==='A'; }).length;
      if(n && !confirm('Marcar todos como presentes? Perde '+n+' falta(s)/atraso(s) já marcados.')) return;
      C.estudantes.forEach(function(e){ if(M[e.id]!=='J') M[e.id]='P'; }); sujo=true; confirmar=false; desenhar(); };
    var rs=el.querySelector('[data-gc=restantes]'); if(rs) rs.onclick=function(){ C.estudantes.forEach(function(e){ if(M[e.id]==='U') M[e.id]='P'; }); sujo=true; erroMsg=''; if(filtro==='U') filtro=''; desenhar(); };
    el.querySelector('[data-gc=sum]').oninput=function(){ sumario=this.value; sujo=true; };
    var rv=el.querySelector('[data-gc=rever]'); if(rv) rv.onclick=function(){
      var c=conta();
      if(c.U){ erroMsg='Ainda há '+c.U+' estudante(s) por marcar. Marque-os ou use «Marcar os restantes como presentes».'; filtro='U'; desenhar(); el.scrollIntoView({behavior:'smooth',block:'start'}); return; }
      confirmar=true; erroMsg=''; desenhar(); var cf=el.querySelector('.gc-conf'); if(cf) cf.scrollIntoView({behavior:'smooth',block:'center'}); };
    var co=el.querySelector('[data-gc=corrigir]'); if(co) co.onclick=function(){ confirmar=false; desenhar(); };
    var sv=el.querySelector('[data-gc=save]'); if(sv) sv.onclick=guardar;
  }
  function guardar(){
    if(aGuardar) return; aGuardar=true;
    var b=el.querySelector('[data-gc=save]'); b.disabled=true; b.textContent='A guardar…';
    var sms=el.querySelector('[data-gc=sms]');
    op.guardar(marcasServidor(), sumario, !!(sms&&sms.checked)).then(function(r){
      aGuardar=false;
      if(!r||!r.ok){ confirmar=false; erroMsg=(r&&r.erro)||'Não foi possível guardar.'; desenhar(); return; }
      C.feita=true; sujo=false; confirmar=false; erroMsg=''; desenhar();
      if(op.aviso) op.aviso('Chamada guardada · '+r.faltas+' falta(s), '+r.atrasos+' atraso(s)'+(r.sms?' · '+r.sms+' SMS enviado(s)':''));
      if(op.depois) op.depois(r);
    }, function(){ aGuardar=false; confirmar=false; erroMsg='Sem ligação. Tente de novo.'; desenhar(); });
  }
  desenhar();
  return { sujo:function(){ return sujo; } };
}
window.GSChamada = { montar:montar, dataLonga:dataLonga };
})();
