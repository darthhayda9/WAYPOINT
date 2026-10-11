/* WAYPOINT flight replay: QF128, 9-10 October 2026. Model, not ADS-B. */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const rad=Math.PI/180;
const from={lat:22.308,lng:113.9185},to={lat:-33.9461,lng:151.1772};
function at(p){
  const a=from.lat*rad,b=from.lng*rad,c=to.lat*rad,d=to.lng*rad;
  const x=[Math.cos(a)*Math.cos(b),Math.cos(a)*Math.sin(b),Math.sin(a)],y=[Math.cos(c)*Math.cos(d),Math.cos(c)*Math.sin(d),Math.sin(c)];
  const omega=Math.acos(Math.max(-1,Math.min(1,x.reduce((v,z,i)=>v+z*y[i],0))));
  const n=Math.sin((1-p)*omega)/Math.sin(omega),m=Math.sin(p*omega)/Math.sin(omega);
  const v=x.map((z,i)=>n*z+m*y[i]);return {lat:Math.atan2(v[2],Math.hypot(v[0],v[1]))/rad,lng:Math.atan2(v[1],v[0])/rad};
}
const route=Array.from({length:141},(_,i)=>at(i/140));
let progress=.35,playing=false,timer=null,map=null,plane=null,trail=null,follow=false;
function content(){
 return [
 '<div class="wp3-page-head"><div><span class="wp3-eyebrow">FLIGHT OPERATIONS · PLAYBACK MODE</span><h1>See the journey.</h1><p>Explore QF128 from Hong Kong to Sydney. Scrub the route, follow the aircraft and inspect flight data.</p></div><span class="wp3-warning">Historical simulation · Not live</span></div>',
 '<div class="wp3-map-frame"><div class="wp3-map-toolbar"><div class="wp3-flight-id"><span class="wp3-q">Q</span><div><strong>QF128</strong><span>HKG → SYD <em>9–10 October 2026</em></span></div></div><div class="wp3-map-tools"><button id="wp3Recenter" class="wp3-outline">Fit route</button><button id="wp3Follow" class="wp3-outline">Follow: Off</button></div></div>',
 '<div class="wp3-real-map" id="wp3RealMap" role="application" aria-label="Interactive map of a simulated route from Hong Kong to Sydney"><div class="wp3-map-fallback"><svg viewBox="0 0 800 430" preserveAspectRatio="none"><rect width="800" height="430" fill="#cbdfe7"/><path d="M90 0 L430 0 405 85 345 100 310 153 264 190 240 225 202 210 175 120 112 83Z" fill="#e7ecdf" stroke="#aec8be" stroke-width="2"/><path d="M460 335 Q555 260 665 330 L770 370 705 430 494 430Z" fill="#e7ecdf" stroke="#aec8be" stroke-width="2"/><path d="M395 95 Q440 210 580 334" fill="none" stroke="#086a83" stroke-width="3" stroke-dasharray="6 7"/><circle cx="395" cy="95" r="6" fill="#0b3552"/><circle cx="580" cy="334" r="6" fill="#0b3552"/><text x="415" y="92" fill="#173c53" font-size="17">HKG</text><text x="600" y="355" fill="#173c53" font-size="17">SYD</text></svg><div class="wp3-fallback-note">Map tiles unavailable · replay still works</div><div class="wp3-fallback-plane" id="wp3FallbackPlane">✈</div></div></div>',
 '<div class="wp3-map-bottom"><div class="wp3-playback-head"><div><span class="wp3-label">FLIGHT REPLAY</span><strong id="wp3ReplayTime">09 Oct · 19:30 HKT</strong></div><span id="wp3Phase">Cruising</span></div><div class="wp3-scrub"><span>HKG</span><input id="wp3Slider" type="range" min="0" max="1000" step="1" value="350" aria-label="Scrub through QF128 flight" /><span>SYD</span></div><div class="wp3-map-footer"><div class="wp3-playback-actions"><button class="wp3-button-primary" id="wp3Play">▶ Play flight</button><button class="wp3-outline" id="wp3Reset">↺ Start over</button><span class="wp3-progress-label" id="wp3Percent">35% complete</span></div><span class="wp3-map-attribution">Modelled great-circle route · Not actual ADS-B data</span></div></div></div>',
 '<div class="wp3-telemetry"><div><small>PROGRESS</small><strong id="wp3Distance">35%</strong><span>Distance along route</span></div><div><small>ALTITUDE</small><strong id="wp3Altitude">35,000 ft</strong><span>Simulated</span></div><div><small>GROUND SPEED</small><strong id="wp3Speed">850 km/h</strong><span>Simulated</span></div><div><small>COORDINATES</small><strong id="wp3Coords">0°, 0°</strong><span>Calculated position</span></div></div>',
 '<div class="wp3-map-info"><div class="wp3-map-notice"><span class="wp3-information">i</span><div><strong>Playback, not live tracking</strong><p>QF128 on 9 October is a past flight. This is a mathematical reconstruction, not its actual recorded flight path. Scheduled departure is 19:30 HKT; speed and altitude are illustrative. With an aviation API, Waypoint can display real tracked positions and flight events.</p></div></div><div class="wp3-map-provider"><span>PRODUCTION CONNECTION</span><strong>Live aviation data</strong><small>FlightAware AeroAPI can provide current and historical tracks with a licensed API subscription.</small><button id="wp3ProviderInfo" class="wp3-link">What is required →</button></div></div>'
 ].join('');
}
function model(){
 const p=Math.max(0,Math.min(1,progress));
 let alt=p<.04?35000*p/.04:p>.96?35000*(1-p)/.04:35000+Math.sin(p*16)*220;
 const speed=p<.04?260+560*p/.04:p>.96?260+560*(1-p)/.04:848+17*Math.sin(p*12);
 return {p,pos:at(p),alt:Math.max(0,alt),speed,phase:p<.04?'Climbing':p>.96?'Descending':'Cruising',date:new Date(Date.UTC(2026,9,9,11,30)+p*555*60000)};
}
function stop(){playing=false;clearInterval(timer);timer=null;if($('#wp3Play'))$('#wp3Play').textContent='▶ Play flight'}
function update(){
 if(!$('#wp3Slider'))return;
 const m=model(),v=Math.round(m.p*100);
 const slider=$('#wp3Slider');slider.value=Math.round(m.p*1000);slider.style.setProperty('--flight-progress',v+'%');
 $('#wp3Percent').textContent=v+'% complete';$('#wp3Distance').textContent=v+'%';
 $('#wp3ReplayTime').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Hong_Kong',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(m.date)+' HKT';
 $('#wp3Phase').textContent=m.p===1?'Arrived (model)':m.phase;
 $('#wp3Altitude').textContent=Math.round(m.alt).toLocaleString('en-AU')+' ft';
 $('#wp3Speed').textContent=Math.round(m.speed)+' km/h';
 $('#wp3Coords').textContent=m.pos.lat.toFixed(2)+'°, '+m.pos.lng.toFixed(2)+'°';
 if(plane){plane.setLatLng([m.pos.lat,m.pos.lng]);if(follow)map.panTo([m.pos.lat,m.pos.lng],{animate:false})}
 if(trail)trail.setLatLngs(route.slice(0,Math.max(2,Math.floor(m.p*140)+1)).map(x=>[x.lat,x.lng]));
 const f=$('#wp3FallbackPlane');if(f){f.style.left=(49.4+23*m.p)+'%';f.style.top=(22+56*m.p)+'%'}
 if(m.p>=1)stop();
}
function play(){
 if(playing){stop();return}
 if(progress>=1)progress=0;
 playing=true;$('#wp3Play').textContent='Ⅱ Pause flight';
 timer=setInterval(()=>{progress=Math.min(1,progress+.0028);update()},150);
}
function createMap(){
 if(!window.L)return;
 try{
 const L=window.L;
 map=L.map('wp3RealMap',{scrollWheelZoom:false,zoomControl:true,preferCanvas:true});
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{minZoom:2,maxZoom:15,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
 const path=route.map(x=>[x.lat,x.lng]);
 L.polyline(path,{color:'#173c57',weight:4,opacity:.52,dashArray:'7 7'}).addTo(map);
 trail=L.polyline(path.slice(0,50),{color:'#057d8b',weight:5}).addTo(map);
 const airport=(x,code)=>L.marker([x.lat,x.lng],{icon:L.divIcon({className:'wp3-airport-pin',html:'<span class="wp3-airport-dot"></span><b>'+code+'</b>',iconSize:[70,32],iconAnchor:[8,16]})}).addTo(map);
 airport(from,'HKG');airport(to,'SYD');
 plane=L.marker([from.lat,from.lng],{icon:L.divIcon({className:'wp3-plane-pin',html:'<span class="wp3-plane-marker">✈</span>',iconSize:[44,44],iconAnchor:[22,22]})}).addTo(map);
 map.fitBounds([[from.lat,from.lng],[to.lat,to.lng]],{padding:[38,50],maxZoom:5,animate:false});
 setTimeout(()=>map.invalidateSize(),160);
 }catch(e){console.warn('Waypoint interactive map fallback',e.message)}
}
function init(){
 const section=$('#mapSection');if(!section)return;
 const page=document.createElement('div');page.id='wp3Map';page.innerHTML=content();section.prepend(page);section.classList.add('wp3-map-active');
 createMap();
 $('#wp3Slider').addEventListener('input',e=>{progress=Number(e.target.value)/1000;update()});
 $('#wp3Play').onclick=play;
 $('#wp3Reset').onclick=()=>{stop();progress=0;update()};
 $('#wp3Recenter').onclick=()=>{if(map){map.fitBounds([[from.lat,from.lng],[to.lat,to.lng]],{padding:[38,50],maxZoom:5});map.invalidateSize()}};
 $('#wp3Follow').onclick=()=>{follow=!follow;$('#wp3Follow').textContent='Follow: '+(follow?'On':'Off');if(follow&&map&&plane)map.setView(plane.getLatLng(),5)};
 $('#wp3ProviderInfo').onclick=()=>switchApp('integrations');
 document.querySelectorAll('[data-app="map"]').forEach(el=>el.addEventListener('click',()=>setTimeout(()=>map&&map.invalidateSize(),150)));
 window.addEventListener('hashchange',()=>{if(location.hash==='#app/map')setTimeout(()=>map&&map.invalidateSize(),120)});
 update();
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();