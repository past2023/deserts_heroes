// ============================================================
// CONTENT — language-neutral game identity and gameplay metadata
// GUI wording lives exclusively in js/i18n.js.
// ============================================================
(function () {
  const Content = {
    game: {
      titleTop: "Desert's",
      titleBottom: 'Heroes',
      browserTitle: "Desert's Heroes",
    },
    mission: {
      number: 1,
    },
    vehicle: {
      name: 'ASSAULT TANK',
    },
  };

  document.title = Content.game.browserTitle;
  window.GameContent = Content;
})();
