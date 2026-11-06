// Validation runs before generating any public HTML, CSS, or contact script.
const requireText=(value,path,{min=1,max=800}={})=>{
  if(typeof value!=='string'||value.trim().length<min||value.length>max||/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)){
    throw new Error(path+' must be text of length '+min+'-'+max+' without control characters');
  }
};
const object=(v,path)=>{
  if(!v||typeof v!=='object'||Array.isArray(v))throw new Error(path+' must be an object');
};
const array=(v,path,max=12)=>{
  if(!Array.isArray(v)||v.length<1||v.length>max)throw new Error(path+' must contain 1-'+max+' items');
};
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
export const contrastRatio=(a,b)=>{
  const luminosity=hex=>rgb(hex).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const x=luminosity(a),y=luminosity(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
};
export function validateSite(d){
  object(d,'site');
  for(const k of ['brand','theme','services','portfolio','caseStudy','faq','contact','labels']) object(d[k],k);
  const b=d.brand;
  for(const k of ['name','mark','title','description','tagline','eyebrow','heroNote','heroAlt'])requireText(b[k],'brand.'+k,{max:k==='mark'?4:500});
  requireText(b.heroImage,'brand.heroImage',{max:200});
  if(!/^assets\/images\/[a-z0-9/_-]+\.webp$/i.test(b.heroImage)||b.heroImage.includes('..'))throw new Error('brand.heroImage must use assets/images/*.webp');
  const t=d.theme;
  for(const k of ['ink','paper','paperMuted','accent','white','dark','servicesBackground','faqBackground']){
    if(typeof t[k]!=='string'||!/^#[a-f0-9]{6}$/i.test(t[k]))throw new Error('Invalid color theme.'+k+'; use #RRGGBB');
  }
  const contrastPairs=[
    ['ink','paper'],['ink','white'],['ink','paperMuted'],['ink','servicesBackground'],['ink','faqBackground'],
    ['ink','accent'],['white','dark'],['accent','dark']
  ];
  for(const [text,bg] of contrastPairs){
    const ratio=contrastRatio(t[text],t[bg]);
    if(ratio<4.5)throw new Error('WCAG contrast theme.'+text+' / theme.'+bg+' is '+ratio.toFixed(2)+':1; needs >= 4.5:1');
  }
  // Some secondary text in the dark sections retains a fixed muted-light color.
  for(const fixed of ['#d2d8cc','#fffef9']){
    const ratio=contrastRatio(fixed,t.dark);
    if(ratio<4.5)throw new Error('WCAG contrast fixed '+fixed+' / theme.dark needs >= 4.5:1');
  }
  for(const key of ['services','portfolio','faq']){
    object(d[key],key);
    for(const field of ['heading','intro'])requireText(d[key][field],key+'.'+field,{max:500});
    array(d[key].items,key+'.items');
  }
  d.services.items.forEach((item,i)=>{
    const path='services.items['+i+']';object(item,path);
    for(const k of ['title','description','tag'])requireText(item[k],path+'.'+k,{max:500});
  });
  d.portfolio.items.forEach((item,i)=>{
    const path='portfolio.items['+i+']';object(item,path);
    for(const k of ['title','category','description','artAlt'])requireText(item[k],path+'.'+k,{max:500});
    if(!['residence','cafe','workspace'].includes(item.art))throw new Error(path+'.art must be a supported illustration');
    for(const k of ['featured','caseStudy'])if(typeof item[k]!=='boolean')throw new Error(path+'.'+k+' must be boolean');
  });
  const linked=d.portfolio.items.filter(x=>x.caseStudy);
  if(linked.length!==1)throw new Error('portfolio.items requires exactly one caseStudy=true');
  const c=d.caseStudy;
  for(const k of ['name','heading','lead','label'])requireText(c[k],'caseStudy.'+k,{max:500});
  if(linked[0].title!==c.name)throw new Error('caseStudy.name must match title of project with caseStudy=true');
  array(c.stages,'caseStudy.stages');
  c.stages.forEach((item,i)=>{
    const path='caseStudy.stages['+i+']';object(item,path);
    requireText(item.title,path+'.title',{max:150});
    requireText(item.description,path+'.description',{max:500});
  });
  d.faq.items.forEach((item,i)=>{
    const path='faq.items['+i+']';object(item,path);
    requireText(item.question,path+'.question',{max:250});
    requireText(item.answer,path+'.answer',{max:800});
  });
  for(const k of ['heading','intro','demoLabel'])requireText(d.contact[k],'contact.'+k,{max:500});
  object(d.contact.whatsapp,'contact.whatsapp');object(d.contact.email,'contact.email');
  const wa=d.contact.whatsapp,em=d.contact.email;
  if(typeof wa.enabled!=='boolean'||typeof em.enabled!=='boolean')throw new Error('contact enabled flags must be boolean');
  if(typeof wa.number!=='string'||typeof em.address!=='string')throw new Error('contact numbers and addresses must be strings');
  requireText(wa.message,'contact.whatsapp.message',{max:500});
  requireText(em.subject,'contact.email.subject',{max:250});
  if(wa.enabled&&!/^[1-9][0-9]{7,14}$/.test(wa.number))throw new Error('contact.whatsapp.number must be 8-15 international digits');
  if(em.enabled){
    const emailPattern=/^[A-Za-z0-9](?:[A-Za-z0-9._+-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
    if(em.address.length>254||em.address.split('@')[0].length>64||em.address.split('@')[0].includes('..')||!emailPattern.test(em.address))
      throw new Error('contact.email.address must be a valid conventional ASCII email');
  }
  const labels=['heroPrimary','heroSecondary','scrollCue','portfolioReadCase','portfolioPending','caseBack','caseIndex','servicesIndex','portfolioIndex','faqIndex','contactIndex','contactPanelTitle','contactPanelInfo','contactWhatsApp','contactEmail','contactUnavailable','contactHint'];
  for(const key of labels)requireText(d.labels[key],'labels.'+key,{max:250});
}
