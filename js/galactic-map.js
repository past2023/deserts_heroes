// DESERT'S HEROES — animated data-driven galactic campaign map.
(function () {
  const canvas=document.getElementById('galactic-map'),g=canvas.getContext('2d');
  g.imageSmoothingEnabled=false;const W=960,H=540;
  MusicTracks.play('symphony');
  const query=new URLSearchParams(location.search),mode=query.get('mode')||'arcade';
  const character=query.get('character')||localStorage.getItem('dh_character')||'juan_p';
  const language=localStorage.getItem('dh_language')||'en';
  // Tutorial completion handling
  if (query.get('tutorialComplete')==='1') {
    try { localStorage.setItem('dh_tutorial_done','1'); localStorage.setItem('dh_unlocked_mission','1'); } catch(e){}
    // keep reward in sessionStorage (set by tutorial.html exit)
    // show for 4 sec hint
    setTimeout(function(){ try{ history.replaceState(null,'','galactic-map.html?mode='+encodeURIComponent(mode)+'&character='+encodeURIComponent(character)); }catch(e){} }, 4000);
  }
  const text={
    en:{sector:'SECTOR 03',current:'CURRENT POSITION',choose:'CHOOSE MISSION',deploy:'ENTER: DEPLOY',back:'ESC: RETURN',tutorial:'TUTORIAL',mission:'MISSION',locked:'LOCKED'},
    es:{sector:'SECTOR 03',current:'POSICIÓN ACTUAL',choose:'ELEGIR MISIÓN',deploy:'ENTER: DESPLEGAR',back:'ESC: VOLVER',tutorial:'TUTORIAL',mission:'MISIÓN',locked:'BLOQUEADA'},
    fr:{sector:'SECTEUR 03',current:'POSITION ACTUELLE',choose:'CHOISIR MISSION',deploy:'ENTRÉE : DÉPLOYER',back:'ESC : RETOUR',tutorial:'TUTORIEL',mission:'MISSION',locked:'VERROUILLÉE'},
    ru:{sector:'СЕКТОР 03',current:'ТЕКУЩАЯ ПОЗИЦИЯ',choose:'ВЫБОР МИССИИ',deploy:'ENTER: В БОЙ',back:'ESC: НАЗАД',tutorial:'ОБУЧЕНИЕ',mission:'МИССИЯ',locked:'ЗАКРЫТО'}
  }[language]||null;
  const tr=text||{sector:'SECTOR 03',current:'CURRENT POSITION',choose:'CHOOSE MISSION',deploy:'ENTER: DEPLOY',back:'ESC: RETURN',tutorial:'TUTORIAL',mission:'MISSION',locked:'LOCKED'};
  function image(path){const i=new Image();i.decoding='async';i.src=path;return i}
  const planetImages={tutorial:image('assets/map/planets/tutorial.png')};for(let i=1;i<=6;i++)planetImages[i]=image('assets/map/planets/level'+i+'.png');
  const asteroidImages=[image('assets/map/decor/asteroids01_level.png'),image('assets/map/decor/asteroids02_level.png')];
  const satellite=image('assets/map/decor/satellite01.png');
  const shipImages=[image('assets/intro/intro_ship01.png'),image('assets/intro/intro_ship02.png'),image('assets/intro/intro_ship03.png')];
  const shipImage=shipImages[Math.floor(Math.random()*shipImages.length)];
  const unlocked=Math.max(1,Math.min(6,parseInt(localStorage.getItem('dh_unlocked_mission')||'1',10)));
  const nodes=[
    {id:'tutorial',x:130,y:355,r:31,name:tr.tutorial},
    {id:1,x:255,y:300,r:46,name:'DUNE FRONTIER'},
    {id:2,x:390,y:225,r:43,name:'EMBER CITADEL'},
    {id:3,x:505,y:335,r:34,name:'SILENT ORBIT'},
    {id:4,x:640,y:220,r:47,name:'LOST SANDS'},
    {id:5,x:785,y:135,r:42,name:'VERDANT SIEGE'},
    {id:6,x:855,y:355,r:45,name:'FROZEN SIGNAL'}
  ];
  let selected=0,time=0,last=performance.now(),shipX=nodes[0].x,shipY=nodes[0].y-50;
  const stars=[];let seed=9917;function rnd(){seed=(seed*1664525+1013904223)|0;return(seed>>>0)/4294967296}
  for(let i=0;i<310;i++)stars.push({x:rnd()*W,y:rnd()*H,s:rnd()<.88?1:2,d:.1+rnd()*.55,p:rnd()*6.28});
  const asteroids=[{x:180,y:180,img:0,s:.72,p:0},{x:730,y:330,img:1,s:.7,p:2},{x:875,y:175,img:0,s:.48,p:4.1},{x:500,y:110,img:1,s:.35,p:1.2}];
  const fgAsteroids=[{x:80,y:95,img:0,s:1.55,p:0.4,v:34},{x:880,y:420,img:1,s:1.35,p:2.6,v:-28},{x:520,y:505,img:0,s:1.05,p:4.2,v:22}];
  const satellites=[{x:210,y:125,p:0},{x:760,y:245,p:2.1},{x:875,y:95,p:4.4}];
  const gamepadPrevious={left:false,right:false,confirm:false,back:false};
  const meteors=[],galaxyParticles=[];let meteorTimer=3.5;
  function ready(i){return i&&i.naturalWidth>0}
  function txt(v,x,y,z,c,a){g.font='bold '+Math.round(z*0.65)+'px "Press Start 2P","Courier New",monospace';g.textAlign=a||'left';g.fillStyle='#02030a';g.fillText(v,x+2,y+2);g.fillStyle=c;g.fillText(v,x,y)}
  function panel(x,y,w,h,accent){g.fillStyle='rgba(3,12,31,.9)';g.fillRect(x,y,w,h);g.strokeStyle=accent||'#55d9ed';g.lineWidth=2;g.strokeRect(x+.5,y+.5,w-1,h-1);g.strokeStyle='rgba(160,230,245,.28)';g.strokeRect(x+6.5,y+6.5,w-13,h-13)}
  function background(){
    const grad=g.createRadialGradient(470,270,10,470,270,590);grad.addColorStop(0,'#112c55');grad.addColorStop(.45,'#071735');grad.addColorStop(1,'#010614');g.fillStyle=grad;g.fillRect(0,0,W,H);
    for(const s of stars){let x=(s.x-time*7*s.d+W)%W;g.globalAlpha=.28+Math.abs(Math.sin(time*2+s.p))*.62;g.fillStyle=s.s>1?'#d9f8ff':'#6fb1da';g.fillRect(x,s.y,s.s,s.s)}g.globalAlpha=1;
    // Slowly rotating pixel-galaxy arms.
    g.save();g.translate(430,270);g.rotate(time*.025);g.globalAlpha=.34;g.strokeStyle='#2f6f9e';
    g.globalCompositeOperation='lighter';
    for(let arm=0;arm<5;arm++){for(let i=0;i<75;i++){let r=i*4.3,a=arm*1.257+i*.115,x=Math.round(Math.cos(a)*r*1.35/4)*4,y=Math.round(Math.sin(a)*r*.68/4)*4,size=(i+arm)%9===0?6:3;g.globalAlpha=.12+(arm%2)*.05;g.fillStyle=arm%2?'#57d8e8':'#356caa';g.fillRect(x-size/2,y-size/2,size,size)}}g.restore();
    for(const a of asteroids){g.save();g.translate(a.x+Math.sin(time*.3+a.p)*18,a.y);g.rotate(time*.08+a.p);if(ready(asteroidImages[a.img]))g.drawImage(asteroidImages[a.img],-asteroidImages[a.img].naturalWidth*a.s/2,-asteroidImages[a.img].naturalHeight*a.s/2,asteroidImages[a.img].naturalWidth*a.s,asteroidImages[a.img].naturalHeight*a.s);g.restore()}
    for(const s of satellites){g.save();g.translate(s.x+Math.sin(time*.45+s.p)*12,s.y+Math.cos(time*.4+s.p)*8);g.rotate(Math.sin(time*.6+s.p)*.16);if(ready(satellite))g.drawImage(satellite,-22,-26,43,51);g.restore()}
    for(const p of galaxyParticles){g.globalAlpha=Math.max(0,p.life);g.fillStyle=p.color;g.fillRect(p.x,p.y,p.size,p.size)}g.globalAlpha=1;
    for(const m of meteors){g.save();g.globalCompositeOperation='lighter';const trail=g.createLinearGradient(m.x,m.y,m.x-m.vx*.09,m.y-m.vy*.09);trail.addColorStop(0,'#ffffff');trail.addColorStop(.25,'#ffcf55');trail.addColorStop(1,'rgba(255,80,25,0)');g.strokeStyle=trail;g.lineWidth=4;g.beginPath();g.moveTo(m.x,m.y);g.lineTo(m.x-m.vx*.09,m.y-m.vy*.09);g.stroke();g.restore()}
  }
  function route(){g.save();g.strokeStyle='#43e3ee';g.lineWidth=3;g.setLineDash([8,7]);g.lineDashOffset=-time*19;g.beginPath();nodes.forEach((n,i)=>i?g.lineTo(n.x,n.y):g.moveTo(n.x,n.y));g.stroke();g.restore()}
  function available(node){return node.id==='tutorial'||(typeof node.id==='number'&&node.id<=unlocked)}
  const tutorialDone = (function(){ try{ return localStorage.getItem('dh_tutorial_done')==='1'; }catch(e){ return false; } })();
  function drawNodes(){
    nodes.forEach((node,index)=>{const img=planetImages[node.id],active=index===selected,spin=time*(.08+index*.012);g.save();g.translate(node.x,node.y);g.rotate(spin);if(ready(img)){const diameter=node.r*2,scale=diameter/Math.max(img.naturalWidth,img.naturalHeight),dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;g.shadowColor=active?'#ffe45f':'#4ee9ff';g.shadowBlur=active?18:7;g.drawImage(img,-dw/2,-dh/2,dw,dh)}g.restore();
      if(active){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.55+Math.sin(time*7)*.2;g.strokeStyle='#ffe45f';g.lineWidth=4;g.beginPath();g.arc(node.x,node.y,node.r+10+Math.sin(time*5)*3,0,Math.PI*2);g.stroke();g.restore()}
      // checkmark for completed tutorial
      if(node.id==='tutorial' && tutorialDone){
        g.save(); g.translate(node.x+18, node.y-22); g.rotate(-0.12);
        g.fillStyle='#9aff8a'; g.font='bold 12px "Press Start 2P","Courier New",monospace'; g.fillText('✓',0,0);
        g.shadowColor='#9aff8a'; g.shadowBlur=8; g.fillText('✓',0,0); g.restore();
      }
      const label=node.id==='tutorial'?'T':String(node.id).padStart(2,'0');txt(label,node.x,node.y+node.r+23,13,available(node)?active?'#ffe45f':'#9af5ff':'#596579','center');
    });
  }
  function drawShip(){const target=nodes[selected];shipX+=(target.x-shipX)*.08;shipY+=(target.y-target.r-24-shipY)*.08;g.save();g.translate(shipX,shipY);g.rotate(Math.sin(time*4)*.04);if(ready(shipImage)){const w=42,h=16;g.shadowColor='#68efff';g.shadowBlur=8;g.drawImage(shipImage,-w/2,-h/2,w,h)}g.globalCompositeOperation='lighter';g.fillStyle='#68efff';g.globalAlpha=.65;g.fillRect(-28,-2,10+Math.sin(time*18)*4,4);g.restore()}
  function foregroundAsteroids(){for(const a of fgAsteroids){const img=asteroidImages[a.img];const x=(a.x+time*a.v+W+180)%(W+360)-180;const y=a.y+Math.sin(time*.8+a.p)*28;g.save();g.translate(x,y);g.rotate(time*.18+a.p);g.globalAlpha=.92;if(ready(img))g.drawImage(img,-img.naturalWidth*a.s/2,-img.naturalHeight*a.s/2,img.naturalWidth*a.s,img.naturalHeight*a.s);g.restore()}}
  function hud(){panel(18,15,275,46,'#5fc7df');txt("DESERT'S HEROES",35,47,21,'#fff0c8');panel(755,15,187,46,'#5fc7df');txt(tr.sector,849,47,19,'#fff0c8','center');const node=nodes[selected];panel(18,458,265,65,'#55d9ed');txt(tr.current,34,482,13,'#68efff');txt(node.name,34,506,12,'#fff0c8');panel(700,460,242,62,'#ffb347');txt(tr.choose,821,486,15,'#fff0c8','center');txt(available(node)?tr.deploy:tr.locked,821,509,11,available(node)?'#8cff9f':'#ff6870','center');panel(405,490,150,34,'#8297ad');txt(tr.back,480,512,11,'#b5c4d2','center')}
  function updateDecor(dt){
    meteorTimer-=dt;if(meteorTimer<=0){meteors.push({x:-80,y:40+Math.random()*230,vx:620+Math.random()*480,vy:180+Math.random()*180,life:1.7});meteorTimer=4+Math.random()*7}
    for(const m of meteors){m.x+=m.vx*dt;m.y+=m.vy*dt;m.life-=dt}for(let i=meteors.length-1;i>=0;i--)if(meteors[i].life<=0)meteors.splice(i,1);
    if(Math.random()<dt*15)galaxyParticles.push({x:240+Math.random()*420,y:100+Math.random()*330,vx:-16+Math.random()*32,vy:-22+Math.random()*44,life:.6+Math.random()*.8,size:Math.random()<.8?1:2,color:Math.random()<.3?'#b58cff':'#68efff'});
    for(const p of galaxyParticles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}for(let i=galaxyParticles.length-1;i>=0;i--)if(galaxyParticles[i].life<=0)galaxyParticles.splice(i,1);
  }
  function draw(){g.clearRect(0,0,W,H);background();const z=1.025+Math.sin(time*.75)*.025;g.save();g.translate(W/2,H/2);g.scale(z,z);g.translate(-W/2,-H/2);route();drawNodes();drawShip();g.restore();foregroundAsteroids();g.strokeStyle='#4bcbe4';g.lineWidth=2;g.strokeRect(8,8,W-16,H-16);g.strokeStyle='rgba(220,190,125,.7)';g.strokeRect(3,3,W-6,H-6);hud()}
  function launch(){const node=nodes[selected];if(!available(node))return;localStorage.setItem('dh_selected_mission',String(node.id));if(node.id==='tutorial')location.href='tutorial.html?mode='+encodeURIComponent(mode)+'&character='+encodeURIComponent(character);else if(node.id===1)location.href='level1.html?autostart=1&mode='+encodeURIComponent(mode)+'&character='+encodeURIComponent(character)}
  function move(dir){selected=(selected+dir+nodes.length)%nodes.length}
  addEventListener('keydown',e=>{if(['ArrowLeft','ArrowUp'].includes(e.code)){move(-1);e.preventDefault()}else if(['ArrowRight','ArrowDown'].includes(e.code)){move(1);e.preventDefault()}else if(e.code==='Enter'||e.code==='Space'){launch();e.preventDefault()}else if(e.code==='Escape')location.href='level1.html'});
  addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;let best=-1,d=70;nodes.forEach((n,i)=>{const nd=Math.hypot(x-n.x,y-n.y);if(nd<d){d=nd;best=i}});if(best>=0){if(best===selected)launch();else selected=best}});
  function pollGamepad(){if(!navigator.getGamepads)return;const pads=navigator.getGamepads();let p=null;for(let i=0;i<pads.length;i++)if(pads[i]&&pads[i].connected){p=pads[i];break}if(!p)return;const b=i=>p.buttons[i]&&p.buttons[i].pressed,a=p.axes[0]||0,n={left:b(14)||a<-.35,right:b(15)||a>.35,confirm:b(0),back:b(1)||b(9)};if(n.left&&!gamepadPrevious.left)move(-1);if(n.right&&!gamepadPrevious.right)move(1);if(n.confirm&&!gamepadPrevious.confirm)launch();if(n.back&&!gamepadPrevious.back)location.href='level1.html';Object.assign(gamepadPrevious,n)}
  function resize(){const s=Math.min(innerWidth/W,innerHeight/H);canvas.style.width=Math.floor(W*s)+'px';canvas.style.height=Math.floor(H*s)+'px'}addEventListener('resize',resize);resize();
  function loop(now){pollGamepad();const dt=Math.min(.1,(now-last)/1000);last=now;time+=dt;updateDecor(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
})();
