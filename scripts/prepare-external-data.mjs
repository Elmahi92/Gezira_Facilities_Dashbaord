import { readFile, writeFile } from 'node:fs/promises';

const external = 'Geo Assets/External';
const decodeXml = value => value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
const sharedStringsXml = await readFile(`${external}/schools-workbook/xl/sharedStrings.xml`, 'utf8');
const sharedStrings = [...sharedStringsXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(match => decodeXml(match[1]));
const sheetXml = await readFile(`${external}/schools-workbook/xl/worksheets/sheet1.xml`, 'utf8');

function columnIndex(reference) { return [...reference.match(/[A-Z]+/)[0]].reduce((index, letter) => index * 26 + letter.charCodeAt(0) - 64, 0) - 1; }
function cellValue(cell) { const type = cell.match(/ t="([^"]+)"/)?.[1]; const raw = cell.match(/<v>([\s\S]*?)<\/v>/)?.[1] || ''; return type === 's' ? sharedStrings[Number(raw)] : decodeXml(raw); }
const rows = [...sheetXml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map(match => { const row = []; for (const cell of match[1].matchAll(/<c r="([A-Z]+\d+)"[^>]*>[\s\S]*?<\/c>/g)) row[columnIndex(cell[1])] = cellValue(cell[0]); return row; });
const headers = rows[0];
const authoritySchools = rows.slice(2).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] || '']))).filter(row => row.STCODE === 'SD15').map(row => ({ school_id: row['School ID'], name_ar: row.school_name_arabic, name_en: row.school_name_english, locality: row.LOCENG, locality_code: row.LOCCODE, type: row.Type, status: row.Status, teachers: row.teachers, students_total: row.students_total, classrooms: row.Total_Classrooms, electricity: row.electricity, potable_water_source: row.Potable_Water_source, latrines: row.Latrines, source: 'Ministry of Education / UNICEF via HDX, 2021' }));

const education = JSON.parse(await readFile(`${external}/education/education_facilities.geojson`, 'utf8'));
education.features = education.features.filter(feature => feature.properties.adm1_pcode === 'SD15');
const poi = JSON.parse(await readFile(`${external}/poi/points_of_interest.geojson`, 'utf8'));
poi.features = poi.features.filter(feature => feature.properties.adm1_pcode === 'SD15' && /drinking_water|water_point/.test(feature.properties.amenity || '') || feature.properties.adm1_pcode === 'SD15' && /water_well|water_works|water_tower|water_tap|storage_tank/.test(feature.properties.man_made || ''));

await Promise.all([
  writeFile(`${external}/schools-authority-gezira.json`, JSON.stringify(authoritySchools)),
  writeFile(`${external}/hotosm-education-gezira.geojson`, JSON.stringify(education)),
  writeFile(`${external}/hotosm-water-reference-gezira.geojson`, JSON.stringify(poi))
]);
console.log(`Prepared ${authoritySchools.length} authority school records, ${education.features.length} education references, and ${poi.features.length} water references.`);