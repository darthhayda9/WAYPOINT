/* WAYPOINT brand review — three live-switchable SVG marks */
(function(){
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const options=[{id:'signature',file:'/waypoint-mark.svg',title:'Signature W',subtitle:'Simple, distinct and confident. A subtle waypoint dot.'},{id:'compass',file:'/waypoint-mark-compass.svg',title:'Compass',subtitle:'Directional, premium and immediately travel-oriented.'},{id:'route',file:'/waypoint-mark-route.svg',title:'Route',subtitle:'Motion and connection, approachable for everyday travellers.'}];
function apply(id){
 const x=options.find(o=>o.id===id)||options[0];
 state.wp3Logo=x.id;save();
 $$('.wp3-logo-icon').forEach(im=>im.src=x.file);
 const favicon=$('link[rel="icon"][type="image/svg+xml"]');if(favicon)favicon.href=x.file;
 $$('.wp3-brand-option').forEach(b=>b.classList.toggle('selected',b.dataset.logo===x.id));
 const sel=$('#wp3SelectedLogo');if(sel)sel.textContent='Selected: '+x.title;
}
function view(){
 const sec=document.createElement('section');sec.id='brandSection';sec.className='app-section';
 sec.innerHTML='<div class="wp3-main-head"><div><div class="wp3-eyebrow">WAYPOINT IDENTITY</div><h1>A simpler way forward.</h1><p>Three original marks built as clean, scalable vectors. Pick a direction for the investor presentation—nothing permanent is changed outside this browser.</p></div></div>'+
 '<div class="wp3-brand-grid">'+options.map(o=>'<button type="button" class="wp3-brand-option" data-logo="'+o.id+'"><span class="wp3-brand-visual"><img src="'+o.file+'" alt=""></span><strong>'+o.title+'</strong><small>'+o.subtitle+'</small><span class="wp3-choice">Choose mark →</span></button>').join('')+'</div>'+
 '<div class="wp3-brand-lockup"><div><span class="wp3-eyebrow">POSITIONING</span><h2>Make travel easier.<br>Keep more of your money.</h2><p>Three full trips free. One simple place for bookings, flight intelligence and the things that matter after you book.</p></div><div><strong>WAYPOINT</strong><span>Travel, simplified.</span><small id="wp3SelectedLogo"></small></div></div>';
 $('.app-content').appendChild(sec);
 titles.brand=['Brand studio','Select a premium logo direction'];
 const more=$('.wp2-more-grid');if(more){
  const btn=document.createElement('button');btn.className='wp2-more-card';btn.dataset.wp2Go='brand';
  btn.innerHTML='<span class="wp2-icon">◈</span><span><b>Brand studio</b><small>Explore three premium logo directions</small></span><span class="wp2-arrow">→</span>';
  more.appendChild(btn);
 }
 $$('.wp3-brand-option').forEach(btn=>btn.addEventListener('click',()=>apply(btn.dataset.logo)));
 apply(state.wp3Logo||'signature');
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',view):view();
})();