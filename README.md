# Directus Polymorphic Reference

A Directus **bundle** for polymorphic references — a target *collection* plus a *primary key*, like Laravel's `morphTo`. It turns a pair of plain columns (`entity_type` + `entity_id`) into a searchable, navigable relational field, and dynamically resolves the target collection at runtime.

Think of a `comments` collection whose rows can belong to **either** `articles`, `products`, or `pages`:

```
comments
├─ id
├─ body
├─ entity_type  = "products"   ← which collection this comment belongs to
└─ entity_id    = "8f3a1c…"    ← the primary key within that collection
```

`entity_type` + `entity_id` together point at one record — but Directus has no native field for that. This bundle adds it.

## What's in the bundle

| Entry | Type | Use it for |
| --- | --- | --- |
| **Polymorphic Reference** | Interface | The `entity_id` field — a searchable dropdown that lists records from the collection named in `entity_type`, writes the chosen primary key, and links out to the record. |
| **Collection Select** | Interface | The `entity_type` field — a dropdown that lists all collections dynamically, so you never maintain a hardcoded choices list. |
| **Polymorphic Reference** | Display | List / table columns, when a *single* field already encodes both parts (a self-describing `{ collection, id }` value). |

## Setup

### 1. `entity_type` → **Collection Select** interface

Settings → Data Model → your collection → field `entity_type` → Interface → **Collection Select**.

- **Include system collections**: off (hides `directus_*`)
- Stores the technical collection name (`articles`, `products`, …) — exactly what the reference field needs to resolve.

### 2. `entity_id` → **Polymorphic Reference** interface

Field `entity_id` → Interface → **Polymorphic Reference**.

- **Collection Field**: `entity_type` — the sibling field that holds the target collection name.
- **Display Templates per Collection**: one row per possible target collection; click together which fields to show, e.g.
  - `articles` → `{{ title }}`
  - `products` → `{{ name }} ({{ sku }})`
- **Show open-record action**: adds a launch icon that opens the selected record.
- **Placeholder** / **Result Limit**: optional.

You now get a native-style relational control: click the field, search, pick a record (its primary key is written to `entity_id`), open it via the launch icon, or clear the selection.

## Why an interface for separate columns?

A Directus **display** only ever receives the value of *its own* field — it has no access to sibling columns of the same row (verified against `render-display.vue` and `adjust-fields-for-displays.ts` in core). So a display cannot read `entity_type` to learn which collection `entity_id` points at.

A Directus **interface** runs inside the item form and can `inject('values')`, giving it every field on the row — including `entity_type`. That's why the **interface** is the right tool for the two-separate-columns schema.

## Display: self-describing values

If instead you store both parts in a *single* field, the **display** can render it in list/table columns:

- **JSON**: `{ "collection": "products", "id": "8f3a1c…" }` (configurable keys)
- **String**: `products:8f3a1c…` (configurable separator)

Add the field as a column in any list and set its display to *Polymorphic Reference*.

## Per-collection templates

Both the interface and the display expose a `Display Templates per Collection` repeater. Each row binds a `system-display-template` editor to the collection chosen in that same row (via `collectionField`), so you get the familiar Directus "click the fields you want to show" experience — per target collection. When no row matches the resolved collection, the raw primary key is shown. Only the fields referenced by the matched template are fetched.

## System collections

Links and lookups are mapped for `directus_users`, `directus_files`, `directus_roles`. Other `directus_*` collections render without a link (they have no Content-module route); regular collections link to `/content/<collection>/<id>`.

## Development

```bash
npm install
npm run dev      # watch build
npm run build    # production build → dist/
```

Then drop `dist/` into your Directus `extensions/<name>/` folder, or `npm run link` for local development. Requires Directus host `^11`.

## License

MIT
