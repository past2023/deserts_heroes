// ============================================================
// THREE-CHARACTER PNG MANIFEST
// ============================================================
(function () {
  // 100px gameplay-space sockets used by Elena and Sergio.
  const horizontalSockets = {
    muzzle: { x: 46, y: -54 }, launcher: { x: 45, y: -70 },
    melee: { x: 43, y: -48, radius: 22 },
  };
  const jumpSockets = {
    muzzle: { x: 49, y: -65 }, launcher: { x: 49, y: -72 },
    melee: { x: 43, y: -48, radius: 22 },
  };
  const crouchSockets = {
    muzzle: { x: 42, y: -52 }, launcher: { x: 41, y: -70 },
    melee: { x: 42, y: -43, radius: 20 },
  };
  const upSockets = {
    muzzle: { x: 9, y: -121 }, launcher: { x: -14, y: -121 },
    melee: { x: 34, y: -54, radius: 22 },
  };

  // Juan's new art is authored at 200px width and rendered at 50% today.
  const juanHorizontalSockets = {
    muzzle: { x: 49, y: -50 }, launcher: { x: 29, y: -70 },
    melee: { x: 43, y: -48, radius: 22 },
  };
  const juanJumpSockets = {
    muzzle: { x: 49, y: -61 }, launcher: { x: 29, y: -72 },
    melee: { x: 43, y: -48, radius: 22 },
  };
  const juanCrouchSockets = {
    muzzle: { x: 49, y: -50 }, launcher: { x: 29, y: -70 },
    melee: { x: 42, y: -43, radius: 20 },
  };
  const juanUpSockets = {
    muzzle: { x: 4, y: -139 }, launcher: { x: -24, y: -124 },
    melee: { x: 34, y: -58, radius: 22 },
  };

  function sheet(file, frameWidth, frameHeight, count, fps, sockets, loop, renderWidth, renderHeight) {
    return {
      sheet: file,
      frameWidth: frameWidth,
      frameHeight: frameHeight,
      frameCount: count,
      expectedSheetWidth: frameWidth * count,
      expectedSheetHeight: frameHeight,
      fps: fps,
      loop: loop !== false,
      sockets: sockets || null,
      renderWidth: renderWidth || frameWidth,
      renderHeight: renderHeight || frameHeight,
    };
  }

  function baseCharacter(id, states) {
    return {
      basePath: 'assets/characters/' + id + '/',
      portrait: id + '_portrait.png',
      portraitWidth: 400,
      portraitHeight: 400,
      faceRight: true,
      states: states,
    };
  }

  function standardCharacter(id) {
    return baseCharacter(id, {
      idle: sheet(id + '_idle_animation.png', 100, 100, 2, 2, horizontalSockets, true),
      run: sheet(id + '_run.png', 100, 100, 4, 10, horizontalSockets, true),
      jump: sheet(id + '_jump.png', 100, 100, 1, 1, jumpSockets, false),
      crouch: sheet(id + '_crouch.png', 100, 100, 1, 1, crouchSockets, false),
      idleUp: sheet(id + '_idle_aimup.png', 100, 123, 1, 1, upSockets, false),
      runUp: sheet(id + '_run_aimup.png', 100, 123, 4, 10, upSockets, true),
      jumpUp: sheet(id + '_jump_aimup.png', 100, 123, 1, 1, upSockets, false),
      dead: sheet(id + '_death_animation.png', 100, 100, 8, 6, null, false),
    });
  }

  function juanHighResolution() {
    const id = 'juan_p';
    return baseCharacter(id, {
      idle: sheet(id + '_idle_animation.png', 200, 200, 18, 10,
        juanHorizontalSockets, true, 100, 100),
      run: sheet(id + '_run.png', 200, 200, 20, 30,
        juanHorizontalSockets, true, 100, 100),
      jump: sheet(id + '_jump.png', 200, 200, 1, 1,
        juanJumpSockets, false, 100, 100),
      crouch: sheet(id + '_crouch.png', 200, 200, 1, 1,
        juanCrouchSockets, false, 100, 100),
      idleUp: sheet(id + '_idle_aimup.png', 200, 282, 1, 1,
        juanUpSockets, false, 100, 141),
      runUp: sheet(id + '_run_aimup.png', 200, 282, 20, 30,
        juanUpSockets, true, 100, 141),
      jumpUp: sheet(id + '_jump_aimup.png', 200, 282, 1, 1,
        juanUpSockets, false, 100, 141),
      dead: sheet(id + '_death_animation.png', 200, 200, 13, 8,
        null, false, 100, 100),
    });
  }

  window.CharacterAssetConfig = {
    enabled: true,
    defaultCharacter: 'juan_p',
    characters: {
      juan_p: juanHighResolution(),
      elena_k: standardCharacter('elena_k'),
      sergio_h: standardCharacter('sergio_h'),
    },
  };
})();
