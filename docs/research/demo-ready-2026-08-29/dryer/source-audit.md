# Electric dryer source audit

Verified 2026-08-29. The machine-readable ledger is `source-audit.json`.

Nineteen current primary manufacturer sources were reviewed: three each for Maytag, Amana, Electrolux, Frigidaire, and GE/Hotpoint; three Bosch symptom pages; and the exact Bosch `WTG86403UC/01` manual.

## Applicability controls

- Manufacturer troubleshooting pages establish symptom-level checks only. Each row also carries its exact official model page for identity and topology.
- Hotpoint rows use exact Hotpoint owner pages hosted by GE Appliances, which directly link the GE-hosted dryer support library. They are not activated merely from corporate-brand inference.
- Electrolux and Frigidaire use their own owner-support domains; no cross-brand inference is needed.
- Maytag and Amana use their own Product Help domains despite similar article structure.
- Bosch `WTG86403UC/01` is identified by its exact service page and manual as a compact condensation dryer. Vented advice is prohibited for this row.

## Excluded content

Several current manufacturer pages mix safe owner checks with service or installation work. Clunk retains only the supported visible/owner-accessible subset. The following are explicitly excluded even when present on a cited page:

- cord-cover, terminal-block, terminal-screw, outlet-voltage, or energized electrical work;
- continuity, multimeter, heating-element, fuse, thermostat, motor, belt, roller, blower, or panel access;
- turning a stationary drum by hand;
- empty five-minute heat tests that direct the user to feel the hot interior;
- gas branches and all topology-mismatched heat-pump, compact-condensation, vented, or laundry-center instructions.

## Purchase-source separation

Compatibility promotions use exact manufacturer or authorized-parts pages. Shopify Global Catalog was queried only after fit proof and retained only available offers containing the exact normalized SKU. Candidate search results for the 15 blocked models remain discovery notes and do not establish fit.

The official Frigidaire owner pages directly link `frigidaireapplianceparts.com` as Replacement Parts, establishing the site's role as a factory-certified parts source. Even so, Electrolux/Frigidaire candidate rows were left blocked where the retained page sequence did not unambiguously bind the complete revision to one current visible door-side SKU.

## Retrieval notes

GE and Encompass exact-parts pages sometimes return automated-client 403/timeout responses while remaining current and search-indexed. The source ledger records the evidence observed in the current rendered/indexed page and does not treat a raw status probe alone as a compatibility result. Seller price and availability are snapshots, not durable compatibility evidence.
