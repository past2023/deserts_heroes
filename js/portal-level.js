// Self-contained orbital time-rift bonus level.
(function(){
const c=document.getElementById('rift'),g=c.getContext('2d'),W=960,H=540,WORLD=5600;g.imageSmoothingEnabled=false;MusicTracks.play('space');
const keys={},stars=new Image(),asteroids=new Image(),platformImg=new Image();stars.src='assets/intro/slide2_stars.png';asteroids.src='assets/intro/slide2_asteroids.png';platformImg.src='assets/platforms/floating_platform.png';
let campaign={};try{campaign=JSON.parse(sessionStorage.getItem('dh_portal_return')||'{}')}catch(e){}
const heroId=campaign.characterId||'juan_p',heroRun=new Image(),heroJump=new Image(),heroIdle=new Image();
heroRun.src='assets/characters/'+heroId+'/'+heroId+'_run.png';heroJump.src='assets/characters/'+heroId+'/'+heroId+'_jump.png';heroIdle.src='assets/characters/'+heroId+'/'+heroId+'_idle_animation.png';
const heroCell=heroId==='juan_p'?200:100,heroRunFrames=heroId==='juan_p'?20:4,heroRunFps=heroId==='juan_p'?30:10;
const enemyArt={scout:new Image(),orb:new Image(),sentry:new Image()},portalArt=new Image(),shipArt=[new Image(),new Image()];
enemyArt.scout.src='assets/space/enemies/Rift_Scout.png';enemyArt.orb.src='assets/space/enemies/Phase_Orb.png';enemyArt.sentry.src='assets/space/enemies/Orbital_Sentry.png';
portalArt.src='assets/props/deco_portal02.png';shipArt[0].src='assets/space/ships/enemies_ship01.png';shipArt[1].src='assets/space/ships/enemies_ship02.png';

const PICKUP_INFO=Object.freeze({
  mg:{color:'#ffd76a',file:'Heavy_machine_gun.png',w:72,h:27},
  spread:{color:'#7ad0ff',file:'Spread_weapon.png',w:62,h:30},
  rocket:{color:'#ff8a6a',file:'Rocket_weapon.png',w:75,h:25},
  flame:{color:'#ff7a2a',file:'Flame_shot.png',w:70,h:27},
  grenades:{color:'#9aff8a',file:'Grenade_refill_pack.png',w:38,h:35},
  homing:{color:'#68efff',file:'Guided_missile_pod.png',w:56,h:31},
});
const pickupImages={};
for(const type in PICKUP_INFO){
  const img=new Image();
  img.src='assets/pickups/'+PICKUP_INFO[type].file;
  pickupImages[type]=img;
}

let cam=0,t=0,last=performance.now(),score=0,startedAudio=false,irisIn=1.05,exiting=-1,returnSaved=false,gpJumpWas=false;
const p={x:110,y:360,vx:0,vy:0,on:false,face:1,inv:1,shots:[],lives:3,airJump:1};let checkpoint={x:115,y:390};
const plats=[];for(let x=40,i=0;x<WORLD;x+=165+(i%3)*15,i++)plats.push({x,y:390-[0,70,125,35,155,90][i%6],w:150});
const fx=[],farShips=[{x:180,y:95,d:.035,s:.65},{x:760,y:145,d:.055,s:.9},{x:480,y:70,d:.025,s:.5}],meteors=[];let meteorTimer=3.5;
const exitPlatform=plats[plats.length-1],EXIT_X=exitPlatform.x+exitPlatform.w*.68;
const enemies=[];for(let x=650,i=0;x<5200;x+=430,i++)enemies.push({x:x,startX:x,y:170+(i%4)*65,type:['scout','orb','sentry'][i%3],hp:[2,3,4][i%3],t:i,dead:false});
const rewards={grenades:0,homing:0,weapon:null};const itemTypes=['mg','spread','rocket','flame','grenades','homing'];const items=[];for(let x=430,i=0;x<5200;x+=520,i++)items.push({x,y:210+(i%5)*45,type:itemTypes[i%itemTypes.length],t:0,taken:false});
const dust=[];for(let i=0;i<150;i++)dust.push({x:Math.random()*(W+300),y:Math.random()*H,s:Math.random()<.85?1:2,p:Math.random()*6.3,d:.03+Math.random()*.16});
function ready(i){return i.naturalWidth>0}function txt(s,x,y,z,col,a){g.font='bold '+z+'px monospace';g.textAlign=a||'left';g.fillStyle='#000';g.fillText(s,x+2,y+2);g.fillStyle=col;g.fillText(s,x,y)}
function audio(){if(MusicTracks.isActive()||startedAudio)return;startedAudio=true;const A=new(window.AudioContext||window.webkitAudioContext)();let step=0;setInterval(()=>{const o=A.createOscillator(),v=A.createGain();o.type=step%4?'triangle':'square';o.frequency.value=[110,164.8,220,329.6,246.9,196][step++%6];v.gain.setValueAtTime(.035,A.currentTime);v.gain.exponentialRampToValueAtTime(.001,A.currentTime+.18);o.connect(v);v.connect(A.destination);o.start();o.stop(A.currentTime+.2)},190)}
addEventListener('keydown',e=>{keys[e.code]=true;audio();if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault()});addEventListener('keyup',e=>keys[e.code]=false);
function reset(){p.x=checkpoint.x;p.y=checkpoint.y;p.vy=0;p.vx=0;p.on=true;p.airJump=1;p.inv=1.8;p.lives--;cam=Math.max(0,p.x-260);if(p.lives<0)finish()}
function finish(){if(exiting>=0)return;if(!returnSaved){let s=null;try{s=JSON.parse(sessionStorage.getItem('dh_portal_return')||'null')}catch(e){}if(s){s.score=(s.score||0)+score;s.grenades=(s.grenades||0)+rewards.grenades*4+Math.floor(score/1200);s.homingMissiles=(s.homingMissiles||0)+rewards.homing*5;if(rewards.weapon){s.weapon=rewards.weapon;s.ammo={mg:200,spread:30,rocket:25,flame:90}[rewards.weapon]}sessionStorage.setItem('dh_portal_return',JSON.stringify(s))}returnSaved=true}exiting=.95}
function update(dt){t+=dt;irisIn=Math.max(0,irisIn-dt);if(exiting>=0){exiting-=dt;if(exiting<=0)location.href='level1.html?resumePortal=1';return;}const pads=navigator.getGamepads?navigator.getGamepads():[],gp=Array.from(pads).find(q=>q&&q.connected),btn=i=>!!gp&&gp.buttons[i]&&gp.buttons[i].pressed,ax=gp&&gp.axes.length?gp.axes[0]:0,gpJump=btn(0),gpJumpPressed=gpJump&&!gpJumpWas;p.inv-=dt;let m=(keys.ArrowRight||keys.KeyD||btn(15)||ax>.35?1:0)-(keys.ArrowLeft||keys.KeyA||btn(14)||ax<-.35?1:0);p.vx=m*240;if(m)p.face=m; if((keys.Space||keys.KeyK||gpJumpPressed)&&(p.on||p.airJump>0)){if(!p.on)p.airJump--;p.vy=-610;p.on=false;keys.Space=keys.KeyK=false;fx.push({kind:'ring',x:p.x,y:p.y-5,t:0,life:.3})}p.vy+=1550*dt;let py=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.x=Math.max(20,Math.min(WORLD-20,p.x));p.on=false;if(p.vy>=0)for(const q of plats)if(p.x>q.x&&p.x<q.x+q.w&&py<=q.y&&p.y>=q.y){p.y=q.y;p.vy=0;p.on=true;p.airJump=1;if(q.x+q.w/2>checkpoint.x){checkpoint={x:q.x+Math.min(q.w-25,55),y:q.y};}break}if(p.y>590)reset();cam+=((p.x-330)-cam)*Math.min(1,dt*5);cam=Math.max(0,Math.min(WORLD-W,cam));
if((keys.KeyJ||keys.KeyZ||btn(2)||btn(5))&&(!p.cool||p.cool<=0)){
  const wantUp=keys.ArrowUp||keys.KeyW;
  const mx=p.x+(wantUp?0:p.face*32), my=p.y-(wantUp?56:44);
  const dirX=wantUp?0:p.face, dirY=wantUp?-1:0;
  p.shots.push({x:mx, y:my, vx:dirX*820, vy:dirY*820});
  p.cool=0.14;
}
p.cool=(p.cool||0)-dt;for(const b of p.shots){b.x+=b.vx*dt;b.y+=b.vy*dt;}p.shots=p.shots.filter(b=>b.x>cam-30&&b.x<cam+W+30&&b.y>-50&&b.y<600);for(const e of enemies){if(e.dead)continue;e.t+=dt;e.y+=Math.sin(e.t*2)*18*dt;e.x=e.startX+Math.sin(e.t*1.3)*130;for(const b of p.shots)if(Math.abs(b.x-e.x)<(e.type==='scout'?36:30)&&Math.abs(b.y-e.y)<(e.type==='sentry'?38:32)){e.hp--;b.x=-999;if(e.hp<=0){e.dead=true;score+=250;for(let i=0;i<18;i++)fx.push({kind:i%3?'spark':'fire',x:e.x,y:e.y,vx:-180+Math.random()*360,vy:-220+Math.random()*360,t:0,life:.35+Math.random()*.55})}}if(p.inv<=0&&Math.abs(p.x-e.x)<34&&Math.abs((p.y-25)-e.y)<38)reset()}for(const it of items){it.t+=dt;if(!it.taken&&Math.abs(p.x-it.x)<28&&Math.abs((p.y-25)-it.y)<35){it.taken=true;score+=500;if(it.type==='grenades')rewards.grenades++;else if(it.type==='homing')rewards.homing++;else rewards.weapon=it.type;fx.push({kind:'ring',x:it.x,y:it.y,t:0,life:.45})}}for(const f of fx){f.t+=dt;f.x+=(f.vx||0)*dt;f.y+=(f.vy||0)*dt;if(f.kind!=='ring')f.vy=(f.vy||0)+260*dt}for(let i=fx.length-1;i>=0;i--)if(fx[i].t>=fx[i].life)fx.splice(i,1);
meteorTimer-=dt;if(meteorTimer<=0){meteors.push({x:cam+W+160,y:40+Math.random()*240,vx:-900-Math.random()*650,vy:260+Math.random()*220,life:1.4});meteorTimer=2.5+Math.random()*5}for(const m of meteors){m.x+=m.vx*dt;m.y+=m.vy*dt;m.life-=dt}for(let i=meteors.length-1;i>=0;i--)if(meteors[i].life<=0)meteors.splice(i,1);
gpJumpWas=gpJump;if(p.x>EXIT_X-12)finish()}
function iris(open){let k=Math.max(0,Math.min(1,open)),r=Math.round(Math.hypot(W,H)*.62*k/12)*12;g.save();g.fillStyle='#000';g.beginPath();g.rect(0,0,W,H);if(r>.5){for(let i=0;i<=28;i++){let a=-i/28*Math.PI*2,x=Math.round((W/2+Math.cos(a)*r)/12)*12,y=Math.round((H/2+Math.sin(a)*r)/12)*12;if(i===0)g.moveTo(x,y);else g.lineTo(x,y)}g.closePath()}g.fill('evenodd');if(r>10)for(let i=0;i<16;i++){let a=i/16*Math.PI*2,x=Math.round((W/2+Math.cos(a)*r)/12)*12,y=Math.round((H/2+Math.sin(a)*r)/12)*12;g.fillRect(x-6,y-6,12,12)}g.restore()}
function draw(){g.fillStyle='#020613';g.fillRect(0,0,W,H);g.save();g.translate(W/2,H/2);g.rotate(Math.sin(t*.12+cam*.0004)*.012);g.scale(1.035,1.035);g.translate(-W/2,-H/2);
const neb=g.createRadialGradient(690-Math.sin(t*.08)*120,250,20,560,270,480);neb.addColorStop(0,'rgba(90,40,150,.30)');neb.addColorStop(.45,'rgba(15,70,135,.16)');neb.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=neb;g.fillRect(0,0,W,H);
if(ready(stars)){g.save();g.globalAlpha=.42;for(let x=-((cam*.018)%1020)-1020;x<W;x+=1020)g.drawImage(stars,x,0,1020,540);g.globalAlpha=.7;for(let x=-((cam*.065)%1020)-1020;x<W;x+=1020)g.drawImage(stars,x,-35,1020,540);g.restore()}for(const s of dust){let dx=((s.x-cam*s.d+t*12*s.d)%(W+300)+W+300)%(W+300)-150;g.globalAlpha=.4+Math.sin(t*3+s.p)*.35;g.fillStyle='#8eefff';g.fillRect(dx,s.y,s.s,s.s);if(s.s>1&&Math.sin(t*2+s.p)>.75){g.fillRect(dx-3,s.y,7,1);g.fillRect(dx,s.y-3,1,7)}}g.globalAlpha=1;if(ready(asteroids)){g.save();g.globalAlpha=.16;for(let x=-((cam*.11)%1200)-1200;x<W;x+=1200)g.drawImage(asteroids,x,-55,1200,540);g.globalAlpha=.38;for(let x=-((cam*.28)%1200)-1200;x<W;x+=1200)g.drawImage(asteroids,x,45,1200,540);g.restore()}for(let si=0;si<farShips.length;si++){const sh=farShips[si],img=shipArt[si%2],x=((sh.x-cam*sh.d+t*9*sh.s)%(W+300)+W+300)%(W+300)-150,y=sh.y+Math.sin(t*.7+sh.x)*8;if(ready(img)){const sw=(si%2?150:175)*sh.s,shh=(si%2?72:61)*sh.s;g.save();g.globalAlpha=.42+sh.s*.2;g.shadowColor='#52eaff';g.shadowBlur=8;g.drawImage(img,x-sw/2,y-shh/2,sw,shh);g.restore()}}for(const m of meteors){let x=m.x-cam;g.save();g.globalCompositeOperation='lighter';let gr=g.createLinearGradient(x,m.y,x+90,m.y-45);gr.addColorStop(0,'#fff');gr.addColorStop(.18,'#ffcc55');gr.addColorStop(1,'rgba(255,60,20,0)');g.strokeStyle=gr;g.lineWidth=5;g.beginPath();g.moveTo(x,m.y);g.lineTo(x+95,m.y-48);g.stroke();g.restore()}g.restore();for(const q of plats){let x=q.x-cam;if(x<-200||x>W+50)continue;if(ready(platformImg))g.drawImage(platformImg,x,q.y,q.w,11);else{g.fillStyle='#785a4a';g.fillRect(x,q.y,q.w,10)}g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.35;g.fillStyle='#52dfff';g.fillRect(x+20,q.y+12,q.w-40,2);g.restore()}
for(const it of items)if(!it.taken){
  let x=it.x-cam, info=PICKUP_INFO[it.type], img=pickupImages[it.type], floatY=it.y-Math.sin(it.t*3)*3;
  if(ready(img)){
    g.save(); g.imageSmoothingEnabled=false;
    g.shadowColor=info.color; g.shadowBlur=10;
    g.drawImage(img, Math.round(x-info.w/2), Math.round(floatY-info.h/2), info.w, info.h);
    g.shadowBlur=0; g.restore();
  } else {
    g.fillStyle=info.color; g.fillRect(x-14, floatY-14, 28, 28);
  }
}
for(const e of enemies)if(!e.dead){let x=e.x-cam,img=enemyArt[e.type],sz=e.type==='scout'?[96,52]:e.type==='orb'?[60,60]:[60,84];if(ready(img)){g.save();g.shadowColor=e.type==='orb'?'#ff5fd2':'#68efff';g.shadowBlur=12+Math.sin(t*8+e.t)*3;g.drawImage(img,x-sz[0]/2,e.y-sz[1]/2,sz[0],sz[1]);g.shadowBlur=0;if(e.type==='orb'){g.globalCompositeOperation='lighter';g.globalAlpha=.32;g.fillStyle='#ff7de2';g.beginPath();g.arc(x,e.y,32+Math.sin(t*7+e.t)*4,0,6.3);g.fill()}g.restore()}else{g.fillStyle='#813ca5';g.fillRect(x-36,e.y-26,72,52)}}for(const b of p.shots){
  g.fillStyle='#fff'; g.fillRect(b.x-cam,b.y,12,4);
  g.fillStyle='#68efff'; g.fillRect(b.x-cam-4,b.y+1,18,2);
}for(const f of fx){let a=Math.max(0,1-f.t/f.life),x=f.x-cam;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;if(f.kind==='ring'){g.strokeStyle='#68efff';g.lineWidth=3;g.beginPath();g.arc(x,f.y,8+f.t*70,0,6.3);g.stroke()}else{g.fillStyle=f.kind==='fire'?'#ff7a2a':'#ffe45f';g.beginPath();g.arc(x,f.y,(f.kind==='fire'?8:3)*a,0,6.3);g.fill()}g.restore()}let px=p.x-cam;let sheet=p.on?(Math.abs(p.vx)>5?heroRun:heroIdle):heroJump;if(ready(sheet)){let frames=sheet===heroRun?heroRunFrames:(sheet===heroIdle?(heroId==='juan_p'?18:2):1),fps=sheet===heroRun?heroRunFps:(sheet===heroIdle?(heroId==='juan_p'?10:2):1),frame=Math.floor(t*fps)%frames;g.save();g.translate(Math.round(px),Math.round(p.y));if(p.face<0)g.scale(-1,1);if(p.inv>0&&Math.floor(t*12)%2)g.globalAlpha=.35;g.drawImage(sheet,frame*heroCell,0,heroCell,heroCell,-50,-100,100,100);g.restore()}else{g.fillStyle='#d9e5ee';g.fillRect(px-10,p.y-48,20,45)}if(p.x>EXIT_X-500){let ex=EXIT_X-cam,base=exitPlatform.y,pulse=.65+Math.sin(t*7)*.2;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){g.globalAlpha=(.36-i*.06)*pulse;g.strokeStyle=i%2?'#b56cff':'#68efff';g.lineWidth=3;g.beginPath();g.ellipse(ex,base-39,38+i*9+Math.sin(t*5+i)*4,47+i*10,0,0,6.3);g.stroke()}g.globalCompositeOperation='source-over';g.globalAlpha=1;if(ready(portalArt)){g.shadowColor='#68efff';g.shadowBlur=24+pulse*12;g.drawImage(portalArt,ex-40,base-80,80,80);g.shadowBlur=0}g.restore();txt('EXIT RIFT',ex,base+28,14,'#e8d0ff','center')}txt('TIME-RIFT EXPEDITION',22,34,18,'#83efff');txt('SCORE '+String(score).padStart(6,'0'),W-22,34,15,'#ffe45f','right');txt('LIVES '+Math.max(0,p.lives),22,58,12,'#ff9a9f');txt('ARROWS/WASD MOVE  ·  SPACE JUMP  ·  J/Z FIRE',W/2,H-18,11,'#b7dce8','center');if(irisIn>0)iris(1-irisIn/1.05);if(exiting>=0)iris(Math.max(0,exiting/.95))}
function resize(){let s=Math.min(innerWidth/W,innerHeight/H);c.style.width=Math.floor(W*s)+'px';c.style.height=Math.floor(H*s)+'px'}addEventListener('resize',resize);resize();function loop(n){let dt=Math.min(.05,(n-last)/1000);last=n;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
})();