# Synthetic data and evaluation fixtures

All records here are invented for JanSetu. State and district names identify real administrative contexts; locality names, IDs, population, service gaps, plans and reports are fictional. These are not official statistics or actual citizen submissions.

demo-data.json is the canonical seed bundle. Its source row carries the provenance caveat. Importers must preserve `synthetic=true` and source references. Seed records are templates copied into isolated workspaces; users must not share mutable report rows.

ai-cases.json is an evaluation set, not a prerecorded live model response. Expected labels are test expectations; the building agent must create provider test doubles separately and run a real Gemini evaluation before claiming live integration.

AI sample text and contextual indicators must stay separate. A model cannot infer population from these complaints. Missing indicators intentionally exercise insufficient-data behavior.
