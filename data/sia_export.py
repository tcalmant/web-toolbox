#!/usr/bin/env python3
"""
Export SIA data to JSON files.

:author: Thomas Calmant
:copyright: Copyright 2025, Thomas Calmant
:license: Apache License 2.0

..

    Copyright 2025 Thomas Calmant

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
"""

import argparse
import json
import logging
import pathlib
import xml.etree.ElementTree as etree


def export_sia(input_file: pathlib.Path, output_file: pathlib.Path) -> int:
    """
    Exports SIA data to JSON files
    """
    if not input_file.exists():
        print(input_file, "does not exist")
        return 1

    print(f"Reading SIA data from {input_file}...")

    # Parse the XML data
    try:
        with input_file.open(encoding="utf-8") as xml_file:
            root = etree.fromstring(xml_file.read())
    except Exception as e:
        print("Failed to parse the input file:", e)
        return 2

    # Extract airfield data
    with open(output_file, "w", encoding="utf-8") as json_file:
        # Open the JSON object
        json_file.write("{\n")

        nb_airfields = 0
        for idx, airfield in enumerate(root.findall(".//Ahp")):
            # Check if the airfield has an ICAO code
            code_icao = airfield.findtext("codeIcao")
            if not code_icao:
                logging.debug(
                    "Skipping airfield %s without ICAO code",
                    airfield.findtext("txtName"),
                )
                continue

            # Check if it's an airfield we want to use
            code_type = airfield.findtext("codeType")
            if code_type != "AD":
                # Not an airfield
                logging.debug(
                    "Skipping non-airfield %s (%s)",
                    airfield.findtext("name"),
                    code_type,
                )
                continue

            # Parse coordinates
            latitude_str = airfield.findtext("geoLat")
            longitude_str = airfield.findtext("geoLong")
            if not latitude_str or not longitude_str:
                logging.debug(
                    "Skipping airfield %s without coordinates",
                    code_icao,
                )
                continue

            multiplier = 1 if latitude_str[-1] == "N" else -1
            degrees = int(latitude_str[0:2])
            minutes = int(latitude_str[2:4])
            seconds = int(latitude_str[4:6])
            latitude = round((degrees + minutes / 60 + seconds / 3600) * multiplier, 6)

            multiplier = 1 if longitude_str[-1] == "E" else -1
            degrees = int(longitude_str[0:3])
            minutes = int(longitude_str[3:5])
            seconds = int(longitude_str[5:7])
            longitude = round((degrees + minutes / 60 + seconds / 3600) * multiplier, 6)

            # Parse elevation
            elevation_str = airfield.findtext("valElev")
            elevation_unit = airfield.findtext("uomDistVer")
            try:
                elevation = int(elevation_str) if elevation_str else None
                if elevation and elevation_unit:
                    if elevation_unit == "M":
                        # Convert from meters to feet
                        elevation = elevation * 3.28084
                    elif elevation_unit != "FT":
                        # Unknown unit
                        elevation = None
            except:
                # Ignore invalid elevation
                elevation = None

            # Prepare the airfield entry
            airfield_entry = [latitude, longitude, elevation]
            if nb_airfields > 0:
                json_file.write(",\n")

            json_file.write(f'  "{code_icao}": {json.dumps(airfield_entry)}')
            nb_airfields += 1

        # Close the JSON object
        json_file.write("\n}\n")

    print("Exported", nb_airfields, "airfields.")
    return 0


def main(args: list[str] | None = None) -> int:
    """
    Script entry point
    """
    ROOT_FOLDER = pathlib.Path(__file__).parent.parent

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-d", "--debug", action="store_true", help="Enable debug output"
    )
    parser.add_argument(
        "-o",
        "--output",
        type=pathlib.Path,
        default=ROOT_FOLDER / "src" / "fixed-data" / "airfields_fr.json",
        help="Output file (default: %(default)s)",
    )
    parser.add_argument(
        "xml",
        type=pathlib.Path,
        help="Input SIA XML file",
    )
    options = parser.parse_args(args)

    if options.debug:
        logging.getLogger().setLevel(logging.DEBUG)

    return export_sia(options.xml, options.output)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    exit(main())
