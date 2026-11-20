import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

register(StyleDictionary);
const dictionary = new StyleDictionary({
  source: ['tokens/base.json'],
  preprocessors: ['tokens-studio'],
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      buildPath: 'build/css/',
      files: [{ destination: 'variables.css', format: 'css/variables' }]
    }
  }
});
await dictionary.buildAllPlatforms();
