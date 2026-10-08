# Chapter 1 — The Passenger Manifest

**Theme:** Welcome to the historical archive; learn to examine a fictional practice ledger inspired by RMS Titanic.

**Duration:** Self-paced; validate the time estimate with a beginner before release. **Dataset:** 24 invented passenger records in `public/data/titanic-ch01.sqlite`.

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

All mission definitions, starter queries, worked examples, reference queries and hints are in `content/chapter-01.json`. They can be changed without editing React components.

## Teaching contract: explain → example → practice

This course assumes the learner has **never written SQL**. Every mission follows three visible steps:

1. **Learn the idea.** Explain any new syntax in plain English. The keyword glossary must explain each new symbol, including `SELECT`, `*`, `FROM`, `LIMIT`, `;`, commas, and column names as appropriate.
2. **Follow a worked example.** Give a realistic archive request, a valid SQL query, a line-by-line breakdown, and a takeaway. The learner can run the example in place and inspect a small live preview without overwriting her SQL draft or affecting progress. Worked examples must not be the exact answers to their tasks.
3. **Your turn.** Ask for a related but different query. The first task should be a small variation on the example; later tasks gradually require more independent thinking.

For example, lesson 1 teaches `SELECT * FROM passengers LIMIT 2;`: the asterisk means **all columns**, while `LIMIT 2` means **at most two rows**. The separate assignment asks for five rows. The initial editor code is a partially completed query rather than a solved answer. Explain that `LIMIT` without `ORDER BY` does not guarantee any particular order.

Every worked example is validated by automated tests against the same SQLite database used in the lesson. Real database records in Chapter 1 remain entirely fictional and clearly labelled as such.

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
