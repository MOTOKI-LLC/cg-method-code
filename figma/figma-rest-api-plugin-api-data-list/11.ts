// code.ts
figma.showUI(__html__, { width: 360, height: 280 });
figma.ui.onmessage = (msg) => {
  if (msg.type === 'ping') figma.ui.postMessage({ type: 'pong' });
};

// ui.html（抜粋）
/*
<script>
  parent.postMessage({ pluginMessage: { type: 'ping' } }, '*');
  onmessage = (e) => {
    if (e.data.pluginMessage?.type === 'pong') console.log('PONG!');
  };
</script>
*/
