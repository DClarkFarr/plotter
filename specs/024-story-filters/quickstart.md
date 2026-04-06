# Quickstart: Story Filters

## Prerequisites

- Install dependencies in `web/`.
- Install dependencies in `express/` if the API is not already running.

## Run

1. Start the API server from `express/` with `npm run dev`.
2. Start the web app from `web/` with `npm run dev`.
3. Open a story in the dashboard.
4. Click the filter icon in the top bar to open the filters menu.
5. Add a tag filter, selecting a variant or All if variants exist.
6. Add a plot filter and a character filter using the search inputs.
7. Select custom text, submit a non-empty value, and confirm the filter is applied.
8. Remove an individual filter and then use Clear All.

## Expected Result

- The filters menu opens from the top bar and closes after a filter is applied or the custom text modal opens.
- Tag, plot, and character menus show searchable lists, with tag variants including an All option.
- The filters bar appears only when filters are active and shows badges with remove actions plus a Clear All button.
- Clearing filters removes all badges and hides the filters bar.
