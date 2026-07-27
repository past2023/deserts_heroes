// Compact queued portrait transmissions with teleprompter text and video noise.
(function(){
  const queue=[];
  let current=null,timer=0;
  const portraits={boss:new Image(),enemy:new Image(),robot:new Image(),faces:new Image()};
  portraits.boss.src='assets/vehicles/boss_tank01/boss_tank01_portrait.png';
  portraits.enemy.src='assets/enemies/soldier05/full.png';
  portraits.robot.src='assets/enemies/soldier01/full.png';
  portraits.faces.src='assets/ui/dialogue/face_expresion01.png';

  function say(speaker,key,duration){ queue.push({speaker:speaker,key:key,duration:duration||4}); }
  function update(dt){
    if(!current&&queue.length){
      current=queue.shift(); timer=current.duration;
      if(window.SFX){
        if(current.speaker==='enemy'||current.speaker==='boss'){ if(SFX.enemyChatBeep) SFX.enemyChatBeep(); }
        else if(current.speaker==='player'){ if(SFX.chatBeep) SFX.chatBeep(); }
      }
    }
    if(current){ timer-=dt; if(timer<=0){ current=null; timer=0; } }
  }
  function wrap(g,value,width){
    const words=value.split(/\s+/),lines=[]; let line='';
    for(const word of words){
      const next=line?line+' '+word:word;
      if(line&&g.measureText(next).width>width){ lines.push(line); line=word; }
      else line=next;
    }
    if(line) lines.push(line);
    return lines.slice(0,3);
  }
  function playerFace(g,x,y,w,h,characterId,key){
    const rows={juan_p:0,sergio_h:1,elena_k:2};
    const row=rows[characterId]===undefined?0:rows[characterId];
    let col=0;
    if(key.indexOf('lava')>=0) col=3;
    else if(key.indexOf('portal')>=0||key.indexOf('ruins')>=0||key.indexOf('observer')>=0||key.indexOf('tank')>=0) col=2;
    else if(key.indexOf('final')>=0||key.indexOf('exit')>=0) col=1;
    if(portraits.faces.naturalWidth){
      const cellW=256, cellH=(portraits.faces.naturalHeight||1024)/3;
      g.drawImage(portraits.faces,col*cellW,row*cellH,cellW,cellH,x,y,w,h);
    }
  }
  function draw(g,W,H,characterId){
    if(!current) return;
    const elapsed=current.duration-timer;
    const appear=Math.min(1,elapsed*6,timer*4);
    const x=12,y=12,w=376,h=78;
    const accent=current.speaker==='boss'?'#ff5c50':current.speaker==='player'?'#68efff':'#ffb347';
    g.save();
    g.globalAlpha=appear;
    g.fillStyle='rgba(2,7,16,.88)';
    g.fillRect(x,y,w,h);
    g.fillStyle=accent;
    g.fillRect(x,y,5,h);
    g.strokeStyle='rgba(130,220,240,.58)';
    g.lineWidth=2;
    g.strokeRect(x+0.5,y+0.5,w-1,h-1);

    const px=x+9,py=y+8,pw=46,ph=60;
    g.save();
    g.beginPath(); g.rect(px,py,pw,ph); g.clip();
    g.fillStyle='rgba(2,12,22,.95)'; g.fillRect(px,py,pw,ph);
    const glitch=Math.sin((window.G?G.time:0)*29)>.9?1.5:0;
    if(current.speaker==='player') playerFace(g,px+glitch,py,pw,ph,characterId,current.key);
    else {
      const image=current.speaker==='boss'?portraits.boss:portraits.enemy;
      if(image.naturalWidth){
        const iw=image.naturalWidth, ih=image.naturalHeight;
        const scale=Math.max(pw/iw,ph/ih);
        const dw=iw*scale, dh=ih*scale;
        g.drawImage(image,px+(pw-dw)/2+glitch,py+(ph-dh)/2,dw,dh);
      }
    }
    g.globalCompositeOperation='lighter';
    g.globalAlpha=.16; g.fillStyle='#00eaff'; g.fillRect(px+glitch,py,2,ph);
    g.fillStyle='#ff3158'; g.fillRect(px+pw-3-glitch,py,2,ph);
    g.globalCompositeOperation='source-over';
    g.globalAlpha=.20; g.fillStyle='#07121c';
    for(let sy=py+2;sy<py+ph;sy+=4) g.fillRect(px,sy,pw,1);
    if(Math.sin((window.G?G.time:0)*41)>.93){ g.globalAlpha=.55; g.fillStyle='#d9f8ff'; g.fillRect(px,py+20,pw,2); }
    g.restore();

    const nameKey=current.speaker==='player'?'dialogue.heroName':current.speaker==='boss'?'boss.name':'dialogue.enemyName';
    g.font='bold 7px "Press Start 2P","Courier New",monospace';
    g.textAlign='left';
    g.fillStyle='#fff0a8';
    g.fillText(I18n.t(nameKey),x+66,y+17);

    const full=I18n.t(current.key);
    const visible=full.slice(0,Math.floor(elapsed*34));
    g.font='bold 8px "Press Start 2P","Courier New",monospace';
    const lines=wrap(g,visible,292);
    for(let i=0;i<Math.min(3,lines.length);i++){
      g.fillStyle='rgba(0,0,0,.9)';
      g.fillText(lines[i],x+68,y+35+i*14);
      g.fillStyle='#ffffff';
      g.fillText(lines[i],x+66,y+33+i*14);
    }
    if(visible.length<full.length&&Math.floor((window.G?G.time:0)*4)%2===0){
      const last=lines[lines.length-1]||'';
      g.fillStyle=accent;
      g.fillRect(x+66+Math.min(286,last.length*7.2),y+35+(lines.length-1)*14,5,3);
    }
    g.restore();
  }
  function clear(){ queue.length=0; current=null; timer=0; }
  window.Dialogue=Object.freeze({say:say,update:update,draw:draw,clear:clear,isBusy:()=>!!current||queue.length>0});
})();
