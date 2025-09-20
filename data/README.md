# Data extraction scripts

This folder contains the scripts used to generate the files found in the `/src/fixed-data` folder.

## `sia_export.py`

This script extracts the location of the airfields in France from an AIXM4.5 file.

This file can requested on the SIA (Service de l'Information Aéronautique) shop in the [AIM Data](https://www.sia.aviation-civile.gouv.fr/products-to-be-downloaded/aim-data.html) ([fr](https://www.sia.aviation-civile.gouv.fr/produits-numeriques-en-libre-disposition/les-bases-de-donnees-sia.html)) section.

It will generate the `src/fixed-data/airfields_fr.json` file associating a location to each airfield found in the AIXM file.
