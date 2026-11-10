import { renderSite } from '../scripts/render-site.mjs';
import { validateSite, contrastRatio } from '../scripts/validate-site.mjs';

const editor = document.querySelector('#editor');
const status = document.querySelector('#status');
const exportButton = document.querySelector('#export-button');
const importButton = document.querySelector('#import-brief-button');
const importFile = document.querySelector('#brief-config-file');
const frame = document.querySelector('#preview-frame');
const stage = document.querySelector('.preview-stage');
let defaults;
let data;
let sourceHTML;
let sourceCSS;
let renderTimer;

const fields = {
  brand: [['name','Nama bisnis'],['mark','Inisial logo (maks. 4)'],['title','Judul halaman (SEO)'],['description','Deskripsi SEO','textarea'],['tagline','Tagline','textarea'],['eyebrow','Label hero'],['heroNote','Catatan hero','textarea'],['heroImage','Path gambar hero'],['heroAlt','Alt gambar hero']],
  services: [['heading','Judul layanan'],['intro','Pengantar layanan','textarea']],
  portfolio: [['heading','Judul portofolio'],['intro','Pengantar portofolio','textarea']],
  caseStudy: [['name','Nama proyek terkait'],['heading','Judul studi kasus'],['lead','Pengantar studi kasus','textarea'],['label','Label demo']],
  faq: [['heading','Judul FAQ'],['intro','Pengantar FAQ','textarea']],
  contact: [['heading','Judul kontak'],['intro','Pengantar kontak','textarea'],['demoLabel','Label demo kontak']],
  whatsapp: [['number','Nomor internasional (tanpa +)'],['message','Pesan WhatsApp','textarea']],
  email: [['address','Alamat email'],['subject','Subjek email']],
  servicesItem: [['title','Nama layanan'],['description','Deskripsi','textarea'],['tag','Tag']],
  portfolioItem: [['title','Nama proyek'],['category','Kategori'],['description','Deskripsi','textarea'],['artAlt','Alt ilustrasi','textarea']],
  faqItem: [['question','Pertanyaan'],['answer','Jawaban','textarea']],
  stageItem: [['title','Tahap'],['description','Penjelasan','textarea']]
};
const paletteLabels = {ink:'Teks utama',paper:'Latar halaman',paperMuted:'Latar sekunder',accent:'Warna aksen',white:'Putih',dark:'Bagian gelap',servicesBackground:'Latar layanan',faqBackground:'Latar FAQ'};
const labelTitles = {heroPrimary:'Tombol utama',heroSecondary:'Tombol kedua',scrollCue:'Petunjuk gulir',portfolioReadCase:'Tautan studi kasus',portfolioPending:'Proyek belum tersedia',caseBack:'Kembali ke portofolio',caseIndex:'Indeks studi kasus',servicesIndex:'Indeks layanan',portfolioIndex:'Indeks portofolio',faqIndex:'Indeks FAQ',contactIndex:'Indeks kontak',contactPanelTitle:'Judul panel kontak',contactPanelInfo:'Petunjuk panel kontak',contactWhatsApp:'Tombol WhatsApp',contactEmail:'Tombol email',contactUnavailable:'Kontak nonaktif',contactHint:'Petunjuk awal kontak',contactActiveNote:'Status kontak aktif',contactActiveDemo:'Label kontak aktif',contactInactiveNote:'Status kontak nonaktif'};

const node = (tag, {text, className} = {}) => {
  const el = document.createElement(tag);
  if(text !== undefined) el.textContent = text;
  if(className) el.className = className;
  return el;
};
const get = path => path.reduce((value,key)=>value[key],data);
const put = (path,value) => {
  const parent = get(path.slice(0,-1));
  parent[path.at(-1)] = value;
};
const pathKey = path => JSON.stringify(path);
const describe = (root, name) => root === 'brand' ? 'brand.'+name : root+'.'+name;

function inputField(path, title, kind='text'){
  const wrapper=node('div',{className:'field'});
  const label=node('label',{text:title});
  const id='input-'+path.map(x=>String(x).replace(/[^a-z0-9]/gi,'-')).join('-');
  label.htmlFor=id;
  const el=node(kind==='textarea'?'textarea':'input');
  el.id=id;el.dataset.path=pathKey(path);
  if(kind==='textarea') el.rows=3;
  else el.type='text';
  el.value=String(get(path)??'');
  if(path.join('.')==='brand.mark')el.maxLength=4;
  wrapper.append(label,el);
  return wrapper;
}
function checkboxField(path,title){
  const wrapper=node('label',{className:'checkbox-field'});
  const el=document.createElement('input');el.type='checkbox';el.dataset.path=pathKey(path);el.checked=get(path);
  wrapper.append(el,document.createTextNode(title));
  return wrapper;
}
function selectField(path,title,values){
  const wrap=node('div',{className:'field'});
  const label=node('label',{text:title});
  const id='input-'+path.join('-');label.htmlFor=id;
  const el=document.createElement('select');el.id=id;el.dataset.path=pathKey(path);
  for(const value of values){const opt=node('option',{text:value});opt.value=value;el.append(opt)}
  el.value=get(path);wrap.append(label,el);return wrap;
}
function colorField(key){
  const wrap=node('div',{className:'field'});
  const label=node('label',{text:paletteLabels[key]});wrap.append(label);
  const row=node('div',{className:'color-row'});
  const picker=document.createElement('input');picker.type='color';picker.value=data.theme[key];picker.dataset.colorPicker=key;
  picker.setAttribute('aria-label','Pilih warna '+paletteLabels[key]);
  const textbox=document.createElement('input');textbox.type='text';textbox.id='input-theme-'+key;label.htmlFor=textbox.id;textbox.value=data.theme[key];textbox.dataset.path=pathKey(['theme',key]);textbox.setAttribute('aria-label','Kode hex '+paletteLabels[key]);textbox.maxLength=7;
  row.append(picker,textbox);wrap.append(row);return wrap;
}
function control(text,click,extra=''){
  const btn=node('button',{text,className:'mini-button '+extra});
  btn.type='button';btn.addEventListener('click',click);
  return btn;
}
function cardItem(parentPath,i,kind){
  const itemPath=[...parentPath,'items',i];
  const div=node('div',{className:'item-card'});
  const head=node('div',{className:'item-head'});
  const strong=node('strong',{text:(i+1)+'. '+(get([...itemPath,'title'])??get([...itemPath,'question'])??'Tahap')});
  const actions=node('div',{className:'item-actions'});
  const items=get([...parentPath,'items']);
  actions.append(control('Hapus',()=>{
    if(items.length<=1)return;
    items.splice(i,1);
    if(kind==='portfolio' && items.every(x=>!x.caseStudy)){
      items[0].caseStudy=true;
      data.caseStudy.name=items[0].title;
    }
    buildEditor();schedulePreview();
  },'danger'));
  if(kind!=='portfolio') actions.append(control('Duplikat',()=>{
    if(items.length>=12)return;
    items.splice(i+1,0,structuredClone(items[i]));buildEditor();schedulePreview();
  }));
  head.append(strong,actions);div.append(head);
  for(const [key,label,inputKind] of fields[kind==='services'?'servicesItem':kind==='portfolio'?'portfolioItem':kind==='faq'?'faqItem':'stageItem'])div.append(inputField([...itemPath,key],label,inputKind));
  if(kind==='portfolio'){
    div.append(selectField([...itemPath,'art'],'Gaya ilustrasi',['residence','cafe','workspace']));
    div.append(checkboxField([...itemPath,'featured'],'Kartu unggulan'));
    const linked=checkboxField([...itemPath,'caseStudy'],'Tautkan ke studi kasus');
    linked.querySelector('input').dataset.linkedProject=String(i);
    div.append(linked);
  }
  return div;
}
function section(title,open=false){
  const details=node('details');details.open=open;
  details.append(node('summary',{text:title}));
  const content=node('div',{className:'group-content'});
  details.append(content);
  return {details,content};
}
function appendSimple(root,content,definitions){
  for(const [key,label,kind] of definitions)content.append(inputField([root,key],label,kind));
}
function appendArray(root,content,itemsKind,starter){
  const arr=root==='caseStudy'?data.caseStudy.stages:data[root].items;
  const path=root==='caseStudy'?['caseStudy','stages']:[root,'items'];
  if(root==='caseStudy'){
    for(let i=0;i<arr.length;i++){
      const card=node('div',{className:'item-card'});
      const h=node('div',{className:'item-head'});
      h.append(node('strong',{text:'Tahap '+(i+1)}),control('Hapus',()=>{if(arr.length<=1)return;arr.splice(i,1);buildEditor();schedulePreview()},'danger'));
      card.append(h);
      for(const [key,label,kind] of fields.stageItem)card.append(inputField([...path,i,key],label,kind));
      content.append(card);
    }
  } else for(let i=0;i<arr.length;i++)content.append(cardItem([root],i,itemsKind));
  const actions=node('div',{className:'group-actions'});
  actions.append(control('+ Tambah '+(root==='faq'?'FAQ':root==='services'?'layanan':root==='portfolio'?'proyek':'tahap'),()=>{
    if(arr.length>=12)return;
    const item=structuredClone(starter);
    if(root==='portfolio' && arr.length===0){item.caseStudy=true;data.caseStudy.name=item.title}
    arr.push(item);
    buildEditor();schedulePreview();
  }));
  content.append(actions);
}
function buildEditor(){
  const openNames = [...editor.querySelectorAll('details[open]')].map(el=>el.dataset.section);
  const initiallyOpen = editor.childElementCount===0;
  editor.replaceChildren();
  const add=(name,title,open,fn)=>{
    const {details,content}=section(title,initiallyOpen?open:openNames.includes(name));
    details.dataset.section=name;fn(content);editor.append(details);
  };
  add('brand','01 · Identitas & SEO',true,c=>appendSimple('brand',c,fields.brand));
  add('theme','02 · Palet warna',true,c=>{
    for(const key of Object.keys(paletteLabels))c.append(colorField(key));
    c.append(node('p',{className:'muted',text:'Validator memeriksa pasangan warna utama dengan ambang 4,5:1. Audit axe tetap diperlukan untuk kombinasi klien.'}));
  });
  add('services','03 · Layanan',false,c=>{
    appendSimple('services',c,fields.services);
    appendArray('services',c,'services',{title:'Layanan baru',description:'Deskripsikan layanan.',tag:'Kategori'});
  });
  add('portfolio','04 · Portofolio',false,c=>{
    appendSimple('portfolio',c,fields.portfolio);
    appendArray('portfolio',c,'portfolio',{title:'Proyek baru',category:'Kategori · Konsep demo',description:'Deskripsi singkat proyek.',art:'residence',artAlt:'Ilustrasi abstrak proyek',featured:false,caseStudy:false});
    c.append(node('p',{className:'inline-message',text:'Tepat satu proyek harus tertaut ke studi kasus. Jika diganti, nama studi kasus mengikuti proyek yang dipilih.'}));
  });
  add('caseStudy','05 · Studi kasus',false,c=>{
    appendSimple('caseStudy',c,fields.caseStudy);
    appendArray('caseStudy',c,'caseStudy',{title:'Tahap baru',description:'Jelaskan proses.'});
  });
  add('faq','06 · FAQ',false,c=>{
    appendSimple('faq',c,fields.faq);
    appendArray('faq',c,'faq',{question:'Pertanyaan baru?',answer:'Isi jawabannya.'});
  });
  add('contact','07 · Kontak',false,c=>{
    appendSimple('contact',c,fields.contact);
    c.append(node('h3',{text:'WhatsApp'}),checkboxField(['contact','whatsapp','enabled'],'Aktifkan WhatsApp'));
    for(const [key,label,kind] of fields.whatsapp)c.append(inputField(['contact','whatsapp',key],label,kind));
    c.append(node('h3',{text:'Email'}),checkboxField(['contact','email','enabled'],'Aktifkan email'));
    for(const [key,label,kind] of fields.email)c.append(inputField(['contact','email',key],label,kind));
    c.append(node('p',{text:'Periksa nomor dan email milik bisnis sebelum menyalakan saluran kontak.',className:'inline-message'}));
  });
  add('labels','08 · Label & tombol',false,c=>{
    for(const [key,label] of Object.entries(labelTitles))c.append(inputField(['labels',key],label));
  });
}
function previewMarkup(){
  const rendered=renderSite(sourceHTML,sourceCSS,data);
  const safeBase=new URL('../',location.href).href;
  const safeRuntime={whatsapp:{...data.contact.whatsapp,enabled:false},email:{...data.contact.email,enabled:false},
    labels:{activeNote:data.labels.contactActiveNote,activeDemo:data.labels.contactActiveDemo,inactiveNote:data.labels.contactInactiveNote}};
  const safeScript=JSON.stringify(safeRuntime).replace(/</g,'\\u003c');
  // Preview never turns on live WhatsApp or mailto links, even when export settings enable them.
  let html=rendered.html.replace('<head>','<head><base href="'+safeBase+'">');
  html=html.replace('<link rel="stylesheet" href="styles.css" />',()=>'<style>'+rendered.css+'</style>');
  const tokens={ink:'ink',paper:'paper',paperMuted:'paper-muted',accent:'accent',white:'white',dark:'dark',servicesBackground:'services-bg',faqBackground:'faq-bg'};
  const palette=Object.entries(tokens).map(([key,token])=>'--'+token+':'+data.theme[key]+';').join('');
  html=html.replace('</head>','<style>:root{'+palette+'}</style></head>');
  html=html.replace(/<script src="config\/contact\.js" defer><\/script>/,()=>'<script>window.RUANG_REKA_CONTACT='+safeScript+';<\/script>');
  return html;
}
function update(){
  try{
    validateSite(data);
    frame.srcdoc=previewMarkup();
    exportButton.disabled=false;
    status.textContent='Konfigurasi valid ✓ · Preview siap · Ekspor JSON tersedia';
    status.classList.remove('invalid');
  }catch(error){
    exportButton.disabled=true;
    status.classList.add('invalid');
    status.textContent='Perbaiki konfigurasi sebelum ekspor:\n'+error.message;
    // Do not reset the iframe: last valid preview stays visible.
  }
}
function schedulePreview(){
  clearTimeout(renderTimer);
  renderTimer=setTimeout(update,180);
}
editor.addEventListener('input',event=>{
  const el=event.target;
  if(el.dataset.colorPicker){
    const key=el.dataset.colorPicker;put(['theme',key],el.value);
    const textbox=editor.querySelector('#input-theme-'+key);
    if(textbox)textbox.value=el.value;
  }else if(el.dataset.path){
    const path=JSON.parse(el.dataset.path);
    put(path,el.type==='checkbox'?el.checked:el.value);
    if(path[0]==='theme'&&/^#[a-f0-9]{6}$/i.test(el.value)){
      const picker=editor.querySelector('[data-color-picker="'+path[1]+'"]');
      if(picker)picker.value=el.value;
    }
    if(path[0]==='portfolio'&&path[1]==='items'&&path[3]==='title'&&data.portfolio.items[path[2]].caseStudy)data.caseStudy.name=el.value;
  }
  schedulePreview();
});
editor.addEventListener('change',event=>{
  const el=event.target;
  if(el.dataset.linkedProject!==undefined && el.checked){
    const i=Number(el.dataset.linkedProject);
    data.portfolio.items.forEach((x,n)=>x.caseStudy=n===i);
    data.caseStudy.name=data.portfolio.items[i].title;
    buildEditor();
  }
  schedulePreview();
});
document.querySelectorAll('.viewport-button').forEach(btn=>btn.addEventListener('click',()=>{
  const mobile=btn.dataset.viewport==='mobile';stage.classList.toggle('is-mobile',mobile);
  document.querySelectorAll('.viewport-button').forEach(b=>{const selected=b===btn;b.classList.toggle('is-active',selected);b.setAttribute('aria-pressed',String(selected))});
}));
importButton.addEventListener('click',()=>importFile.click());
importFile.addEventListener('change',async()=>{
  const file=importFile.files?.[0];
  if(!file)return;
  try{
    if(file.size>256*1024)throw new Error('File konfigurasi melebihi batas 256 KB.');
    const imported=JSON.parse(await file.text());
    validateSite(imported);
    data=structuredClone(imported);
    buildEditor();
    update();
    status.textContent='Konfigurasi dari Brief to Proposal berhasil diimpor dan lolos validasi. Periksa seluruh konten, aset, warna, dan kontak sebelum ekspor/build.';
  }catch(error){
    status.classList.add('invalid');
    status.textContent='Import ditolak: '+error.message;
    exportButton.disabled=true;
  }finally{importFile.value='';}
});
document.querySelector('#reset-button').addEventListener('click',()=>{
  if(!confirm('Kembalikan semua perubahan ke konfigurasi awal?'))return;
  data=structuredClone(defaults);buildEditor();update();
});
exportButton.addEventListener('click',()=>{
  try{
    validateSite(data);
    const payload=JSON.stringify(data,null,2)+'\n';
    const url=URL.createObjectURL(new Blob([payload],{type:'application/json;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='site.json';document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent='site.json berhasil disiapkan. Simpan file dan gunakan untuk mengganti config/site.json dalam proyek klien.';
  }catch(error){status.textContent=error.message;exportButton.disabled=true;status.classList.add('invalid')}
});
async function start(){
  try{
    const res=await Promise.all(['../config/site.json','../index.html','../styles.css'].map(url=>fetch(url)));
    if(res.some(r=>!r.ok))throw Error('Aset configurator tidak ditemukan. Jalankan npm run build dan buka hasil di dist/.');
    const [cfg,html,css]=await Promise.all([res[0].json(),res[1].text(),res[2].text()]);
    defaults=cfg;data=structuredClone(cfg);sourceHTML=html;sourceCSS=css;
    buildEditor();update();
  }catch(error){status.textContent='Gagal memuat konfigurasi: '+error.message;status.classList.add('invalid')}
}
start();
