const response = await fetch('https://api.figma.com/v1/files/FILE_KEY', {
  headers: {
    'X-Figma-Token': 'YOUR_TOKEN'
  }
});
const data = await response.json();
