# NHA408E Midterm Verification

- **Group:** G09
- **Product:** Finfolio 2.0
- **Date:** 16/09/2026
- **Team representative:** Lê Bảo An
- **Repository:** <https://github.com/FTU-Legacy-63/G09>
- **Instructor:** Assoc. Prof. Phan Trần Trung Dũng, PhD

## A. Group Verification

### 1. What is the biggest issue your team still needs to solve before Week 6?

The team's biggest remaining issue before Week 6 is internal coordination and a shared understanding of each deliverable. At the beginning, work was divided mainly by week and assigned to individual members. This made ownership visible, but it did not fully reflect how closely the tasks depend on one another. Some tasks also require specialized knowledge, so an idea or output prepared by one member may be interpreted differently by other members when the expected scope, terminology, or hand-off is not stated clearly.

For example, Week 4 focuses on financial logic and one member has primary responsibility for that area. However, defining the logic affects the required data, product flow, interface, and testing criteria. It therefore requires discussion and validation by the whole team rather than being completed independently by only one person. The problem is not a lack of participation; it is that the team has not always made this shared responsibility and the expected final output explicit enough.

### 2. Why is this issue important?

This issue is important because the parts of Finfolio must use the same definitions, assumptions, and decision logic. If responsibilities and expected outputs are not understood consistently, the financial logic may require data that has not been prepared, the interface may present a different interpretation of the result, or the tester may evaluate the product using rules that differ from those intended by the developer. Even when each individual section appears reasonable, the combined product can become inconsistent.

These differences also affect progress. When misunderstandings are discovered late, members must revisit earlier work, reconcile conflicting sections, and revise dependent deliverables together. This creates avoidable rework and may delay implementation. Clear coordination is therefore necessary both for product consistency and for ensuring that every member can explain how their own output connects with the rest of the project.

### 3. What has your team done about this issue so far?

After identifying the issue, the team began holding more regular progress updates instead of waiting until the end of each weekly task. During these discussions, members explain what they have produced, raise unclear terms or assumptions, and identify where one person's work depends on another person's output. This has helped the team recognize that several deliverables, especially financial logic, data requirements, user flow, and validation, cannot be reviewed in isolation.

Members have also started cross-checking sections prepared by others. When two sections describe the same input, calculation, output, or limitation differently, the team discusses the difference and agrees on one interpretation before treating the deliverable as complete. The repository documents are then used as the shared reference so that later work is based on the same version of the project's scope and logic.

### 4. What will your team do next about this issue?

Before and during Week 6, the team will confirm the intended output, main owner, supporting members, dependencies, and a simple acceptance check for each task before implementation begins. The primary owner will still coordinate the deliverable, but members whose work is affected by it will participate in the relevant discussion and review. This should prevent a weekly assignment from being treated as an isolated task when it actually affects several parts of the product.

The team will also maintain consistent explanations for important terms, inputs, calculation rules, assumptions, and expected outputs. These explanations will be shared with the tester, UI/UX designer, and developer so that they work from the same interpretation. Short progress updates and cross-checks will continue, and any change that affects another section will be communicated before the related work is finalized.

## B. Member Contribution Verification

| Member | What did this member actually produce? | How is it used in the project? | What can this member personally explain, calculate, demonstrate, or reproduce? |
| --- | --- | --- | --- |
| **Hoàng Khánh Linh**<br>2412380024 | Defined the MVP scope and drafted the financial-method decisions for benchmark, contribution analysis, and constrained optimization. | These decisions set what the MVP calculates, what it does not claim, and how current and reference portfolios are compared. | Explain the selected metrics, benchmark role, optimization assumptions, and why the result is a reference allocation rather than investment advice. |
| **Nguyễn Quỳnh Anh**<br>2413380010 | Structured the requirements, user-flow paths, acceptance scenarios, and Week 5 readiness checklist. | They are used to check whether the product handles normal, alternative, and invalid-input cases before Week 6. | Walk through the complete user flow, demonstrate the test scenarios, and explain the pass/fail criteria for current-versus-reference comparison. |
| **Lê Bảo An**<br>2412380002 | Produced the repository structure and the technical pipeline specification linking input, validation, calculation, benchmark, optimizer, and output. | It provides the implementation route and identifies which technical integrations and executable tests are still pending. | Explain the data-to-output pipeline, validation sequence, optimizer integration route, and reproduce the repository evidence structure. |
| **Trần Minh Ngọc**<br>2412380036 | Prepared the input dictionary, source-use mapping, data requirements, and the register of data limitations. | They define the fields, sources, classifications, and data-quality checks required by the analysis. | Explain each essential input, compare candidate sources, identify missing data, and show how an observation is traced to its source and use. |
| **Nguyễn Ngọc Anh**<br>2413380008 | Designed the user flow, output hierarchy, text wireframe, homepage draft, and portfolio-analysis dashboard sample. | These artifacts show how users enter the flow and read allocation, contribution, benchmark, and comparison results. | Demonstrate the interface samples and explain the information hierarchy, explanation boxes, error states, and current-versus-reference layout. |

> Because one person may upload files on behalf of the team, Git commit authorship is not used as proof of individual contribution. Each member should be able to explain or reproduce the output stated in their row.
