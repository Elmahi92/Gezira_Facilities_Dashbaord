# Gezira Facilities Dashboard

A static Leaflet dashboard for exploring the supplied health facilities, water projects, schools, and locality boundaries. It loads the assets dynamically at runtime and does not require a build step.

## Run locally

Because browsers block `fetch()` from local files, serve the folder over HTTP:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Structure

- `index.html`: accessible dashboard layout and external Leaflet dependencies.
- `styles.css`: responsive UNDP-blue visual system and map controls.
- `js/app.js`: CSV parsing, data normalization, filtering, lazy school loading, clustering, and error states.
- `Geo Assets/`: source CSV and GeoJSON assets supplied with the project.
- `metadata.json`: controlled review date and population-source metadata displayed by the dashboard.
- `scripts/verify-data.mjs`: zero-dependency integrity check for locality P-codes and population overrides.
- `scripts/prepare-external-data.mjs`: creates compact Al Gezira external enrichment/reference assets.
- `docs/DATA_DICTIONARY.md`: field mappings, data ownership, refresh procedure, and known limitations.
- `docs/EXTERNAL_ENRICHMENT.md`: external source provenance, limitations, and refresh process.

## Data sources

| Dashboard data | Source owner | Source file or reference |
|---|---|---|
| Health facilities | Health Pillar | `Geo Assets/Al_health_facilities.csv` |
| Water projects | R&R Pillar | `Geo Assets/All_water_Projects.csv` |
| Schools | GIS Unit data assets | `Geo Assets/Schools.json` |
| Locality boundaries | GIS Unit data assets | `Geo Assets/Sudan_Localities/Sudan_Khartoum_Localities.geojson` |
| Locality population | UNFPA, *Sudan - Subnational Population Statistics*, Humanitarian Data Exchange (HDX) | ADM2 total population (`T_TL`), reference year 2024; values recorded in `Geo Assets/Sudan_Localities/population_overrides.json` |

Population data is joined to locality boundaries using the HRP/ADM2 P-codes. The HDX source is available at https://data.humdata.org/dataset/cod-ps-sdn.

## Data handling

Health records use `level2`, `level3`, `latitude`, and `longitude`. Water records use `State`, `Locality`, `Latitude`, and `Longitude`. School features are GeoJSON points, are lazy-loaded after their layer is enabled, and are restricted to coordinates within the Al Gezira locality polygons.

The map uses Leaflet's canvas preference, chunked MarkerCluster loading, and removal of markers outside the visible map to keep interaction fluid for the supplied records and substantially larger point collections. It loads the supplied locality GeoJSON directly at runtime.

## Production operations

Run the integrity check before publishing updated locality or population data:

```powershell
node scripts/verify-data.mjs
```

When data is refreshed, update the appropriate file in `Geo Assets/`, revise `metadata.json` with the review date, and update `population_overrides.json` only from the documented UNFPA/HDX ADM2 source. The dashboard exposes invalid-coordinate and out-of-bound school exclusions in the locality profile.

The dashboard includes locality and text-search filters; map-layer controls; print/PDF support; shareable filter URLs; EN/AR localization; and light/dark modes. The `?` help control contains the bilingual operating guide.

## Deployment and security

The application is static and can be hosted on any HTTPS static-site service approved by the organization. A GitHub Pages workflow is included in `.github/workflows/deploy-pages.yml`; enable GitHub Pages with **GitHub Actions** as the source after pushing the project to the `main` branch.

`index.html` includes a Content Security Policy that restricts scripts, styles, fonts, map tiles, and network requests to the application itself and its approved Leaflet, Google Fonts, and Esri providers. For an organizational deployment, host the Leaflet and font assets internally and update the CSP to approved organization domains.