/* WAYPOINT V3: usable local booking import, manual points wallet, honest integrations */
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s)),esc=s=>escapeHtml(String(s==null?'':s));
function ensure(){
 state.wp3Wallet=Array.isArray(state.wp3Wallet)?state.wp3Wallet:[];
 state.wp3Imports=Array.isArray(state.wp3Imports)?state.wp3Imports:[];
 state.connections={gmail:false,qantas:false,marriott:false}; // old toggles never established OAuth
 state.connectedPrograms=[];
}
const icons={
 dashboard:'<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M9 21v-7h6v7"/>',
 trips:'<rect x="4" y="7" width="16" height="14" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 12h16"/>',
 map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
 assistant:'<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/><path d="m19 17 .8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17Z"/>',
 more:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>'
};
function vector(path){return '<svg class="wp3-nav-svg" viewBox="0 0 24 24" aria-hidden="true">'+path+'</svg>'}
function brand(){
 $$('.brand').forEach(el=>{
  const mark=el.querySelector('.brand-mark');if(mark)mark.innerHTML='<img class="wp3-logo-icon" src="/waypoint-mark.svg" alt="">';
 });
 const favicon=document.createElement('link');favicon.rel='icon';favicon.type='image/svg+xml';favicon.href='/waypoint-mark.svg';document.head.appendChild(favicon);
 Object.entries(icons).forEach(([name,path])=>{
  const nav=$('.app-nav button[data-app="'+name+'"]');if(nav){
    nav.innerHTML=vector(path)+'<span>'+({dashboard:'Home',trips:'Trips',map:'Flight map',assistant:'Concierge',more:'More'}[name])+'</span>';
  }
 });
 const profile=$('#profileButton');if(profile){
  const span=profile.querySelectorAll('span');if(span[1])span[1].textContent='Demo profile';
 }
 const brandLabel=$('#wp2BrandLabel');if(brandLabel)brandLabel.textContent='TRAVEL, SIMPLIFIED';
}
function banner(label,title,description){return '<div class="wp3-main-head"><div><span class="wp3-eyebrow">'+label+'</span><h1>'+title+'</h1><p>'+description+'</p></div></div>'}
function connectionsHTML(){
 return banner('YOUR CONNECTIONS','Bring everything together.','Import booking details today. Gmail and airline account integrations are ready to connect when production authorization is configured.')+
 '<div class="wp3-two"><div class="wp3-card"><div class="wp3-status">WORKING NOW · LOCAL IMPORT</div><h2 style="margin-top:12px">Import a booking</h2><p>Paste a travel confirmation or upload a .eml or .ics file. Waypoint extracts basic trip details and lets you review them before saving. The original message stays in your browser.</p>'+
 '<label class="wp3-field">Paste booking confirmation<textarea id="wp3EmailText" rows="8" placeholder="Booking confirmed&#10;QF128 HKG to SYD&#10;Departure: 9 October 2026&#10;Confirmation: Example123"></textarea></label>'+
 '<label class="wp3-field">Or choose an email / calendar file<input type="file" id="wp3EmailFile" accept=".eml,.txt,.ics,text/plain,text/calendar,message/rfc822"></label>'+
 '<div class="wp3-modal-actions"><button class="ghost" id="wp3Example">Try sample email</button><button class="primary" id="wp3ParseEmail">Review booking →</button></div></div>'+
 '<div class="wp3-card"><div class="wp3-status">ACCOUNT CONNECTIONS · SETUP REQUIRED</div><h2 style="margin-top:12px">Connected services</h2><p>Production services need explicit permission from the traveller. We never ask for airline passwords inside Waypoint.</p>'+
 '<div class="wp3-connector"><div class="wp3-connector-mark" style="color:#c94d44">M</div><div><strong>Gmail</strong><small>Automatic booking and refund detection</small></div><button class="ghost small-btn" id="wp3GmailHelp">Setup steps</button></div>'+
 '<div class="wp3-connector"><div class="wp3-connector-mark">Q</div><div><strong>Qantas Frequent Flyer</strong><small>Manual balances now · live access requires agreement</small></div><button class="ghost small-btn" id="wp3QantasHelp">Details</button></div>'+
 '<div class="wp3-connector"><div class="wp3-connector-mark">✈</div><div><strong>Flight data</strong><small>Historical replay now · API required for live data</small></div><button class="ghost small-btn" id="wp3FlightHelp">Details</button></div>'+
 '<div class="wp3-legal" style="margin-top:15px"><strong>Privacy first.</strong> The live connections are not enabled on this demo. Your manually entered trips and balances stay in this browser. No passwords or passport scans should be entered here.</div></div></div>'+
 '<div class="wp3-card" style="margin-top:15px"><h2>Imported trips</h2><p>Bookings you reviewed and saved from an email or calendar file.</p><div id="wp3Imports"></div></div>';
}
function loyaltyHTML(){
 return banner('YOUR REWARDS','Your points, without the guesswork.','A clean wallet for balances and tiers. Add programmes manually now; account syncing will require approved connections.')+
 '<div class="wp3-two"><div class="wp3-card"><h2>Your rewards wallet</h2><p>Keep balances in one place, track their source, and update them whenever you like.</p><div id="wp3Wallet"></div><button id="wp3AddWallet" class="primary" style="margin-top:14px">+ Add a programme</button></div>'+
 '<div class="wp3-card"><h2>Unlocking automatic sync</h2><p>Frequent-flyer airlines rarely offer open consumer balance APIs. We will pursue official partnerships where available and optionally detect statement information from emails a traveller authorizes.</p>'+
 '<div class="wp3-connector"><div class="wp3-connector-mark">01</div><div><strong>Manual wallet</strong><small>Save points, status and expiry now</small></div><span class="wp3-status" style="margin-left:auto">READY</span></div>'+
 '<div class="wp3-connector"><div class="wp3-connector-mark">02</div><div><strong>Statement intelligence</strong><small>Extract balances from permitted email content</small></div><span class="wp3-status" style="margin-left:auto">PLANNED</span></div>'+
 '<div class="wp3-connector"><div class="wp3-connector-mark">03</div><div><strong>Official API partners</strong><small>Real-time balances and tier status</small></div><span class="wp3-status" style="margin-left:auto">PARTNERSHIP</span></div>'+
 '<button class="ghost" id="wp3ConnectionsFromWallet" style="margin-top:18px">Read integration requirements →</button></div></div>';
}
function renderWallet(){
 const box=$('#wp3Wallet');if(!box)return;
 const list=state.wp3Wallet;
 box.innerHTML=list.length?list.map(w=>
  '<div class="wp3-list-row"><div class="wp3-connector-mark">◇</div><div><strong>'+esc(w.program)+'</strong><small>'+esc(w.tier||'Member')+' · Updated '+esc(w.updated)+' · Manually entered'+(w.expiry?' · Expiry '+esc(w.expiry):'')+'</small></div><div style="text-align:right"><div class="wp3-balance">'+Number(w.balance).toLocaleString('en-AU')+' pts</div><button class="wp3-remove" data-wp3-remove-wallet="'+w.id+'">Remove</button></div></div>').join(''):
  '<div class="wp3-empty">No accounts added yet. Add your first frequent-flyer programme to track points.</div>';
}
function renderImports(){
 const box=$('#wp3Imports');if(!box)return;
 box.innerHTML=state.wp3Imports.length?state.wp3Imports.map(x=>
  '<div class="wp3-list-row"><div class="wp3-connector-mark">✈</div><div><strong>'+esc(x.flight||x.route)+'</strong><small>'+esc(x.date)+' · '+esc(x.source)+' · Imported locally</small></div><span class="wp3-status">SAVED</span></div>').join(''):
  '<div class="wp3-empty">Nothing imported yet. Try the sample booking above.</div>';
}
function setupPages(){
 const sec=document.createElement('section');sec.id='integrationsSection';sec.className='app-section';sec.innerHTML=connectionsHTML();$('.app-content').appendChild(sec);
 const loyalty=$('#loyaltySection');if(loyalty){
   const fresh=document.createElement('div');fresh.id='wp3Loyalty';fresh.innerHTML=loyaltyHTML();loyalty.prepend(fresh);loyalty.classList.add('wp3-loyalty-active');
 }
 titles.integrations=['Connections','Import bookings and connect accounts'];
 titles.loyalty=['Points','Your rewards wallet'];
 titles.map=['Flight replay','QF128 · Historical simulation'];
 const more=$('.wp2-more-grid');
 if(more){
   const link=document.createElement('button');link.className='wp2-more-card';link.dataset.wp2Go='integrations';
   link.innerHTML='<span class="wp2-icon">↔</span><span><b>Connections</b><small>Import bookings, Gmail and flight data setup</small></span><span class="wp2-arrow">→</span>';
   more.prepend(link);
 }
 const trips=$('#tripsSection .section-actions-row');if(trips){
   const btn=document.createElement('button');btn.className='ghost';btn.textContent='↧ Import booking';btn.onclick=()=>switchApp('integrations');
   trips.appendChild(btn);
 }
 renderWallet();renderImports();
}
function walletModal(){
 modal('Add frequent flyer programme',
 '<p>Store just the balance information you want Waypoint to remember. Do not enter passwords or membership numbers here.</p>'+
 '<label>Programme<select id="wp3Program"><option>Qantas Frequent Flyer</option><option>Velocity Frequent Flyer</option><option>Singapore Airlines KrisFlyer</option><option>Cathay</option><option>British Airways Club (Avios)</option><option>Emirates Skywards</option><option>Marriott Bonvoy</option><option>Hilton Honors</option><option>American Express Membership Rewards</option><option>Other</option></select></label>'+
 '<div class="wp3-input-row"><label>Points balance<input type="number" id="wp3Balance" min="0" max="1000000000" step="1" value="25000"></label><label>Status / tier<input id="wp3Tier" maxlength="45" placeholder="Silver, Gold, Member…"></label></div>'+
 '<label>Expiry or review date (optional)<input id="wp3Expiry" type="date"></label><button class="primary full" id="wp3SaveWallet">Save account</button>');
}
function parseMail(txt){
 const s=String(txt||'').slice(0,70000).replace(/=\r?\n/g,'');
 const airlineMatch=s.match(/\b((?:QF|SQ|CX|VA|EK|BA|QR|JL|NH|UA|AA|DL|NZ|JQ|EY|AF)\s?-?\d{1,4})\b/i);
 const flight=airlineMatch?airlineMatch[1].replace(/[\s-]/g,'').toUpperCase():'Flight not identified';
 const two=s.match(/\b([A-Z]{3})\s*(?:to|→|—|-|\/|>)\s*([A-Z]{3})\b/i);
 const origin=s.match(/(?:from|origin|departure airport)\s*[:\-]?\s*([A-Z]{3})\b/i);
 const dest=s.match(/(?:to|destination|arrival airport)\s*[:\-]?\s*([A-Z]{3})\b/i);
 const route=two?two[1].toUpperCase()+' → '+two[2].toUpperCase():origin&&dest?origin[1].toUpperCase()+' → '+dest[1].toUpperCase():'Add airport codes';
 const date=s.match(/\b(\d{1,2}\s+[A-Za-z]{3,9}\s+20\d{2}|\d{4}[-/]\d{2}[-/]\d{2}|\d{1,2}[-/]\d{1,2}[-/]20\d{2})\b/);
 let dateText=date?date[1]:'Dates to confirm';
 if(s.includes('DTSTART:')){const ics=s.match(/DTSTART(?:;[^:]*)?:(\d{4})(\d{2})(\d{2})/);if(ics)dateText=ics[1]+'-'+ics[2]+'-'+ics[3]}
 const subject=s.match(/^Subject:\s*(.*)$/im),confirmation=s.match(/(?:reference|confirmation|booking ref|pnr)[:\s]+([A-Z0-9]{5,8})/i);
 return {flight,route,date:dateText,subject:subject?subject[1].slice(0,90):'',ref:confirmation?confirmation[1]:''};
}
let currentImport=null;
function reviewImport(source,txt){
 if(!txt.trim()){toast('Paste a booking email or choose a file');return}
 const record=parseMail(txt);currentImport={record,source};
 modal('Review your booking',
 '<div class="wp3-legal">Review everything before saving. Waypoint is extracting patterns locally; no email is uploaded to a server. Saving uses one of your three free trip credits.</div>'+
 '<label>Trip title<input id="wp3ImportedTitle" maxlength="100" value="'+esc(record.flight==='Flight not identified'?'Imported trip':record.flight+' itinerary')+'"></label>'+
 '<label>Flight<input id="wp3ImportedFlight" maxlength="24" value="'+esc(record.flight)+'"></label>'+
 '<label>Route<input id="wp3ImportedRoute" maxlength="40" value="'+esc(record.route)+'"></label>'+
 '<label>Date<input id="wp3ImportedDate" maxlength="70" value="'+esc(record.date)+'"></label>'+
 '<button class="primary full" id="wp3CommitImport">Save imported trip</button>');
}
function saveImport(){
 if(!currentImport)return;
 const paid=state.plan==='Annual'||state.plan==='Monthly';
 const used=Math.max(Number(state.wp2TripsUsed)||0,state.trips.filter(t=>Number(t.id)>3).length);
 if(!paid&&used>=3){closeModal();modal('Three free trips used','<p>Upgrade to Pro to import more trips.</p><button class="primary full" id="wp3Upgrade">View plan options</button>');return}
 const name=$('#wp3ImportedTitle').value.trim()||'Imported trip';
 const flight=$('#wp3ImportedFlight').value.trim().slice(0,24)||'Unknown';
 const route=$('#wp3ImportedRoute').value.trim().slice(0,40)||'Unspecified route';
 const dates=$('#wp3ImportedDate').value.trim().slice(0,70)||'Dates TBD';
 const id=Date.now();state.trips.unshift({id,title:name.slice(0,100),flight,route,dates,status:'Upcoming'});
 state.wp2TripsUsed=used+1;
 state.wp3Imports.unshift({id,flight,route,date:dates,source:currentImport.source});
 state.wp3Imports=state.wp3Imports.slice(0,40);save();renderTrips();renderImports();
 if(typeof refreshHome==='function')refreshHome();
 closeModal();currentImport=null;toast('Booking imported into Trips');switchApp('trips');
}
function info(type){
 const records={
  gmail:['Connect Gmail the right way','Google Cloud Console → create a project → enable the Gmail API → configure OAuth consent and verified domain → add your server callback → store client ID and client secret in Vercel environment variables. A secure backend exchanges tokens and fetches travel-related mail with gmail.readonly. Google classifies this as restricted: verification and potentially a security assessment are required for public use. For Friday, use the local booking importer instead.'],
  qantas:['Frequent flyer sync','Automatic Qantas Frequent Flyer balances need an approved Qantas integration or contractual provider access; it is not appropriate to request airline passwords or scrape private accounts. Until approved, use the fully working manual loyalty wallet. Emails from users who authorize Gmail may help identify balance statements, but they cannot guarantee up-to-date balances.'],
  flight:['Live flight data','For actual aircraft positions and past flight tracks, contract with FlightAware AeroAPI or another licensed provider. Add an API key only in Vercel server settings and create a cacheable backend for positions. The 9 October QF128 sample is historical, so replay a real historical track only after paying for and retrieving it.'],
 };
 const o=records[type];modal(o[0],'<p>'+esc(o[1])+'</p><button class="primary full" id="wp3CloseHelp">Got it</button>');
}
const sample='Subject: Your Qantas booking confirmation\nPassenger: ALEX MORGAN\nFlight: QF128\nRoute: HKG to SYD\nDeparture: 9 October 2026\nArrival: 10 October 2026\nBooking reference: DEMO12\nThis is fictional sample booking data for product demonstration.';
function events(){
 document.addEventListener('click',e=>{
 const t=e.target;
 if(t.id==='wp3AddWallet'){walletModal();return}
 if(t.id==='wp3SaveWallet'){
   const program=$('#wp3Program').value,number=Number($('#wp3Balance').value);
   if(!Number.isInteger(number)||number<0||number>1e9){toast('Enter a valid points balance');return}
   state.wp3Wallet.unshift({id:Date.now(),program,tier:$('#wp3Tier').value.trim().slice(0,45),balance:number,expiry:$('#wp3Expiry').value,updated:new Date().toLocaleDateString('en-AU')});
   save();renderWallet();closeModal();toast('Balance saved');return
 }
 const rem=t.closest('[data-wp3-remove-wallet]');if(rem){state.wp3Wallet=state.wp3Wallet.filter(w=>String(w.id)!==rem.dataset.wp3RemoveWallet);save();renderWallet();toast('Account removed');return}
 if(t.id==='wp3ConnectionsFromWallet'){switchApp('integrations');return}
 if(t.id==='wp3Example'){$('#wp3EmailText').value=sample;return}
 if(t.id==='wp3ParseEmail'){reviewImport('Pasted booking',$('#wp3EmailText').value);return}
 if(t.id==='wp3CommitImport'){saveImport();return}
 if(t.id==='wp3Upgrade'){closeModal();switchApp('billing');return}
 if(t.id==='wp3CloseHelp'){closeModal();return}
 if(t.id==='wp3GmailHelp')info('gmail');
 if(t.id==='wp3QantasHelp')info('qantas');
 if(t.id==='wp3FlightHelp')info('flight');
 });
 document.addEventListener('change',async e=>{
  if(e.target.id!=='wp3EmailFile')return;
  const file=e.target.files[0];if(!file)return;
  if(file.size>1000000){toast('File must be smaller than 1 MB');e.target.value='';return}
  try{const body=await file.text();$('#wp3EmailText').value=body.slice(0,70000);toast('Booking file loaded · review details below')}catch(err){toast('Unable to read this file')}
 });
 // Block stale demo buttons that toggled fake OAuth connections.
 document.addEventListener('click',e=>{
  if(e.target.closest('.connect-btn')||e.target.closest('#connectProgramBtn')){
   e.preventDefault();e.stopImmediatePropagation();switchApp(e.target.id==='connectProgramBtn'?'loyalty':'integrations');
  }
 },true);
}
function init(){
 ensure();save();brand();setupPages();events();
 const existing=$('#assistantSection .chat-head b');if(existing)existing.textContent='Travel assistant';
 const subtitle=$('#assistantSection .assistant-side h2');if(subtitle)subtitle.textContent='Your travel assistant';
 const blurb=$('#assistantSection .assistant-side p');if(blurb)blurb.textContent='Clear answers for the trip you are planning. AI is optional; clarity comes first.';
 const mock=$('#flightSection .detail-flight-head .kicker');if(mock)mock.textContent='Qantas · QF128 · HISTORICAL EXAMPLE';
 const refresh=$('#refreshFlightBtn');if(refresh)refresh.textContent='↻ Simulate status change';
 if(location.hash==='#app/integrations')switchApp('integrations',false);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();