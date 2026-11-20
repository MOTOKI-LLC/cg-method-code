async function variablesSnapshot() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();
  return {
    collections: collections.map(c => ({
      id: c.id,
      name: c.name,
      defaultModeId: c.defaultModeId,
      modes: c.modes,
      variableIds: c.variableIds
    })),
    variables: variables.map(v => ({
      id: v.id,
      name: v.name,
      collectionId: v.variableCollectionId,
      type: v.resolvedType,
      valuesByMode: v.valuesByMode
    }))
  };
}
variablesSnapshot()
  .then(snapshot => console.log(JSON.stringify(snapshot, null, 2)))
  .catch(error => console.error('変数の取得に失敗しました', error));
