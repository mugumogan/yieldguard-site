# Research note: distinguish contractual and historical fields

Proposed documentation note, not a production validator. Preserve negotiated charge, charge method, count, median, percentiles and notes as separate values. Do not infer a median from a contractual dollar amount. Candidate logic: if reporting applies AND count equals zero AND any allowed-amount statistic is populated, send the row for review. Applicability must be resolved before this becomes a compliance finding.

https://yieldguard.health/learn/zero-count-with-median/

CMS FAQ: https://www.cms.gov/files/document/hospital-price-transparency-frequently-asked-questions.pdf
CMS documentation: https://github.com/CMSgov/hospital-price-transparency/blob/master/documentation/JSON/README.md
