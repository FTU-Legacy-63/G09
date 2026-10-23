# Finfolio Individual Reports — Formatting QA

## Reference style extracted

The five final reports use `Group12_FOMC_Report_Reference_Style.docx` as their formatting reference and preserve its main academic conventions:

- US Letter page size;
- cover margins of approximately 2.0 cm on the top, right and bottom and 3.0 cm on the left;
- body margins of approximately 2.5 cm on the top, right and bottom and 2.8 cm on the left;
- double-line border on the cover page only;
- FTU logo extracted from the reference document rather than substituted;
- Times New Roman body text, 1.5 line spacing and justified paragraphs;
- blue Heading 1 and Heading 2 hierarchy based on the reference style;
- compact blue table headers, alternating row shading and centred page numbers.

## Corrections applied

- Rebuilt every report in English from the corresponding Individual Footprint instead of translating one generic template.
- Preserved the original files and wrote new deliverables with the `_FINAL.docx` suffix.
- Moved the complete Monte Carlo workflow to Lê Bảo An and removed algorithm ownership from Nguyễn Ngọc Anh.
- Moved benchmark sourcing, fallback, currency and common-date alignment from Hoàng Khánh Linh to Trần Minh Ngọc.
- Kept Hoàng Khánh Linh responsible for product scope, Return/Euler/FX methodology, optimization assumptions and claim boundaries.
- Kept Nguyễn Quỳnh Anh responsible for user flows, acceptance criteria, regression evidence, bug governance and release acceptance.
- Kept Nguyễn Ngọc Anh responsible for information architecture, visual design, responsive behavior, accessibility and explainability.
- Removed raw LaTeX notation. Compact formulas are represented with editable Unicode mathematical symbols and Cambria Math typography; no formulas are raster images.
- Added a verified static table of contents because cross-application automatic TOC refresh is not reliable in headless LibreOffice. Page references were checked against the final rendered PDFs.

## Rendering verification

All five documents were opened through LibreOffice in headless mode, exported to PDF and visually inspected page by page after the final content changes.

| Final report | Rendered pages | Result |
| :--- | :---: | :--- |
| `Finfolio_Personal_Report_bao-an_FINAL.docx` | 7 | Pass |
| `Finfolio_Personal_Report_linh_FINAL.docx` | 6 | Pass |
| `Finfolio_Personal_Report_minh-ngoc_FINAL.docx` | 6 | Pass |
| `Finfolio_Personal_Report_ngoc-anh_FINAL.docx` | 6 | Pass |
| `Finfolio_Personal_Report_quynh-anh_FINAL.docx` | 6 | Pass |

Checks included cover-page border and logo, table boundaries, page breaks, heading hierarchy, table-of-contents references, declaration page, Vietnamese names, English body text and absence of clipped or overflowing content.

## Remaining manual items

Each member must complete the signature and date fields on the Individual Declaration page before submission. No layout repair is currently required.
