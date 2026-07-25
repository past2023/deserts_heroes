// ============================================================
// TUTORIAL LEVEL — Frontier Training Annex v5
// Updated for 8 modules (01,02,03,04,06,07,08,05) + pilar seams
// Platforms extracted from white-on-black tutorial_midXX_refe.png guides.
// Pilar01.png hides seams at each module border.
// Pilar02.png is an optional center-level extreme-foreground accent.
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
  const pilarImage = new Image(); pilarImage.decoding='async'; pilarImage.src='assets/tutorial/pilar01.png';
  const pilar02Image = new Image(); pilar02Image.decoding='async'; pilar02Image.src='assets/tutorial/pilar02.png';
  const soldier06DecorImage = new Image(); soldier06DecorImage.decoding='async'; soldier06DecorImage.src='assets/enemies/soldier06/enemie_soldier06.png';

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

  pilarImage.onerror = function(){ if(!this._fallbackTried){ this._fallbackTried=true; this.src = 'upload/pilar01.png'; } };
  pilar02Image.onerror = function(){ if(!this._fallbackTried){ this._fallbackTried=true; this.src = 'upload/pilar02.png'; } };

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

  // Light FX placed at positions matching actual pixel art in mid PNGs.
  // Screen entries use exact pixel-bounds from the monitor art, so the glow
  // follows the rectangular PC-screen shape instead of a generic floating blob.
  // Fires are only used where the art has a visible flame source.
  const lights=[
    // Module 0 — mid01b (satellite dish lab)
    { module:0, x:70, y:392, type:'lamp', color:'#ffb44a', r:16, pulse:1.7, intensity:0.62 },
    { module:0, x:70, y:418, w:27, h:9, type:'screen', color:'#4af1ff', r:21, pulse:3.2, intensity:0.58 },
    { module:0, x:612, y:346, w:7, h:7, type:'screen', color:'#58f0ff', r:10, pulse:2.4, intensity:0.34 },
    { module:0, x:607, y:354, w:5, h:7, type:'screen', color:'#58f0ff', r:9, pulse:2.5, intensity:0.30 },
    { module:0, x:594, y:366, w:8, h:11, type:'screen', color:'#58f0ff', r:12, pulse:2.6, intensity:0.34 },
    { module:0, x:560, y:106, type:'lamp', color:'#ff9a2a', r:29, pulse:1.1, intensity:0.80 },
    { module:0, x:1020, y:144, type:'lamp', color:'#ffb44a', r:24, pulse:1.4, intensity:0.70 },
    { module:0, x:1111, y:88, w:33, h:4, type:'screen', color:'#42f2ff', r:18, pulse:2.2, intensity:0.46 },
    { module:0, x:1116, y:116, w:28, h:11, type:'screen', color:'#42f2ff', r:22, pulse:2.4, intensity:0.58 },
    { module:0, x:1236, y:395, type:'lamp', color:'#ffaa3a', r:20, pulse:1.3, intensity:0.58 },
    { module:0, x:1249, y:416, w:30, h:8, type:'screen', color:'#58f0ff', r:18, pulse:2.8, intensity:0.52 },
    { module:0, x:900, y:530, type:'fire', color:'#ff6a18', r:30, pulse:11, intensity:0.82 },

    // Module 1 — mid02b (broken circular)
    { module:1, x:72, y:395, type:'lamp', color:'#ffaa3a', r:18, pulse:1.6, intensity:0.60 },
    { module:1, x:69, y:418, w:25, h:9, type:'screen', color:'#4aff88', r:22, pulse:2.5, intensity:0.58 },
    { module:1, x:414, y:487, w:57, h:23, type:'screen', color:'#5afcff', r:36, pulse:1.8, intensity:0.64 },
    { module:1, x:1020, y:144, type:'lamp', color:'#ff9a2a', r:24, pulse:1.2, intensity:0.72 },
    { module:1, x:1238, y:392, type:'lamp', color:'#ffaa3a', r:20, pulse:1.5, intensity:0.58 },
    { module:1, x:1249, y:416, w:30, h:8, type:'screen', color:'#58f0ff', r:18, pulse:2.8, intensity:0.50 },

    // Module 2 — mid03b (suspended ship)
    { module:2, x:72, y:392, type:'lamp', color:'#ffaa3a', r:18, pulse:1.7, intensity:0.60 },
    { module:2, x:236, y:130, type:'lamp', color:'#ff9a2a', r:27, pulse:1.3, intensity:0.76 },
    { module:2, x:660, y:459, w:37, h:11, type:'screen', color:'#4af1ff', r:26, pulse:2.2, intensity:0.60 },
    { module:2, x:900, y:532, type:'fire', color:'#ff6a18', r:32, pulse:10, intensity:0.86 },
    { module:2, x:1020, y:144, type:'lamp', color:'#ffb44a', r:24, pulse:1.4, intensity:0.72 },
    { module:2, x:1116, y:116, w:28, h:11, type:'screen', color:'#42f2ff', r:22, pulse:2.4, intensity:0.58 },
    { module:2, x:1240, y:395, type:'lamp', color:'#ffaa3a', r:20, pulse:1.5, intensity:0.60 },
    { module:2, x:1249, y:416, w:30, h:8, type:'screen', color:'#58f0ff', r:18, pulse:2.8, intensity:0.50 },

    // Module 3 — mid04b (desert view upper + two broken robots)
    { module:3, x:72, y:396, type:'lamp', color:'#ffaa3a', r:18, pulse:1.7, intensity:0.60 },
    { module:3, x:69, y:418, w:25, h:9, type:'screen', color:'#4aff88', r:20, pulse:2.5, intensity:0.50 },
    { module:3, x:332, y:362, type:'robotEye', color:'#ff4a22', r:7, pulse:2.6, intensity:0.92 },
    { module:3, x:334, y:366, type:'electric', color:'#5affff', r:26, pulse:18, intensity:0.62 },
    { module:3, x:520, y:360, type:'robotEye', color:'#ff5a1a', r:7, pulse:2.1, intensity:0.86 },
    { module:3, x:522, y:366, type:'electric', color:'#7af4ff', r:28, pulse:14, intensity:0.66 },
    { module:3, x:532, y:493, w:9, h:2, type:'screen', color:'#5afcff', r:10, pulse:2.3, intensity:0.30 },
    { module:3, x:539, y:498, w:6, h:2, type:'screen', color:'#5afcff', r:10, pulse:2.3, intensity:0.30 },
    { module:3, x:742, y:410, type:'lamp', color:'#ffaa3a', r:20, pulse:1.8, intensity:0.56 },
    { module:3, x:1192, y:372, type:'lamp', color:'#ffb44a', r:16, pulse:1.6, intensity:0.48 },

    // Module 4 — mid06b (elevator lab)
    { module:4, x:72, y:395, type:'lamp', color:'#ffaa3a', r:17, pulse:1.6, intensity:0.58 },
    { module:4, x:70, y:418, w:26, h:9, type:'screen', color:'#4aff88', r:21, pulse:2.8, intensity:0.50 },
    { module:4, x:260, y:126, type:'lamp', color:'#ff9a2a', r:18, pulse:1.2, intensity:0.58 },
    { module:4, x:700, y:42, type:'lamp', color:'#ffb44a', r:23, pulse:1.3, intensity:0.70 },
    { module:4, x:832, y:526, type:'fire', color:'#ff7a22', r:30, pulse:10, intensity:0.82 },
    { module:4, x:850, y:437, w:18, h:6, type:'screen', color:'#72e7ff', r:18, pulse:2.1, intensity:0.46 },
    { module:4, x:839, y:466, w:37, h:51, type:'screen', color:'#72e7ff', r:34, pulse:2.1, intensity:0.54 },
    { module:4, x:1077, y:196, w:38, h:30, type:'screen', color:'#4af1ff', r:28, pulse:2.4, intensity:0.60 },
    { module:4, x:1244, y:392, type:'lamp', color:'#ffaa3a', r:18, pulse:1.5, intensity:0.56 },
    { module:4, x:1249, y:416, w:30, h:8, type:'screen', color:'#5afcff', r:18, pulse:2.5, intensity:0.50 },

    // Module 5 — mid07b (sand hangar - no fire in art)
    { module:5, x:160, y:260, type:'lamp', color:'#ffaa3a', r:18, pulse:1.6, intensity:0.52 },
    { module:5, x:912, y:390, w:23, h:4, type:'screen', color:'#5afcff', r:14, pulse:2.5, intensity:0.38 },
    { module:5, x:916, y:409, w:15, h:6, type:'screen', color:'#5afcff', r:14, pulse:2.5, intensity:0.38 },
    { module:5, x:1000, y:280, type:'lamp', color:'#ffaa3a', r:17, pulse:1.5, intensity:0.50 },
    { module:5, x:1043, y:450, w:28, h:23, type:'screen', color:'#5afcff', r:24, pulse:2.5, intensity:0.54 },
    { module:5, x:1042, y:491, w:38, h:29, type:'screen', color:'#5afcff', r:28, pulse:2.2, intensity:0.58 },
    { module:5, x:1091, y:494, w:21, h:21, type:'screen', color:'#5afcff', r:22, pulse:2.2, intensity:0.54 },
    { module:5, x:1029, y:530, w:29, h:23, type:'screen', color:'#5afcff', r:24, pulse:2.3, intensity:0.54 },
    { module:5, x:1073, y:531, w:28, h:25, type:'screen', color:'#5afcff', r:24, pulse:2.3, intensity:0.54 },
    { module:5, x:1238, y:394, type:'lamp', color:'#ff4d38', r:17, pulse:2.4, intensity:0.46 },
    { module:5, x:1249, y:416, w:30, h:8, type:'screen', color:'#5afcff', r:18, pulse:2.5, intensity:0.46 },

    // Module 6 — mid08b (second elevator/satellite)
    { module:6, x:72, y:396, type:'lamp', color:'#ffaa3a', r:17, pulse:1.6, intensity:0.56 },
    { module:6, x:535, y:616, type:'fire', color:'#ff7a22', r:30, pulse:11, intensity:0.78 },
    { module:6, x:825, y:530, type:'lamp', color:'#ffb44a', r:20, pulse:1.3, intensity:0.56 },
    { module:6, x:1077, y:196, w:36, h:30, type:'screen', color:'#4af1ff', r:28, pulse:2.6, intensity:0.58 },
    { module:6, x:1242, y:394, type:'lamp', color:'#ff4d38', r:17, pulse:2.2, intensity:0.48 },
    { module:6, x:1249, y:416, w:30, h:8, type:'screen', color:'#5afcff', r:18, pulse:2.5, intensity:0.46 },

    // Module 7 — mid05b (desert exit final)
    { module:7, x:350, y:390, type:'lamp', color:'#ffaa3a', r:18, pulse:1.4, intensity:0.48 },
    { module:7, x:785, y:150, w:66, h:78, type:'screen', color:'#7befff', r:42, pulse:2.1, intensity:0.34 },
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

  const decorDrones = [
    { module:1, x:610, y:280, phase:0.2, scale:0.56 },
    { module:3, x:930, y:278, phase:1.8, scale:0.56 },
    { module:5, x:640, y:250, phase:3.4, scale:0.54 },
    { module:6, x:880, y:278, phase:5.0, scale:0.56 },
  ];
  function drawDecorDrones(g,camX,time,VW){
    if(!imageReady(soldier06DecorImage)) return;
    g.save(); g.imageSmoothingEnabled=false;
    for(const d of decorDrones){
      // Same visual scale as the normal Soldier06 observer, but scripted as a
      // decorative broken unit: patrol, violent malfunction, explosion, reboot.
      const cycle=(time+d.phase)%7.4;
      const malfunction=cycle>3.75 && cycle<=5.1;
      const exploding=cycle>5.1 && cycle<=6.45;
      const reboot=cycle>6.45;
      const patrol=Math.sin(time*1.05+d.phase)*46;
      const wx=d.module*MODULE_W + d.x + patrol;
      const sx=Math.round(wx-camX);
      if(sx<-150 || sx>VW+150) continue;
      const sy=Math.round(MID_BASE_Y + d.y + Math.sin(time*1.8+d.phase)*5);
      const sw=soldier06DecorImage.naturalWidth*d.scale, sh=soldier06DecorImage.naturalHeight*d.scale;
      if(!exploding && !reboot){
        const glitch=malfunction ? Math.sin(time*120+d.phase)*5 : (Math.sin(time*41+d.phase)>0.88 ? Math.sin(time*90)*2 : 0);
        g.globalAlpha=malfunction ? 0.95 : 0.86;
        if(malfunction && Math.sin(time*32)>0.72){ g.globalAlpha=0.45; }
        g.drawImage(soldier06DecorImage, sx-sw/2+glitch, sy-sh/2, sw, sh);
        g.globalCompositeOperation='lighter';
        g.globalAlpha=(malfunction?0.75:0.44)+Math.sin(time*11+d.phase)*0.12;
        g.fillStyle=malfunction?'#ffffff':'#68efff';
        g.beginPath(); g.arc(sx+sw*0.08, sy-sh*0.16, malfunction?10:7, 0, Math.PI*2); g.fill();
        g.strokeStyle=malfunction?'#ffffff':'#7af4ff'; g.lineWidth=malfunction?1.5:1;
        const arcs=malfunction?5:1;
        for(let a=0;a<arcs;a++){
          if(!malfunction && Math.sin(time*17+d.phase)<=0.65) continue;
          g.beginPath();
          g.moveTo(sx+(Math.random()-0.5)*18, sy-sh*(0.12+Math.random()*0.18));
          g.lineTo(sx+18+Math.random()*32, sy-sh*0.16+Math.sin(time*31+a)*12);
          g.stroke();
        }
        g.globalCompositeOperation='source-over';
      } else if(exploding) {
        const p=Math.min(1,(cycle-5.1)/1.35);
        g.globalCompositeOperation='lighter';
        g.globalAlpha=(1-p)*0.88;
        for(let i=0;i<24;i++){
          const a=i*0.62+time*3.7;
          const r=10+p*(22+i*2.8);
          g.fillStyle=i%3?'#68efff':(i%2?'#ffffff':'#ff9a2a');
          g.fillRect(Math.round(sx+Math.cos(a)*r), Math.round(sy+Math.sin(a)*r), 2+(i%3), 2+(i%2));
        }
        g.globalAlpha=(1-p)*0.40;
        g.fillStyle='#ff7a22'; g.beginPath(); g.arc(sx,sy,20+p*34,0,Math.PI*2); g.fill();
        g.globalAlpha=(1-p)*0.26;
        g.fillStyle='#68efff'; g.beginPath(); g.arc(sx,sy,36+p*54,0,Math.PI*2); g.fill();
        g.globalCompositeOperation='source-over';
      }
    }
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
    drawDecorDrones(g, camX, time, VW);

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
        g.globalCompositeOperation='lighter';
        const sw = (lt.w || 28) * MID_SCALE;
        const sh = (lt.h || 20) * MID_SCALE;
        const left = screenX - sw/2, top = screenY - sh/2;
        const tvFlick = Math.max(0.08, 0.62 + Math.sin(time*38 + lt.x)*0.28 + Math.sin(time*91 + lt.y)*0.16);
        const dropout = (Math.sin(time*17.3 + lt.x*0.07) > 0.88) ? 0.18 : 1;
        const tvI = intensity * tvFlick * dropout;
        const jitterX = Math.round(Math.sin(time*77 + lt.y) * 1.5);
        // Exact rectangular malfunctioning CRT face.
        g.globalAlpha=0.38*tvI; g.fillStyle=lt.color; g.fillRect(Math.round(left+jitterX), Math.round(top), Math.max(1,Math.round(sw)), Math.max(1,Math.round(sh)));
        g.globalAlpha=0.28*tvI; g.fillStyle='#ffffff';
        for(let yy=top+1; yy<top+sh-1; yy+=3) {
          const lineShift = Math.round(Math.sin(time*65 + yy + lt.x)*2);
          g.fillRect(Math.round(left+2+lineShift), Math.round(yy), Math.max(1,Math.round(sw-4-lineShift)), 1);
        }
        if(Math.sin(time*53 + lt.x)>0.74){
          g.globalAlpha=0.35*tvI; g.fillStyle='#dfffff';
          g.fillRect(Math.round(left+1), Math.round(top+Math.abs(Math.sin(time*31))*Math.max(1,sh-3)), Math.max(1,Math.round(sw-2)), 2);
        }
        // Rectangular halo, then a soft radial spill around the monitor.
        g.globalAlpha=0.26*tvI; g.fillStyle=lt.color; g.fillRect(Math.round(left-2), Math.round(top-2), Math.max(1,Math.round(sw+4)), Math.max(1,Math.round(sh+4)));
        const grad=g.createRadialGradient(screenX,screenY,2,screenX,screenY,lt.r*(1+tvFlick*0.25));
        grad.addColorStop(0,lt.color); grad.addColorStop(0.45,lt.color+'aa'); grad.addColorStop(1,'rgba(0,0,0,0)');
        g.globalAlpha=0.46*tvI; g.fillStyle=grad; g.beginPath(); g.arc(screenX,screenY,lt.r*(1+tvFlick*0.18),0,Math.PI*2); g.fill();
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

    // Optional center-level extreme foreground accents. pilar02.png can live in
    // assets/tutorial/ or upload/; if it is absent the tutorial simply skips it.
    if(imageReady(pilar02Image)){
      const naturalW = pilar02Image.naturalWidth || pilar02Image.width || 226;
      const naturalH = pilar02Image.naturalHeight || pilar02Image.height || 768;
      const scale = 1.0;
      const drawW = naturalW*scale, drawH = naturalH*scale;
      const placements = [
        3*MODULE_W + 650,
        4*MODULE_W + 700,
        5*MODULE_W + 620,
      ];
      for(const worldX of placements){
        const sway = Math.sin(time*0.9 + worldX*0.002)*4;
        const sx = Math.round(worldX - camX*1.10 - drawW/2 + sway);
        if(sx<-drawW-80 || sx>VW+80) continue;
        g.globalAlpha = 0.92;
        g.drawImage(pilar02Image, sx, Math.round(MID_BASE_Y), drawW, drawH);
        g.globalCompositeOperation='lighter';
        g.globalAlpha=0.06 + Math.sin(time*2.2 + worldX)*0.015;
        g.fillStyle='#68efff';
        g.fillRect(sx+drawW*0.45, MID_BASE_Y+30, Math.max(3,drawW*0.08), drawH*0.22);
        // Foreground pilar02 malfunction: tiny electric crawls on cables.
        g.globalAlpha=0.22 + Math.sin(time*18 + worldX)*0.08;
        g.strokeStyle='#7af4ff'; g.lineWidth=1.1;
        for(let e=0;e<3;e++){
          const ex=sx+drawW*(0.38+e*0.13)+Math.sin(time*21+e)*4;
          let ey=MID_BASE_Y+drawH*(0.22+e*0.18);
          g.beginPath(); g.moveTo(ex,ey);
          for(let k=0;k<4;k++){ const nx=ex+(Math.random()-0.5)*18; ey += 10+Math.random()*16; g.lineTo(nx,ey); }
          g.stroke();
        }
        g.globalCompositeOperation='source-over';
        // Dark smoke drifting around the foreground pillar.
        for(let sidx=0;sidx<5;sidx++){
          const drift=(time*(12+sidx*2)+sidx*31)%130;
          const puff=1-drift/130;
          g.globalAlpha=0.10*puff;
          g.fillStyle=sidx%2?'#2b2d30':'#45413a';
          g.beginPath();
          g.arc(sx+drawW*(0.30+(sidx%3)*0.18)-drift*0.12, MID_BASE_Y+drawH*(0.20+sidx*0.10)-drift*0.20, 8+(1-puff)*18, 0, Math.PI*2);
          g.fill();
        }
        g.globalAlpha=1;
      }
    }
    g.restore();
  }

  function nightAmount(){ return 0.78; }
  function isLavaGap(){ return false; }
  const sparkRainModules = { 0:true, 2:true, 4:true, 6:true };
  function updateHazards(dt){
    if(!window.G || !G.particles) return;
    const camCenter = (G.camX || 0) + 480;
    const moduleIdx = Math.max(0, Math.min(MODULE_COUNT-1, Math.floor(camCenter / MODULE_W)));
    // Small electrical malfunctions can happen everywhere in the annex.
    if(Math.random()<dt*7){
      const x = (G.camX || 0) + Math.random() * 960;
      const y = 90 + Math.random() * 370;
      G.particles.push({
        kind:'spark', x:x, y:y,
        vx:(Math.random()-0.5)*90, vy:(Math.random()-0.5)*70,
        t:0, life:0.18+Math.random()*0.28,
        color:Math.random()<0.5?'#68efff':'#ffffff',
        size:1+Math.random()*2.8, grav:0, drag:0.72
      });
    }
    // Heavier blue data-rain remains module-specific for pacing.
    if(!sparkRainModules[moduleIdx]) return;
    const rainRate = moduleIdx === 6 ? 24 : 16;
    if(Math.random()<dt*rainRate){
      const x = (G.camX || 0) + Math.random() * 960;
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
