// ============================================================
// SETTINGS — audio, language, commands and gameplay
// ============================================================
(function () {
  let open = false;
  let backTo = 'menu';
  let cursor = 0;
  let toastMsg = null;
  let toastT = 0;
  let scrollY = 0;

  const items = [];
  const tr = (key, vars) => I18n.t(key, vars);

  function isFocusable(it) { return it && it.kind !== 'header'; }

  function rebuild() {
    const previousKind = items[cursor] && (items[cursor].id || items[cursor].action);
    items.length = 0;

    items.push({ kind: 'header', label: tr('settings.general') });
    items.push({
      kind: 'choice', id: 'language', label: tr('settings.language'),
      get: () => I18n.getLanguage(),
      change: (dir) => {
        I18n.cycle(dir);
        rebuild();
      },
      display: (value) => I18n.languageName(value),
    });

    items.push({ kind: 'header', label: tr('settings.audio') });
    items.push({ kind: 'slider', id: 'master', label: tr('settings.masterVolume'),
      get: () => SFX.getMaster(), set: (v) => SFX.setMaster(v) });
    items.push({ kind: 'slider', id: 'sfx', label: tr('settings.sfxVolume'),
      get: () => SFX.getSfx(), set: (v) => SFX.setSfx(v) });
    items.push({ kind: 'slider', id: 'music', label: tr('settings.musicVolume'),
      get: () => SFX.getMusic(), set: (v) => SFX.setMusic(v) });
    items.push({ kind: 'toggle', id: 'mute', label: tr('settings.muteAll'),
      get: () => SFX.isMuted(),
      set: (v) => { if (v !== SFX.isMuted()) SFX.toggleMute(); } });
    items.push({ kind: 'toggle', id: 'musicOn', label: tr('settings.musicEnabled'),
      get: () => SFX.isMusicOn(),
      set: (v) => { if (v !== SFX.isMusicOn()) SFX.toggleMusic(); } });

    items.push({ kind: 'header', label: tr('settings.commands') });
    for (const action of Input.ACTIONS) {
      items.push({ kind: 'binding', action: action, label: tr('input.' + action) });
    }
    items.push({ kind: 'action', id: 'reset', label: tr('settings.resetKeys'), run: () => {
      Input.resetBindings();
      flash(tr('toast.keysReset'));
    } });

    items.push({ kind: 'header', label: tr('settings.video') });
    items.push({ kind: 'toggle', id: 'retroFilter', label: tr('settings.retroFilter'),
      get: () => RetroFilter.isEnabled(),
      set: (v) => RetroFilter.setEnabled(v) });

    items.push({ kind: 'header', label: tr('settings.gameplay') });
    items.push({ kind: 'toggle', id: 'god', label: tr('settings.godMode'),
      get: () => !!window.G && !!G.godMode,
      set: (v) => {
        if (window.G) G.godMode = !!v;
        flash(v ? tr('toast.godOn') : tr('toast.godOff'));
      } });
    items.push({ kind: 'action', id: 'back', label: tr('settings.back'), run: close });

    if (previousKind) {
      const found = items.findIndex(it => (it.id || it.action) === previousKind);
      if (found >= 0) cursor = found;
    }
    ensureFocus();
  }

  function moveCursor(dir) {
    if (!items.length) return;
    let index = cursor;
    for (let i = 0; i < items.length; i++) {
      index = (index + dir + items.length) % items.length;
      if (isFocusable(items[index])) {
        cursor = index;
        SFX.bounce();
        return;
      }
    }
  }

  function ensureFocus() {
    if (isFocusable(items[cursor])) return;
    for (let i = 0; i < items.length; i++) {
      if (isFocusable(items[i])) { cursor = i; return; }
    }
  }

  function flash(message) { toastMsg = message; toastT = 1.6; }

  function openPanel(back) {
    rebuild();
    open = true;
    backTo = back || 'menu';
    cursor = 0;
    scrollY = 0;
    ensureFocus();
    toastT = 0;
  }

  function close() {
    open = false;
    if (Input.isCapturing()) Input.cancelCapture();
  }

  function update(dt) {
    if (!open) return;
    if (toastT > 0) toastT -= dt;
    if (Input.isCapturing()) return;

    if (Input.pressed('Escape')) { close(); return; }
    if (Input.pressed('ArrowDown') || Input.pressed('KeyS')) moveCursor(1);
    if (Input.pressed('ArrowUp') || Input.pressed('KeyW')) moveCursor(-1);

    const item = items[cursor];
    if (!item) return;

    if (item.kind === 'slider') {
      const value = item.get();
      let next = value;
      if (Input.down('ArrowLeft') || Input.down('KeyA')) next -= dt;
      if (Input.down('ArrowRight') || Input.down('KeyD')) next += dt;
      if (next !== value) {
        next = Math.max(0, Math.min(1, next));
        item.set(next);
        if (Math.floor(next * 10) !== Math.floor(value * 10)) SFX.blip();
      }
    } else if (item.kind === 'choice') {
      let direction = 0;
      if (Input.pressed('ArrowLeft') || Input.pressed('KeyA')) direction = -1;
      if (Input.pressed('ArrowRight') || Input.pressed('KeyD') ||
          Input.pressed('Enter') || Input.pressed('Space')) direction = 1;
      if (direction) { item.change(direction); SFX.bounce(); }
    } else if (item.kind === 'toggle') {
      if (Input.pressed('Enter') || Input.pressed('Space') ||
          Input.pressed('ArrowLeft') || Input.pressed('ArrowRight')) {
        item.set(!item.get());
        SFX.bounce();
      }
    } else if (item.kind === 'binding') {
      if (Input.pressed('Enter') || Input.pressed('Space')) {
        startCapture(item.action, 0);
      } else if (Input.pressed('Tab')) {
        startCapture(item.action, 1);
      } else if (Input.pressed('Backspace') || Input.pressed('Delete')) {
        Input.setBinding(item.action, 1, null);
        flash(tr('toast.slotRemoved'));
      }
    } else if (item.kind === 'action') {
      if (Input.pressed('Enter') || Input.pressed('Space')) item.run();
    }
  }

  function startCapture(action, slot) {
    Input.captureNext((code) => {
      if (code) {
        Input.setBinding(action, slot, code);
        flash(tr('toast.keyAssigned', { key: Input.label(code) }));
      } else {
        flash(tr('toast.cancelled'));
      }
    });
  }

  function txt(g, value, x, y, size, color, align) {
    g.font = 'bold ' + size + 'px "Courier New", monospace';
    g.textAlign = align || 'left';
    g.fillStyle = '#000';
    g.fillText(value, x + 2, y + 2);
    g.fillStyle = color || '#fff';
    g.fillText(value, x, y);
  }

  function buildLayout() {
    const layout = [];
    let y = 0;
    for (let i = 0; i < items.length; i++) {
      const height = items[i].kind === 'header' ? 30 : 26;
      layout.push({ index: i, y: y, height: height });
      y += height;
    }
    return { rows: layout, height: y };
  }

  function draw(g, VW, VH) {
    if (!open) return;
    g.fillStyle = 'rgba(6,6,12,0.9)';
    g.fillRect(0, 0, VW, VH);
    g.strokeStyle = '#caa86a';
    g.lineWidth = 2;
    g.strokeRect(40, 30, VW - 80, VH - 60);

    txt(g, tr('settings.title'), VW / 2, 67, 31, '#ffae42', 'center');
    txt(g, tr('settings.hint'), VW / 2, 92, 10, '#aaa', 'center');

    const top = 112;
    const bottom = VH - 52;
    const viewportHeight = bottom - top;
    const layout = buildLayout();
    const selected = layout.rows.find(row => row.index === cursor);
    if (selected) {
      if (selected.y < scrollY + 8) scrollY = Math.max(0, selected.y - 8);
      if (selected.y + selected.height > scrollY + viewportHeight - 8) {
        scrollY = selected.y + selected.height - viewportHeight + 8;
      }
    }
    scrollY = Math.max(0, Math.min(Math.max(0, layout.height - viewportHeight), scrollY));

    g.save();
    g.beginPath();
    g.rect(54, top, VW - 108, viewportHeight);
    g.clip();

    for (const row of layout.rows) {
      const item = items[row.index];
      const y = top + row.y - scrollY + row.height - 7;
      if (y < top - 20 || y > bottom + 20) continue;

      if (item.kind === 'header') {
        txt(g, '— ' + item.label + ' —', VW / 2, y, 15, '#caa86a', 'center');
        continue;
      }

      const selectedRow = row.index === cursor;
      txt(g, (selectedRow ? '> ' : '  ') + item.label, 92, y, 15,
        selectedRow ? '#fff' : '#aaa');

      if (item.kind === 'slider') {
        const value = item.get();
        const width = 225, x = 470;
        g.fillStyle = '#000'; g.fillRect(x, y - 12, width, 13);
        g.fillStyle = selectedRow ? '#7ad0ff' : '#4d829f';
        g.fillRect(x + 2, y - 10, (width - 4) * value, 9);
        txt(g, Math.round(value * 100) + '%', x + width + 54, y, 13,
          selectedRow ? '#fff' : '#aaa', 'right');
      } else if (item.kind === 'toggle') {
        const value = !!item.get();
        txt(g, value ? tr('common.on') : tr('common.off'), 735, y, 15,
          value ? '#9aff8a' : '#888', 'right');
      } else if (item.kind === 'choice') {
        txt(g, '◀  ' + item.display(item.get()) + '  ▶', 735, y, 15,
          selectedRow ? '#68efff' : '#7aa6b0', 'right');
      } else if (item.kind === 'binding') {
        const codes = Input.bindings()[item.action] || [];
        txt(g, Input.label(codes[0]), 470, y, 15, selectedRow ? '#ffe28a' : '#caa86a');
        txt(g, Input.label(codes[1]), 610, y, 15, selectedRow ? '#ffe28a' : '#7a6a4a');
        if (selectedRow && !Input.isCapturing()) {
          txt(g, tr('settings.bindingHelp'), 735, y, 10, '#777', 'right');
        }
      }
    }
    g.restore();

    // Slim scrollbar communicates that the settings list is scrollable.
    if (layout.height > viewportHeight) {
      const trackH = viewportHeight - 12;
      const thumbH = Math.max(30, trackH * viewportHeight / layout.height);
      const maxScroll = layout.height - viewportHeight;
      const thumbY = top + 6 + (trackH - thumbH) * (scrollY / maxScroll);
      g.fillStyle = 'rgba(255,255,255,0.1)';
      g.fillRect(VW - 67, top + 6, 3, trackH);
      g.fillStyle = '#caa86a';
      g.fillRect(VW - 67, thumbY, 3, thumbH);
    }

    if (toastMsg && toastT > 0) {
      g.save();
      g.globalAlpha = Math.min(1, toastT * 1.5);
      txt(g, toastMsg, VW / 2, VH - 37, 14, '#9aff8a', 'center');
      g.restore();
    }

    if (Input.isCapturing()) {
      g.fillStyle = 'rgba(0,0,0,0.82)';
      g.fillRect(VW / 2 - 220, VH / 2 - 60, 440, 120);
      g.strokeStyle = '#ffae42';
      g.strokeRect(VW / 2 - 220, VH / 2 - 60, 440, 120);
      txt(g, tr('settings.pressKey'), VW / 2, VH / 2 - 12, 22, '#fff', 'center');
      txt(g, tr('settings.cancelHint'), VW / 2, VH / 2 + 22, 13, '#aaa', 'center');
    }
  }

  window.Settings = {
    open: openPanel,
    close: close,
    isOpen: () => open,
    update: update,
    draw: draw,
    flash: flash,
  };
})();
