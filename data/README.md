# Data extraction scripts

This folder contains the scripts used to generate the files found in the `/src/fixed-data` folder.

## `sia_export.py`

This script extracts the location of the airfields in France from an AIXM4.5 file.

This file can requested on the SIA (Service de l'Information Aéronautique) shop in the [AIM Data](https://www.sia.aviation-civile.gouv.fr/products-to-be-downloaded/aim-data.html) ([fr](https://www.sia.aviation-civile.gouv.fr/produits-numeriques-en-libre-disposition/les-bases-de-donnees-sia.html)) section.

It will generate the `src/fixed-data/airfields_fr.json` file associating a location to each airfield found in the AIXM file.

## `borders_export.py`

This script downloads the French land borders (with Spain, Andorra, Switzerland, Italy, Germany, Belgium, Luxembourg and Monaco) and the limit of the territorial waters from OpenStreetMap, through the Overpass API.

It stitches the ways, simplifies them (about 55 m by default) and generates the `src/fixed-data/borders_fr.json` file, used to follow the border described in AIP texts (`frontière franco-espagnole`, `limite des eaux territoriales ...`) instead of drawing a straight line.

The Overpass answers are cached in `data/.overpass_cache`, as the public server often rate-limits. Delete this folder to download the data again. The data is © OpenStreetMap contributors, available under the ODbL.
