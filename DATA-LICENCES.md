# Data licences

The source code of this project is released under the [Apache 2.0 licence](./LICENSE). The data bundled with the application, or loaded by it at run time, comes with its own terms, listed below. This is an open list: add a row with each new dataset.

## Bundled data

| File | Content | Source | Terms |
|---|---|---|---|
| `src/fixed-data/airfields_fr.json` | Location of the French airfields | SIA, AIXM 4.5 export, through `data/sia_export.py` | [SIA reuse licence](https://www.sia.aviation-civile.gouv.fr/pub/media/news/file//l/i/licenceopendata-vf_2.pdf): reuse allowed, the source (SIA) and the date of last update must be stated, see `airfields_fr.meta.json` |
| `src/fixed-data/borders_fr.json` | French land borders and territorial waters limit | OpenStreetMap through Overpass, with `data/borders_export.py` | © OpenStreetMap contributors, [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). This file is a derivative database: it stays under the ODbL, not under Apache 2.0 |
| `src/fixed-data/acd.vault.json` | Aircraft, checklists and map layers of the Aéroclub du Dauphiné, encrypted | ACD | ACD data, all rights reserved, used with permission. Not to be redistributed in plain text |
| `src/fixed-data/checklists/general/` | Public general checklist tier | This project | Apache 2.0 |

## Data loaded at run time

These are not part of the repository: the application requests them from their servers, and shows their attribution on the map.

| Service | Used for | Terms |
|---|---|---|
| IGN Géoplateforme, Plan IGN and orthophotos | Base maps | [IGN terms of use](https://geoservices.ign.fr/cgu-licences) |
| IGN SCAN OACI | VFR chart base map, defined in the ACD vault | IGN licence, used for the members of the association only |
| OpenStreetMap tiles | Base map | © OpenStreetMap contributors, ODbL, [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) |
| OpenTopoMap | Base map | © OpenStreetMap contributors, SRTM, map style © OpenTopoMap ([CC-BY-SA](https://creativecommons.org/licenses/by-sa/3.0/)) |

NOTAM, SUP AIP and weather texts are pasted or imported by the user from SOFIA, the SIA or AeroWeb: the application neither fetches nor redistributes them.
