# Tasks: fullpage-visualization

Convert visualization from an output-panel tab to a dedicated full-page view.

## Section 1: HTML Structure

- [x] 1.1 Remove the Visualize tab button and `#visualize-tab` content from the output panel
- [x] 1.2 Remove the output-tabs bar entirely (Validate is the only output now)
- [x] 1.3 Add a hidden full-page `#visualize-view` overlay alongside `<main>`, with a back button and graph container

## Section 2: CSS

- [x] 2.1 Remove `.output-tabs` and `.output-tab` styles
- [x] 2.2 Add `.visualize-view` full-page styles (position, z-index, background, flex layout)
- [x] 2.3 Style the visualize-view header bar (back button, document title)
- [x] 2.4 Update `.graph-container` to fill the visualize view

## Section 3: JavaScript

- [x] 3.1 Remove tab-switching logic (`switchTab`, tab click listeners, `activeTab` state)
- [x] 3.2 Add `showVisualizeView()` and `hideVisualizeView()` functions for full-page transitions
- [x] 3.3 Update `handleVisualize()` to target the full-page graph container
- [x] 3.4 Update `renderGraph()` to render into the full-page view and increase node sizing for the larger canvas
- [x] 3.5 Wire back button and Escape key to return to editor view
- [x] 3.6 Update `loadTutorialFile` from graph node clicks to hide visualize view and load into editor
