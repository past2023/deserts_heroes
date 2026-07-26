// Allocation-conscious helpers shared by entity systems.
(function () {
  function compactInPlace(list, keep) {
    let write = 0;
    for (let read = 0; read < list.length; read++) {
      const value = list[read];
      if (keep(value)) list[write++] = value;
    }
    list.length = write;
    return list;
  }

  function removeDead(list) {
    return compactInPlace(list, function (value) { return !value.dead; });
  }

  window.EntityUtils = Object.freeze({
    compactInPlace: compactInPlace,
    removeDead: removeDead,
  });
})();
