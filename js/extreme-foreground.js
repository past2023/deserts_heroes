// Static antenna bunkers anchored to the bottom in the nearest parallax plane.
(function () {
  const images = [];
  for (let i = 1; i <= 7; i++) {
    const image = new Image(); image.decoding = 'async';
    image.src = 'assets/foreground/bunkers/foreground_bunker0' + i + '.png';
    images.push(image);
  }

  // Sparse deterministic world placements. A parallax factor above 1 makes
  // these foreground structures cross the camera faster than gameplay terrain.
  const placements = [];
  let seed = 7719;
  function random() {
    seed = (seed * 1664525 + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  }
  for (let x = 2200, index = 0; x < Level.W - 1200; x += 3000 + random() * 1900) {
    placements.push({ worldX:x, image:images[index % images.length],
      mirror:random() < 0.5, offsetY:Math.round(random() * 8) });
    index++;
  }

  function update() {
    // Intentionally static: bunkers never fly or move vertically.
  }

  function draw(g) {
    const camera = G.camX || 0;
    const parallax = 1.16;
    for (const placement of placements) {
      const image = placement.image;
      if (!image.naturalWidth) continue;
      const width = image.naturalWidth * 0.5;
      const height = image.naturalHeight * 0.5;
      const x = placement.worldX - camera * parallax;
      if (x + width / 2 < -30 || x - width / 2 > 990) continue;
      const bottom = 540 + placement.offsetY;
      g.save();
      g.globalAlpha = 1;
      g.imageSmoothingEnabled = false;
      g.translate(Math.round(x), Math.round(bottom));
      if (placement.mirror) g.scale(-1, 1);
      g.drawImage(image, -width / 2, -height, width, height);
      g.restore();
    }
  }

  window.ExtremeForeground = Object.freeze({ update:update, draw:draw });
})();
