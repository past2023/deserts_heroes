// ============================================================
// TUTORIAL LEVEL — Frontier Training Annex v4
// Updated for 8 modules (01,02,03,04,06,07,08,05) + pilar seams
// Platforms extracted from tutorial_midXX_refe.png reference lines.
// Pilar01.png hides seams at each module border.
// Old foreground tutorial_foreground01.png only at start and middle.
// ============================================================
(function () {
  const MODULE_W = 1376;
  const MODULE_COUNT = 8;
  const W = MODULE_W * MODULE_COUNT; // 11008
  const GROUND = 470;
  const VW = 960, VH = 540;
  const GROUND_LINE = 620;
  const MID_SCALE = 1.0;
  const MID_BASE_Y = GROUND - GROUND_LINE; // -150

  function imageReady(img){ return img && img.naturalWidth>0 && img.complete!==false; }

  const tutorialBack = new Image(); tutorialBack.decoding='async'; tutorialBack.src='assets/tutorial/tutorial_back01.png';
  const tutorialFore = new Image(); tutorialFore.decoding='async'; tutorialFore.src='assets/tutorial/tutorial_foreground01.png';
  const pilarImage = new Image(); pilarImage.decoding='async'; pilarImage.src='assets/tutorial/pilar01.png';

  // 8 modular mids
  const midSources = [
    'assets/tutorial/tutorial_mid01b.png',
    'assets/tutorial/tutorial_mid02b.png',
    'assets/tutorial/tutorial_mid03b.png',
    'assets/tutorial/tutorial_mid04b.png',
    'assets/tutorial/tutorial_mid06b.png',
    'assets/tutorial/tutorial_mid07b.png',
    'assets/tutorial/tutorial_mid08b.png',
    'assets/tutorial/tutorial_mid05b.png',
  ];
  const midSourcesFallback = [
    ['upload/tutorial_mid01b.png','assets/tutorial/tutorial_mid01.png','upload/tutorial_mid01.png'],
    ['upload/tutorial_mid02b.png','assets/tutorial/tutorial_mid02.png','upload/tutorial_mid02.png'],
    ['upload/tutorial_mid03b.png','assets/tutorial/tutorial_mid03.png','upload/tutorial_mid03.png'],
    ['upload/tutorial_mid04b.png','assets/tutorial/tutorial_mid04.png','upload/tutorial_mid04.png'],
    ['upload/tutorial_mid06b.png','assets/tutorial/tutorial_mid06.png','upload/tutorial_mid06.png','upload/tutorial_mid06b.png'],
    ['upload/tutorial_mid07b.png','assets/tutorial/tutorial_mid07.png','upload/tutorial_mid07.png'],
    ['upload/tutorial_mid08b.png','assets/tutorial/tutorial_mid08.png','upload/tutorial_mid08.png'],
    ['upload/tutorial_mid05b.png','assets/tutorial/tutorial_mid05.png','upload/tutorial_mid05.png'],
  ];

  const tutorialMids = [];
  for(let i=0;i<MODULE_COUNT;i++){
    const img = new Image(); img.decoding='async';
    let fallbackIdx=0;
    img.src = midSources[i];
    img.onerror = (function(idx, im){
      return function(){
        const list = midSourcesFallback[idx]||[];
        if(fallbackIdx < list.length){ im.src = list[fallbackIdx++]; }
      };
    })(i, img);
    tutorialMids.push(img);
  }

  if (!imageReady(pilarImage)) {
    pilarImage.onerror = function(){ this.src = 'upload/pilar01.png'; };
  }

  // Platforms extracted from tutorial_midXX_refe.png (black background + white guide rectangles).
  // Module-to-refe mapping: 0=mid01_refe, 1=mid02_refe, 2=mid03_refe, 3=mid04_refe,
  // 4=mid06_refe, 5=mid07_refe, 6=mid08_refe, 7=mid05_refe (desert exit).
  const platforms = [];
  function addP(modIdx, lx, ly, lw){
    const wx = modIdx*MODULE_W + lx;
    const wy = MID_BASE_Y + ly;
    platforms.push({ x: wx, baseY: wy, y: wy, w: lw, amp:0, speed:0, phase:0, fragile:false, invisible:true });
  }

  // Platforms extracted from the user-provided white-on-black reference PNGs.
  // Each white rectangle becomes one invisible platform; its top edge is the walkable Y.
  // Module-to-refe mapping: 0=mid01_refe, 1=mid02_refe, 2=mid03_refe, 3=mid04_refe,
  // 4=mid06_refe, 5=mid07_refe, 6=mid08_refe, 7=mid05_refe (desert exit).

  // Module 0 — mid01b (satellite dish lab) — tutorial_mid01_refe.png (10 guide rectangles)
  addP(0, 268, 214, 201);
  addP(0, 494, 259, 120);
  addP(0, 667, 259, 604);
  addP(0, 79, 261, 170);
  addP(0, 389, 435, 83);
  addP(0, 980, 450, 130);
  addP(0, 514, 473, 48);
  addP(0, 560, 484, 39);
  addP(0, 596, 499, 68);
  addP(0, 127, 501, 125);

  // Module 1 — mid02b (broken circular) — tutorial_mid02_refe.png (5 guide rectangles)
  addP(1, 927, 258, 384);
  addP(1, 65, 307, 900);
  addP(1, 474, 387, 91);
  addP(1, 297, 442, 180);
  addP(1, 1055, 507, 53);

  // Module 2 — mid03b (suspended ship) — tutorial_mid03_refe.png (11 guide rectangles)
  addP(2, 270, 212, 208);
  addP(2, 494, 260, 128);
  addP(2, 708, 260, 599);
  addP(2, 76, 264, 173);
  addP(2, 396, 438, 79);
  addP(2, 981, 453, 128);
  addP(2, 517, 468, 40);
  addP(2, 558, 481, 32);
  addP(2, 125, 498, 70);
  addP(2, 596, 500, 79);
  addP(2, 197, 509, 63);

  // Module 3 — mid04b (desert view upper) — tutorial_mid04_refe.png (10 guide rectangles)
  addP(3, 467, 260, 146);
  addP(3, 662, 261, 216);
  addP(3, 91, 262, 196);
  addP(3, 1204, 265, 120);
  addP(3, 1102, 443, 137);
  addP(3, 504, 468, 50);
  addP(3, 558, 482, 32);
  addP(3, 585, 498, 77);
  addP(3, 140, 503, 62);
  addP(3, 202, 509, 57);

  // Module 4 — mid06b (elevator lab) — tutorial_mid06_refe.png (8 guide rectangles)
  addP(4, 264, 209, 59);
  addP(4, 84, 263, 157);
  addP(4, 1077, 271, 244);
  addP(4, 923, 290, 151);
  addP(4, 482, 422, 122);
  addP(4, 1024, 431, 41);
  addP(4, 888, 450, 121);
  addP(4, 160, 458, 157);

  // Module 5 — mid07b (sand hangar robots) — tutorial_mid07_refe.png (7 guide rectangles)
  addP(5, 87, 260, 304);
  addP(5, 1077, 271, 237);
  addP(5, 920, 289, 152);
  addP(5, 1022, 429, 52);
  addP(5, 239, 454, 41);
  addP(5, 763, 465, 50);
  addP(5, 161, 502, 62);

  // Module 6 — mid08b (second elevator/satellite) — tutorial_mid08_refe.png (8 guide rectangles)
  addP(6, 265, 208, 69);
  addP(6, 77, 255, 162);
  addP(6, 1076, 271, 233);
  addP(6, 913, 288, 160);
  addP(6, 470, 421, 133);
  addP(6, 1021, 431, 44);
  addP(6, 163, 459, 148);
  addP(6, 572, 530, 52);

  // Module 7 — mid05b (desert exit final) — tutorial_mid05_refe.png (3 guide rectangles)
  addP(7, 863, 416, 47);
  addP(7, 229, 451, 63);
  addP(7, 0, 469, 88);


  const spawns=[
    { x:700, type:'soldier' },
    { x:1150, type:'pow' },
    { x:1720, type:'observer' },
    { x:2050, type:'soldier' },
    { x:2380, type:'grenadier' },
    { x:2950, type:'observer' },
    { x:3350, type:'knife' },
    { x:3850, type:'soldier' },
    { x:4600, type:'observer' },
    { x:5100, type:'bazooka' },
    { x:6000, type:'soldier' },
    { x:6500, type:'grenadier' },
    { x:7000, type:'observer' },
    { x:7800, type:'soldier' },
    { x:8600, type:'bazooka' },
    { x:9200, type:'observer' },
  ];
  const props=[
    { x:980, type:'barrel01' },
    { x:2510, type:'barrel02' },
    { x:3520, type:'crate' },
    { x:4780, type:'barrel01' },
    { x:5320, type:'crate' },
    { x:6400, type:'barrel02' },
    { x:7600, type:'crate' },
    { x:8800, type:'barrel01' },
  ];
  const highPickups=[
    { x:500, type:'mg' },
    { x:1650, type:'grenades' },
    { x:2220, type:'homing' },
    { x:3150, type:'heart' },
    { x:4350, type:'jet_pack' },
    { x:7000, type:'heart' },
    { x:9000, type:'homing' },
  ];
  const slugSpawns=[ { x:2850, type:'ally_tank02' } ];
  const SURFBOARD_X = W - 180;
  const END_LIGHT = { x: W - 260, y: 200, r: 28, triggered:false };

  // Light FX placed at positions matching actual pixel art in mid PNGs
  // Module order: 0=mid01b, 1=mid02b, 2=mid03b, 3=mid04b,
  // 4=mid06b, 5=mid07b, 6=mid08b, 7=mid05b
  const lights=[
    // Module 0 — mid01b (satellite dish lab)
    { module:0, x:560, y:105, type:'lamp', color:'#ff9a2a', r:32, pulse:1.1, intensity:0.9 },
    { module:0, x:1000, y:145, type:'lamp', color:'#ffb44a', r:28, pulse:1.4, intensity:0.8 },
    { module:0, x:1200, y:135, type:'lamp', color:'#ff9a2a', r:30, pulse:1.2, intensity:0.85 },
    { module:0, x:70, y:420, type:'screen', color:'#4af1ff', r:26, pulse:3.2, intensity:0.55 },
    { module:0, x:1250, y:420, type:'screen', color:'#58f0ff', r:22, pulse:2.8, intensity:0.5 },
    { module:0, x:920, y:530, type:'fire', color:'#ff6a18', r:48, pulse:11, intensity:1.0 },

    // Module 1 — mid02b (broken circular)
    { module:1, x:1000, y:145, type:'lamp', color:'#ff9a2a', r:28, pulse:1.2, intensity:0.85 },
    { module:1, x:70, y:420, type:'screen', color:'#4aff88', r:32, pulse:2.5, intensity:0.6 },
    { module:1, x:410, y:490, type:'screen', color:'#5afcff', r:44, pulse:1.8, intensity:0.65 },
    { module:1, x:340, y:300, type:'fire', color:'#ff7a20', r:36, pulse:9, intensity:0.9 },
    { module:1, x:90, y:300, type:'lamp', color:'#ffaa3a', r:24, pulse:1.6, intensity:0.7 },

    // Module 2 — mid03b (suspended ship)
    { module:2, x:240, y:130, type:'lamp', color:'#ff9a2a', r:30, pulse:1.3, intensity:0.8 },
    { module:2, x:1000, y:145, type:'lamp', color:'#ffb44a', r:28, pulse:1.4, intensity:0.8 },
    { module:2, x:75, y:390, type:'lamp', color:'#ffaa3a', r:22, pulse:1.7, intensity:0.6 },
    { module:2, x:660, y:460, type:'screen', color:'#4af1ff', r:28, pulse:2.2, intensity:0.6 },
    { module:2, x:920, y:530, type:'fire', color:'#ff6a18', r:50, pulse:10, intensity:1.0 },

    // Module 3 — mid04b (desert view upper + big robots)
    { module:3, x:590, y:380, type:'lamp', color:'#ff9a2a', r:30, pulse:1.5, intensity:0.85 },
    { module:3, x:740, y:410, type:'lamp', color:'#ffaa3a', r:22, pulse:1.8, intensity:0.6 },
    { module:3, x:680, y:530, type:'fire', color:'#ff8a22', r:28, pulse:12, intensity:0.8 },
    { module:3, x:320, y:420, type:'robotEye', color:'#ff3a2a', r:8, pulse:2.4 },
    { module:3, x:315, y:425, type:'electric', color:'#5affff', r:32, pulse:18 },
    { module:3, x:540, y:380, type:'robotEye', color:'#ff5a1a', r:7, pulse:1.9 },
    { module:3, x:535, y:385, type:'electric', color:'#7af4ff', r:36, pulse:14 },

    // Module 4 — mid06b (elevator lab) - fire/screens from art scan
    { module:4, x:700, y:42, type:'lamp', color:'#ffb44a', r:26, pulse:1.3, intensity:0.8 },
    { module:4, x:1070, y:196, type:'screen', color:'#4af1ff', r:24, pulse:2.4, intensity:0.55 },
    { module:4, x:70, y:418, type:'screen', color:'#4aff88', r:26, pulse:2.8, intensity:0.5 },
    { module:4, x:1245, y:418, type:'screen', color:'#5afcff', r:24, pulse:2.5, intensity:0.5 },
    { module:4, x:75, y:398, type:'fire', color:'#ff6a18', r:36, pulse:9.5, intensity:0.9 },
    { module:4, x:1245, y:398, type:'fire', color:'#ff6a18', r:36, pulse:9.5, intensity:0.9 },
    { module:4, x:828, y:528, type:'fire', color:'#ff8a22', r:40, pulse:10, intensity:1.0 },

    // Module 5 — mid07b (sand hangar - no fire in art)
    { module:5, x:160, y:260, type:'lamp', color:'#ffaa3a', r:20, pulse:1.6, intensity:0.6 },
    { module:5, x:1000, y:280, type:'lamp', color:'#ffaa3a', r:18, pulse:1.5, intensity:0.55 },
    { module:5, x:70, y:420, type:'screen', color:'#5afcff', r:22, pulse:2.5, intensity:0.5 },

    // Module 6 — mid08b (second elevator/satellite) - from mid08b art scan
    { module:6, x:825, y:468, type:'lamp', color:'#ffb44a', r:22, pulse:1.3, intensity:0.6 },
    { module:6, x:975, y:498, type:'lamp', color:'#ff9a2a', r:22, pulse:1.4, intensity:0.65 },
    { module:6, x:70, y:420, type:'screen', color:'#4af1ff', r:20, pulse:2.6, intensity:0.45 },
    { module:6, x:1160, y:510, type:'fire', color:'#ff7a22', r:24, pulse:11, intensity:0.6 },

    // Module 7 — mid05b (desert exit final)
    { module:7, x:350, y:390, type:'lamp', color:'#ffaa3a', r:20, pulse:1.4, intensity:0.6 },
    { module:7, x:1248, y:530, type:'fire', color:'#ff8a22', r:24, pulse:8, intensity:0.7 },
  ];

  function resetPlatforms(){ for(const p of platforms){ p.dead=false; p.triggered=false; p.breakT=0; p.y=p.baseY; } }
  function updatePlatforms(dt,player){
    for(const p of platforms){
      if(p.dead) continue;
      if(p.fragile && !p.triggered){
        const riding = player && !player.dead && player.jetpackT<=0 && Math.abs(player.y - p.y) < 8 && player.x > p.x && player.x < p.x + p.w && player.vy>=0;
        if(riding){ player.y=p.y; player.onGround=true; if(!p.triggered){ p.triggered=true; p.breakT=1.45; } }
      } else if(!p.fragile){
        const riding = player && !player.dead && player.jetpackT<=0 && Math.abs(player.y - p.y) < 8 && player.x > p.x && player.x < p.x + p.w && player.vy>=0;
        if(riding){ player.y=p.y; player.onGround=true; }
      }
      if(p.triggered){ p.breakT-=dt; if(p.breakT<=0) p.dead=true; }
    }
  }

  function drawTiledFullscreen(g,img,camX,parallax,VW,VH){
    if(!imageReady(img)) return false;
    const sw=img.naturalWidth||img.width, sh=img.naturalHeight||img.height;
    const scale=VH/sh;
    const tw=Math.round(sw*scale), th=VH;
    const scroll=camX*parallax;
    let x=-(scroll%tw)-tw;
    g.save(); g.imageSmoothingEnabled=false;
    for(; x<VW+tw; x+=tw) g.drawImage(img, Math.round(x), 0, tw, th);
    g.restore(); return true;
  }

  function drawProceduralNeon(g,time,VW,VH){
    const pulse=0.55+Math.sin(time*1.05)*0.28+Math.sin(time*0.67)*0.18;
    const grad=g.createLinearGradient(0,0,0,VH);
    grad.addColorStop(0,'#061326'); grad.addColorStop(0.25,'#0a2444'); grad.addColorStop(0.55,'#12385f'); grad.addColorStop(0.85,'#1a4f7a'); grad.addColorStop(1,'#0a2a44');
    g.fillStyle=grad; g.fillRect(0,0,VW,VH);
    g.save(); g.globalCompositeOperation='lighter';
    for(let i=0;i<2;i++){
      const cx=VW*(0.35+i*0.35)+Math.sin(time*0.28+i)*18;
      const cy=VH*0.42+Math.cos(time*0.31+i*1.2)*10;
      const radius=420+Math.sin(time*1.4+i)*38+pulse*55;
      const inner=g.createRadialGradient(cx,cy,8,cx,cy,radius);
      inner.addColorStop(0,'rgba(90,220,255,'+(0.38*pulse).toFixed(3)+')');
      inner.addColorStop(0.18,'rgba(60,160,255,'+(0.22*pulse).toFixed(3)+')');
      inner.addColorStop(0.45,'rgba(30,90,180,0.12)'); inner.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=inner; g.beginPath(); g.arc(cx,cy,radius,0,Math.PI*2); g.fill();
    }
    g.globalAlpha=0.09+pulse*0.04; g.fillStyle='#3bd8ff';
    for(let y=0;y<VH;y+=8){ if((y+Math.floor(time*40))%24<2) g.fillRect(0,y,VW,2); }
    g.restore();
  }

  function drawBackground(g,camX,time,VW,VH){
    time=time||(window.G&&G.time)||0;
    drawProceduralNeon(g,time,VW,VH);
    drawTiledFullscreen(g,tutorialBack,camX,0.08,VW,VH);
    const midW=MODULE_W*MID_SCALE, midH=768*MID_SCALE;
    for(let i=0;i<tutorialMids.length;i++){
      const img=tutorialMids[i];
      if(!imageReady(img)) continue;
      const worldX=i*MODULE_W;
      const screenX=Math.round(worldX - camX);
      if(screenX+midW<-220 || screenX>VW+220) continue;
      g.save(); g.imageSmoothingEnabled=false;
      g.drawImage(img, screenX, Math.round(MID_BASE_Y), midW, midH);
      g.restore();
    }
    g.save();
    for(const lt of lights){
      const worldX=lt.module*MODULE_W + lt.x*MID_SCALE;
      const screenX=worldX - camX;
      if(screenX<-140 || screenX>VW+140) continue;
      const screenY=MID_BASE_Y + lt.y*MID_SCALE;
      const flicker=Math.sin(time*lt.pulse + lt.x*0.01)*0.22 + Math.cos(time*lt.pulse*0.7)*0.15;
      const intensity=Math.max(0,Math.min(1,lt.intensity + flicker*0.35));
      if(intensity<=0.02) continue;
      if(lt.type==='lamp'){
        g.globalCompositeOperation='lighter';
        const grad=g.createRadialGradient(screenX,screenY,1,screenX,screenY,lt.r*intensity*1.7);
        grad.addColorStop(0,lt.color); grad.addColorStop(0.35,lt.color+'cc'); grad.addColorStop(1,'rgba(0,0,0,0)');
        g.globalAlpha=0.88*intensity; g.fillStyle=grad; g.beginPath(); g.arc(screenX,screenY,lt.r*intensity*1.7,0,Math.PI*2); g.fill();
        g.globalAlpha=1; g.fillStyle='#fff8cc'; g.beginPath(); g.arc(screenX,screenY,3+intensity*2,0,Math.PI*2); g.fill();
      } else if(lt.type==='screen'){
        g.globalCompositeOperation='lighter'; g.globalAlpha=0.40*intensity; g.fillStyle=lt.color; g.fillRect(screenX-14,screenY-10,28,20);
        const grad=g.createRadialGradient(screenX,screenY,2,screenX,screenY,lt.r);
        grad.addColorStop(0,lt.color); grad.addColorStop(1,'rgba(0,0,0,0)');
        g.globalAlpha=0.58*intensity; g.fillStyle=grad; g.beginPath(); g.arc(screenX,screenY,lt.r,0,Math.PI*2); g.fill();
      } else if(lt.type==='fire'){
        g.globalCompositeOperation='lighter';
        const fireFlick=Math.sin(time*lt.pulse)*3+Math.random()*2;
        const h=15+Math.abs(fireFlick); const fw=13+Math.abs(fireFlick)*0.6;
        let grad=g.createRadialGradient(screenX,screenY,2,screenX,screenY-6,lt.r*1.3);
        grad.addColorStop(0,'#ffef8a'); grad.addColorStop(0.22,lt.color); grad.addColorStop(1,'rgba(80,20,0,0)');
        g.globalAlpha=0.85*intensity; g.fillStyle=grad; g.beginPath(); g.arc(screenX,screenY-4,lt.r*intensity,0,Math.PI*2); g.fill();
        g.globalAlpha=0.94; g.fillStyle='#ffe28a'; g.beginPath(); g.moveTo(screenX-fw*0.5,screenY); g.lineTo(screenX,screenY-h-fireFlick); g.lineTo(screenX+fw*0.5,screenY); g.closePath(); g.fill();
        g.fillStyle='#ff6a18'; g.beginPath(); g.moveTo(screenX-fw*0.3,screenY); g.lineTo(screenX,screenY-h*0.72); g.lineTo(screenX+fw*0.3,screenY); g.closePath(); g.fill();
        if(Math.random()<0.14 && window.G && G.particles){
          G.particles.push({kind:'ember',x:worldX+(Math.random()-0.5)*10,y:screenY-6,vx:(Math.random()-0.5)*50,vy:-60-Math.random()*70,t:0,life:0.5+Math.random()*0.5,color:Math.random()<0.5?'#ff9a2a':'#ffe28a',size:1.5+Math.random()*3,grav:-15,drag:0.85});
        }
      } else if(lt.type==='robotEye'){
        g.globalCompositeOperation='lighter'; g.globalAlpha=0.85*intensity; g.fillStyle=lt.color;
        const flick=Math.sin(time*lt.pulse)*1.5;
        g.beginPath(); g.arc(screenX+flick*0.3, screenY, 3+intensity*2.5, 0, Math.PI*2); g.fill();
        g.fillStyle='#fff8a0'; g.globalAlpha=0.9; g.beginPath(); g.arc(screenX, screenY, 1.6,0,Math.PI*2); g.fill();
        if(Math.random()<0.04){ g.globalAlpha=0.18; g.fillStyle=lt.color; g.fillRect(screenX, screenY, 40+Math.random()*60, 1); }
      } else if(lt.type==='electric'){
        g.globalCompositeOperation='lighter'; g.globalAlpha=0.32+Math.sin(time*lt.pulse)*0.18;
        g.strokeStyle=lt.color; g.lineWidth=1.2;
        g.beginPath();
        let ex=screenX, ey=screenY;
        for(let k=0;k<5;k++){
          const nx=ex + (Math.random()-0.5)*18, ny=ey + (Math.random()-0.5)*18;
          g.moveTo(ex,ey); g.lineTo(nx,ny); ex=nx; ey=ny;
        }
        g.stroke();
        if(Math.random()<0.12){
          g.fillStyle='#ffffff'; g.globalAlpha=0.7; g.beginPath(); g.arc(screenX+(Math.random()-0.5)*14, screenY+(Math.random()-0.5)*14, 1.5,0,Math.PI*2); g.fill();
        }
      }
    }
    g.restore();

    // End beacon light
    g.save();
    const orbWorldX=END_LIGHT.x, orbWorldY=END_LIGHT.y;
    const orbScreenX=orbWorldX - camX, orbScreenY=orbWorldY;
    if(orbScreenX>-60 && orbScreenX<VW+60){
      const p=Math.sin(time*2.2)*0.2+0.8;
      g.globalCompositeOperation='lighter';
      let grad=g.createRadialGradient(orbScreenX,orbScreenY,4,orbScreenX,orbScreenY,END_LIGHT.r*5);
      grad.addColorStop(0,'#fff8cc'); grad.addColorStop(0.2,'#68efff'); grad.addColorStop(0.45,'#2a9aff'); grad.addColorStop(1,'rgba(0,0,0,0)');
      g.globalAlpha=0.85*p; g.fillStyle=grad; g.beginPath(); g.arc(orbScreenX,orbScreenY,END_LIGHT.r*5,0,Math.PI*2); g.fill();
      g.globalAlpha=1; g.fillStyle='#ffffff'; g.beginPath(); g.arc(orbScreenX,orbScreenY,4+Math.sin(time*6)*1.2,0,Math.PI*2); g.fill();
      g.globalAlpha=0.55; g.strokeStyle='#a0f0ff'; g.lineWidth=2;
      g.beginPath(); g.arc(orbScreenX,orbScreenY,18+Math.sin(time*3)*2, time*1.2, time*1.2+Math.PI*1.6); g.stroke();
    }
    g.restore();
  }

  function drawGround(g,camX,VW,VH){
    if(window.G && G.godMode){
      g.save(); g.globalAlpha=0.26;
      for(const pl of platforms){
        if(pl.dead) continue;
        const px=pl.x-camX;
        if(px+pl.w<-40 || px>VW+40) continue;
        g.fillStyle=pl.fragile?'#ff4d45':'#3aff7a';
        g.fillRect(Math.round(px), Math.round(pl.y), pl.w, 2);
        g.fillRect(Math.round(px), Math.round(pl.y), 4, 4);
      }
      g.restore();
    }
  }

  function drawExtremeForeground(g,camX,VW,VH){
    const time = (window.G&&G.time)||0;
    g.save(); g.imageSmoothingEnabled=false;
    if(imageReady(pilarImage)){
      const pilarW = 120, pilarH = 768, scale = 1.0;
      const drawW = pilarW*scale, drawH = pilarH*scale;
      for(let i=1;i<MODULE_COUNT;i++){
        const worldX = i*MODULE_W;
        const sx = Math.round(worldX - camX - drawW/2);
        if(sx<-300 || sx>VW+300) continue;
        g.globalAlpha = 0.96;
        g.drawImage(pilarImage, sx, Math.round(MID_BASE_Y), drawW, drawH);
        g.globalCompositeOperation='lighter'; g.globalAlpha=0.08;
        g.fillStyle='#68efff'; g.fillRect(sx+drawW*0.3, MID_BASE_Y, drawW*0.1, drawH*0.25);
        g.globalCompositeOperation='source-over'; g.globalAlpha=1;
      }
    }
    g.restore();

    g.save(); g.imageSmoothingEnabled=false;
    if(imageReady(tutorialFore)){
      const foreScale=1.0, foreTileW=724*foreScale, foreTileH=768*foreScale;
      const foreY=VH - foreTileH + 140;
      let sx = Math.round(0 - camX*1.18);
      if(sx>-foreTileW && sx<VW+foreTileW) g.drawImage(tutorialFore, sx, Math.round(foreY), foreTileW, foreTileH);
      sx = Math.round(150 - camX*1.18);
      if(sx>-foreTileW && sx<VW+foreTileW){ g.globalAlpha=0.85; g.drawImage(tutorialFore, sx, Math.round(foreY), foreTileW*0.85, foreTileH*0.85); g.globalAlpha=1; }
      const secondX = 4*MODULE_W + 200;
      const sx2 = Math.round(secondX - camX*1.18);
      if(sx2>-foreTileW && sx2<VW+foreTileW){ g.globalAlpha=0.92; g.drawImage(tutorialFore, sx2, Math.round(foreY), foreTileW, foreTileH); g.globalAlpha=1; }
    }
    g.restore();
  }

  function nightAmount(){ return 0.78; }
  function isLavaGap(){ return false; }
  function updateHazards(dt){
    if(window.G && G.particles && Math.random()<dt*18){
      const x = (window.G ? G.camX : 0) + Math.random() * 960;
      G.particles.push({
        kind:'spark', x:x, y:-10,
        vx:(Math.random()-0.5)*12, vy:80+Math.random()*160,
        t:0, life:2+Math.random()*3,
        color:Math.random()<0.3?'#68efff':'#8ab5ff',
        size:1+Math.random()*2, grav:0, drag:0.3
      });
    }
  }
  function playerTouchesLaser(){ return false; }

  window.TutorialLevel={
    W:W, GROUND:GROUND, VIEW_W:960, VIEW_H:540,
    platforms:platforms, spawns:spawns, props:props, highPickups:highPickups,
    slugSpawns:slugSpawns, SURFBOARD_X:SURFBOARD_X, END_LIGHT:END_LIGHT, lights:lights,
    duneSpec:null, mountainSpec:null, skySpec:null,
    nightAmount:nightAmount, isLavaGap:isLavaGap, updateHazards:updateHazards,
    playerTouchesLaser:playerTouchesLaser, resetPlatforms:resetPlatforms,
    updatePlatforms:updatePlatforms, drawBackground:drawBackground, drawGround:drawGround,
    drawExtremeForeground:drawExtremeForeground,
    BOSS_TRIGGER_X:999999, BOSS_X:999999, PORTAL_X:999999, MODULE_W:MODULE_W,
  };
})();
