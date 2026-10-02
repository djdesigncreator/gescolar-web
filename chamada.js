/* Gescolar · folha de chamada (usada em professor.html e direccao.html)
   GSChamada.montar(elemento, chamada, { guardar: function(marcas, sumario, sms){ return Promise<{ok, erro, faltas, atrasos, sms}> }, podeJustificar: bool, hoje: 'AAAA-MM-DD', aviso: fn })
   chamada = { turma:{nome}, disciplina:{nome,cor}, data, i, f, estudantes:[{id,nome,numero}], marcas:{estId:'F'|'A'|'J'}, sumario, feita, feita_por }
   Sem marca = presente. F = falta · A = atraso · J = falta justificada (só a Direcção) */
(function(){
'use strict';
var CSS = '' +
'.gc-top{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start;margin-bottom:12px}' +
'.gc-top h3{margin:0;font-size:18px}' +
'.gc-top .gc-sub{color:var(--muted);font-size:13px;margin-top:2px}' +
'.gc-cont{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}' +
'.gc-cont span{font-size:13px;font-weight:700;border-radius:99px;padding:4px 12px;background:var(--surface2,#EEF2F8)}' +
'.gc-cont .p{background:var(--ok-soft);color:var(--ok)}.gc-cont .f{background:var(--bad-soft);color:var(--bad)}.gc-cont .a{background:var(--warn-soft);color:var(--warn)}.gc-cont .j{background:var(--blue-soft);color:var(--blue)}' +
'.gc-lista{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--surface)}' +
'.gc-it{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line)}' +
'.gc-it:last-child{border-bottom:0}' +
'.gc-it .nm{flex:1;min-width:0}' +
'.gc-it .nm b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
'.gc-it .nm small{color:var(--muted);font-family:var(--f-mono);font-size:11.5px}' +
'.gc-it.F{background:var(--bad-soft)}.gc-it.A{background:var(--warn-soft)}.gc-it.J{background:var(--blue-soft)}' +
'.gc-seg{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;flex:none;background:var(--surface)}' +
'.gc-seg button{border:0;background:none;min-width:42px;height:40px;font:800 14px var(--f-body);color:var(--muted);cursor:pointer;border-right:1px solid var(--line)}' +
'.gc-seg button:last-child{border-right:0}' +
'.gc-seg button.on.P{background:var(--ok);color:#fff}.gc-seg button.on.F{background:var(--bad);color:#fff}.gc-seg button.on.A{background:var(--warn,#B7791F);color:#fff}.gc-seg button.on.J{background:var(--blue);color:#fff}' +
'.gc-err{background:var(--bad-soft);color:var(--bad);border-radius:8px;padding:10px 12px;font-size:14px;font-weight:600;margin-bottom:10px}' +
'.gc-baixo{display:flex;flex-direction:column;gap:10px;margin-top:14px}' +
'.gc-baixo textarea{width:100%;min-height:70px;border:1px solid var(--line);border-radius:9px;padding:10px;font:400 15px var(--f-body);background:var(--surface);color:var(--ink);resize:vertical;box-sizing:border-box}' +
'.gc-baixo label.chk{display:flex;gap:8px;align-items:flex-start;font-size:14px;font-weight:600;color:var(--ink)}' +
'.gc-baixo .btn.pri{height:46px;justify-content:center;font-size:15px}';
function estilo(){ if(document.getElementById('gc-css')) return; var s=document.createElement('style'); s.id='gc-css'; s.textContent=CSS; document.head.appendChild(s); }
function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
var DIAS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
function dataLonga(d){ var x=new Date(d+'T12:00:00Z'); return DIAS[x.getUTCDay()]+', '+d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4); }

function montar(el, C, op){
  estilo(); op=op||{};
  var M = JSON.parse(JSON.stringify(C.marcas||{})), sumario=C.sumario||'', sujo=false, aGuardar=false;
  var tipos = op.podeJustificar ? ['P','F','A','J'] : ['P','F','A'];
  var nomes = {P:'Presente',F:'Falta',A:'Atraso',J:'Justificada'};
  var ehHoje = C.data===op.hoje;
  function marcarSujo(){ sujo=true; var b=el.querySelector('[data-gc=save]'); if(b) b.textContent=(C.feita?'Guardar alterações':'Guardar chamada')+' *'; }
  function contagem(){
    var c={P:0,F:0,A:0,J:0}; C.estudantes.forEach(function(e){ c[M[e.id]||'P']++; });
    var box=el.querySelector('[data-gc=cont]'); if(box) box.innerHTML='<span class="p">'+(c.P+c.A)+' presentes</span><span class="f">'+c.F+' faltas</span><span class="a">'+c.A+' atrasos</span>'+(c.J||op.podeJustificar?'<span class="j">'+c.J+' justificadas</span>':'');
  }
  function desenhar(erro){
    el.innerHTML='<div class="gc-top"><div><h3>'+esc(C.disciplina.nome)+' · '+esc(C.turma.nome)+'</h3><div class="gc-sub">'+dataLonga(C.data)+(C.i?' · '+esc(C.i)+'–'+esc(C.f):' · dia inteiro')+(C.feita?' · chamada feita'+(C.feita_por?' por '+esc(C.feita_por):''):' · chamada por fazer')+'</div></div>'+
      '<button class="btn sm" type="button" data-gc="todos">Todos presentes</button></div>'+
      (erro?'<div class="gc-err">'+esc(erro)+'</div>':'')+
      '<div class="gc-cont" data-gc="cont"></div>'+
      (C.estudantes.length? '<div class="gc-lista">'+C.estudantes.map(function(e){ var t=M[e.id]||'P';
        return '<div class="gc-it '+t+'" data-e="'+esc(e.id)+'"><div class="nm"><b>'+esc(e.nome)+'</b><small>'+esc(e.numero)+'</small></div><div class="gc-seg">'+
          tipos.map(function(k){ return '<button type="button" class="'+k+(t===k?' on':'')+'" data-t="'+k+'" title="'+nomes[k]+'" aria-label="'+nomes[k]+' · '+esc(e.nome)+'">'+k+'</button>'; }).join('')+'</div></div>'; }).join('')+'</div>'
        : '<div class="gc-err" style="background:var(--surface2,#EEF2F8);color:var(--muted)">Esta turma ainda não tem estudantes.</div>')+
      '<div class="gc-baixo"><label style="font-size:13px;font-weight:600;color:var(--muted)">Sumário da aula (opcional)<textarea data-gc="sum" maxlength="1000" placeholder="Ex.: Equações do 2º grau. Exercícios 1 a 5 da página 42.">'+esc(sumario)+'</textarea></label>'+
      (ehHoje?'<label class="chk"><input type="checkbox" data-gc="sms" checked style="margin-top:3px"><span>Avisar por SMS os encarregados dos que faltaram<br><span class="small muted" style="font-weight:400">Cada encarregado recebe um SMS só uma vez por aula.</span></span></label>':'')+
      '<button class="btn pri" type="button" data-gc="save">'+(C.feita?'Guardar alterações':'Guardar chamada')+(sujo?' *':'')+'</button>'+
      '<p class="small muted" style="margin:0">P presente · F falta · A atraso'+(op.podeJustificar?' · J falta justificada':' · As justificações são dadas pela Direcção.')+'</p></div>';
    contagem(); ligar();
  }
  function ligar(){
    Array.prototype.forEach.call(el.querySelectorAll('.gc-it'),function(row){
      var id=row.getAttribute('data-e');
      Array.prototype.forEach.call(row.querySelectorAll('[data-t]'),function(b){ b.onclick=function(){
        var t=b.getAttribute('data-t'); if(t==='P') delete M[id]; else M[id]=t;
        row.className='gc-it '+t; Array.prototype.forEach.call(row.querySelectorAll('[data-t]'),function(x){ x.classList.toggle('on', x===b); });
        contagem(); marcarSujo();
      }; });
    });
    var td=el.querySelector('[data-gc=todos]'); if(td) td.onclick=function(){ Object.keys(M).forEach(function(k){ if(M[k]!=='J') delete M[k]; }); marcarSujo(); desenhar(); };
    el.querySelector('[data-gc=sum]').oninput=function(){ sumario=this.value; marcarSujo(); };
    el.querySelector('[data-gc=save]').onclick=guardar;
  }
  function guardar(){
    if(aGuardar) return; aGuardar=true;
    var b=el.querySelector('[data-gc=save]'); b.disabled=true; b.textContent='A guardar…';
    var sms=el.querySelector('[data-gc=sms]');
    op.guardar(M, sumario, !!(sms&&sms.checked)).then(function(r){
      aGuardar=false;
      if(!r||!r.ok){ desenhar((r&&r.erro)||'Não foi possível guardar.'); return; }
      C.feita=true; sujo=false; desenhar();
      if(op.aviso) op.aviso('Chamada guardada · '+r.faltas+' falta(s), '+r.atrasos+' atraso(s)'+(r.sms?' · '+r.sms+' SMS enviado(s)':''));
      if(op.depois) op.depois(r);
    });
  }
  desenhar();
  return { sujo:function(){ return sujo; } };
}
window.GSChamada = { montar:montar, dataLonga:dataLonga };
})();
