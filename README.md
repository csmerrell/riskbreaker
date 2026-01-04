# The Stonecaller

## Documentation Navigation
- [Systems](docs/systems/index.md)
  - [Classes](docs/systems/classes/index.md)
  - [Equipment](docs/systems/classes/index.md)
  - [Strategems ("Gems")](docs/systems/strategems/index.md)
  - [Battlefield](docs/systems/battlefield/index.md)
  - [Exploration](docs/systems/exploration/index.md)
- [Narrative](docs/narrative/index.md)
- [Business](docs/business/index.md)

## Getting Started
To run the game's desktop (electron) dev server, run:
```bash
npm install
npm run dev
```

This is currently hard coded to launch two windows side by side:
- A `960 x 540` frameless game window
- A `900 x 1000` devtools window
  - There's currently a config that tethers the devtool window to the game window. It has some known bugs:
    - Opening the game window automatically pulls the devtool window to the foreground, but opening the devtool window doesn't pull the game window to the foreground.
    - If you close the devtool window, the game window throws errors anytime you click it, because it's trying to pull the devtool window to the foreground, even though it doesn't exist.

TODO:
Change the local dev build to take args for different launch configs:
- Make the devtool window optional
  - Keep devtool window, but launch without the config that tethers it to the game window.
- Different launch resolutions
- Run just a vite build for browser development
  - No electron overhead.