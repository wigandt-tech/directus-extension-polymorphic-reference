# Directus Polymorphic Reference

A Directus **bundle** that resolves polymorphic references — a target *collection* plus a *primary key*, like Laravel's `morphTo` — into a navigable, templated link.

It ships two complementary entries:

| Entry | Where it works | How it learns the target collection |
| --- | --- | --- |
| **Polymorphic Reference (Interface)** | Item **detail view** | From a **sibling field** on the same item (e.g. `entity`) |
| **Polymorphic Reference (Display)** | **List / table columns** | From the field value itself (a **self-describing** value) |

## Why two entries?

A Directus **display** only ever receives the value of *its own* field — it has no access to sibling columns of the same row (verified against `render-display.vue` and `adjust-fields-for-displays.ts` in core). So a display can only resolve a polymorphic reference if the value carries the collection *with* the id.

A Directus **interface** runs inside the item form and can `inject('values')`, giving it every field on the item — including the one holding the collection name. So for the common schema of **two separate columns** (`entity` + `id`), the **interface** is the right tool.

Pick the entry that matches your data shape:

### Separate columns (`entity` + `id`) → use the Interface

```
duplicate_candidates
├─ entity        = "accounts"
├─ primary_id    = "0ece8135-…"   ← apply the interface here
└─ duplicate_id  = "23d0a778-…"   ← and here
```

Configure each id field's interface:

- **Collection Field**: `entity` (the sibling field holding the collection name)
- **Display Templates per Collection**: one row per possible collection, where you click together the template (e.g. `accounts` → `{{ company_name }}`, `kontakte` → `{{ first_name }} {{ last_name }}`)
- **Make clickable**: links to `/content/<collection>/<id>`

### Self-describing value → use the Display

For a single field that already encodes both parts:

- **JSON**: `{ "collection": "accounts", "id": "0ece8135-…" }` (configurable keys)
- **String**: `accounts:0ece8135-…` (configurable separator)

Then add the field as a column in any list and set its display to *Polymorphic Reference*.

## Per-collection templates

Both entries expose a repeater (`Display Templates per Collection`). Each row binds a
`system-display-template` editor to the collection chosen in that same row (via
`collectionField`), so you get the familiar Directus "click the fields you want to show"
experience — per target collection. When no row matches the resolved collection, the raw
primary key is shown.

Only the fields referenced by the matched template are fetched (one request per resolved
reference).

## System collections

Links and fetches are mapped for `directus_users`, `directus_files`, `directus_roles` and
fall back to `/<name>` for other `directus_*` collections.

## Development

```bash
npm install
npm run dev      # watch build
npm run build    # production build → dist/
```

Then drop `dist/` into your Directus `extensions/<name>/` folder, or `npm run link` for local development.

Requires Directus host `^11`.

## License

MIT
