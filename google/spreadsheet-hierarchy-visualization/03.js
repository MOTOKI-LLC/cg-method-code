<script>
const status = document.getElementById('status');
function showFailure(error) {
  status.textContent = '表示できません：' + (error.message || String(error));
}
function drawTree(nodes) {
  try {
    const root = d3.stratify().id(d => d.id).parentId(d => d.parent || null)(nodes);
    d3.tree().nodeSize([64, 240])(root);
    const all = root.descendants();
    const min = Math.min(...all.map(d => d.x));
    const max = Math.max(...all.map(d => d.x));
    const svg = d3.select('svg').attr('width', (root.height + 1) * 240 + 40).attr('height', max - min + 90);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(20,${35-min})`);
    g.selectAll('path').data(root.links()).join('path')
      .attr('fill','none').attr('stroke','#777')
      .attr('d',d => `M${d.source.y+190},${d.source.x}H${d.source.y+215}V${d.target.x}H${d.target.y}`);
    const n = g.selectAll('.node').data(all).join('g').attr('class','node')
      .attr('transform',d => `translate(${d.y},${d.x})`).attr('tabindex',0).attr('role','button')
      .attr('aria-label',d => d.data.name + '：' + d.data.comps);
    const show = (event,d) => { document.getElementById('detail').textContent = d.data.name + '：' + (d.data.comps || '補足情報なし'); };
    n.on('mouseenter',show).on('focus',show).on('click',show)
      .on('keydown',(event,d) => {if (event.key==='Enter' || event.key===' ') {event.preventDefault();show(event,d);}});
    n.append('rect').attr('y',-18).attr('width',190).attr('height',36).attr('fill','#fff').attr('stroke','#333');
    n.append('text').attr('x',8).attr('y',5).attr('font-size',13)
      .text(d => {const a=Array.from(d.data.name);return a.length>12?a.slice(0,12).join('')+'…':d.data.name;});
    n.append('title').text(d => d.data.name + '：' + d.data.comps);
    status.textContent = nodes.length + '件を表示。シート変更後はページを再読み込みしてください。';
  } catch (error) {showFailure(error);}
}
if (typeof d3 === 'undefined') showFailure(new Error('D3.jsを読み込めませんでした'));
else google.script.run.withSuccessHandler(drawTree).withFailureHandler(showFailure).getPrefabTreeData();
</script>
