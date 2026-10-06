# yieldguard-site

Source for [yieldguard.health](https://yieldguard.health), the website of YieldGuard, a hospital price transparency compliance company (CMS 45 CFR Part 180).

This README is a map of the repository and of the primary sources behind the guides. It does not repeat the site copy. For what YieldGuard does, read the site.

## How the guides map to the CMS sources

The three guides under `learn/` each cite CMS and federal sources. This table shows which primary source supports which topic, so you can go straight to the rule text.

| Topic | Guide in this repo | Primary sources |
|---|---|---|
| What changed in the CY 2026 rule | `learn/hospital-price-transparency-2026-requirements/` | [Federal Register, CY 2026 OPPS final rule](https://www.federalregister.gov/documents/2025/11/25/2025-20907/medicare-program-hospital-outpatient-prospective-payment-and-ambulatory-surgical-center-payment), [CMS fact sheet](https://www.cms.gov/newsroom/fact-sheets/cy-2026-opps-ambulatory-surgical-center-final-rule-hospital-price-transparency-policy-changes), [45 CFR 180.90](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-E/part-180/subpart-C/section-180.90) |
| Checking a machine-readable file | `learn/how-to-check-your-hospital-mrf/` | [CMSgov/hpt-tool](https://github.com/CMSgov/hpt-tool) (validator), [CMSgov/hospital-price-transparency](https://github.com/CMSgov/hospital-price-transparency) (schema and templates), [CMS FAQs](https://www.cms.gov/files/document/hospital-price-transparency-frequently-asked-questions.pdf) |
| Gap types in 2026 files | `learn/mrf-gap-types-2026/` | CMS FAQs, CMS fact sheet, Federal Register final rule (links above) |

CMS hospital price transparency landing page: https://www.cms.gov/priorities/key-initiatives/hospital-price-transparency/hospitals

## Repository layout

Plain static HTML. No build step, no dependencies. Netlify publishes the repo root on every push to `main`.

```
index.html                 home page
learn/                     the three sourced guides plus an index
features/ pricing/ about/ careers/ contact/ thanks/
mandate-tracker/           waitlist page
mrf-compliance-glossary/   glossary of MRF and regulatory terms
style.css                  shared stylesheet
sitemap.xml robots.txt     crawler files
llms.txt                   plain-text page index for language models
_redirects 404.html        Netlify routing and error page
```

## Using or citing this material

- Cite the guide page URL, for example `https://yieldguard.health/learn/mrf-gap-types-2026`, and the CMS source it points to. The CMS documents are the authority; the guides are plain-language summaries of them.
- Each guide shows a "last reviewed" date. Check it against the current CMS FAQs and fact sheet, since CMS updates them.
- `llms.txt` lists every public page with a one-line description.
- Page structured data (Article and FAQPage JSON-LD) sits in the `<head>` of each guide.

## Contact

https://yieldguard.health/contact
