const searchData=window.SEARCH_DATA||[];
const modal=document.getElementById('search-modal');
const input=document.getElementById('search-input');
const results=document.getElementById('search-results');
const themeSwitch=document.getElementById('theme-switch');
const pageLang=document.documentElement.lang||'ru';
const ui={ru:{ask:'Что вы хотите найти?',example:'Например: сознание, развитие воли, отношения, природа',found:'Найдено',first:'показаны первые 40',none:'Совпадений нет',retry:'Попробуйте другую форму слова или более короткий запрос.',light:'Светлый вид',night:'Ночной вид'},en:{ask:'What would you like to find?',example:'For example: consciousness, will, relationships, nature',found:'Found',first:'showing the first 40',none:'No matches',retry:'Try another word form or a shorter query.',light:'Light view',night:'Night view'},de:{ask:'Was möchten Sie finden?',example:'Zum Beispiel: Bewusstsein, Wille, Beziehungen, Natur',found:'Gefunden',first:'die ersten 40 werden angezeigt',none:'Keine Treffer',retry:'Versuchen Sie eine andere Wortform oder eine kürzere Suche.',light:'Helle Ansicht',night:'Nachtansicht'},fr:{ask:'Que souhaitez-vous trouver ?',example:'Par exemple : conscience, volonté, relations, nature',found:'Résultats',first:'les 40 premiers sont affichés',none:'Aucun résultat',retry:'Essayez une autre forme du mot ou une requête plus courte.',light:'Mode clair',night:'Mode nuit'}}[pageLang]||null;
const skyLabel={ru:'Небесный вид',en:'Sky view',de:'Himmelsansicht',fr:'Mode ciel'}[pageLang]||'Sky view';
const normalize=s=>(s||'').toLocaleLowerCase(pageLang).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('ß','ss').replaceAll('ё','е').replace(/[^a-zа-я0-9]+/g,' ').trim();
const escapeHtml=s=>(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function openSearch(){modal.hidden=false;document.body.style.overflow='hidden';input.focus()}
function closeSearch(){modal.hidden=true;document.body.style.overflow='';input.value='';results.innerHTML=''}
function snippet(item,tokens){const plain=item.text.replace(/\s+/g,' ').trim();const low=normalize(plain);let pos=-1;for(const token of tokens){const p=low.indexOf(token);if(p>=0&&(pos<0||p<pos))pos=p}if(pos<0)return item.excerpt;const start=Math.max(0,pos-75),end=Math.min(plain.length,pos+185);return(start?'…':'')+plain.slice(start,end)+(end<plain.length?'…':'')}
function runSearch(){const raw=input.value.trim(),q=normalize(raw);if(!q){results.innerHTML=`<div class="search-empty"><b>${ui.ask}</b><span>${ui.example}</span></div>`;return}const tokens=[...new Set(q.split(/\s+/).filter(Boolean))];const found=searchData.map(item=>{const title=normalize(item.title),category=normalize(item.category),text=normalize(item.text);const matched=tokens.filter(t=>title.includes(t)||category.includes(t)||text.includes(t));if(!matched.length)return null;let score=matched.length*20;if(matched.length===tokens.length)score+=40;if(title.includes(q))score+=120;if(category.includes(q))score+=35;score+=tokens.filter(t=>title.includes(t)).length*45;return{item,score,matched}}).filter(Boolean).sort((a,b)=>b.score-a.score||a.item.title.localeCompare(b.item.title,pageLang));const shown=found.slice(0,40);results.innerHTML=`<div class="search-summary">${ui.found}: <b>${found.length}</b>${found.length>40?' · '+ui.first:''}</div>`+(shown.length?shown.map(({item,matched})=>`<a class="result" href="${SITE_ROOT}/${item.url}"><span>${escapeHtml(item.category)}</span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(snippet(item,matched))}</small></a>`).join(''):`<div class="search-empty"><b>${ui.none}</b><span>${ui.retry}</span></div>`)}
document.querySelectorAll('[data-search]').forEach(b=>b.addEventListener('click',openSearch));
document.getElementById('search-close').addEventListener('click',closeSearch);
modal.addEventListener('click',e=>{if(e.target===modal)closeSearch()});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();openSearch()}if(e.key==='Escape')closeSearch()});
input.addEventListener('input',runSearch);
function updateThemeLabel(){const theme=document.documentElement.dataset.theme||'light';themeSwitch.querySelector('.theme-label').textContent=theme==='light'?ui.night:theme==='night'?skyLabel:ui.light;themeSwitch.querySelector('.theme-icon').textContent=theme==='light'?'◐':theme==='night'?'☁':'☼';themeSwitch.setAttribute('aria-label',themeSwitch.querySelector('.theme-label').textContent)}
themeSwitch.addEventListener('click',()=>{const current=document.documentElement.dataset.theme||'light';const next=current==='light'?'night':current==='night'?'sky':'light';document.documentElement.dataset.theme=next;try{localStorage.setItem('drevo-theme',next)}catch(e){}updateThemeLabel()});
updateThemeLabel();
document.querySelectorAll('[data-lang]').forEach(button=>{const pathParts=decodeURIComponent(location.pathname).split('/');const current=pathParts.includes('en')?'en':pathParts.includes('de')?'de':pathParts.includes('fr')?'fr':'ru';button.classList.toggle('active',button.dataset.lang===current);button.addEventListener('click',()=>{const target=button.dataset.lang;if(target===current)return;if(document.body.dataset.noLocalization==='true'){location.href=target==='ru'?'../catalog.html':`../${target}/catalog.html`;return}const url=new URL(location.href);let parts=decodeURIComponent(url.pathname).split('/');const existing=parts.findIndex(x=>['en','de','fr'].includes(x));if(existing>=0)parts.splice(existing,1);if(target!=='ru'){const markers=['articles','source','books'].map(x=>parts.lastIndexOf(x)).filter(x=>x>=0);const insertAt=markers.length?Math.min(...markers):parts.length-1;parts.splice(insertAt,0,target)}url.pathname=parts.join('/');url.hash='';location.href=url.href})});
document.querySelectorAll('[data-carousel]').forEach(carousel=>{const slides=[...carousel.querySelectorAll('.carousel-slide')],dots=[...carousel.querySelectorAll('.carousel-dots button')];let current=0,timer=null;const show=index=>{current=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{const active=i===current;slide.classList.toggle('active',active);slide.setAttribute('aria-hidden',String(!active));dots[i].classList.toggle('active',active)});restart()};const restart=()=>{clearInterval(timer);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>show(current+1),7000)};carousel.querySelector('.carousel-prev').addEventListener('click',()=>show(current-1));carousel.querySelector('.carousel-next').addEventListener('click',()=>show(current+1));dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i)));carousel.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}if(e.key==='ArrowRight'){e.preventDefault();show(current+1)}});carousel.addEventListener('mouseenter',()=>clearInterval(timer));carousel.addEventListener('mouseleave',restart);carousel.addEventListener('focusin',()=>clearInterval(timer));carousel.addEventListener('focusout',restart);document.addEventListener('visibilitychange',()=>document.hidden?clearInterval(timer):restart());restart()});

function enhancePresentation(){
  const deck=document.querySelector('.deck');if(!deck)return;
  const source=slug=>`source/${slug}.html`;
  const wrap=(element,href,label)=>{if(!element||element.querySelector(':scope > a.deck-card-link'))return;const link=document.createElement('a');link.className='deck-card-link';link.href=href;link.setAttribute('aria-label',label||element.textContent.trim());while(element.firstChild)link.appendChild(element.firstChild);const arrow=document.createElement('i');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');link.appendChild(arrow);element.appendChild(link)};
  const levelSlugs=['telo','podsoznanie','soznanie','psihika','nadsoznanie','dusa','duh'];
  const levelNames={body:'telo',corps:'telo','le corps':'telo','körper':'telo',subconscious:'podsoznanie','le subconscient':'podsoznanie','unterbewusstsein':'podsoznanie',consciousness:'soznanie','la conscience':'soznanie','bewusstsein':'soznanie',psyche:'psihika',psychisme:'psihika','le psychisme':'psihika',superconscious:'nadsoznanie','le supraconscient':'nadsoznanie','überbewusstsein':'nadsoznanie',soul:'dusa','l’âme':'dusa','âme':'dusa',seele:'dusa',spirit:'duh','l’esprit':'duh',esprit:'duh',geist:'duh','тело':'telo','подсознание':'podsoznanie','сознание':'soznanie','психика':'psihika','надсознание':'nadsoznanie','душа':'dusa','дух':'duh'};
  document.querySelectorAll('.level-card').forEach((card,index)=>{const title=(card.querySelector('h3')?.textContent||'').trim().toLocaleLowerCase(pageLang);wrap(card,source(levelNames[title]||levelSlugs[index]),title)});
  const principleSlugs=['zakon-zelostnosti','zakony-razvitia-licnosti','zakon-osoznannosti','zakon-otvetstvennosti','zakon-sotrudnicestva','prinzip-psihologiceskoi-ekologii'];
  document.querySelectorAll('.principles-grid article').forEach((card,index)=>wrap(card,source(principleSlugs[index]||'zakony-razvitia-licnosti')));
  const resultSlugs=['telo','psihika','soznanie','razvitie-voli','raskrytie-dusi','ukreplenie-duha','psihologia-soobsestva'];
  document.querySelectorAll('.deck-result li').forEach((item,index)=>wrap(item,source(resultSlugs[index]||'zakony-razvitia-licnosti')));
  const problems=document.querySelectorAll('.problem-grid article');if(problems[0])wrap(problems[0],source('pocemu-celovek-stradaet'));if(problems[1])wrap(problems[1],source('cto-takoe-celovek'));
  wrap(document.querySelector('.deck-hero figure'),source('cto-takoe-celovek'));
  wrap(document.querySelector('.deck-statement'),source('manifest-novoi-psihologii'));
  const treeSlugs=['zennosti-i-smysl','psihologiceskii-immunitet','poisk-prednaznacenia','nasledie-celoveka'];
  document.querySelectorAll('.tree-word span').forEach((item,index)=>wrap(item,source(treeSlugs[index]||'karta-razvitia-licnosti')));
  wrap(document.querySelector('.deck-flow .flow-copy'),source('zakony-razvitia-licnosti'));
  wrap(document.querySelector('.deck-science'),source('prinzip-psihologiceskoi-ekologii'));
}
enhancePresentation();

function updateHomeStats(){
  const materialsNode=document.querySelector('[data-stat="materials"]');
  const directionsNode=document.querySelector('[data-stat="directions"]');
  if(!materialsNode||!directionsNode||!Array.isArray(window.SEARCH_DATA))return;
  const parts=decodeURIComponent(location.pathname).split('/');
  const lang=parts.includes('en')?'en':parts.includes('de')?'de':parts.includes('fr')?'fr':'ru';
  const main=window.SEARCH_DATA.filter(item=>/^articles\/[^/]+\.html$/.test(item.url||''));
  const bookPrefix=lang==='ru'?'books/':`${lang}/books/`;
  const books=window.SEARCH_DATA.filter(item=>{
    const url=item.url||'';
    return url.startsWith(`${bookPrefix}drevo-emotions-`)||url.startsWith(`${bookPrefix}drevo-practices-`);
  });
  const calculatedMaterials=main.length+books.length;
  const calculatedDirections=new Set(main.map(item=>item.category).filter(Boolean)).size;
  // Localized home pages keep their own compact search indexes. They may not
  // yet contain the translated book articles or thematic category metadata,
  // so never replace the build-time totals with a smaller partial count.
  materialsNode.textContent=String(Math.max(Number(materialsNode.textContent)||0,calculatedMaterials));
  directionsNode.textContent=String(Math.max(Number(directionsNode.textContent)||0,calculatedDirections));
}
updateHomeStats();

// Keep newly generated or hand-edited articles consistent with the static
// content pass: consecutive short paragraphs are semantic visual lists.
function enhanceShortEnumerations(){
  document.querySelectorAll('.prose').forEach(prose=>{
    const children=[...prose.children];let run=[];
    const flush=()=>{
      if(run.length>=3){
        const list=document.createElement('ul');list.className='short-enumeration';
        run[0].before(list);
        run.forEach(paragraph=>{const item=document.createElement('li');while(paragraph.firstChild)item.appendChild(paragraph.firstChild);list.appendChild(item);paragraph.remove()});
      }
      run=[];
    };
    children.forEach(element=>{
      const text=element.textContent.trim();
      if(element.tagName==='P'&&text.length>0&&text.length<=72)run.push(element);else flush();
    });
    flush();
  });
}
enhanceShortEnumerations();

function enhanceCatalogNavigation(){
  const catalog=document.querySelector('main > .catalog');
  const hero=document.querySelector('main > .catalog-hero');
  if(!catalog||!hero||document.querySelector('.catalog-jump-nav'))return;
  const lang=(document.documentElement.lang||'ru').split('-')[0];
  const labels={ru:'Навигация по разделам',en:'Browse sections',de:'Bereiche',fr:'Navigation par sections'};
  const sections=[...catalog.querySelectorAll(':scope > .catalog-section')];
  const targets=sections.length?sections:[...catalog.querySelectorAll(':scope > .catalog-grid > a')].filter((_,index)=>index%10===0);
  const nav=document.createElement('nav');nav.className='catalog-jump-nav';nav.setAttribute('aria-label',labels[lang]||labels.ru);
  const title=document.createElement('strong');title.textContent=labels[lang]||labels.ru;nav.appendChild(title);
  const links=document.createElement('div');nav.appendChild(links);
  targets.forEach((section,index)=>{
    if(!section.id)section.id=section.classList.contains('book-catalog-section')?'books':`section-${index+1}`;
    const heading=section.querySelector('.catalog-heading h2');
    const start=index*10+1,end=Math.min(start+9,catalog.querySelectorAll(':scope > .catalog-grid > a').length);
    const link=document.createElement('a');link.href=`#${section.id}`;
    const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');
    const name=document.createElement('b');name.textContent=heading?heading.textContent.trim():`${String(start).padStart(2,'0')}–${String(end).padStart(2,'0')}`;
    link.append(number,name);links.appendChild(link);
  });
  hero.after(nav);
  const layout=document.createElement('div');layout.className='catalog-layout';
  nav.before(layout);layout.append(nav,catalog);
  const linkList=[...links.querySelectorAll('a')];
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      linkList.forEach(link=>link.classList.toggle('active',link.hash===`#${entry.target.id}`));
    }),{rootMargin:'-24% 0px -66% 0px'});
    targets.forEach(section=>observer.observe(section));
  }
}
enhanceCatalogNavigation();

function enhanceContentsNavigation(){
  const navigation=document.querySelector('main > .source-part-nav');
  const contents=document.querySelector('main > .source-structure');
  if(!navigation||!contents||document.querySelector('.contents-layout'))return;
  const layout=document.createElement('div');layout.className='contents-layout';
  navigation.before(layout);layout.append(navigation,contents);
  const links=[...navigation.querySelectorAll('a[href^="#"]')];
  const sections=[...contents.querySelectorAll(':scope > .source-part[id]')];
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      links.forEach(link=>link.classList.toggle('active',link.hash===`#${entry.target.id}`));
    }),{rootMargin:'-24% 0px -66% 0px'});
    sections.forEach(section=>observer.observe(section));
  }
}
enhanceContentsNavigation();

function enhanceMobileHeader(){
  const header=document.querySelector('.site-header');
  const nav=header?.querySelector(':scope > nav');
  if(!header||!nav||nav.querySelector('.mobile-menu-toggle'))return;
  const directLinks=[...nav.children].filter(item=>item.tagName==='A');
  if(!directLinks.length)return;
  const lang=(document.documentElement.lang||'ru').split('-')[0];
  const labels={ru:'Разделы',en:'Sections',de:'Bereiche',fr:'Sections'};
  const links=document.createElement('div');links.className='mobile-nav-links';
  directLinks[0].before(links);directLinks.forEach(link=>links.appendChild(link));
  const button=document.createElement('button');button.type='button';button.className='mobile-menu-toggle';
  button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',labels[lang]||labels.ru);
  button.innerHTML='<span aria-hidden="true"></span><b>'+ (labels[lang]||labels.ru) +'</b>';
  links.before(button);
  const close=()=>{header.classList.remove('mobile-nav-open');button.setAttribute('aria-expanded','false')};
  button.addEventListener('click',()=>{const open=header.classList.toggle('mobile-nav-open');button.setAttribute('aria-expanded',String(open))});
  links.addEventListener('click',event=>{if(event.target.closest('a'))close()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
  document.addEventListener('click',event=>{if(!header.contains(event.target))close()});
}
enhanceMobileHeader();
