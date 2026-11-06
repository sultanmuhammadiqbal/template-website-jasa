const q=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const replaceSection=(html,id,body)=>{
  const re=new RegExp('(<section\\b[^>]*\\bid="'+id+'"[^>]*>)[\\s\\S]*?(<\\/section>)');
  if(!re.test(html)) throw new Error('Missing section '+id);
  return html.replace(re,(all,open,close)=>open+body+close);
};
const colors={ink:'--ink',paper:'--paper',paperMuted:'--paper-muted',accent:'--accent',white:'--white',dark:'--dark',servicesBackground:'--services-bg',faqBackground:'--faq-bg'};
export function renderSite(html,css,data) {
  for(const key of ['brand','theme','services','portfolio','caseStudy','faq','contact']) if(!data[key]) throw new Error('Missing '+key);
  for(const key of Object.keys(colors)) if(!/^#[a-f0-9]{6}$/i.test(data.theme[key])) throw new Error('Invalid color '+key);
  for(const key of ['services','portfolio','faq']) if(!Array.isArray(data[key].items)||data[key].items.length<1||data[key].items.length>12) throw new Error('Invalid '+key+' items');
  if(data.portfolio.items.filter(x=>x.caseStudy).length!==1)throw new Error('Exactly one case study project required');
  if(!Array.isArray(data.caseStudy.stages)||!data.caseStudy.stages.length)throw new Error('Missing case study stages');
  if(!/^[a-z0-9/_-]+\.webp$/i.test(data.brand.heroImage)||data.brand.heroImage.startsWith('/'))throw new Error('Unsafe hero image path');
  for(const project of data.portfolio.items) if(!['residence','cafe','workspace'].includes(project.art))throw new Error('Unknown art style');
  const b=data.brand,s=data.services,p=data.portfolio,c=data.caseStudy,f=data.faq,ct=data.contact;
  html=html.replace(/<title>[^<]*<\/title>/,'<title>'+q(b.title)+'</title>');
  html=html.replace(/(name="description"\s+content=")[^"]*"/,'$1'+q(b.description)+'"');
  for(const prop of ['og:title','twitter:title','og:site_name','og:description','twitter:description']){
    const content=prop==='og:site_name'?b.name:prop.includes('description')?b.description:b.title;
    html=html.replace(new RegExp('((?:name|property)="'+prop+'" content=")[^"]*"'),'$1'+q(content)+'"');
  }
  html=html.replace(/(class="brand"[^>]*aria-label=")[^"]*"/,'$1'+q(b.name+', kembali ke beranda')+'"');
  html=html.replace(/(<span class="brand-mark" aria-hidden="true">)[^<]*(<\/span>\s*<span>)[^<]*(<\/span>)/,'$1'+q(b.mark)+'$2'+q(b.name)+'$3');
  html=replaceSection(html,'beranda',
    '<img class="hero-image" src="'+q(b.heroImage)+'" alt="'+q(b.heroAlt)+'" width="1672" height="941" fetchpriority="high" decoding="async" />'+
    '<div class="hero-shade" aria-hidden="true"></div><div class="hero-content"><p class="demo-label hero-reveal">'+q(b.eyebrow)+'</p>'+
    '<h1 class="hero-reveal" id="hero-title">'+q(b.name)+'</h1><p class="hero-promise hero-reveal">'+q(b.tagline)+'</p>'+
    '<div class="hero-actions hero-reveal"><a class="button button-primary" href="#kontak">Mulai konsultasi <span aria-hidden="true">&rarr;</span></a>'+
    '<a class="text-link" href="#portofolio">Lihat karya demo</a></div><p class="placeholder-note hero-reveal">'+q(b.heroNote)+'</p></div>'+
    '<a class="scroll-cue" href="#layanan" aria-label="Gulir ke bagian berikutnya"><span aria-hidden="true"></span>Jelajahi</a>');
  html=replaceSection(html,'layanan','<div class="section-heading"><div><p class="section-index">02 / Layanan</p><h2 id="layanan-title">'+q(s.heading)+'</h2></div><p>'+q(s.intro)+'</p></div>'+
    '<div class="services-grid">'+s.items.map((x,i)=>'<article class="service-card"><span class="card-number">'+String(i+1).padStart(2,'0')+'</span><h3>'+q(x.title)+'</h3><p>'+q(x.description)+'</p><span class="service-tag">'+q(x.tag)+'</span></article>').join('')+'</div>');
  html=replaceSection(html,'portofolio','<div class="section-heading"><div><p class="section-index">03 / Portofolio</p><h2 id="portofolio-title">'+q(p.heading)+'</h2></div><p>'+q(p.intro)+'</p></div><div class="portfolio-grid">'+
    p.items.map(x=>'<article class="project-card'+(x.featured?' project-featured':'')+'"><div class="project-art art-'+q(x.art)+'" role="img" aria-label="'+q(x.artAlt)+'"><span class="art-window"></span><span class="art-block"></span></div>'+
      '<div class="project-info"><div><p class="project-type">'+q(x.category)+'</p><h3>'+q(x.title)+'</h3><p>'+q(x.description)+'</p></div>'+
      (x.caseStudy?'<a class="project-link" href="#studi-kasus">Baca studi kasus <span aria-hidden="true">↗</span></a>':'<span class="project-note">Studi kasus lengkap menyusul</span>')+'</div></article>').join('')+'</div>');
  html=replaceSection(html,'studi-kasus','<div class="case-study-head"><p class="section-index">04 / Studi kasus demo</p><span class="demo-chip">'+q(c.label)+'</span></div>'+
    '<div class="case-study-layout"><div><p class="demo-label">'+q(c.name)+'</p><h2 id="studi-kasus-title">'+q(c.heading)+'</h2><p class="case-lead">'+q(c.lead)+'</p></div>'+
    '<div class="case-details">'+c.stages.map(x=>'<div><h3>'+q(x.title)+'</h3><p>'+q(x.description)+'</p></div>').join('')+
    '<a class="case-back" href="#portofolio">← Kembali ke portofolio</a></div></div>');
  html=replaceSection(html,'faq','<div class="section-heading"><div><p class="section-index">05 / Pertanyaan umum</p><h2 id="faq-title">'+q(f.heading)+'</h2></div><p>'+q(f.intro)+'</p></div>'+
    '<div class="faq-list">'+f.items.map(x=>'<details class="faq-item"><summary><span>'+q(x.question)+'</span><span class="faq-symbol" aria-hidden="true">+</span></summary><div class="faq-answer"><p>'+q(x.answer)+'</p></div></details>').join('')+'</div>');
  html=replaceSection(html,'kontak','<div class="contact-layout"><div><p class="section-index">06 / Hubungi kami</p><h2 id="kontak-title">'+q(ct.heading)+'</h2>'+
    '<p class="contact-intro">'+q(ct.intro)+'</p><p class="demo-chip contact-demo">'+q(ct.demoLabel)+'</p></div>'+
    '<div class="contact-panel"><h3>Pilih cara menghubungi</h3><p>Saluran aktif hanya akan muncul setelah konfigurasi menggunakan informasi bisnis yang valid.</p>'+
    '<div class="contact-actions"><a class="contact-link" data-contact-link="whatsapp" href="#kontak" hidden target="_blank" rel="noopener noreferrer">Chat melalui WhatsApp <span aria-hidden="true">↗</span></a>'+
    '<a class="contact-link" data-contact-link="email" href="#kontak" hidden>Kirim email <span aria-hidden="true">↗</span></a>'+
    '<p class="contact-unavailable" data-contact-unavailable>WhatsApp dan email demo belum diaktifkan.</p></div>'+
    '<p class="contact-note" data-contact-status aria-live="polite">Atur konfigurasi kontak untuk mengaktifkan tautan.</p></div></div>');
  css=css.replace(/(--(?:ink|paper|paper-muted|accent|white):\s*)#[0-9a-f]{6}/gi,(full,prefix)=>prefix+'var('+prefix.match(/--[a-z-]+/)[0]+'-configured)');
  const vars=Object.entries(colors).map(([key,variable])=>variable+'-configured:'+data.theme[key]+';').join('');
  css=':root{'+vars+'}\n'+css;
  return {html,css};
}
