"""Convert the supplied Sudan locality Shapefile archive to browser-ready GeoJSON."""

import json
from pathlib import Path

import shapefile


SOURCE = Path("Geo Assets/Sudan_Localities/locality_poly_mar20.zip")
TARGET = Path("Geo Assets/Sudan_Localities/Locality_Poly_Mar20.geojson")


def main() -> None:
    reader = shapefile.Reader(str(SOURCE))
    field_names = [field[0] for field in reader.fields[1:]]
    features = []

    for record in reader.iterShapeRecords():
        properties = dict(zip(field_names, record.record))
        features.append(
            {
                "type": "Feature",
                "properties": properties,
                "geometry": record.shape.__geo_interface__,
            }
        )

    collection = {"type": "FeatureCollection", "features": features}
    TARGET.write_text(json.dumps(collection, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Created {TARGET} with {len(features)} locality boundaries.")


if __name__ == "__main__":
    main()