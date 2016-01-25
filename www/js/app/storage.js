define([], () => {
  const save = (patchModel, name, version) => {
    window.localStorage.setItem(
      JSON.stringify([name, version]),
      JSON.stringify(patchModel.toJSON()));
  };

  const load = (patchModel, name, version) => {

  };

  return { save, load };
});
