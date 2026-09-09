$root = Split-Path -Parent $PSScriptRoot
$external = Join-Path $root 'Geo Assets\External'
$output = $external

function Get-ColumnIndex([string]$cellReference) {
    $letters = [regex]::Match($cellReference, '[A-Z]+').Value
    $index = 0
    foreach ($letter in $letters.ToCharArray()) { $index = ($index * 26) + ([int][char]$letter - [int][char]'A' + 1) }
    return $index - 1
}

function Get-CellValue($cell, $sharedStrings) {
    if ($cell.t -eq 's') { return $sharedStrings.sst.si[[int]$cell.v].InnerText }
    return $cell.v
}

[xml]$sharedStrings = Get-Content (Join-Path $external 'schools-workbook\xl\sharedStrings.xml')
[xml]$sheet = Get-Content (Join-Path $external 'schools-workbook\xl\worksheets\sheet1.xml')
$headers = @{}
$firstRow = $sheet.worksheet.sheetData.row | Select-Object -First 1
foreach ($cell in $firstRow.c) { $headers[(Get-ColumnIndex $cell.r)] = Get-CellValue $cell $sharedStrings }

$authoritySchools = foreach ($row in ($sheet.worksheet.sheetData.row | Select-Object -Skip 2)) {
    $record = @{}
    foreach ($cell in $row.c) { $record[$headers[(Get-ColumnIndex $cell.r)]] = Get-CellValue $cell $sharedStrings }
    if ($record.STCODE -eq 'SD15') {
        [PSCustomObject]@{
            school_id = $record.'School ID'; name_ar = $record.school_name_arabic; name_en = $record.school_name_english
            locality = $record.LOCENG; locality_code = $record.LOCCODE; type = $record.Type; status = $record.Status
            teachers = $record.teachers; students_total = $record.students_total; classrooms = $record.Total_Classrooms
            electricity = $record.electricity; potable_water_source = $record.Potable_Water_source; latrines = $record.Latrines
            source = 'Ministry of Education / UNICEF via HDX, 2021'
        }
    }
}
$authoritySchools | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $output 'schools-authority-gezira.json') -Encoding utf8

$education = Get-Content (Join-Path $external 'education\education_facilities.geojson') -Raw | ConvertFrom-Json
$education.features = @($education.features | Where-Object { $_.properties.adm1_pcode -eq 'SD15' })
$education | ConvertTo-Json -Depth 12 | Set-Content (Join-Path $output 'hotosm-education-gezira.geojson') -Encoding utf8

$poi = Get-Content (Join-Path $external 'poi\points_of_interest.geojson') -Raw | ConvertFrom-Json
$poi.features = @($poi.features | Where-Object { $_.properties.adm1_pcode -eq 'SD15' -and (($_.properties.amenity -match 'drinking_water|water_point') -or ($_.properties.man_made -match 'water_well|water_works|water_tower|water_tap|storage_tank')) })
$poi | ConvertTo-Json -Depth 12 | Set-Content (Join-Path $output 'hotosm-water-reference-gezira.geojson') -Encoding utf8

Write-Host "Prepared $($authoritySchools.Count) authority school records, $($education.features.Count) education references, and $($poi.features.Count) water references."