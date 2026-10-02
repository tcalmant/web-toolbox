#!/usr/bin/env python3
"""
Export the French land borders and the territorial waters limit to a JSON file.

The data comes from OpenStreetMap (Overpass API).

:author: Thomas Calmant
:copyright: Copyright 2026, Thomas Calmant
:license: Apache License 2.0

..

    Copyright 2026 Thomas Calmant

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
import math
import pathlib
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

_logger = logging.getLogger(__name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
USER_AGENT = "web-toolbox-data-export/1.0 (https://github.com/tcalmant/web-toolbox)"

# Name used in the AIP texts ("frontière franco-<name>") -> ISO 3166-1 code
NEIGHBOURS = {
    "espagnole": "ES",
    "andorrane": "AD",
    "suisse": "CH",
    "italienne": "IT",
    "allemande": "DE",
    "belge": "BE",
    "luxembourgeoise": "LU",
    "monegasque": "MC",
}

# Key of the territorial waters limit in the output file
TERRITORIAL_KEY = "eaux_territoriales"

# Metropolitan France bounding box: south, west, north, east
METROPOLE_BBOX = "41,-6,51.5,10"

Point = tuple[float, float]

_LAND_QUERY = """
[out:json][timeout:180];
rel["boundary"="administrative"]["admin_level"="2"]["ISO3166-1"="FR"]->.fr;
rel["boundary"="administrative"]["admin_level"="2"]["ISO3166-1"="{iso}"]->.n;
way(r.fr)->.a;
way(r.n)->.b;
way.a.b;
out geom;
"""

_MARITIME_QUERY = """
[out:json][timeout:180];
rel["boundary"="administrative"]["admin_level"="2"]["ISO3166-1"="FR"]->.fr;
way(r.fr)["maritime"="yes"]({bbox});
out geom;
"""


def overpass(query: str, retries: int = 6) -> list[dict]:
    """
    Runs an Overpass query

    :param query: Overpass QL query
    :param retries: Number of attempts (the public server is often busy)
    :return: The elements of the answer
    """
    body = urllib.parse.urlencode({"data": query}).encode()
    for attempt in range(1, retries + 1):
        request = urllib.request.Request(OVERPASS_URL, data=body, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(request, timeout=240) as response:
                return json.load(response)["elements"]
        except (urllib.error.URLError, json.JSONDecodeError, KeyError) as ex:
            _logger.warning("Overpass attempt %d/%d failed: %s", attempt, retries, ex)
            time.sleep(20 * attempt)

    raise RuntimeError("Overpass is not available")


def ways_to_points(elements: list[dict]) -> list[list[Point]]:
    """
    Extracts the (lat, lng) points of each way
    """
    return [
        [(node["lat"], node["lon"]) for node in element["geometry"]]
        for element in elements
        if "geometry" in element
    ]


def stitch(ways: list[list[Point]]) -> list[list[Point]]:
    """
    Joins ways sharing end points into continuous chains
    """
    remaining = [list(way) for way in ways if len(way) > 1]
    chains: list[list[Point]] = []
    while remaining:
        chain = remaining.pop()
        changed = True
        while changed:
            changed = False
            for way in remaining:
                if way[0] == chain[-1]:
                    chain.extend(way[1:])
                elif way[-1] == chain[-1]:
                    chain.extend(reversed(way[:-1]))
                elif way[-1] == chain[0]:
                    chain = way[:-1] + chain
                elif way[0] == chain[0]:
                    chain = list(reversed(way[1:])) + chain
                else:
                    continue

                remaining.remove(way)
                changed = True
                break

        chains.append(chain)

    return chains


def _distance_to_segment(point: Point, start: Point, end: Point, cos_lat: float) -> float:
    """
    Distance in degrees (longitude scaled by cos(latitude)) from a point to a segment
    """
    px, py = point[1] * cos_lat, point[0]
    ax, ay = start[1] * cos_lat, start[0]
    bx, by = end[1] * cos_lat, end[0]
    dx, dy = bx - ax, by - ay
    length_sq = dx * dx + dy * dy
    if length_sq == 0:
        return math.hypot(px - ax, py - ay)

    ratio = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / length_sq))
    return math.hypot(px - (ax + ratio * dx), py - (ay + ratio * dy))


def simplify(points: list[Point], tolerance: float) -> list[Point]:
    """
    Douglas-Peucker simplification (iterative: chains can have many points)

    :param points: Points of the chain
    :param tolerance: Maximum deviation, in degrees
    """
    if len(points) < 3:
        return points

    cos_lat = math.cos(math.radians(points[len(points) // 2][0]))
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        first, last = stack.pop()
        farthest, farthest_idx = 0.0, -1
        for idx in range(first + 1, last):
            dist = _distance_to_segment(points[idx], points[first], points[last], cos_lat)
            if dist > farthest:
                farthest, farthest_idx = dist, idx

        if farthest > tolerance:
            keep[farthest_idx] = True
            stack.append((first, farthest_idx))
            stack.append((farthest_idx, last))

    return [point for point, kept in zip(points, keep) if kept]


def cached_overpass(name: str, query: str, cache_dir: pathlib.Path) -> list[dict]:
    """
    Runs an Overpass query, reusing a previous answer when there is one
    """
    cache_file = cache_dir / f"{name}.json"
    if cache_file.exists():
        _logger.info("Using cached %s", cache_file)
        return json.loads(cache_file.read_text(encoding="utf-8"))

    elements = overpass(query)
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_file.write_text(json.dumps(elements), encoding="utf-8")
    # Be nice with the public server
    time.sleep(5)
    return elements


def export_borders(output_file: pathlib.Path, tolerance: float, cache_dir: pathlib.Path) -> int:
    """
    Downloads, stitches and simplifies the borders, then writes them as JSON
    """
    result: dict[str, list[list[list[float]]]] = {}

    sources = {name: _LAND_QUERY.format(iso=iso) for name, iso in NEIGHBOURS.items()}
    sources[TERRITORIAL_KEY] = _MARITIME_QUERY.format(bbox=METROPOLE_BBOX)
    for name, query in sources.items():
        _logger.info("Fetching %s", name)
        chains = stitch(ways_to_points(cached_overpass(name, query, cache_dir)))
        simplified = [simplify(chain, tolerance) for chain in chains]
        _logger.info(
            "%s: %d chain(s), %d -> %d points",
            name,
            len(chains),
            sum(len(c) for c in chains),
            sum(len(c) for c in simplified),
        )
        if not simplified:
            _logger.error("No data for %s", name)
            return 1

        # 4 decimals is about 10 m
        result[name] = [[[round(lat, 4), round(lng, 4)] for lat, lng in chain] for chain in simplified]

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as fd:
        json.dump(result, fd, separators=(",", ":"))

    _logger.info("Wrote %s (%d bytes)", output_file, output_file.stat().st_size)
    return 0


def main() -> int:
    """
    Script entry point
    """
    parser = argparse.ArgumentParser(description="Export the French borders from OpenStreetMap")
    parser.add_argument(
        "-o",
        "--output",
        type=pathlib.Path,
        default=pathlib.Path(__file__).parent.parent / "src" / "fixed-data" / "borders_fr.json",
        help="Output JSON file",
    )
    parser.add_argument(
        "-t",
        "--tolerance",
        type=float,
        default=0.0005,
        help="Simplification tolerance in degrees (0.0005 is about 55 m)",
    )
    parser.add_argument(
        "--cache-dir",
        type=pathlib.Path,
        default=pathlib.Path(__file__).parent / ".overpass_cache",
        help="Directory where the Overpass answers are kept",
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    return export_borders(args.output, args.tolerance, args.cache_dir)


if __name__ == "__main__":
    sys.exit(main())
