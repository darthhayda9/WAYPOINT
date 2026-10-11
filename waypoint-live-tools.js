/* WAYPOINT — small practical live destination tools */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const HKG='Asia/Hong_Kong';
let rate=null, weather=null;
function clock(){
  const el=$('#exploreSection .destination-stat b');if(!el)return;
  try{el.textContent=new Intl.DateTimeFormat('en-AU',{timeZone:HKG,hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())}catch(e){el.textContent='—'}
}
function note(parent,id,html){
  let el=document.getElementById(id);if(!el){el=document.createElement('p');el.id=id;el.style.cssText='font-size:11px;line-height:1.5;color:#768f9e;margin-top:10px';parent.appendChild(el)}
  el.innerHTML=html;
}
function fxLabel(text){
  const head=$('#destOverview .tool-card:nth-child(2) h3');if(head)head.textContent=text;
}
function convert(){
 const output=$('#audOutput'),input=$('#hkdInput');if(!output||!input)return;
 const amount=Number(input.value);output.value=Number.isFinite(amount)&&amount>=0?(amount*(rate||0.2)).toFixed(2):'';
}
async function fx(){
 const wrapper=$('#destMoney .panel');if(!wrapper)return;
 const old=$('#destMoney .muted-text');
 if(old)old.textContent='Looking up HKD → AUD reference rate…';
 try{
   const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),7500);
   let result;
   try{const response=await fetch('https://open.er-api.com/v6/latest/HKD',{signal:ctrl.signal});if(!response.ok)throw Error('FX status '+response.status);result=await response.json()}finally{clearTimeout(timeout)}
   if(result.result!=='success'||!Number(result.rates?.AUD))throw Error('Invalid FX data');
   rate=Number(result.rates.AUD);convert();fxLabel('1 HKD ≈ A$'+rate.toFixed(3));
   if(old)old.textContent='Reference rate · '+new Date(result.time_last_update_unix*1000).toLocaleDateString('en-AU')+'. Your card provider may charge fees.';
   note(wrapper,'wp3FxCredit','Rate data by <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">ExchangeRate-API</a>. This is not a live trade quote.');
 }catch(err){
   rate=.20;convert();fxLabel('1 HKD ≈ A$0.20');
   if(old)old.textContent='Offline demonstration rate: 1 HKD ≈ A$0.20. Check your bank for the actual exchange rate.';
   note(wrapper,'wp3FxCredit','Exchange-rate provider is unavailable. Conversion uses an illustrative fallback, not current market data.');
 }
}
const conditions={0:'Clear skies',1:'Mostly clear',2:'Partly cloudy',3:'Cloudy',45:'Foggy',48:'Foggy',51:'Drizzle',53:'Drizzle',55:'Drizzle',61:'Rain',63:'Rain',65:'Heavy rain',71:'Snow',80:'Showers',81:'Showers',82:'Heavy showers',95:'Thunderstorms'};
async function getWeather(){
 const el=$('#exploreSection .destination-stat span'),head=$('#exploreSection .destination-stat');if(!el||!head)return;
 el.textContent='Weather loading…';
 try{
   const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),7500);
   let json;
   try{
     const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=22.3193&longitude=114.1694&current=temperature_2m,weather_code&timezone=Asia%2FHong_Kong',{signal:ctrl.signal});
     if(!r.ok)throw Error('Weather provider status '+r.status);json=await r.json();
   }finally{clearTimeout(timeout)}
   if(!json.current||!Number.isFinite(json.current.temperature_2m))throw Error('No weather');
   weather=json.current;
   el.textContent=Math.round(weather.temperature_2m)+'°C · '+(conditions[weather.weather_code]||'Forecast');
   note(head,'wp3WeatherCredit','Live weather data: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · model forecast, not airport observation');
 }catch(err){
   el.textContent='Weather temporarily unavailable';
   note(head,'wp3WeatherCredit','Weather connection unavailable. Time above is live.');
 }
}
function init(){
 const old=$('#hkdInput');if(old)old.oninput=convert;
 const localLabel=$('#exploreSection .destination-hero p');if(localLabel)localLabel.textContent='Practical tools for Hong Kong · sample destination';
 clock();setInterval(clock,60000);convert();
 fx();getWeather();
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();