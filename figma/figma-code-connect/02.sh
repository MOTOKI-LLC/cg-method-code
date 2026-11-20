npx figma connect create "https://www.figma.com/design/FILE_KEY/Library?node-id=1-2" --outDir src/components
npx figma connect preview src/components/Button.figma.ts --inspect
npx figma connect preview src/components/Button.figma.ts
npx figma connect publish --file src/components/Button.figma.ts --dry-run
npx figma connect publish --file src/components/Button.figma.ts
