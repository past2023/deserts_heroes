// ============================================================
// VEHICLE PNG MANIFEST
// ============================================================
(function () {
  const allyTankSockets = {
    // Offsets from the bottom-center world pivot for right-facing art.
    machineGun: { x: 31, y: -94 },
    mainCannon: { x: 88, y: -68 },
    exhaust: { x: -85, y: -47 },
  };

  function state(sheet, frameCount, fps, loop) {
    return {
      sheet: sheet,
      frameWidth: 180,
      frameHeight: 120,
      frameCount: frameCount,
      expectedSheetWidth: 180 * frameCount,
      expectedSheetHeight: 120,
      fps: fps,
      loop: loop !== false,
      anchorX: 0.5,
      anchorY: 1,
      sockets: allyTankSockets,
    };
  }

  window.VehicleAssetConfig = {
    enabled: true,
    basePath: 'assets/vehicles/',
    vehicles: {
      allyTank: {
        basePath: 'ally_tank/',
        faceRight: true,
        states: {
          idle: state('ally_tank_idle.png', 4, 4, true),
          move: state('ally_tank_move.png', 8, 12, true),
          mgFire: state('ally_tank_mg_fire.png', 4, 14, true),
          cannonFire: state('ally_tank_cannon_fire.png', 6, 12, false),
          jump: state('ally_tank_jump.png', 4, 8, false),
          hit: state('ally_tank_hit.png', 2, 16, false),
          damage: state('ally_tank_damage.png', 4, 4, true),
          destroy: state('ally_tank_destroy.png', 10, 12, false),
        },
      },
    },
  };
})();
