# Research note: preserve null and zero

Suggested test fixture: count = 0; median = blank; p10 = blank; p90 = blank; note = insufficient remittance history. This is a semantic illustration, not copied hospital data. Preserve blank, missing and numeric zero as distinct input states. Avoid blanket fillna(0) normalization. The fixture only describes the no-claims treatment after reporting applicability is established; it does not certify the whole row.

https://yieldguard.health/learn/zero-count-with-median/

CMS FAQ: https://www.cms.gov/files/document/hospital-price-transparency-frequently-asked-questions.pdf
CMS documentation: https://github.com/CMSgov/hospital-price-transparency/blob/master/documentation/JSON/README.md
