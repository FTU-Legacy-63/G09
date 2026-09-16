# NHA408E Midterm Verification

- **Group:** G09
- **Product:** Finfolio 2.0
- **Date:** _To be completed_
- **Team representative:** _To be completed_
- **Repository:** <https://github.com/FTU-Legacy-63/G09>
- **Instructor:** _To be completed_

## A. Group Verification

### 1. What is the biggest issue your team still needs to solve before Week 6?

The team still needs to define one simple, consistent route for comparing stocks with gold and silver without expanding the MVP into a full multi-asset platform.

### 2. Why is this issue important?

Cross-asset comparison is the user's main need. An equity-only MVP would miss that need, while a broad multi-asset scope could create inconsistent inputs, dates, units, and results.

### 3. What has your team done about this issue so far?

We limited the extension to stocks, gold, and silver; kept one shared return-risk analysis flow; tested a historical fixture containing stocks and a gold proxy; and moved other asset classes and advanced methods outside the MVP.

### 4. What will your team do next about this issue?

We will select supported gold and silver instruments and sources, align them with stock data on the same period and currency, build one small test portfolio, and validate the current-versus-reference comparison.

## B. Member Contribution Verification

| Member | What did this member actually produce? | How is it used in the project? | What can this member personally explain, calculate, demonstrate, or reproduce? |
| --- | --- | --- | --- |
| **Hoàng Khánh Linh**<br>2412380024 | Defined the MVP scope and drafted the financial-method decisions for benchmark, contribution analysis, and constrained optimization. | These decisions set what the MVP calculates, what it does not claim, and how current and reference portfolios are compared. | Explain the selected metrics, benchmark role, optimization assumptions, and why the result is a reference allocation rather than investment advice. |
| **Nguyễn Quỳnh Anh**<br>2413380010 | Structured the requirements, user-flow paths, acceptance scenarios, and Week 5 readiness checklist. | They are used to check whether the product handles normal, alternative, and invalid-input cases before Week 6. | Walk through the complete user flow, demonstrate the test scenarios, and explain the pass/fail criteria for current-versus-reference comparison. |
| **Lê Bảo An**<br>2412380002 | Produced the repository structure and the technical pipeline specification linking input, validation, calculation, benchmark, optimizer, and output. | It provides the implementation route and identifies which technical integrations and executable tests are still pending. | Explain the data-to-output pipeline, validation sequence, optimizer integration route, and reproduce the repository evidence structure. |
| **Trần Minh Ngọc**<br>2412380036 | Prepared the input dictionary, source-use mapping, data requirements, and the register of data limitations. | They define the fields and sources needed for stocks, gold, silver, benchmark data, classification, and data-quality checks. | Explain each essential input, compare candidate sources, identify missing data, and show how an observation is traced to its source and use. |
| **Nguyễn Ngọc Anh**<br>2413380008 | Designed the user flow, output hierarchy, text wireframe, homepage draft, and portfolio-analysis dashboard sample. | These artifacts show how users enter the flow and read allocation, contribution, benchmark, and comparison results. | Demonstrate the interface samples and explain the information hierarchy, explanation boxes, error states, and current-versus-reference layout. |

> Because one person may upload files on behalf of the team, Git commit authorship is not used as proof of individual contribution. Each member should be able to explain or reproduce the output stated in their row.
