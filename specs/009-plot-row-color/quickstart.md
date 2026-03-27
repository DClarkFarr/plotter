# Quickstart: Plot Row Color Sync

## Prerequisites

- Install dependencies in `web/`.

## Run

1. Start the frontend dev server.
2. Open a story view that displays the plot grid.
3. Edit a plot color in the header.
4. Verify that the entire row (headers, scenes, empty cells) updates to the softened background color with a smooth transition.
5. Verify that text flips to light on dark backgrounds and stays dark on light backgrounds.

## Expected Result

- Row background colors update within 0.5 seconds.
- No mixed colors remain after the transition completes.
