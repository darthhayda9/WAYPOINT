/* WAYPOINT V2 — product experience + demo-safe trip/AI logic */
(function(){
  'use strict';
  var FREE_LIMIT=3;
  var q=function(s){return document.querySelector(s)};
  var qa=function(s){return Array.from(document.querySelectorAll(s))};
  var esc=function(s){return escapeHtml(String(s==null?'':s))};
  var paid=function(){return state.plan==='Monthly'||state.plan==='Annual'};
  var tripsUsed=function(){return Math.max(Number(state.wp2TripsUsed)||0,state.trips.filter(function(t){return Number(t.id)>3}).length)};
  var pendingTripCount=null;
  function go(section){switchApp(section);if(section==='dashboard')refreshHome();if(section==='more')refreshMore()}
  function migrate(){
    if(state.wp2Version===2)return;
    state.wp2TripsUsed=tripsUsed();
    state.plan='Free'; // V1's paid plan was unverified local demo state
    state.wp2Version=2;
    state.wp2Chat=[];
    save();
  }
  function tripProgress(){
    var used=Math.min(FREE_LIMIT,tripsUsed()),dots='';
    for(var i=0;i<FREE_LIMIT;i++)dots+='<i class="'+(i<used?'used':'')+'"></i>';
    return {used:used,remaining:FREE_LIMIT-used,dots:dots};
  }
  function refreshHome(){
    var p=tripProgress();
    var line=q('#wp2TripLine');if(line)line.textContent=paid()?'Unlimited trips · Pro demo':p.used+' of 3 free trips used';
    var info=q('#wp2TripHelp');if(info)info.textContent=paid()?'Subscription preview only · no charge made':p.remaining+' trip'+(p.remaining===1?'':'s')+' left to create free';
    var dots=q('#wp2TripDots');if(dots)dots.innerHTML=p.dots;
    var ref=q('#wp2RefundText');if(ref)ref.textContent=state.refundReceived?'Marked received in this demo':'Qantas refund email detected · amount unverified';
    var plan=q('#wp2PlanAction');if(plan)plan.textContent=paid()?'Manage plan':'View Pro';
    var hero=q('#wp2FlightStatus');if(hero)hero.textContent='SAMPLE FLIGHT';
  }
  function showPaywall(){
    modal('Your three free trips are used',
      '<div class="wp2-info-banner"><strong>Waypoint Free</strong> includes three trips you create. Your sample trips do not use your allowance.</div>'+
      '<p>You can still view and manage your trips. To add another, try the Waypoint Pro subscription flow.</p>'+
      '<p class="muted-text">This is an investor demo. Pro activation is simulated and does not charge money.</p>'+
      '<button class="primary full" id="wp2SeePlans">View Pro plans</button><button class="ghost full" style="margin-top:9px" id="wp2NotNow">Not now</button>');
  }
  function startNewTrip(){if(!paid()&&tripsUsed()>=FREE_LIMIT){showPaywall();return}tripModal()}
  function markupHome(){
    var host=q('#dashboardSection');if(!host)return;
    var home=document.createElement('div');home.id='wp2Dashboard';
    home.innerHTML=
      '<div class="wp2-head"><div><div class="wp2-eyebrow">Your travel, one place</div><h1>Travel, without the chaos.</h1><p>Everything for your trip. Only what matters right now.</p></div>'+
      '<div class="wp2-actions"><button class="ghost" data-wp2-go="trips">All trips</button><button class="primary" id="wp2AddTrip">+ New trip</button></div></div>'+
      '<div class="wp2-info-banner"><strong>Investor demo</strong> · Example bookings, times, weather and aircraft positions. No airline or inbox is connected. QF128 is a historical sample, not an upcoming live flight.</div>'+
      '<div class="wp2-hero-grid"><div class="wp2-flight">'+
      '<div class="wp2-card-top"><span class="wp2-eyebrow">Featured sample itinerary</span><span class="wp2-pill" id="wp2FlightStatus">SAMPLE FLIGHT</span></div>'+
      '<h2>Hong Kong to Sydney</h2>'+
      '<div class="wp2-route"><div><strong>HKG</strong><small>Hong Kong</small><span class="wp2-route-time">19:30</span><small>9 Oct 2026</small></div><div class="wp2-route-mid">✈</div><div><strong>SYD</strong><small>Sydney</small><span class="wp2-route-time">07:45</span><small>10 Oct 2026</small></div></div>'+
      '<div class="wp2-flight-foot"><div class="wp2-details"><b>QF128</b> · Terminal 1 · Seat 40D<br>Sample itinerary · information is not live</div><button class="light-btn" data-wp2-go="flight">Flight details →</button></div></div>'+
      '<div class="wp2-side"><div class="wp2-status-card"><div><div class="wp2-eyebrow">One thing to check</div><h3>Paid-seat refund</h3><p id="wp2RefundText">Qantas refund email detected · amount unverified</p></div><button class="wp2-inline" data-wp2-go="money">Open refund tracker →</button></div>'+
      '<div class="wp2-plan"><div><b id="wp2TripLine">0 of 3 free trips used</b><small id="wp2TripHelp">Three trips free to create</small><div class="wp2-dots" id="wp2TripDots"></div></div><button class="ghost small-btn" data-wp2-go="billing" id="wp2PlanAction">View Pro</button></div></div></div>'+
      '<div class="wp2-subhead"><div><h2>What would you like to do?</h2><p>Jump straight to the task you need.</p></div></div>'+
      '<div class="wp2-action-grid">'+
      '<button class="wp2-action" data-wp2-go="assistant"><span class="wp2-icon">✦</span><strong>Ask Waypoint</strong><span>Get answers based on your demo trip details.</span></button>'+
      '<button class="wp2-action" data-wp2-go="map"><span class="wp2-icon">⌖</span><strong>Flight map</strong><span>Explore the simulated aircraft route.</span></button>'+
      '<button class="wp2-action" data-wp2-go="explore"><span class="wp2-icon">◉</span><strong>Destination tools</strong><span>eSIM, money, transport and essentials.</span></button></div>'+
      '<div class="wp2-below"><div class="wp2-next"><h3>Your trip essentials</h3>'+
      '<div class="wp2-row"><div><b>Itinerary</b><br><small>Flights and saved trips</small></div><button data-wp2-go="trips">Open →</button></div>'+
      '<div class="wp2-row"><div><b>Money & refunds</b><br><small>Expenses and what you may be owed</small></div><button data-wp2-go="money">Open →</button></div>'+
      '<div class="wp2-row"><div><b>Travel ID</b><br><small>Fake passport autofill demonstration</small></div><button data-wp2-go="travelid">Open →</button></div></div>'+
      '<div class="wp2-next"><h3>Travel smarter</h3><p style="color:#aebfd2;font-size:13px;line-height:1.65">Waypoint is built around post-booking intelligence: changes, extra charges, refunds and the next action to take.</p>'+
      '<div class="wp2-row"><div><b>Make it yours</b><br><small>Hide features you do not need</small></div><button data-wp2-go="customize">Customize →</button></div>'+
      '<div class="wp2-row"><div><b>Account & billing</b><br><small>Three free trips, then Pro</small></div><button data-wp2-go="billing">Plans →</button></div></div></div>';
    host.insertBefore(home,host.firstChild);host.classList.add('wp2-ready');
  }
  function markupMore(){
    var sec=document.createElement('section');sec.id='moreSection';sec.className='app-section';
    var items=[
      ['explore','◉','Explore destination','eSIM, currency, transit and essentials'],
      ['money','$','Money & refunds','Track spending and refunds'],
      ['travelid','▣','Travel ID','Fake passport and autofill demo'],
      ['loyalty','◇','Points & loyalty','Preview of planned rewards tools'],
      ['notifications','◌','Alerts','Flight, refund and trip notifications'],
      ['customize','◫','Customize','Show only the tools you want'],
      ['settings','⚙','Settings','Profile and data settings'],
      ['billing','↗','Plans & billing','Three free trips, then Pro']
    ];
    sec.innerHTML='<div class="wp2-more-intro"><div class="wp2-eyebrow">Your Waypoint</div><h2>Everything else, in one place.</h2><p>Keep the main app simple. Open any tool when you need it.</p></div><div class="wp2-more-grid">'+items.map(function(it){return '<button class="wp2-more-card" data-wp2-go="'+it[0]+'"><span class="wp2-icon">'+it[1]+'</span><span><b>'+it[2]+'</b><small>'+it[3]+'</small></span><span class="wp2-arrow">→</span></button>'}).join('')+'</div>';
    q('.app-content').appendChild(sec);
    var nav=document.createElement('button');nav.setAttribute('data-app','more');nav.innerHTML='<span>☷</span>More';q('.app-nav').appendChild(nav);nav.addEventListener('click',function(){go('more')});
    titles.more=['More','Tools, preferences and account'];
  }
  function refreshMore(){
    var links=qa('.wp2-more-card');links.forEach(function(btn){
      var feature=btn.getAttribute('data-wp2-go');var restricted=['explore','money','travelid','loyalty','notifications'].includes(feature);
      var off=restricted&&state.features&&state.features[feature]===false;
      btn.style.opacity=off?'.76':'1';
    });
  }
  function billing(){
    var intro=q('#billingSection .section-actions-row p');if(intro)intro.textContent='Use three trips for free. Membership unlocks unlimited trips. Payments shown here are simulated.';
    var grid=q('#billingSection .pricing-grid');if(!grid)return;
    grid.innerHTML=
      '<article class="price-card"><div class="price-name">Free</div><div class="price">A$0</div><p>Three trips you create, forever.</p><ul><li>Full trip organization</li><li>Demo flight map and destination tools</li><li>Refund tracker and travel assistant demo</li></ul><button class="ghost full wp2-plan-choice" data-plan="Free">Use Free</button></article>'+
      '<article class="price-card featured"><div class="popular">BEST VALUE</div><div class="price-name">Pro · Annual</div><div class="price">A$24.99 <small>/ year</small></div><p>Made for people who keep travelling.</p><ul><li>Unlimited trips</li><li>Everything in Free</li><li>Future connected travel intelligence</li></ul><button class="primary full wp2-plan-choice" data-plan="Annual">Preview Annual Pro</button></article>'+
      '<article class="price-card"><div class="price-name">Pro · Monthly</div><div class="price">A$4.99 <small>/ month</small></div><p>Stay flexible.</p><ul><li>Unlimited trips</li><li>Everything in Free</li><li>Cancel anytime when real billing launches</li></ul><button class="ghost full wp2-plan-choice" data-plan="Monthly">Preview Monthly Pro</button></article>';
    var note=document.createElement('div');note.className='wp2-info-banner';note.style.marginTop='16px';
    note.innerHTML='<strong>Demo billing only.</strong> No payments are collected. A real launch requires Stripe, account authentication and server-verified subscription access.';
    grid.after(note);
    renderBilling();
  }
  function pickPlan(plan){
    if(plan==='Free'){state.plan='Free';save();renderAll();refreshHome();toast('Free demo plan active');return}
    var amount=plan==='Annual'?'A$24.99 per year':'A$4.99 per month';
    modal('Preview Waypoint Pro','<div class="wp2-info-banner"><strong>Test only</strong> · This does not charge your card and does not create a real subscription.</div>'+
      '<div class="checkout-summary"><div class="row"><span>Waypoint Pro · '+esc(plan)+'</span><b>'+amount+'</b></div></div>'+
      '<p>Preview unlimited trips with the '+esc(plan.toLowerCase())+' plan. Real checkout is not connected yet.</p>'+
      '<button class="primary full" id="wp2ActivatePlan" data-plan="'+esc(plan)+'">Activate Pro demo</button>');
  }
  function improveOnboarding(){
    var old=onboarding;
    onboarding=function(){
      old();
      var s=q('#obPlan');if(s){s.innerHTML='<option value="Free">Free · 3 trips included</option>';s.value='Free'}
    };
    q('#headerCta').onclick=onboarding;q('#heroStart').onclick=onboarding;
  }
  function fallbackAI(question){
    var s=question.toLowerCase();
    var last=(state.wp2Chat||[]).filter(function(x){return x.role==='user'}).slice(-2).map(function(x){return x.content.toLowerCase()}).join(' ');
    if(/\b(refund|seat|money owed|reimburse|chargeback|ancillary)\b/.test(s)||(s.includes('what about')&&/refund|seat/.test(last))){
      return state.refundReceived?'Your sample paid-seat refund is marked as received in this browser. The sample expense was around A$100; the email does not establish an exact refund amount.':'Your example itinerary shows an extra-legroom seat purchased before a flight change. The Qantas email says an eligible refund was processed separately, but its amount and bank arrival are not confirmed. Check the original payment method and match the transaction in Money → Refund watch.'}
    if(/\b(where|location|track|map|altitude|speed)\b/.test(s)&&/\b(plane|flight|qf|aircraft|now|route)\b/.test(s)){
      return 'Open the Flight map to explore QF128 from Hong Kong to Sydney. The moving plane, altitude, speed and ETA are simulated for this demonstration, not an actual live aircraft position.'}
    if(/\b(delay|cancel|gate|terminal|departure|arrival|qf128|boarding)\b/.test(s)){
      return 'The example QF128 itinerary departed Hong Kong Terminal 1 at 19:30 on 9 October 2026, arriving Sydney Terminal 1 at 07:45 on 10 October. Seat 40D; demo gate 23. Any current delay, gate or flight-status information needs a live airline feed, which is not connected.'}
    if(/\b(checklist|prepare|before flight|passport|pack|ready|documents|check in)\b/.test(s)){
      return 'Before an international trip: confirm passport validity and entry rules using official sources, check in with the airline, save your boarding pass, confirm baggage allowance, review your gate closer to departure and arrange airport transport. Travel ID in this demo uses fake passport data only.'}
    if(/\b(leave|reach|airport|transport|express|taxi|bus)\b/.test(s)){
      return 'For a 19:30 international departure from HKG, a useful planning target is arriving roughly three hours early, around 16:30. Leave enough time for your actual starting location and traffic. The Hong Kong destination pack includes sample train, taxi and bus options; verify costs and schedules before relying on them.'}
    if(/\b(esim|sim|internet|data|roam|wifi|connectivity)\b/.test(s)){
      return 'The eSIM page links to Saily, but the demo does not have a personalized referral URL yet. Compare coverage, allowed hotspot usage, data allowance and activation timing. The fictional providers in the demo are not real offers.'}
    if(/\b(hkd|aud|exchange|currency|cash|convert|rate|octopus|pay)\b/.test(s)){
      return 'The destination pack has a HKD → AUD calculator using a fixed demonstration rate of 1 HKD = A$0.20. It is not a live exchange quote. In Hong Kong, Octopus is often useful for public transport; be mindful of dynamic currency conversion on card terminals.'}
    if(/\b(points|loyalty|miles|avios|rewards|redeem)\b/.test(s)){
      return 'A unified loyalty wallet is on the Waypoint roadmap. This demo does not access real reward balances or award availability, so I cannot reliably compare a redemption yet.'}
    if(/\b(trip|itinerary|booking|plans|travel)\b/.test(s)){
      return 'Your sample trips include Hong Kong → Sydney, Sydney → Singapore, and a Melbourne weekend. You can create and remove your own trips under Trips. Three user-created trips are included on Free; sample trips do not count.'}
    if(/\b(hi|hello|hey|help)\b/.test(s)){
      return 'Hi! I can discuss your example bookings, refund, trip checklist, airport timing, eSIMs, travel money and the flight map. I am using demo answers until a real AI provider is configured.'}
    return 'I can help you reason through your itinerary, refunds, preparation, loyalty and destination needs using this demo’s saved information. I cannot verify live flights, prices, bookings or passport requirements here. Could you tell me what part of your trip you want help with?';
  }
  var aiBusy=false;
  function addMessage(role,text){var el=document.createElement('div');el.className='chat-msg '+(role==='user'?'user':'ai');el.textContent=text;q('#chatMessages').appendChild(el);q('#chatMessages').scrollTop=q('#chatMessages').scrollHeight;return el}
  function initAI(){
    q('#assistantSection .assistant-side p').textContent='A conversational travel assistant grounded in your sample itinerary. Real AI can be connected through the server.';
    var head=q('#assistantSection .chat-head span.badge');if(head){head.textContent='DEMO MODE';head.className='wp2-demo-tag'}
    var note=document.createElement('p');note.className='wp2-ai-note';note.id='wp2AIStatus';
    note.textContent='Answers are locally generated unless a server AI key is configured. No real booking, email or passport is sent.';
    q('.chat-panel .chat-head').after(note);
    var input=q('#chatInput');input.placeholder='Ask anything about your trip…';
    var prompts=['What changed with my seat refund?','Help me prepare for my flight','Where is the plane right now?','How does the 3-trip limit work?'];
    qa('.suggestion').forEach(function(b,i){b.textContent=prompts[i]||b.textContent;b.onclick=function(){sendAI(b.textContent)}});
    q('#chatSend').onclick=function(){sendAI()};
    input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.stopImmediatePropagation();sendAI()}},true);
    var cached=Array.isArray(state.wp2Chat)?state.wp2Chat.slice(-24):[];
    cached.forEach(function(m){if(['user','assistant'].includes(m.role))addMessage(m.role,m.content)});
    q('#chatMessages').scrollTop=q('#chatMessages').scrollHeight;
    var mapAsk=q('#mapAskAiBtn');if(mapAsk)mapAsk.onclick=function(){go('assistant');sendAI('Where is QF128 right now on the map?')};
    var pointsAsk=q('#askPointsBtn');if(pointsAsk)pointsAsk.onclick=function(){go('assistant');sendAI('How can Waypoint help me use my points?')};
  }
  var aiQueuedQuestion='';
  function showAIUnlock(){
    modal('Unlock live AI',
      '<p>Waypoint can use a real AI model for open-ended travel questions during the investor demo. Enter the access code provided by the demo owner.</p>'+
      '<label>Investor access code<input id="wpAIInvestorCode" type="password" autocomplete="off" placeholder="Access code"></label>'+
      '<p class="muted-text" style="font-size:12px">This code is held only in the current browser session. Never enter an OpenAI API key here.</p>'+
      '<button class="primary full" id="wpAIApplyCode">Continue to AI</button>');
  }
  function aiGateInit(){
    var head=q('#assistantSection .chat-head');
    if(!head)return;
    var button=document.createElement('button');
    button.className='ghost small-btn';
    button.id='wpAIUnlockButton';
    button.textContent='Unlock live AI';
    button.addEventListener('click',showAIUnlock);
    head.appendChild(button);
    document.addEventListener('click',function(e){
      if(e.target.id==='wpAIApplyCode'){
        var code=q('#wpAIInvestorCode')?.value.trim()||'';
        if(code.length<14){toast('Enter your complete investor access code');return}
        sessionStorage.setItem('waypointInvestorCode',code);
        closeModal();
        button.textContent='Change access code';
        if(aiQueuedQuestion){var next=aiQueuedQuestion;aiQueuedQuestion='';sendAI(next)}
        else toast('Access code saved for this session. Ask a question to verify it.');
      }
    });
    var key=sessionStorage.getItem('waypointInvestorCode');
    if(key)button.textContent='Change access code';
    var status=q('#wp2AIStatus');
    if(status)status.textContent='Real AI requires an investor access code. If unavailable, the local demo assistant still works without one.';
  }
  async function sendAI(prefill){
    if(aiBusy)return;
    var input=q('#chatInput'),question=String(prefill||input.value||'').trim().slice(0,900);
    if(!question)return;
    if(!sessionStorage.getItem('waypointInvestorCode')){
      aiQueuedQuestion=question;showAIUnlock();return;
    }
    input.value='';addMessage('user',question);state.wp2Chat=state.wp2Chat||[];
    state.wp2Chat.push({role:'user',content:question});state.wp2Chat=state.wp2Chat.slice(-24);save();
    aiBusy=true;q('#chatSend').disabled=true;
    var msg=addMessage('assistant','Thinking…');
    var answer='',real=false;
    try{
      var recent=state.wp2Chat.slice(-12).map(function(m){return {role:m.role,content:m.content}});
      var context={tripCount:state.trips.length,trips:state.trips.slice(0,8).map(function(t){return {title:t.title,route:t.route,dates:t.dates,flight:t.flight}}),refundReceived:!!state.refundReceived,flightStatus:'Sample flight — no live data',homeCurrency:state.profile.currency};
      var controller=new AbortController();var tm=setTimeout(function(){controller.abort()},12000);
      try{
        var r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json','x-waypoint-demo-code':sessionStorage.getItem('waypointInvestorCode')||''},body:JSON.stringify({messages:recent,context:context}),signal:controller.signal});
        if(r.ok){var body=await r.json();if(body&&typeof body.reply==='string'&&body.reply.length){answer=body.reply.slice(0,5000);real=body.mode==='ai'}}
        else if(r.status===401){sessionStorage.removeItem('waypointInvestorCode');answer='That investor access code was not accepted. Select Unlock live AI and enter the correct code to retry.';var unlock=q('#wpAIUnlockButton');if(unlock)unlock.textContent='Unlock live AI';}
        else if(r.status===429){answer='This investor demo has reached its AI usage limit for now. You can still use the trip and travel tools without the model.';}
        else if(r.status===503){answer='The real AI connection has not been fully enabled yet. Please check the production environment settings.';}
        else if(r.status===502){answer='The AI provider could not complete that request. Check the OpenAI project billing and try again.';}
      }finally{clearTimeout(tm)}
    }catch(e){}
    if(!answer)answer=fallbackAI(question);
    msg.textContent=answer;
    state.wp2Chat.push({role:'assistant',content:answer});state.wp2Chat=state.wp2Chat.slice(-24);save();
    var status=q('#wp2AIStatus');if(status)status.textContent=real?'AI response generated from sample trip context. Verify live travel information independently.':'Demo response from local travel knowledge. Configure the server AI integration for open-ended model answers.';
    var badge=q('#assistantSection .chat-head .wp2-demo-tag');if(badge)badge.textContent=real?'AI CONNECTED':'DEMO MODE';
    q('#chatMessages').scrollTop=q('#chatMessages').scrollHeight;aiBusy=false;q('#chatSend').disabled=false;
  }
  function checklist(){
    qa('#flightSection .checklist input').forEach(function(el,i){el.checked=!!(state.wp2Checklist&&state.wp2Checklist[i]);el.addEventListener('change',function(){state.wp2Checklist=state.wp2Checklist||{};state.wp2Checklist[i]=el.checked;save()})});
  }
  function boot(){
    migrate();renderAll();markupHome();markupMore();billing();improveOnboarding();initAI();aiGateInit();checklist();
    var title=q('#assistantSection .chat-head b');if(title)title.textContent='Waypoint Concierge';
    var brand=q('.app-brand');if(brand&&!q('#wp2BrandLabel')){var tag=document.createElement('div');tag.id='wp2BrandLabel';tag.textContent='TRAVEL, SIMPLIFIED';brand.appendChild(tag)}
    q('#wp2AddTrip').addEventListener('click',startNewTrip);
    [q('#addTripBtn'),q('#addTripBtn2')].forEach(function(b){if(b)b.onclick=startNewTrip});
    document.addEventListener('click',function(e){
      var b=e.target.closest('[data-wp2-go]');if(b){e.preventDefault();go(b.getAttribute('data-wp2-go'))}
      if(e.target.id==='wp2SeePlans'){closeModal();go('billing')}
      if(e.target.id==='wp2NotNow')closeModal();
      if(e.target.id==='wp2ActivatePlan'){state.plan=e.target.dataset.plan;save();closeModal();renderAll();refreshHome();addNotification('✓','Pro demo activated','Unlimited trip access has been simulated; no payment was collected.','billing');toast('Pro preview active · no charge')}
      if(e.target.matches('.wp2-plan-choice'))pickPlan(e.target.getAttribute('data-plan'));
      if(e.target.closest('.delete-trip')||e.target.id==='resetDemoBtn'){setTimeout(function(){migrate();refreshHome()},0)}
      if(e.target.id==='saveTrip'&&pendingTripCount!=null){if(state.trips.length>pendingTripCount){state.wp2TripsUsed=Math.max(tripsUsed(),(Number(state.wp2TripsUsed)||0)+1);save();refreshHome()}pendingTripCount=null}
    });
    document.addEventListener('click',function(e){
      if(e.target.id==='saveTrip'){
        pendingTripCount=state.trips.length;
        if(!paid()&&tripsUsed()>=FREE_LIMIT){e.preventDefault();e.stopImmediatePropagation();pendingTripCount=null;showPaywall()}
      }
    },true);
    qa('#pricing .plan-btn').forEach(function(b){b.onclick=function(){pickPlan(b.dataset.plan)}});
    if(location.hash==='#app/more')switchApp('more',false);
    window.waypointRefreshHome=refreshHome;
    document.addEventListener('click',function(e){if(e.target.closest('[data-app="dashboard"]'))setTimeout(refreshHome,0)});
    refreshHome();refreshMore();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();