## MODIFIED Requirements

### Requirement: Display available Gemara schema versions

The version selector SHALL display a dropdown of available Gemara schema versions loaded from a static `versions.json` file bundled with the site at build time.

#### Scenario: Page loads with versions available

- **WHEN** the playground page loads
- **THEN** the version dropdown is populated with versions from `versions.json`
- **AND** versions are sorted in descending order (newest first)

#### Scenario: versions.json fails to load

- **WHEN** the browser fails to fetch `versions.json`
- **THEN** the version dropdown displays an error state indicating versions could not be loaded

## REMOVED Requirements

### Requirement: Backend caches version list

**Reason**: No backend exists. Versions are pre-generated at build time as a static `versions.json` file. Caching is handled by the CDN/browser HTTP cache.
**Migration**: Versions are served as a static file. Freshness is managed by the build pipeline (daily CI cron).

### Requirement: Display available Gemara schema versions

**Reason**: The original requirement specified fetching from the CUE Central Registry via a backend proxy. This is replaced by the MODIFIED version above which loads from a static file.
**Migration**: Frontend fetches `versions.json` instead of `/api/versions`.
