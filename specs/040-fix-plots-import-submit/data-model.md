# Data Model: Fix Plot Customizations Submission on Import

## Changed Types

### `ImportPlotCustomization` (new — shared concept)

Represents a single plot's settings as configured by the user during the import preview.

| Field           | Type      | Required | Notes                                                                                   |
| --------------- | --------- | -------- | --------------------------------------------------------------------------------------- |
| `id`            | `string`  | yes      | Tag ID from parse result; `"main_plot_id"` for the synthetic Main plot                  |
| `name`          | `string`  | yes      | Display name; becomes the DB plot's `title`                                             |
| `color`         | `string`  | yes      | Hex colour string (e.g. `"#729cfd"`)                                                    |
| `isDefaultPlot` | `boolean` | yes      | Exactly one entry per plots array should be `true`; that plot gets `horizontalIndex: 0` |
| `ignored`       | `boolean` | yes      | If `true`, the plot is excluded from DB creation                                        |

---

### `ImportCustomizations` (modified)

| Field                 | Type                        | Change                          |
| --------------------- | --------------------------- | ------------------------------- |
| `ignoredCharacterIds` | `string[]`                  | unchanged                       |
| `characterMerges`     | `Record<string, string>`    | unchanged                       |
| ~~`plotTagIds`~~      | ~~`string[]`~~              | **removed**                     |
| `plots`               | `ImportPlotCustomization[]` | **new** — replaces `plotTagIds` |

---

### `ImportOutlineParseTag` (no change)

The `isDefaultPlot` and `color` fields on this type were only used transiently in the `PlotsTab` via `onChangeTags`. With the new design these fields are no longer written to this type at runtime. The type definition can optionally be cleaned up but is not required for correctness.

---

## Server-side plot creation logic (service pseudocode)

```
plots_customizations = customizations.plots ?? []

# Separate Main from tag-converted plots
main_entry   = plots_customizations.find(p => p.id == "main_plot_id")
tag_entries  = plots_customizations.filter(p => p.id != "main_plot_id" && !p.ignored)

# Determine which entry is default
default_entry = plots_customizations.find(p => p.isDefaultPlot && !p.ignored)
            ?? plots_customizations.find(p => !p.ignored)
            ?? null

# Assign horizontal indices: default → 0, rest in order
ordered_plots = [default_entry, ...all_non_ignored_except_default].filter(non-null)
for i, entry in enumerate(ordered_plots):
    create plot(title=entry.name, color=entry.color, horizontalIndex=i)

# Fallback: if ordered_plots is empty, create hardcoded Main at index 0
```

---

## Initial client state

```ts
customizations = {
  ignoredCharacterIds: [],
  characterMerges: {},
  plots: [
    {
      id: "main_plot_id",
      name: "Main",
      color: "#729cfd",
      isDefaultPlot: true,
      ignored: false,
    },
  ],
};
```
