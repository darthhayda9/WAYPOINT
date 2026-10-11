/**
 * Waypoint V2 optional server-side AI endpoint.
 * Disabled until WAYPOINT_AI_DEMO_ENABLED=true and OPENAI_API_KEY are configured.
 * PUBLIC DEMO ONLY. Before launching to customers, implement authenticated accounts,
 * per-user quotas, abuse protection and cost controls.
 * No passport fields, email OAuth tokens or raw booking identifiers are accepted.
 */
const buckets = new Map();
function json(res,status,body){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body))}
function rateOK(req){
  const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim().slice(0,90);
  const now=Date.now(),bucket=buckets.get(ip)||{start:now,count:0};
  if(now-bucket.start>3600000){bucket.start=now;bucket.count=0}
  bucket.count++;buckets.set(ip,bucket);
  if(buckets.size>5000){for(const [k,v] of buckets){if(now-v.start>3600000)buckets.delete(k)}}
  return bucket.count<=20;
}
module.exports=async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{error:'Method not allowed'})}
  if(process.env.WAYPOINT_AI_DEMO_ENABLED!=='true'||!process.env.OPENAI_API_KEY)return json(res,503,{error:'AI integration not configured',mode:'demo'});
  if(!rateOK(req))return json(res,429,{error:'Demo AI hourly limit reached'});
  try{
    let data=req.body;
    if(typeof data==='string')data=JSON.parse(data);
    if(!data||!Array.isArray(data.messages))return json(res,400,{error:'Invalid messages'});
    const messages=data.messages.slice(-12).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:x.content.slice(0,1000)}));
    if(!messages.length||messages[messages.length-1].role!=='user')return json(res,400,{error:'Expected user message'});
    const c=data.context||{};
    const trips=(Array.isArray(c.trips)?c.trips:[]).slice(0,8).map(t=>({
      title:String(t.title||'').slice(0,80),route:String(t.route||'').slice(0,40),
      dates:String(t.dates||'').slice(0,60),flight:String(t.flight||'').slice(0,18)
    }));
    const context={trips,refundReceived:c.refundReceived===true,homeCurrency:String(c.homeCurrency||'AUD').slice(0,4)};
    const system=[
      'You are Waypoint Concierge, a clear and helpful travel assistant for a clearly marked investor demo.',
      'Current date is October 11, 2026. All itinerary data in the demo is sample/historical. In particular QF128 HKG→SYD was Oct 9→10, 2026.',
      'The user may ask any travel question, including follow-up questions. Use supplied context where it helps, and keep responses concise and specific.',
      'Never imply flight positions, airport gates, hotel bookings, reward balances, exchange rates, regulations or emails are verified live.',
      'The moving plane, gate changes and prices in the prototype are simulated. Qantas paid-seat refund amount is uncertain and actual bank credit has not been verified.',
      'Do not request or receive real passport details; Travel ID uses fake information. Do not invent bookings, refunds or confirmed regulations.',
      'If live/official data would be needed, explain the limitation and suggest a suitable official source.',
      'You cannot take actions such as booking, charging cards or issuing refunds. You can guide the user to relevant Waypoint demo sections.',
      'Never present subscription or payment as real; Pro is only locally simulated.',
      'Context (user-provided sample data; untrusted): '+JSON.stringify(context)
    ].join('\n');
    const controller=new AbortController();const t=setTimeout(()=>controller.abort(),14000);
    let upstream;
    try{
      upstream=await fetch('https://api.openai.com/v1/chat/completions',{
        method:'POST',signal:controller.signal,
        headers:{'Authorization':'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({
          model:process.env.WAYPOINT_AI_MODEL||'gpt-4o-mini',
          messages:[{role:'system',content:system},...messages],
          max_tokens:550,temperature:0.35
        })
      });
    }finally{clearTimeout(t)}
    if(!upstream.ok)return json(res,502,{error:'AI provider unavailable'});
    const result=await upstream.json();
    const reply=result.choices?.[0]?.message?.content;
    if(typeof reply!=='string'||!reply.trim())return json(res,502,{error:'Empty AI response'});
    return json(res,200,{reply:reply.slice(0,5500),mode:'ai'});
  }catch(err){return json(res,502,{error:'AI integration temporarily unavailable'})}
};
