# Dishwasher source audit

Verified 2026-08-29.

## Symptom evidence

All 27 unique symptom URLs are HTTPS pages on the relevant manufacturer's current support or owner-help domain. After replacing a stale Bosch deep link with Bosch's current dishwasher troubleshooting hub, the automated reachability pass returned **27 / 27 successful responses**.

The structured source registry in `model-symptom-audit.json` records publisher, title, URL, explicit applicability, primary quality, and verification date. Exact model pages are recorded separately as identity evidence and are not treated as troubleshooting or part-fit evidence.

## Purchase evidence

Compatibility candidates use only exact complete-code evidence from:

- Bosch's exact E-Nr spare-parts list and manufacturer part page;
- GE Appliances' exact-revision assembly diagrams and manufacturer part pages;
- Whirlpool's exact-revision repair-parts PDF; or
- Whirlpool-authorized exact-model pump pages that explicitly say the named drain pump fits that exact model revision.

Some parts sites return bot-protection responses to a raw command-line fetch. Content was therefore reviewed through the indexed browser representation, and bot-protection status is not misreported as evidence failure. A row was accepted only when the retrieved content itself displayed the complete model revision, drain-pump role, and one SKU.

Family pages, incomplete model codes, generic “pump assembly” descriptions, third-party-only cross-references, and neighboring-revision results were rejected. The exact reasons remain attached to all 19 identities in `purchase-readiness-audit.json`.

## Commerce evidence

Shopify Global Catalog was queried only after compatibility proof. Exact normalized SKU matching rejected returned neighbors. No Shopify result was used to prove fit.
