const components = figma.currentPage.findAllWithCriteria({
  types: ["COMPONENT"],
});

console.log(components.map(node => ({
  id: node.id,
  name: node.name,
  key: node.key,
})));
