// Pixel Alien Font — 5-row alien glyph bitmaps rendered to a tiny canvas,
// then CSS-scaled up with image-rendering: pixelated for chunky 2D pixel text.
window.PixelAlienFont = (function () {
  // Each glyph: 5 rows, each row is 5 bits (MSB = leftmost pixel).
  // 0 = transparent, 1 = filled.
  var GLYPHS = [
    // ◈ diamond-ish
    [0b01010, 0b11111, 0b11111, 0b11111, 0b01010],
    // ⬥ filled diamond
    [0b00100, 0b01110, 0b11111, 0b01110, 0b00100],
    // ⬦ small diamond
    [0b00000, 0b00100, 0b01110, 0b00100, 0b00000],
    // ▲ triangle up
    [0b00100, 0b00100, 0b01110, 0b01110, 0b11111],
    // ▼ triangle down
    [0b11111, 0b01110, 0b01110, 0b00100, 0b00100],
    // ◆ wide diamond
    [0b01010, 0b11011, 0b11111, 0b11011, 0b01010],
    // ⊞ grid
    [0b10101, 0b00000, 0b11111, 0b00000, 0b10101],
    // ╬ cross hatch
    [0b10101, 0b10101, 0b00000, 0b10101, 0b10101],
    // ◈◆ hybrid
    [0b11011, 0b10101, 0b01110, 0b10101, 0b11011],
    // △ arrow up
    [0b00100, 0b01110, 0b01110, 0b11111, 0b11111],
    // ⋈ two dots + bar
    [0b10001, 0b00000, 0b11111, 0b00000, 0b10001],
    // ⟐ eye
    [0b00000, 0b01110, 0b11011, 0b01110, 0b00000],
    // ⌬ antenna
    [0b10001, 0b01010, 0b00100, 0b00100, 0b01110],
    // ⍟ spiral-ish
    [0b11111, 0b10001, 0b10111, 0b10001, 0b11111],
    // ⌬▽ mixed
    [0b00100, 0b01110, 0b10101, 0b01110, 0b00100],
    // ⬡ hex
    [0b01110, 0b11111, 0b11111, 0b11111, 0b01110],
  ];

  var COL_W = 2; // pixels per glyph column
  var ROW_H = 1; // pixels per glyph row (5 rows = 5px tall)
  var CHAR_W = COL_W + 1; // column width + 1px gap
  var SCALE = 6; // CSS scale factor

  function render(text, color) {
    var len = text.length;
    var cw = len * CHAR_W + 1;
    var ch = 5;
    var canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    canvas.style.width = (cw * SCALE) + 'px';
    canvas.style.height = (ch * SCALE) + 'px';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.display = 'inline-block';
    canvas.style.verticalAlign = 'middle';
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = color || '#ffffff';
    for (var i = 0; i < len; i++) {
      var ch2 = text[i];
      var idx = -1;
      if (ch2 === ' ') { continue; }
      // Map common symbols to glyph indices
      var map = {a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:7,i:8,j:9,k:10,l:11,m:12,n:13,o:14,p:15};
      if (ch2 >= 'a' && ch2 <= 'p') idx = map[ch2];
      else idx = (ch2.charCodeAt(0) * 7 + i * 3) % GLYPHS.length;
      var g = GLYPHS[idx];
      var ox = i * CHAR_W + 1;
      for (var row = 0; row < 5; row++) {
        for (var col = 0; col < 5; col++) {
          if (g[row] & (1 << (4 - col))) {
            ctx.fillRect(ox + col * COL_W, row * ROW_H, COL_W, ROW_H);
          }
        }
      }
    }
    return canvas;
  }

  function randomLine(len) {
    var out = '';
    for (var i = 0; i < len; i++) {
      out += String.fromCharCode(97 + ((Math.random() * 16) | 0));
    }
    return out;
  }

  function install(container, color) {
    var holder = document.createElement('div');
    holder.style.textAlign = 'center';
    holder.style.lineHeight = '1';
    holder.style.marginBottom = '8px';
    holder.style.minHeight = (5 * SCALE) + 'px';
    container.insertBefore(holder, container.firstChild);
    return {
      update: function (text) {
        while (holder.firstChild) holder.removeChild(holder.firstChild);
        holder.appendChild(render(text, color));
      }
    };
  }

  return { render: render, randomLine: randomLine, install: install, SCALE: SCALE };
})();
