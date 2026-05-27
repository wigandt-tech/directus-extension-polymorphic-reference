# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Unit tests (Vitest) for the shared reference utilities (`getFieldsFromTemplate`,
  `renderTemplate`, `collectionEndpoint`, `referenceEndpoint`, `buildRoute`,
  `templateForCollection`).
- CI job that runs the test suite on pushes and pull requests.

## [1.3.0]

First public release on npm.

### Added

- **Polymorphic Reference** interface: a searchable record selector whose target
  collection is resolved from a sibling field (Laravel-style `morphTo`), with
  open-record and clear actions.
- **Polymorphic Reference** display: renders a templated label in list/table
  columns, resolving the target collection via a sibling lookup.
- **Collection Select** interface: a dropdown that lists all collections
  dynamically, for the field that stores the target collection name.
- Per-collection display templates.
- Internationalization via Directus core translation keys.

[Unreleased]: https://github.com/wigandt-tech/directus-extension-polymorphic-reference/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/wigandt-tech/directus-extension-polymorphic-reference/releases/tag/v1.3.0
