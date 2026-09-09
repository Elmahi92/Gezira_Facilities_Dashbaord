import { readFile } from 'node:fs/promises';

const localities = JSON.parse(await readFile('Geo Assets/Sudan_Localities/Sudan_Khartoum_Localities.geojson', 'utf8'));
const overrides = JSON.parse(await readFile('Geo Assets/Sudan_Localities/population_overrides.json', 'utf8'));
const authoritySchools = JSON.parse(await readFile('Geo Assets/External/schools-authority-gezira.json', 'utf8'));
const educationReferences = JSON.parse(await readFile('Geo Assets/External/hotosm-education-gezira.geojson', 'utf8'));
const waterReferences = JSON.parse(await readFile('Geo Assets/External/hotosm-water-reference-gezira.geojson', 'utf8'));
const gezira = localities.features.filter(feature => feature.properties.state_en === 'Aj Jazirah');
const missingCodes = gezira.filter(feature => !overrides.populations[feature.properties.hrpcode]).map(feature => feature.properties.hrpcode);

if (gezira.length !== 8) throw new Error(`Expected 8 Al Gezira localities, found ${gezira.length}.`);
if (missingCodes.length) throw new Error(`Population overrides missing for: ${missingCodes.join(', ')}.`);
if (Object.values(overrides.populations).some(population => !Number.isFinite(population) || population <= 0)) throw new Error('Population overrides must be positive numeric values.');
if (!authoritySchools.length || !educationReferences.features.length || !waterReferences.features.length) throw new Error('External enrichment reference assets must contain records.');
if (educationReferences.features.some(feature => feature.properties.adm1_pcode !== 'SD15') || waterReferences.features.some(feature => feature.properties.adm1_pcode !== 'SD15')) throw new Error('External reference assets must contain only Al Gezira records.');

console.log(`Validated ${gezira.length} Al Gezira localities, ${Object.keys(overrides.populations).length} population overrides, ${authoritySchools.length} authority school records, and ${educationReferences.features.length + waterReferences.features.length} HOT references.`);