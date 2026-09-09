# External Enrichment Sources

The dashboard retains the supplied Health Pillar, R&R Pillar, and GIS Unit layers as its operational record. The following layers are optional references and must not be interpreted as R&R project completion data.

| Use | Source | Data added | Refresh and limitation |
|---|---|---|---|
| School attribute enrichment | Ministry of Education / UNICEF, *Sudan - Schools*, via HDX | School ID, type, status, teachers, enrolment, classrooms, electricity, potable-water source, and latrines when a normalized name match is found | 2021 release. Names are matched conservatively; unmatched points retain GIS Unit attributes only. |
| Education reference layer | Humanitarian OpenStreetMap Team (HOT), *Education Facilities of Sudan* | Current mapped education-facility names, OSM IDs, localities, and coordinates | OSM data is crowdsourced, refreshed monthly, and not exhaustive. |
| Water infrastructure reference layer | HOT, *Points of Interest of Sudan* | Candidate water wells, towers, storage tanks, and water works | Reference infrastructure only; it does not identify R&R projects or operational status. |

## Refreshing the local reference assets

1. Download the current external releases into `Geo Assets/External/` using the existing filenames.
2. Extract the HOT ZIP releases into `Geo Assets/External/education/` and `Geo Assets/External/poi/`.
3. Extract the XLSX release into `Geo Assets/External/schools-workbook/`.
4. Run `node scripts/prepare-external-data.mjs`.
5. Run `node scripts/verify-data.mjs` before publishing.

Do not display the HOT water layer as project delivery evidence. Validate prospective matches with the responsible sector team before incorporating a reference point into the R&R project register.