# Généalogie

A public, static, interactive genealogie website built with React, TypeScript, Vite and D3-ready data structures.

## Local development

```bash
npm install
npm run dev
```

## Data

- `src/data/people.json`: one normalized record per person
- `src/data/relationships.json`: parent, marriage and other relationships
- `src/data/sources.json`: archival and family sources

Sibling names and counts are calculated from shared parent relationships rather than duplicated in each person record.

## GitHub Pages

1. Create a public repository named `genealogie`.
2. Push this project to the `main` branch.
3. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
4. The included workflow builds and deploys the site after every push to `main`.

The Vite base path is `/genealogie/`. If the repository is renamed, update `base` in `vite.config.ts`.

## Privacy

Do not commit sensitive information about living people to a public repository. Hiding a field in the interface does not remove it from the source or Git history.
