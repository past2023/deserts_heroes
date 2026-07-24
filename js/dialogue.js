// Compact queued portrait transmissions with teleprompter text and video noise.
(function(){
  const queue=[];let current=null,timer=0;
  const portraits={boss:new Image(),enemy:new Image(),robot:new Image(),faces:new Image()};
  portraits.boss.src='assets/vehicles/boss_tank01/full.png';portraits.enemy.src='assets/enemies/soldier05/full.png';portraits.robot.src='assets/enemies/soldier01/full.png';portraits.faces.src='assets/ui/dialogue/face_expresion01.png';
  function say(speaker,key,duration){queue.push({speaker:speaker,key:key,duration:duration||4})}
  function update(dt){if(!current&&queue.length){current=queue.shift();timer=current.duration}if(current){timer-=dt;if(timer<=0){current=null;timer=0}}}
  function wrap(g,value,width){const words=value.split(/\s+/),lines=[];let line='';for(const word of words){const next=line?line+' '+word:word;if(line&&g.measureText(next).width>width){lines.push(line);line=word}else line=next}if(line)lines.push(line);return lines.slice(0,3)}
  function playerFace(g,x,y,characterId,key){const rows={juan_p:0,sergio_h:1,elena_k:2},row=rows[characterId]===undefined?0:rows[characterId];let col=0;if(key.indexOf('lava')>=0)col=3;else if(key.indexOf('portal')>=0||key.indexOf('ruins')>=0||key.indexOf('observer')>=0||key.indexOf('tank')>=0)col=2;else if(key.indexOf('final')>=0||key.indexOf('exit')>=0)col=1;if(portraits.faces.naturalWidth)g.drawImage(portraits.faces,col*256,row*341.33,256,341.33,x,y,38,38)}
  function draw(g,W,H,characterId){if(!current)return;const elapsed=current.duration-timer,appear=Math.min(1,elapsed*6,timer*4),x=12,y=12,w=300,h=52;g.save();g.globalAlpha=appear;g.fillStyle='rgba(2,7,16,.86)';g.fillRect(x,y,w,h);const accent=current.speaker==='boss'?'#ff5c50':current.speaker==='player'?'#68efff':'#ffb347';g.fillStyle=accent;g.fillRect(x,y,4,h);g.strokeStyle='rgba(130,210,230,.42)';g.strokeRect(x+.5,y+.5,w-1,h-1);
    const px=x+6,py=y+5;g.save();g.beginPath();g.rect(px,py,38,38);g.clip();const glitch=Math.sin(G.time*29)>.9?1.5:0;if(current.speaker==='player')playerFace(g,px+glitch,py-2,characterId,current.key);else{const image=current.speaker==='boss'?portraits.boss:portraits.enemy;if(image.naturalWidth)g.drawImage(image,px-6+glitch,py-4,50,42)}
    g.globalCompositeOperation='lighter';g.globalAlpha=.13;g.fillStyle='#00eaff';g.fillRect(px+glitch,py,2,38);g.fillStyle='#ff3158';g.fillRect(px+35-glitch,py,2,38);g.globalCompositeOperation='source-over';g.globalAlpha=.18;g.fillStyle='#07121c';for(let sy=py+2;sy<py+38;sy+=4)g.fillRect(px,sy,38,1);if(Math.sin(G.time*41)>.93){g.globalAlpha=.55;g.fillStyle='#d9f8ff';g.fillRect(px,py+12,38,2)}g.restore();
    const nameKey=current.speaker==='player'?'dialogue.heroName':current.speaker==='boss'?'boss.name':'dialogue.enemyName';g.font='bold 8px "Courier New",monospace';g.textAlign='left';g.fillStyle='#ffe28a';g.fillText(I18n.t(nameKey),x+50,y+12);
    const full=I18n.t(current.key),visible=full.slice(0,Math.floor(elapsed*28));g.font='bold 8px "Courier New",monospace';const lines=wrap(g,visible,215);for(let i=0;i<Math.min(2,lines.length);i++){g.fillStyle='#000';g.fillText(lines[i],x+52,y+26+i*11);g.fillStyle='#e5f1f4';g.fillText(lines[i],x+50,y+24+i*11)}
    if(visible.length<full.length&&Math.floor(G.time*4)%2===0){g.fillStyle=accent;g.fillRect(x+50+Math.min(205,(lines[lines.length-1]||'').length*4.6),y+26+(lines.length-1)*11,4,2)}g.restore()}
  function clear(){queue.length=0;current=null;timer=0}
  window.Dialogue=Object.freeze({say:say,update:update,draw:draw,clear:clear,isBusy:()=>!!current||queue.length>0});
})();
