# Data Dictionary

## Operational datasets

| Dashboard layer | Source owner | Source file | Fields used |
|---|---|---|---|
| Health facilities | Health Pillar | `Geo Assets/Al_health_facilities.csv` | `name`, `level2`, `level3`, `latitude`, `longitude` |
| Water projects | R&R Pillar | `Geo Assets/All_water_Projects.csv` | `Project ID`, `Sub-Project Name`, `Donor`, `State`, `Locality`, `Approx. Beneficiaries`, `Latitude`, `Longitude` |
| Schools | GIS Unit | `Geo Assets/Schools.json` | GeoJSON point geometry, `name`, `name_en`, `name_ar`, `addr_city`, `operator_t`, `capacity_p` |
| Locality boundaries | GIS Unit | `Geo Assets/Sudan_Localities/Sudan_Khartoum_Localities.geojson` | geometry, `loc_en`, `loc_name`, `state_en`, `state`, `hrpcode`, `total_pop` |
| Locality population | UNFPA via HDX | `Geo Assets/Sudan_Localities/population_overrides.json` | HRP/ADM2 P-code and total population |
| School enrichment | Ministry of Education / UNICEF via HDX | `Geo Assets/External/schools-authority-gezira.json` | School ID, status, enrolment, teachers, classrooms, WASH and electricity fields |
| Education reference | HOT / OpenStreetMap | `Geo Assets/External/hotosm-education-gezira.geojson` | Current mapped education-facility points; reference only |
| Water infrastructure reference | HOT / OpenStreetMap | `Geo Assets/External/hotosm-water-reference-gezira.geojson` | Candidate wells, towers, storage tanks, and water works; reference only |

## Population data

Population is an ADM2 planning estimate from UNFPA's *Sudan - Subnational Population Statistics* on HDX, using `T_TL` total population and reference year 2024. It is linked to locality geometry by `hrpcode`. These are planning estimates, not a population census or administrative register.

## Refresh procedure

1. Replace the applicable source file in `Geo Assets/`.
2. Update `metadata.json` with the data-review date and source reference details.
3. Refresh `population_overrides.json` only from the documented UNFPA/HDX ADM2 release.
4. Run `node scripts/verify-data.mjs`.
5. Review invalid-coordinate indicators in the locality profile before publishing.

## Known limitations

- Records without valid latitude/longitude values are excluded from map rendering and reported in the dashboard quality note.
- School records are restricted to points located within the Al Gezira locality polygons.
- The current water source has donor data but no populated project-status or intervention-type field; those filters should be enabled only after those fields are supplied.