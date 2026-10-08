# Historical data, fiction and provenance

## Chapter 1: fictional practice records

The 24 passenger identities in `public/data/fictional-passengers.csv` and `public/data/titanic-ch01.sqlite` are **invented for SQL instruction**. Their ages, names, ticket prices and embarkation ports are illustrative. No person or fare in this teaching dataset should be presented as a verified Titanic record.

The purpose is to teach SELECT/FROM/LIMIT with unambiguous, clean, small datasets.

The records are reproducibly generated with `python3 scripts/build-sample-db.py` and deliberately exclude outcomes of the historical sinking.

## Historical context

The RMS Titanic departed Southampton in April 1912, called at Cherbourg and Queenstown (now Cobh), and sank in the North Atlantic. Accurate future modules should cite primary records and historians, and distinguish uncertain or conflicting passenger details.

## Real datasets for later chapters

Kaggle's Titanic machine-learning competition uses a passenger subset commonly called the 891-row training set; it is **not a full historical manifest**. Before copying such data into a public repository, verify the download's provenance, attribution requirements and redistribution terms. If permission is unclear, link to the source and provide a user-import workflow instead of committing a copied dataset.

## Source policy

- Label any invented names, cabin assignments, fares and conversations as fictional.
- Cite genuine passenger records and photographs by archive and identifier.
- Check image rights; historical age does not guarantee a digital scan is freely reusable.
- Never present missing age as zero, or infer a causal survival explanation from correlation alone.
- Present survival analysis carefully: this is a historical tragedy, not a points-based game.
