// plugin code
figma.ui.postMessage({ type: 'export-complete', data: { url: 'https://...' } });

// ui.html
window.onmessage = (event) => {
  if (event.data.pluginMessage.type === 'export-complete') {
    console.log(event.data.pluginMessage.data.url);
  }
};
