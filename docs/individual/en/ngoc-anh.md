# Individual Contribution Report — Nguyễn Ngọc Anh

## I. Role and accountability

As UI/UX Designer and Information Architecture Lead, I converted complex portfolio analytics into a coherent seven-page experience. My scope covered visual hierarchy, the Forest/Paper design system, Vietnamese-compatible typography, responsive behavior, accessibility, PnL and attribution visualization, and progressive disclosure. The Monte Carlo algorithm, simulation page logic and its fan-chart implementation are assigned to Lê Bảo An and are not claimed in my footprint.

## II. Distinctive contribution to Finfolio 2.0

### 2.1 Real-value PnL visualization

I designed the main performance chart around actual portfolio value rather than a base-100 index. The vertical axis therefore starts from the user's invested capital and the tooltip shows date, portfolio value, benchmark value and absolute PnL. A dual-axis crosshair and edge-aware tooltip support precise inspection without covering the selected point.

### 2.2 Forest/Paper design system

I defined reusable color, spacing, radius and elevation tokens and selected self-hosted typefaces that support Vietnamese diacritics. The system distinguishes positive, negative and neutral analytical states without presenting color as an unsupported “good/bad” recommendation.

### 2.3 Seven-page information architecture

I separated portfolio input, analysis, optimization, simulation, methods and account functions rather than placing every component on one long page. Each page follows progressive disclosure: primary metrics first, then chart, evidence table and expandable methodology. This preserves continuity while reducing overload for a retail investor.

## III. Work completed across the project

### 3.1 User needs and early wireframes — Weeks 1–2

- Identified information overload as a primary usability problem.
- Drafted the analysis layout around capital summary, performance, contribution and risk evidence.
- Prioritized decision-relevant outputs over decorative dashboard elements.

### 3.2 Output explanation pattern — Week 5

- Defined the sequence Result → Reason → Meaning → Action → Limitation.
- Removed unsupported controls such as “Trade now” or broker connectivity from the interface samples.
- Established restrained color semantics for attribution and warning states.

### 3.3 Design tokens and typography — Week 6

- Implemented `tokens.css` for Forest/Paper colors, spacing and component geometry.
- Implemented `typography.css` with self-hosted Vietnamese-compatible fonts and tabular figures.
- Standardized headings, labels, captions and financial-number alignment.

### 3.4 PnL and attribution visualization — Week 7

- Specified native-SVG performance lines, benchmark styling and before/after optimization comparison.
- Designed responsive tooltips and crosshair behavior.
- Designed attribution heatmaps and grouped views that remain readable across instrument, asset class, sector and industry labels.

### 3.5 Responsive and accessible interaction — Week 7

- Defined mobile, tablet and desktop breakpoints and contained wide analytical tables.
- Supported keyboard focus, autocomplete navigation and Escape behavior.
- Audited contrast and ensured that chart meaning is not conveyed by color alone.

## IV. Evidence and reproducibility

| Deliverable | Actual contribution | Repository evidence | How to reproduce or explain it |
| --- | --- | --- | --- |
| Design tokens | Forest/Paper palette, spacing, radius and elevation | `demo/tokens.css` | Inspect CSS custom properties in browser DevTools |
| Typography | Vietnamese-compatible self-hosted hierarchy and tabular figures | `demo/typography.css` | Run typography checks and inspect diacritics |
| Interface structure | Seven-page visual and information hierarchy | `demo/index.html`, `demo/navigation.mjs` | Navigate all production routes on desktop and mobile |
| PnL visualization | Actual-value axis, crosshair, tooltip and benchmark styling | `demo/chart-utils.mjs` | Inspect any point and verify date/value display |
| Responsive layout | Mobile tables, labels and page-level composition | `demo/redesign.css`, `demo/product.css` | Check 375 px, 768 px and 1440 px viewports |

## V. Weekly evidence trail

| Week | Verified output | Personal significance |
| --- | --- | --- |
| W1 | Target-user information needs | Established clarity as the design objective |
| W2 | Initial allocation-brief hierarchy | Ordered information from summary to evidence |
| W3 | Input-to-output interaction review | Ensured each input had a visible consequence |
| W4 | Before/after comparison layout | Prepared the optimization comparison experience |
| W5 | Explanation standard and interface samples | Established the visual direction |
| W6 | Tokens and Vietnamese typography | Created a reusable design system |
| W7 | Native-SVG PnL, responsive tables and accessibility | Completed production-facing interface quality |

## VI. Limitations and lessons learned

Wide attribution tables still require horizontal scrolling on small screens, and long sector or industry labels can increase row height. These constraints are handled but not eliminated. Further usability testing with external retail investors would be required before claiming that every statistical explanation is immediately understood.

The main lesson was that financial interface design must protect meaning. Units, assumptions and uncertainty are part of the visual system, not footnotes added after implementation. I can demonstrate the information hierarchy, typography, chart interaction and responsive behavior, while clearly separating those responsibilities from the simulation methodology owned by the Lead Developer.
