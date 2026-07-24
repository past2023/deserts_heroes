// ============================================================
// PLAYABLE CHARACTERS — data-driven gameplay roster
// ============================================================
(function () {
  const roster = [
    {
      id: 'juan_p',
      nameKey: 'character.juanP.name',
      roleKey: 'character.juanP.role',
      bioKey: 'character.juanP.shortBio',
      accent: '#ff9a38',
      speed: 270,
      jumpVelocity: -780,
      maxArmor: 1,
      startingGrenades: 10,
      ammoMultiplier: 1,
      coyoteTime: 0.09,
      jumpBuffer: 0.12,
      knockback: 1,
    },
    {
      id: 'elena_k',
      nameKey: 'character.elenaK.name',
      roleKey: 'character.elenaK.role',
      bioKey: 'character.elenaK.shortBio',
      accent: '#72e7ff',
      speed: 310,
      jumpVelocity: -840,
      maxArmor: 1,
      startingGrenades: 8,
      ammoMultiplier: 0.85,
      coyoteTime: 0.12,
      jumpBuffer: 0.14,
      knockback: 0.8,
    },
    {
      id: 'sergio_h',
      nameKey: 'character.sergioH.name',
      roleKey: 'character.sergioH.role',
      bioKey: 'character.sergioH.shortBio',
      accent: '#ff4d58',
      speed: 225,
      jumpVelocity: -700,
      maxArmor: 2,
      startingGrenades: 10,
      ammoMultiplier: 1,
      coyoteTime: 0.08,
      jumpBuffer: 0.11,
      knockback: 0.62,
    },
  ];
  const byId = {};
  for (const character of roster) byId[character.id] = Object.freeze(character);

  function get(id) { return byId[id] || byId.juan_p; }
  function isValid(id) { return !!byId[id]; }
  function specialAmmo(id, baseAmount) {
    return Math.max(1, Math.floor(baseAmount * get(id).ammoMultiplier));
  }

  window.Characters = {
    roster: Object.freeze(roster.slice()),
    get: get,
    isValid: isValid,
    specialAmmo: specialAmmo,
  };
})();
