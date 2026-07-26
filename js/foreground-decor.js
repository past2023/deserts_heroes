// Half-size sand platforms drifting upward between mountains and dunes.
(function () {
  const images=[];for(let i=1;i<=7;i++){const image=new Image();image.decoding='async';image.src='assets/scenery/platforms/platform_sand0'+i+'.png';images.push(image)}
  const actors=[],sand=[];let nextSpawn=9+Math.random()*10;
  function update(dt){
    nextSpawn-=dt;
    if(nextSpawn<=0){const image=images[Math.floor(Math.random()*images.length)],width=(image.naturalWidth||230)*.5,height=(image.naturalHeight||70)*.5;actors.push({image:image,x:Math.random()*960,y:540+height,vx:-7+Math.random()*14,vy:-(22+Math.random()*25),width:width,height:height});nextSpawn=16+Math.random()*20}
    for(const actor of actors){actor.x+=actor.vx*dt;actor.y+=actor.vy*dt;if(actor.y<560&&actor.y>-30&&Math.random()<dt*15){sand.push({x:actor.x+(Math.random()-.5)*actor.width*.72,y:actor.y-2,vx:actor.vx*.18+(Math.random()-.5)*16,vy:22+Math.random()*52,t:0,life:.7+Math.random()*1.2,size:1+Math.random()*2})}}
    for(const p of sand){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=40*dt}
    for(let i=sand.length-1;i>=0;i--)if(sand[i].t>=sand[i].life)sand.splice(i,1);
    for(let i=actors.length-1;i>=0;i--)if(actors[i].y+actors[i].height<-20)actors.splice(i,1)
  }
  function drawBehindDunes(g){
    g.save();g.fillStyle='#d8a45f';for(const p of sand){g.globalAlpha=Math.max(0,1-p.t/p.life)*.72;g.fillRect(Math.round(p.x),Math.round(p.y),p.size,p.size*1.8)}g.restore();
    for(const actor of actors){if(!actor.image.naturalWidth)continue;g.save();g.globalAlpha=1;g.imageSmoothingEnabled=false;g.drawImage(actor.image,Math.round(actor.x-actor.width/2),Math.round(actor.y-actor.height),actor.width,actor.height);g.restore()}
  }
  function drawBack(){}function drawFront(){}
  window.ForegroundDecor=Object.freeze({update:update,drawBehindDunes:drawBehindDunes,drawBack:drawBack,drawFront:drawFront});
})();
