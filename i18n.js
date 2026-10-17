/* Gescolar · idiomas (PT · EN · ES · FR)
   Carregar no <head> de cada página, antes de qualquer outro script:
     <script src="i18n.js" charset="utf-8"></script>
   A língua fica guardada neste dispositivo (localStorage gs_lingua).
   Em português não carrega nada. Nas outras línguas carrega i18n-xx.js
   e traduz o ecrã à medida que é desenhado. */
(function(){
  var LINGUAS = { pt:'Português', en:'English', es:'Español', fr:'Français' };
  var LOCAIS  = { pt:'pt-PT', en:'en-GB', es:'es-ES', fr:'fr-FR' };
  var VERSAO  = '1';

  var lingua = 'pt';
  try{
    var q = (location.search.match(/[?&]lang=(pt|en|es|fr)\b/) || [])[1];
    if(q){ localStorage.setItem('gs_lingua', q); }
    lingua = q || localStorage.getItem('gs_lingua') || 'pt';
  }catch(e){}
  if(!LINGUAS[lingua]) lingua = 'pt';

  var eu = document.currentScript;
  var flutuante = !!(eu && eu.hasAttribute('data-flutuante'));
  var base = (eu && eu.src) ? eu.src.replace(/[^\/?#]*([?#].*)?$/, '') : '';

  try{ document.documentElement.lang = lingua; }catch(e){}

  if(lingua !== 'pt'){
    document.write('<script src="' + base + 'i18n-' + lingua + '.js?v=' + VERSAO + '" charset="utf-8"><\/script>');
  }

  /* ---------------- dicionário ---------------- */
  var D = null, RX = null, CACHE = Object.create(null), nCache = 0;
  function pronto(){
    if(D) return true;
    if(lingua === 'pt' || !window.GS_DIC) return false;
    D = window.GS_DIC;
    var frag = Object.keys(D).filter(function(k){
      return (k.length >= 6 && k.indexOf(' ') > 0) || /^[.ªº·—–(]/.test(k) && k.length >= 4;
    }).sort(function(a, b){ return b.length - a.length; });
    if(frag.length){
      RX = new RegExp(frag.map(function(k){ return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'), 'g');
    }
    return true;
  }
  var LETRA = /[A-Za-z0-9À-ɏ]/;
  function palavra(c){ return !!c && LETRA.test(c); }

  function exacta(s){
    if(D[s] != null) return D[s];
    var n = s.replace(/\s+/g, ' ');
    if(n !== s && D[n] != null) return D[n];
    if(n.length > 2 && n === n.toUpperCase() && n !== n.toLowerCase()){
      var cap = n.charAt(0) + n.slice(1).toLowerCase();
      if(D[cap] != null) return D[cap].toUpperCase();
    }
    var m = n.match(/^([\s\S]*?)([:.…!?]+)$/);
    if(m && m[1] && D[m[1]] != null) return D[m[1]] + m[2];
    return null;
  }


  /* ---------------- palavras soltas: meses, dias, contagens ---------------- */
  var MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var MESES_C = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  var DIAS = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  var DIAS_C = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  function nomeMes(i, curto){ return new Date(2026, i, 15).toLocaleDateString(LOCAIS[lingua], { month: curto ? 'short' : 'long' }).replace('.', ''); }
  function nomeDia(i){ var d = new Date(2026, 0, 4 + i); return d.toLocaleDateString(LOCAIS[lingua], { weekday: 'long' }); }
  function maiuscula(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
  /* [pt singular, pt plural, en sg, en pl, es sg, es pl, fr sg, fr pl] */
  var CONTAGENS = [
    ['estudante','estudantes','student','students','alumno','alumnos','élève','élèves'],
    ['aluno','alunos','student','students','alumno','alumnos','élève','élèves'],
    ['turma','turmas','class','classes','grupo','grupos','classe','classes'],
    ['professor','professores','teacher','teachers','profesor','profesores','enseignant','enseignants'],
    ['disciplina','disciplinas','subject','subjects','asignatura','asignaturas','matière','matières'],
    ['dia','dias','day','days','día','días','jour','jours'],
    ['mês','meses','month','months','mes','meses','mois','mois'],
    ['semana','semanas','week','weeks','semana','semanas','semaine','semaines'],
    ['ano','anos','year','years','año','años','an','ans'],
    ['hora','horas','hour','hours','hora','horas','heure','heures'],
    ['minuto','minutos','minute','minutes','minuto','minutos','minute','minutes'],
    ['aula','aulas','lesson','lessons','clase','clases','cours','cours'],
    ['pagamento','pagamentos','payment','payments','pago','pagos','paiement','paiements'],
    ['falta','faltas','absence','absences','falta','faltas','absence','absences'],
    ['mensagem','mensagens','message','messages','mensaje','mensajes','message','messages'],
    ['ficheiro','ficheiros','file','files','archivo','archivos','fichier','fichiers'],
    ['encarregado','encarregados','guardian','guardians','tutor','tutores','responsable','responsables'],
    ['pergunta','perguntas','question','questions','pregunta','preguntas','question','questions'],
    ['vez','vezes','time','times','vez','veces','fois','fois'],
    ['nota','notas','grade','grades','nota','notas','note','notes'],
    ['inscrição','inscrições','registration','registrations','inscripción','inscripciones','inscription','inscriptions'],
    ['recibo','recibos','receipt','receipts','recibo','recibos','reçu','reçus'],
    ['factura','facturas','invoice','invoices','factura','facturas','facture','factures'],
    ['plano','planos','plan','plans','plan','planes','fiche','fiches'],
    ['vídeo','vídeos','video','videos','vídeo','vídeos','vidéo','vidéos'],
    ['participante','participantes','participant','participants','participante','participantes','participant','participants'],
    ['prestação','prestações','instalment','instalments','cuota','cuotas','versement','versements'],
    ['propina','propinas','fee','fees','cuota','cuotas','frais','frais'],
    ['dívida','dívidas','debt','debts','deuda','deudas','dette','dettes'],
    ['viatura','viaturas','vehicle','vehicles','vehículo','vehículos','véhicule','véhicules'],
    ['instruendo','instruendos','learner','learners','alumno','alumnos','élève','élèves'],
    ['pessoa','pessoas','person','people','persona','personas','personne','personnes'],
    ['publicada','publicadas','published','published','publicada','publicadas','publiée','publiées']
  ];
  var RX_PAL = null, MAPA_PAL = null, MAPA_SG = {};
  function prepararPalavras(){
    if(MAPA_PAL) return;
    MAPA_PAL = {};
    var col = { en: 2, es: 4, fr: 6 }[lingua];
    CONTAGENS.forEach(function(c){
      MAPA_PAL[c[0]] = c[col]; MAPA_PAL[c[1]] = c[col + 1];
      MAPA_PAL[c[0] + '(s)'] = c[col + 1]; MAPA_PAL[c[0] + '(es)'] = c[col + 1];
      MAPA_SG[c[0] + '(s)'] = c[col]; MAPA_SG[c[0] + '(es)'] = c[col]; MAPA_SG[c[1]] = c[col];
    });
    var ks = Object.keys(MAPA_PAL).sort(function(a, b){ return b.length - a.length; })
      .map(function(k){ return k.replace(/[()]/g, '\\$&'); });
    RX_PAL = new RegExp('(\\d+\\s)(' + ks.join('|') + ')(?![A-Za-z\\u00C0-\\u024F])', 'g');
  }
  var RX_DATA = new RegExp('\\b(\\d{1,2}) de (' + MESES.join('|') + ')( de (\\d{4}))?', 'gi');
  var RX_MES  = new RegExp('(^|[^A-Za-z\\u00C0-\\u024F])(' + MESES.join('|') + '|' + DIAS.join('|') + ')(?![A-Za-z\\u00C0-\\u024F-])', 'g');
  function palavras(t){
    if(!/\d|[A-Z]/.test(t)) return t;
    prepararPalavras();
    t = t.replace(RX_DATA, function(x, d, m, _a, ano){
      var i = MESES.map(function(n){ return n.toLowerCase(); }).indexOf(m.toLowerCase());
      if(i < 0) return x;
      var op = ano ? { day:'numeric', month:'long', year:'numeric' } : { day:'numeric', month:'long' };
      return new Date(+(ano || 2026), i, +d).toLocaleDateString(LOCAIS[lingua], op);
    });
    t = t.replace(RX_MES, function(x, antes, n){
      var i = MESES.indexOf(n);
      var cap = lingua === 'en' || antes === '' ? maiuscula : function(v){ return v; };
      if(i >= 0) return antes + cap(nomeMes(i));
      i = DIAS.indexOf(n);
      return i >= 0 ? antes + cap(nomeDia(i)) : x;
    });
    t = t.replace(/(^|[\s(])(até|Até) (?=\d)/g, function(x, a, w){ var v = { en:'until ', es:'hasta ', fr:"jusqu'au " }[lingua]; return a + (w === 'Até' ? maiuscula(v) : v); });
    if(lingua !== 'es') t = t.replace(/(\d+) de (\d+)(?!\d)/g, function(x, a, b){ return a + (lingua === 'en' ? ' of ' : ' sur ') + b; });
    t = t.replace(RX_PAL, function(x, num, p, pos, tudo){
      var tr = MAPA_PAL[p] || MAPA_PAL[p.toLowerCase()];
      if(!tr) return x;
      if(num.trim() === '1' && MAPA_SG[p] && !/( of| sur| de) $/.test(tudo.slice(Math.max(0, pos - 5), pos))) tr = MAPA_SG[p];
      return num + tr;
    });
    return t;
  }
  function soltas(n){
    var i = MESES_C.indexOf(n); if(i >= 0) return maiuscula(nomeMes(i, true));
    i = DIAS_C.indexOf(n); if(i >= 0) return maiuscula(nomeDia(i));
    i = MESES.indexOf(n); if(i >= 0) return maiuscula(nomeMes(i));
    return null;
  }

  function traduzir(texto){
    if(!texto || !pronto()) return texto;
    var s = String(texto);
    if(!/[A-Za-zÀ-ÿ]/.test(s)) return s;
    if(CACHE[s] != null) return CACHE[s];
    var m = s.match(/^(\s*)([\s\S]*?)(\s*)$/), nucleo = m[2], r = exacta(nucleo);
    if(r == null) r = soltas(nucleo);
    if(r == null && nucleo.indexOf('\n') >= 0){
      r = nucleo.split('\n').map(function(l){ return traduzir(l); }).join('\n');
    }
    if(r == null && nucleo.indexOf(' · ') > 0){
      r = nucleo.split(' · ').map(function(l){ return traduzir(l); }).join(' · ');
    }
    if(r == null && RX){
      r = nucleo.replace(RX, function(achou, pos, tudo){
        if(palavra(achou.charAt(0)) && palavra(tudo.charAt(pos - 1))) return achou;
        if(palavra(achou.charAt(achou.length - 1)) && palavra(tudo.charAt(pos + achou.length))) return achou;
        return D[achou] != null ? D[achou] : achou;
      });
      if(r === nucleo) r = null;
    }
    if(r == null){
      var pre = nucleo.match(/^([^,:;!?]{2,40}?)([,:;!?]\s)([\s\S]+)$/);
      if(pre){ var tp = exacta(pre[1]); if(tp != null) r = tp + pre[2] + traduzir(pre[3]); }
    }
    if(r == null){
      var pn = nucleo.match(/^([^\s\d]{3,20})(\s+\d[\s\S]*)$/);
      if(pn){ var tn = exacta(pn[1]); if(tn != null) r = tn + pn[2]; }
    }
    if(r == null) r = nucleo;
    r = m[1] + palavras(r) + m[3];
    if(nCache > 20000){ CACHE = Object.create(null); nCache = 0; }
    CACHE[s] = r; nCache++;
    return r;
  }

  /* ---------------- aplicar ao ecrã ---------------- */
  var SALTA = { SCRIPT:1, STYLE:1, TEXTAREA:1, NOSCRIPT:1, CODE:1, PRE:1, OPTION:0 };
  var ATRIBUTOS = ['placeholder', 'title', 'aria-label', 'alt', 'data-tip'];
  var feitos = new WeakMap();

  function bloqueado(el){
    while(el && el.nodeType === 1){
      if(SALTA[el.nodeName] || el.hasAttribute('data-noi18n') || el.isContentEditable) return true;
      el = el.parentNode;
    }
    return false;
  }
  function texto(no){
    if(feitos.get(no) === no.data) return;
    var t = traduzir(no.data);
    if(t !== no.data){ no.data = t; }
    feitos.set(no, no.data);
  }
  function atributos(el){
    for(var i = 0; i < ATRIBUTOS.length; i++){
      var a = ATRIBUTOS[i];
      if(!el.hasAttribute(a)) continue;
      var v = el.getAttribute(a), chave = '_' + a, f = feitos.get(el) || {};
      if(f[chave] === v) continue;
      var t = traduzir(v);
      f[chave] = t; feitos.set(el, f);
      if(t !== v) el.setAttribute(a, t);
    }
    if(el.nodeName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type) && el.value){
      var t2 = traduzir(el.value); if(t2 !== el.value) el.value = t2;
    }
  }
  function aplicar(raiz){
    if(!pronto() || !raiz) return;
    if(raiz.nodeType === 3){ if(!bloqueado(raiz.parentNode)) texto(raiz); return; }
    if(raiz.nodeType === 9){
      try{ if(raiz.title) raiz.title = traduzir(raiz.title); }catch(e){}
      raiz = raiz.body || raiz.documentElement;
    }
    if(!raiz || raiz.nodeType !== 1 || bloqueado(raiz)) return;
    atributos(raiz);
    var doc = raiz.ownerDocument || document;
    var w = doc.createTreeWalker(raiz, 5, { acceptNode: function(n){
      if(n.nodeType === 1){
        if(SALTA[n.nodeName] || n.hasAttribute('data-noi18n') || n.isContentEditable) return 2;
        atributos(n); return 3;
      }
      return 1;
    }});
    var n; while((n = w.nextNode())) texto(n);
  }

  function observar(doc){
    if(!pronto() || !window.MutationObserver) return;
    var mo = new MutationObserver(function(lista){
      for(var i = 0; i < lista.length; i++){
        var r = lista[i];
        if(r.type === 'childList'){
          for(var j = 0; j < r.addedNodes.length; j++) aplicar(r.addedNodes[j]);
        } else if(r.type === 'characterData'){
          aplicar(r.target);
        } else if(r.type === 'attributes'){
          if(!bloqueado(r.target)) atributos(r.target);
        }
      }
      try{ if(doc.title && doc.title !== tituloFeito){ tituloFeito = doc.title = traduzir(doc.title); } }catch(e){}
    });
    mo.observe(doc.documentElement, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:ATRIBUTOS.concat(['value']) });
  }
  var tituloFeito = '';

  /* ---------------- avisos do navegador ---------------- */
  if(lingua !== 'pt'){
    ['alert', 'confirm', 'prompt'].forEach(function(nome){
      var original = window[nome];
      if(!original) return;
      window[nome] = function(msg){
        var a = Array.prototype.slice.call(arguments);
        if(a.length) a[0] = traduzir(String(msg));
        return original.apply(window, a);
      };
    });
    /* datas no formato da língua escolhida */
    ['toLocaleDateString', 'toLocaleString', 'toLocaleTimeString'].forEach(function(nome){
      var original = Date.prototype[nome];
      Date.prototype[nome] = function(loc, op){
        if(loc == null || /^pt/i.test(String(loc))) loc = LOCAIS[lingua];
        return original.call(this, loc, op);
      };
    });
  }

  /* ---------------- selector de língua ---------------- */
  var CSS = '.gs-lng{appearance:none;-webkit-appearance:none;background:transparent;color:inherit;border:1px solid currentColor;border-radius:999px;' +
    'font:700 12px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:.04em;height:30px;padding:0 10px;cursor:pointer;opacity:.9}' +
    '.gs-lng:hover{opacity:1}.gs-lng option{color:#12281A;background:#fff}' +
    '.gs-lng-flut{position:fixed;top:12px;right:12px;z-index:9999;background:#fff;color:#12281A;border-color:rgba(0,0,0,.15);box-shadow:0 2px 10px rgba(0,0,0,.12)}' +
    '@media (max-width:700px){.gs-lng-flut{top:auto;bottom:14px;right:14px}}' +
    '@media print{.gs-lng,.gs-lng-flut{display:none!important}}';
  function estilo(){
    if(document.getElementById('gs-lng-css')) return;
    var s = document.createElement('style'); s.id = 'gs-lng-css'; s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  function seletor(classe){
    var h = '<select class="gs-lng' + (classe ? ' ' + classe : '') + '" data-noi18n aria-label="Language" onchange="GSI18n.mudar(this.value)">';
    var curto = (window.innerWidth || 1024) < 700;
    for(var k in LINGUAS) h += '<option value="' + k + '"' + (k === lingua ? ' selected' : '') + '>' + (curto ? '🌐 ' + k.toUpperCase() : k.toUpperCase() + ' · ' + LINGUAS[k]) + '</option>';
    return h + '</select>';
  }
  function mudar(l){
    if(!LINGUAS[l]) return;
    try{ localStorage.setItem('gs_lingua', l); }catch(e){}
    var u = location.href.replace(/([?&])lang=[a-z]{2}&?/, '$1').replace(/[?&]$/, '');
    if(u !== location.href) location.replace(u); else location.reload();
  }
  function montarFlutuante(){
    if(!flutuante || document.querySelector('.gs-lng')) return;
    var d = document.createElement('div');
    d.innerHTML = seletor('gs-lng-flut');
    document.body.appendChild(d.firstChild);
  }

  function iniciar(){
    estilo();
    comecar();
    if(pronto()){ aplicar(document); }
    montarFlutuante();
  }
  var aObservar = false;
  function comecar(){ if(!aObservar && pronto()){ aObservar = true; observar(document); aplicar(document); } }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();

  window.GSI18n = {
    lingua: lingua,
    linguas: LINGUAS,
    local: LOCAIS[lingua],
    t: traduzir,
    aplicar: function(alvo){ aplicar(alvo || document); },
    seletor: function(){ estilo(); return seletor(''); },
    mudar: mudar,
    _pronto: comecar
  };
})();
