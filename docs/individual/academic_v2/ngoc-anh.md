# Nguyễn Ngọc Anh

## ABSTRACT

This report presents my individual contribution to Finfolio 2.0 as UI/UX Designer and Information Architecture Lead. The project required complex portfolio outputs to be communicated to retail investors without reducing them to an unexplained score or placing every control on one continuous dashboard. My work focused on the seven-page information architecture, the Forest/Paper design system, Vietnamese-compatible typography, actual-value portfolio charts, attribution presentation, responsive layout, accessibility, and progressive disclosure of methods and limitations. The contribution connected visual hierarchy with analytical meaning: capital, return, contribution, risk, benchmark evidence, and optional research tools are presented in a deliberate sequence. The report uses application screenshots and repository artifacts to demonstrate the design decisions and their implementation. It also distinguishes interface responsibility from quantitative ownership. The Monte Carlo method and calculation belong to the Lead Developer; my role was to maintain a coherent visual and interaction system around verified outputs. The resulting product supports desktop and mobile use while preserving units, uncertainty, and interpretive context.

**Keywords:** user experience; information architecture; financial visualization; responsive design; accessibility; design system.

## I. INTRODUCTION AND INDIVIDUAL RESPONSIBILITY

Portfolio analysis interfaces can create a form of information overload. A user may encounter allocation charts, performance series, risk measures, attribution tables, benchmark statistics, and optimization controls on the same screen, with no clear indication of which result should be read first. Finfolio 2.0 addressed this problem by treating information order as part of the analytical method. The interface had to help the user move from an observable result to its drivers, interpretation, possible action, and limitations.

As UI/UX Designer and Information Architecture Lead, I defined this sequence and the visual system through which it is expressed. My responsibilities covered page structure, navigation, typography, spacing, color semantics, responsive behavior, chart interaction, table containment, keyboard behavior, and the presentation of explanatory text. The work is visible in `demo/tokens.css`, `demo/typography.css`, `demo/redesign.css`, `demo/product.css`, `demo/chart-utils.mjs`, `demo/navigation.mjs`, and the application routes.

The role did not include ownership of financial formulas or simulation algorithms. Hoàng Khánh Linh specified the financial meaning, Trần Minh Ngọc specified data labels and provenance, Lê Bảo An implemented the numerical engine, and Nguyễn Quỳnh Anh defined acceptance behavior. I translated their verified outputs into a coherent experience and reviewed whether the interface preserved units, assumptions, and uncertainty.

[[FIGURE:home|Finfolio 2.0 landing page and primary navigation structure|Source: Finfolio 2.0 application, project screenshot.]]

## II. DISTINCTIVE CONTRIBUTIONS TO FINFOLIO 2.0

### 2.1 Seven-page information architecture

The final application separates overview, portfolio entry, analysis, optimization, simulation, methods, and account or decision records. This structure replaced an earlier long-page approach in which users had to scroll through input, analysis, and research features in one continuous sequence. Separating the routes reduced visual density and made application state easier to understand. It also allowed each advanced feature to carry its own assumptions and limitations without overwhelming the core attribution report.

Within the analysis route, the hierarchy begins with the effective period, data status, and base currency. The main result then states the change in actual portfolio value. Summary metrics appear before the contribution views, followed by portfolio and benchmark charts, risk evidence, and expandable methodology. This order follows the pattern Result, Reason, Meaning, Action, and Limitation. The user can identify the result before interpreting the evidence that supports it.

The navigation system uses consistent route labels and active-state treatment on desktop. On narrow screens, it avoids forcing the entire desktop navigation into a horizontal row that would overflow the viewport. The route structure also permits a user to return to the portfolio without losing the conceptual distinction between editing inputs and reading a report.

### 2.2 Forest/Paper design system and typography

I developed the Forest/Paper visual direction as a restrained system for financial information. Dark forest green identifies the product and primary actions, warm paper backgrounds reduce glare, and neutral borders organize content without turning every analytical result into a decorative card. Positive, negative, and warning states use color together with text or sign, so meaning is not dependent on hue alone. The interface avoids red and green as unqualified recommendations; they indicate observed contribution or validation status.

The initial interface used fonts that did not render all Vietnamese diacritics consistently. I therefore specified self-hosted font assets with Vietnamese coverage and tabular numerals for financial values. `typography.css` standardizes display headings, body text, labels, captions, and numeric alignment. Tabular figures prevent columns and changing values from appearing visually unstable. The final build audit recorded 30 self-hosted font faces, allowing the application to avoid a network dependency for its principal typography.

[[FIGURE:analysis|Desktop analysis hierarchy showing result, metrics, attribution controls, and evidence|Source: Finfolio 2.0 application, project screenshot.]]

### 2.3 Actual-value PnL and analytical visualization

The primary performance chart was designed around actual portfolio value rather than a base-100 index. This decision preserves the user's initial capital and makes the vertical scale economically interpretable. A VND 100 million portfolio is therefore shown as a monetary path, and the tooltip reports the date, portfolio value, benchmark-equivalent value, and absolute PnL. Benchmark and reference-allocation lines begin from the same capital so that their paths can be compared without suggesting that the user actually held those alternatives.

The chart interaction includes a crosshair that follows both horizontal and vertical position, an edge-aware tooltip, visible time labels, and keyboard movement between observations. Line style and labels distinguish the portfolio, benchmark, and reference allocation in addition to color. This approach supports users who cannot reliably distinguish the chosen hues and preserves meaning when the chart is printed in grayscale.

Attribution visualization uses ranked positive and negative contributions, tables, and grouped views. Long sector and industry labels are allowed to wrap within bounded containers, while wide tables can scroll horizontally on small screens. The user may group by instrument, asset class, market or commodity type, currency, sector, or industry, but the interface presents one grouping at a time to avoid visual conflict.

### 2.4 Responsive and accessible interaction

Responsive behavior was reviewed at representative widths of 375, 768, and 1440 pixels. On mobile, the content becomes a single column, chart and table containers remain within the viewport, and touch targets retain usable spacing. The typography scale decreases carefully while the order of information remains stable. Figure 3 illustrates how the analysis heading, period, actions, source disclosure, and warnings are preserved on a narrow screen.

[[FIGURE:mobile_analysis|Responsive analysis page at a mobile viewport|Source: Finfolio 2.0 application, project screenshot.]]

Accessibility work included visible keyboard focus, autocomplete navigation with arrow keys, Escape behavior, descriptive labels, and non-color indicators. The interface does not hide assumptions behind an icon-only control, and advanced outputs retain nearby explanatory text. These measures do not replace formal testing with assistive-technology users, but they establish a stronger baseline than pointer-only interaction.

## III. IMPLEMENTATION AND DEVELOPMENT PROCESS

### 3.1 From early wireframes to a production system

During Weeks 1 and 2, I identified the target user's main information need and drafted the hierarchy around capital summary, performance, contribution, and risk. The early wireframes prioritized the output that helps a user understand the portfolio rather than decorative market widgets. During Week 5, interface samples were reviewed against the core task, and controls implying brokerage execution or automated advice were excluded.

The final implementation moved from visual reference to reusable code. Design tokens provide shared color, spacing, radius, border, and elevation values. Typography rules define consistent roles rather than styling each page independently. Page-level CSS handles the specific composition of portfolio, analysis, optimization, simulation, method, and account views. This organization allows a change to the common system to propagate while retaining route-specific layouts.

### 3.2 Visualization integration and review

During Week 7, the chart utilities and analytical tables were integrated with production data. Particular attention was given to hover behavior, axis spacing, the placement of captions and methodology notes, and overflow at the lower edge of charts. Visual review identified cases in which axis labels and explanatory text overlapped; spacing was then reserved beneath the plotting area so the note remained readable at desktop and mobile widths.

The same review addressed font compatibility and deployment rendering. Local success was insufficient because missing font files or incorrect Vercel output configuration could change the interface in production. The final audit therefore compared deployed pages with local screenshots and verified that Vietnamese accents, navigation, tables, and charts retained their intended structure.

## IV. EVIDENCE, VERIFICATION AND PROJECT OUTCOMES

The design contribution can be reproduced directly in the application and inspected through the relevant CSS and JavaScript modules. The screenshots in this report are project evidence rather than external illustrations. A reviewer can navigate the routes at desktop and mobile widths, use the chart tooltip and keyboard controls, and compare the visible styles with the tokens and typography definitions.

| Design output | Repository evidence | Verification procedure |
| --- | --- | --- |
| Information architecture | `demo/index.html`, `demo/navigation.mjs` | Navigate the seven routes and confirm active-state and state continuity. |
| Design system | `demo/tokens.css`, `demo/redesign.css` | Inspect shared color, spacing, border, and layout tokens. |
| Typography | `demo/typography.css` | Review Vietnamese diacritics and tabular financial figures. |
| PnL visualization | `demo/chart-utils.mjs` | Inspect the actual-value axis, tooltip, crosshair, and line distinctions. |
| Responsive behavior | `demo/product.css`, `demo/redesign.css` | Compare 375, 768, and 1440 pixel viewports. |

The final result is an interface in which technical sophistication does not determine reading order. The user encounters the current portfolio result before optional optimization or simulation. Units, data timing, and limitations remain visible. This organization supports the project's problem-first direction and gives each analytical extension a clear place without collapsing the application into a single dashboard.

## V. LIMITATIONS AND LESSONS LEARNED

Wide attribution tables still require horizontal scrolling on small screens, and long Vietnamese sector or industry labels can increase row height. Native SVG provides direct control over chart behavior, but the current implementation would benefit from broader screen-reader testing and user testing with investors outside the development team. The design system establishes consistency but does not prove that every statistical explanation is immediately understood.

The principal lesson was that visual design in a financial product protects meaning. Units, assumptions, source timing, and uncertainty are part of the interface, not material to be added after calculation. A visually prominent number can mislead when its period or basis is unclear. The strongest design decisions therefore connected hierarchy with evidence: result before interpretation, current allocation before alternatives, and methods beside the outputs that depend on them.

## VI. CONCLUSION

My contribution transformed Finfolio 2.0 from a collection of analytical functions into a coherent multi-page user experience. I designed the information architecture, Forest/Paper system, Vietnamese-compatible typography, actual-value chart behavior, attribution presentation, responsive layouts, and accessibility baseline.

The work maintained a clear accountability boundary. I was responsible for how verified outputs are ordered, labelled, and interacted with, while quantitative ownership remained with the financial and development roles. This separation allowed the final application to communicate complex portfolio evidence in a form that a retail investor can examine without losing the assumptions behind it.
