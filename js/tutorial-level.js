// ============================================================
// TUTORIAL LEVEL — Frontier Training Annex v3 (green-ref + layer order + fx)
// Order front->back spec by user:
// 1. tutorial_foreground01.png (extreme frontmost)
// 2. bunkers foreground (ExtremeForeground bunker images, parallax 1.16)
// 3. player / items / enemies / tank
// 4. mid01-05 modular CONNECTED (1376x768 scale 1.0)
// 5. tutorial_back01.png FULL SCREEN (2400x448 stretched to VH)
// 6. nuclear reactor blue pulse extreme background
// Platforms: INVISIBLE from green reference
// Floor: uses mid art floor, no procedural fill
// Added: robot eye fx, electric hazard, end light orb that summons surfboard alone
// ============================================================
(function () {
  const MODULE_W = 1376;
  const MODULE_COUNT = 5;
  const W = MODULE_W * MODULE_COUNT; // 6880
  const GROUND = 470;
  const VW = 960, VH = 540;
  const GROUND_LINE = 620;
  const MID_SCALE = 1.0;
  const MID_BASE_Y = GROUND - GROUND_LINE * MID_SCALE; // -150

  function imageReady(img){ return img && img.naturalWidth>0 && img.complete!==false; }

  const tutorialBack = new Image(); tutorialBack.decoding='async'; tutorialBack.src='assets/tutorial/tutorial_back01.png';
  const tutorialFore = new Image(); tutorialFore.decoding='async'; tutorialFore.src='assets/tutorial/tutorial_foreground01.png';
  const tutorialMids=[];
  for(let i=1;i<=5;i++){ const img=new Image(); img.decoding='async'; img.src='assets/tutorial/tutorial_mid0'+i+'b.png'; tutorialMids.push(img); }

  // Platforms from green reference (exact)
  const platforms=[
    // MID01 - elevator lab (module 0)
    { x:388, baseY:288, y:288, w:90, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:958, baseY:274, y:274, w:158, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:74, baseY:114, y:114, w:182, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:498, baseY:102, y:102, w:124, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:704, baseY:98, y:98, w:616, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:272, baseY:56, y:56, w:214, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    // MID02 - computer lab (module 1)
    { x:1674, baseY:290, y:290, w:182, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:1808, baseY:202, y:202, w:230, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:1376, baseY:152, y:152, w:504, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:1878, baseY:44, y:44, w:774, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    // MID03 - robot graveyard (module 2)
    { x:3727, baseY:301, y:301, w:142, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:3144, baseY:278, y:278, w:98, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:3476, baseY:231, y:231, w:123, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:3250, baseY:231, y:231, w:87, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:3253, baseY:107, y:107, w:145, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:3428, baseY:105, y:105, w:521, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:2824, baseY:102, y:102, w:181, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:3019, baseY:58, y:58, w:218, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    // MID04 - tech lab with tanks (module 3)
    { x:4248, baseY:346, y:346, w:88, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:4637, baseY:318, y:318, w:89, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:4771, baseY:317, y:317, w:202, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:5232, baseY:285, y:285, w:138, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:4205, baseY:111, y:111, w:224, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:4792, baseY:108, y:108, w:286, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:4590, baseY:108, y:108, w:150, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:5329, baseY:104, y:104, w:117, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    // MID05 - desert exit (module 4)
    { x:5726, baseY:297, y:297, w:90, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    // extra bridging for smooth traversal where green gaps exist
    { x:1200, baseY:340, y:340, w:220, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:2600, baseY:360, y:360, w:180, amp:0, speed:0, phase:0, fragile:false, invisible:true },
    { x:4050, baseY:380, y:380, w:160, amp:0, speed:0, phase:0, fragile:false, invisible:true },
  ];

  const spawns=[
    { x:700, type:'soldier' },
    { x:1150, type:'pow' },
    { x:1720, type:'observer' },
    { x:2050, type:'soldier' },
    { x:2380, type:'grenadier' },
    { x:2950, type:'observer' },
    { x:3350, type:'knife' },
    { x:3850, type:'soldier' },
    { x:4220, type:'observer' },
    { x:4600, type:'bazooka' },
    { x:5100, type:'soldier' },
    { x:5380, type:'grenadier' },
    { x:5750, type:'observer' },
  ];
  const props=[
    { x:980, type:'barrel01' },
    { x:2510, type:'barrel02' },
    { x:3520, type:'crate' },
    { x:4780, type:'barrel01' },
    { x:5320, type:'crate' },
  ];
  const highPickups=[
    { x:500, type:'mg' },
    { x:1650, type:'grenades' },
    { x:2220, type:'homing' },
    { x:3150, type:'heart' },
    { x:4350, type:'jet_pack' },
    { x:5750, type:'heart' },
  ];
  const slugSpawns=[ { x:2850, type:'ally_tank02' } ];
  const SURFBOARD_X = W - 90;
  const END_LIGHT = { x: W - 140, y: 190, r: 26, triggered:false };

  const lights=[
    { module:0, x:238, y:126, type:'lamp', color:'#ff9a2a', r:34, pulse:1.2, intensity:0.9 },
    { module:0, x:1002, y:142, type:'lamp', color:'#ffb44a', r:28, pulse:1.4, intensity:0.8 },
    { module:0, x:1209, y:133, type:'lamp', color:'#ff9a2a', r:32, pulse:1.1, intensity:0.9 },
    { module:0, x:141, y:258, type:'lamp', color:'#ffaa3a', r:22, pulse:2.0, intensity:0.6 },
    { module:0, x:1168, y:262, type:'lamp', color:'#ff8a1a', r:30, pulse:1.3, intensity:0.85 },
    { module:0, x:430, y:260, type:'lamp', color:'#ffb46a', r:26, pulse:1.5, intensity:0.7 },
    { module:0, x:69, y:417, type:'screen', color:'#4af1ff', r:26, pulse:3.2, intensity:0.55 },
    { module:0, x:1248, y:415, type:'screen', color:'#58f0ff', r:22, pulse:2.8, intensity:0.5 },
    { module:0, x:920, y:530, type:'fire', color:'#ff6a18', r:48, pulse:11, intensity:1.0 },
    { module:1, x:1003, y:143, type:'lamp', color:'#ff9a2a', r:28, pulse:1.2, intensity:0.85 },
    { module:1, x:69, y:418, type:'screen', color:'#4aff88', r:32, pulse:2.5, intensity:0.6 },
    { module:1, x:414, y:486, type:'screen', color:'#5afcff', r:44, pulse:1.8, intensity:0.65 },
    { module:1, x:339, y:299, type:'fire', color:'#ff7a20', r:36, pulse:9, intensity:0.9 },
    { module:1, x:87, y:296, type:'lamp', color:'#ffaa3a', r:24, pulse:1.6, intensity:0.7 },
    { module:2, x:238, y:126, type:'lamp', color:'#ff9a2a', r:30, pulse:1.3, intensity:0.8 },
    { module:2, x:1001, y:142, type:'lamp', color:'#ffb44a', r:28, pulse:1.4, intensity:0.8 },
    { module:2, x:75, y:386, type:'lamp', color:'#ffaa3a', r:22, pulse:1.7, intensity:0.6 },
    { module:2, x:659, y:458, type:'screen', color:'#4af1ff', r:28, pulse:2.2, intensity:0.6 },
    { module:2, x:922, y:531, type:'fire', color:'#ff6a18', r:50, pulse:10, intensity:1.0 },
    { module:3, x:182, y:257, type:'lamp', color:'#ff9a2a', r:34, pulse:1.5, intensity:0.9 },
    { module:3, x:75, y:387, type:'lamp', color:'#ffaa3a', r:20, pulse:1.8, intensity:0.6 },
    { module:3, x:68, y:418, type:'screen', color:'#5affa0', r:30, pulse:2.6, intensity:0.55 },
    { module:3, x:682, y:527, type:'fire', color:'#ff8a22', r:28, pulse:12, intensity:0.8 },
    { module:4, x:348, y:385, type:'lamp', color:'#ffaa3a', r:20, pulse:1.4, intensity:0.6 },
    { module:4, x:1248, y:530, type:'fire', color:'#ff8a22', r:24, pulse:8, intensity:0.7 },
  ];

  // Robot decoration FX — two giant robots in mid04 (module index 3)
  const robotFX=[
    // robot lying left (humanoid)
    { module:3, x:320, y:420, type:'robotEye', color:'#ff3a2a', r:8, pulse:2.4 },
    { module:3, x:315, y:425, type:'electric', color:'#5affff', r:32, pulse:18 },
    // tracked robot middle
    { module:3, x:540, y:380, type:'robotEye', color:'#ff5a1a', r:7, pulse:1.9 },
    { module:3, x:535, y:385, type:'electric', color:'#7af4ff', r:36, pulse:14 },
  ];

  function resetPlatforms(){ for(const p of platforms){ p.dead=false; p.triggered=false; p.breakT=0; p.y=p.baseY; } }
  function updatePlatforms(dt,player){
    for(const p of platforms){
      if(p.dead) continue;
      if(p.fragile && !p.triggered){
        const riding = player && !player.dead && player.jetpackT<=0 && Math.abs(player.y - p.y) < 6 && player.x > p.x && player.x < p.x + p.w && player.vy>=0;
        if(riding){ player.y=p.y; player.onGround=true; if(!p.triggered){ p.triggered=true; p.breakT=1.45; } }
      } else if(!p.fragile){
        const riding = player && !player.dead && player.jetpackT<=0 && Math.abs(player.y - p.y) < 6 && player.x > p.x && player.x < p.x + p.w && player.vy>=0;
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
    // back01 full screen behind mids
    drawTiledFullscreen(g,tutorialBack,camX,0.08,VW,VH);
    // mids connected
    const midW=MODULE_W*MID_SCALE, midH=768*MID_SCALE;
    for(let i=0;i<tutorialMids.length;i++){
      const img=tutorialMids[i];
      if(!imageReady(img)) continue;
      const worldX=i*MODULE_W;
      const screenX=Math.round(worldX - camX);
      if(screenX+midW<-140 || screenX>VW+140) continue;
      g.save(); g.imageSmoothingEnabled=false;
      g.drawImage(img, screenX, Math.round(MID_BASE_Y), midW, midH);
      g.restore();
    }
    // lights + robot fx over mids
    g.save();
    const allLights=lights.concat(robotFX);
    for(const lt of allLights){
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
        // eye beam occasional
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

    // End light orb in air (portal-like)
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
      // rotating ring
      g.globalAlpha=0.55; g.strokeStyle='#a0f0ff'; g.lineWidth=2;
      g.beginPath(); g.arc(orbScreenX,orbScreenY,18+Math.sin(time*3)*2, time*1.2, time*1.2+Math.PI*1.6); g.stroke();
    }
    g.restore();
  }

  function drawGround(g,camX,VW,VH){
    // No procedural floor, only invisible platforms (debug when godMode)
    if(window.G && G.godMode){
      g.save(); g.globalAlpha=0.22;
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
    // Bunker foreground is drawn by ExtremeForeground module after world, not here
  }

  function drawExtremeForeground(g,camX,VW,VH){
    const foreScale=1.0, foreTileW=724*foreScale, foreTileH=768*foreScale;
    const foreY=VH - foreTileH + 140;
    const foreParallax=1.18;
    const scroll=camX*foreParallax;
    let fx=-(scroll%foreTileW)-foreTileW;
    g.save(); g.imageSmoothingEnabled=false;
    for(; fx<VW+foreTileW; fx+=foreTileW){
      if(imageReady(tutorialFore)) g.drawImage(tutorialFore, Math.round(fx), Math.round(foreY), foreTileW, foreTileH);
    }
    g.restore();
  }

  function nightAmount(){ return 0.78; }
  function isLavaGap(){ return false; }
  function updateHazards(){}
  function playerTouchesLaser(){ return false; }

  window.TutorialLevel={
    W:W, GROUND:GROUND, VIEW_W:960, VIEW_H:540,
    platforms:platforms, spawns:spawns, props:props, highPickups:highPickups,
    slugSpawns:slugSpawns, SURFBOARD_X:SURFBOARD_X, END_LIGHT:END_LIGHT, lights:lights, robotFX:robotFX,
    duneSpec:null, mountainSpec:null, skySpec:null,
    nightAmount:nightAmount, isLavaGap:isLavaGap, updateHazards:updateHazards,
    playerTouchesLaser:playerTouchesLaser, resetPlatforms:resetPlatforms,
    updatePlatforms:updatePlatforms, drawBackground:drawBackground, drawGround:drawGround,
    drawExtremeForeground:drawExtremeForeground,
    BOSS_TRIGGER_X:999999, BOSS_X:999999, PORTAL_X:999999, MODULE_W:MODULE_W,
  };
})();
