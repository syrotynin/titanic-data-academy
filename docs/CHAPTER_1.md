# Chapter 1 — The Passenger Manifest

**Theme:** Welcome to the historical archive; learn to examine a fictional practice ledger inspired by RMS Titanic.

**Duration:** Approximately 45–60 minutes, self-paced. **Dataset:** 24 invented passenger records in `public/data/titanic-ch01.sqlite`.

## Narrative

Southampton, April 1912. The RMS Titanic is preparing for her first voyage. In a present-day educational reimagining, the learner joins the Historical Records Room, where an archivist has prepared a practice passenger ledger. The goal is to understand what a data record looks like before moving on to complex investigations.

Historical backdrop and exercise records are deliberately distinct: fictional names should never be claimed to have been onboard.

## Learning sequence

| # | Lesson | Concept | Expected query result |
| --- | --- | --- | --- |
| 1 | Meet the Database | Rows, columns, records, `SELECT *`, `LIMIT` | All columns for first five rows |
| 2 | Your First Query | `SELECT`, `FROM` | All `name` values |
| 3 | Passenger Profiles | Multiple column selection | All `name` and `age` values |
| 4 | A Shorter Register | `LIMIT` | First five `name` and `passenger_class` values |
| 5 | Your First Assignment | Independent query construction | First ten `passenger_id`, `name`, `ticket_fare` values |

All mission definitions, starter queries, reference queries and hints are in `content/chapter-01.json`. They can be changed without editing React components.

## Assessment behavior

- Clicking **Run query** runs arbitrary read-only SELECT queries without marking progress.
- Clicking **Check answer** reruns the current draft and compares its full result to the reference query.
- Different syntaxes with identical complete result sets are accepted.
- Column order is not important. For tasks using `LIMIT`, the practice dataset's returned row order matters; no ORDER BY is taught until Chapter 2.
- Incorrect results show whether columns, number of records, or values differ.
- Hints are gradually revealed; full reference solution is optional.

## Suggested end-of-chapter reflection

1. What is the difference between a column and a row?
2. What does `FROM passengers` tell the database?
3. Why should you avoid requesting every column if you only need two?
4. Why can a query with `LIMIT 5` produce a different selection when row order changes?
5. Given `SELECT name, ticket_fare FROM passengers LIMIT 3;`, predict the output shape.

## Next chapter

The Passenger Office: WHERE, AND/OR, comparisons, ORDER BY, and explicit ordering before LIMIT.
