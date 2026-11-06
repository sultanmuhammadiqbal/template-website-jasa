import { validateSite } from './validate-site.mjs';
const q=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const replaceSection=(html,id,body)=>{
  const re=new RegExp('(<section\\b[^>]*\\bid="'+id+'"[^>]*>)[\\s\\S]*?(<\\/section>)');
  if(!re.test(html)) throw new Error('Missing section '+id);
  return html.replace(re,(all,open,close)=>open+body+close);
};
const colors={ink:'--ink',paper:'--paper',paperMuted:'--paper-muted',accent:'--accent',white:'--white',dark:'--dark',servicesBackground:'--services-bg',faqBackground:'--faq-bg'};
export function renderSite(html,css,data) {
  validateSite(data);
  const b=data.brand,s=data.services,p=data.portfolio,c=data.caseStudy,f=data.faq,ct=data.contact,l=data.labels;
  html=html.replace(/<title>[^<]*<\/title>/,()=>'<title>'+q(b.title)+'</title>');
  html=html.replace(/(rel="preload" href=")[^"]*(")/,(_,pre,post)=>pre+q(b.heroImage)+post);
  html=html.replace(/(name="theme-color" content=")[^"]*(")/,(_,pre,post)=>pre+q(data.theme.dark)+post);
  html=html.replace(/(property="og:image:alt" content=")[^"]*(")/,(_,pre,post)=>pre+q(b.heroAlt)+post);
  html=html.replace(/(name="description"\s+content=")[^"]*"/,(_,pre)=>pre+q(b.description)+'"');
  for(const prop of ['og:title','twitter:title','og:site_name','og:description','twitter:description']){
    const content=prop==='og:site_name'?b.name:prop.includes('description')?b.description:b.title;
    html=html.replace(new RegExp('((?:name|property)="'+prop+'" content=")[^"]*"'),(_,pre)=>pre+q(content)+'"');
  }
  html=html.replace(/(class="brand"[^>]*aria-label=")[^"]*"/,(_,pre)=>pre+q(b.name+', kembali ke beranda')+'"');
  html=html.replace(/(<span class="brand-mark" aria-hidden="true">)[^<]*(<\/span>\s*<span>)[^<]*(<\/span>)/,(_,pre,middle,post)=>pre+q(b.mark)+middle+q(b.name)+post);
  html=replaceSection(html,'beranda',
    '<img class="hero-image" src="'+q(b.heroImage)+'" alt="'+q(b.heroAlt)+'" width="1672" height="941" fetchpriority="high" decoding="async" />'+
    '<div class="hero-shade" aria-hidden="true"></div><div class="hero-content"><p class="demo-label hero-reveal">'+q(b.eyebrow)+'</p>'+
    '<h1 class="hero-reveal" id="hero-title">'+q(b.name)+'</h1><p class="hero-promise hero-reveal">'+q(b.tagline)+'</p>'+
    '<div class="hero-actions hero-reveal"><a class="button button-primary" href="#kontak">'+q(l.heroPrimary)+' <span aria-hidden="true">&rarr;</span></a>'+
    '<a class="text-link" href="#portofolio">'+q(l.heroSecondary)+'</a></div><p class="placeholder-note hero-reveal">'+q(b.heroNote)+'</p></div>'+
    '<a class="scroll-cue" href="#layanan" aria-label="Gulir ke bagian berikutnya"><span aria-hidden="true"></span>'+q(l.scrollCue)+'</a>');
  html=replaceSection(html,'layanan','<div class="section-heading"><div><p class="section-index">'+q(l.servicesIndex)+'</p><h2 id="layanan-title">'+q(s.heading)+'</h2></div><p>'+q(s.intro)+'</p></div>'+
    '<div class="services-grid">'+s.items.map((x,i)=>'<article class="service-card"><span class="card-number">'+String(i+1).padStart(2,'0')+'</span><h3>'+q(x.title)+'</h3><p>'+q(x.description)+'</p><span class="service-tag">'+q(x.tag)+'</span></article>').join('')+'</div>');
  html=replaceSection(html,'portofolio','<div class="section-heading"><div><p class="section-index">'+q(l.portfolioIndex)+'</p><h2 id="portofolio-title">'+q(p.heading)+'</h2></div><p>'+q(p.intro)+'</p></div><div class="portfolio-grid">'+
    p.items.map(x=>'<article class="project-card'+(x.featured?' project-featured':'')+'"><div class="project-art art-'+q(x.art)+'" role="img" aria-label="'+q(x.artAlt)+'"><span class="art-window"></span><span class="art-block"></span></div>'+
      '<div class="project-info"><div><p class="project-type">'+q(x.category)+'</p><h3>'+q(x.title)+'</h3><p>'+q(x.description)+'</p></div>'+
      (x.caseStudy?'<a class="project-link" href="#studi-kasus">'+q(l.portfolioReadCase)+' <span aria-hidden="true">↗</span></a>':'<span class="project-note">'+q(l.portfolioPending)+'</span>')+'</div></article>').join('')+'</div>');
  html=replaceSection(html,'studi-kasus','<div class="case-study-head"><p class="section-index">'+q(l.caseIndex)+'</p><span class="demo-chip">'+q(c.label)+'</span></div>'+
    '<div class="case-study-layout"><div><p class="demo-label">'+q(c.name)+'</p><h2 id="studi-kasus-title">'+q(c.heading)+'</h2><p class="case-lead">'+q(c.lead)+'</p></div>'+
    '<div class="case-details">'+c.stages.map(x=>'<div><h3>'+q(x.title)+'</h3><p>'+q(x.description)+'</p></div>').join('')+
    '<a class="case-back" href="#portofolio">← '+q(l.caseBack)+'</a></div></div>');
  html=replaceSection(html,'faq','<div class="section-heading"><div><p class="section-index">'+q(l.faqIndex)+'</p><h2 id="faq-title">'+q(f.heading)+'</h2></div><p>'+q(f.intro)+'</p></div>'+
    '<div class="faq-list">'+f.items.map(x=>'<details class="faq-item"><summary><span>'+q(x.question)+'</span><span class="faq-symbol" aria-hidden="true">+</span></summary><div class="faq-answer"><p>'+q(x.answer)+'</p></div></details>').join('')+'</div>');
  html=replaceSection(html,'kontak','<div class="contact-layout"><div><p class="section-index">'+q(l.contactIndex)+'</p><h2 id="kontak-title">'+q(ct.heading)+'</h2>'+
    '<p class="contact-intro">'+q(ct.intro)+'</p><p class="demo-chip contact-demo">'+q(ct.demoLabel)+'</p></div>'+
    '<div class="contact-panel"><h3>'+q(l.contactPanelTitle)+'</h3><p>'+q(l.contactPanelInfo)+'</p>'+
    '<div class="contact-actions"><a class="contact-link" data-contact-link="whatsapp" href="#kontak" hidden target="_blank" rel="noopener noreferrer">'+q(l.contactWhatsApp)+' <span aria-hidden="true">↗</span></a>'+
    '<a class="contact-link" data-contact-link="email" href="#kontak" hidden>'+q(l.contactEmail)+' <span aria-hidden="true">↗</span></a>'+
    '<p class="contact-unavailable" data-contact-unavailable>'+q(l.contactUnavailable)+'</p></div>'+
    '<p class="contact-note" data-contact-status aria-live="polite">'+q(l.contactHint)+'</p></div></div>');
  css=css.replace(/(--(?:ink|paper|paper-muted|accent|white):\s*)#[0-9a-f]{6}/gi,(full,prefix)=>prefix+'var('+prefix.match(/--[a-z-]+/)[0]+'-configured)');
  css=css.replace(/#262d26/gi,'var(--dark)')
    .replace(/#eeeae1/gi,'var(--services-bg)')
    .replace(/#eae7de/gi,'var(--faq-bg)');
  const vars=Object.entries(colors).map(([key,variable])=>variable+'-configured:'+data.theme[key]+';').join('');
  css=':root{'+vars+'--dark:var(--dark-configured);--services-bg:var(--services-bg-configured);--faq-bg:var(--faq-bg-configured);}\n'+css;
  return {html,css};
}
