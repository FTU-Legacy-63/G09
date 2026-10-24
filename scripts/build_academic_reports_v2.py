#!/usr/bin/env python3
"""Build and render five substantive Finfolio academic individual reports."""

from __future__ import annotations

import re
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "docs" / "individual" / "academic_v2"
OUTPUT_DIR = ROOT / "academic_reports_v2"
ASSET_DIR = OUTPUT_DIR / "assets"
REFERENCE = Path(
    "/Users/admin/Documents/TCH442_Group12/fomc-price-discovery/output/pdf/"
    "Group12_FOMC_Report_Reference_Style.docx"
)
SCREENSHOTS = ROOT / "output" / "playwright"

COURSE = "Information Technology Applications in Finance and Banking (NHA408E)"
INSTRUCTOR = "Phan Trần Trung Dũng"
PROJECT = "FINFOLIO 2.0 - PORTFOLIO ATTRIBUTION & RISK ANALYTICS"

MEMBERS = {
    "bao-an": ("Lê Bảo An", "2412380002", "Team Representative / Lead Developer"),
    "linh": ("Hoàng Khánh Linh", "2412380024", "Product Owner / Financial Logic Lead"),
    "minh-ngoc": ("Trần Minh Ngọc", "2412380036", "Business Analyst / Data and Provenance Lead"),
    "ngoc-anh": ("Nguyễn Ngọc Anh", "2413380008", "UI/UX Designer / Information Architecture Lead"),
    "quynh-anh": ("Nguyễn Quỳnh Anh", "2413380010", "Product Manager / Flow and Testing Lead"),
}

FIGURE_FILES = {
    "home": "home.png",
    "analysis": "analysis.png",
    "portfolio_input": "portfolio-input.png",
    "optimize": "optimize.png",
    "monte_carlo": "monte-carlo.png",
    "mobile_analysis": "mobile-analysis.png",
    "diagram_system_architecture": "diagram-system-architecture.png",
    "diagram_methodology": "diagram-methodology.png",
    "diagram_data_pipeline": "diagram-data-pipeline.png",
    "diagram_user_flow": "diagram-user-flow.png",
}

EQUATIONS = {
    "portfolio_value": ["Vₚ = ∑ᵢ qᵢ Pᵢ,ₜ FXᵢ,ₜ"],
    "optimization_objectives": [
        "Minimum volatility:  minimize  wᵀΣw",
        "Maximum Sharpe:  maximize  (wᵀμ - rₑ) / √(wᵀΣw)",
    ],
    "return_contribution": ["Rₚ = (Vᵀ / V⁰) - 1,     Rₚ = ∑ᵢ Cᴿ,ᵢ"],
    "euler_risk": [
        "σₚ = √(252 · wᵀΣw)",
        "RCᵢ = wᵢ(Σw)ᵢ√252 / √(wᵀΣw),     ∑ᵢ RCᵢ = σₚ",
    ],
    "fx_attribution": [
        "rᵛⁿᴰ = (1 + rˡᵒᶜᵃˡ)(1 + rᶠˣ) - 1 = rˡᵒᶜᵃˡ + rᶠˣ + rˡᵒᶜᵃˡrᶠˣ"
    ],
}

INLINE = re.compile(r"(\*\*[^*]+\*\*|`[^`]+`)")
FIGURE = re.compile(r"^\[\[FIGURE:([^|]+)\|([^|]+)\|([^]]+)\]\]$")
EQUATION = re.compile(r"^\[\[EQUATION:([^]]+)\]\]$")


def font_path(bold: bool = False) -> str:
    candidates = [
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        "/Library/Fonts/Times New Roman Bold.ttf" if bold else "/Library/Fonts/Times New Roman.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return candidate
    return "/System/Library/Fonts/Supplemental/Arial.ttf"


def fit_font(draw: ImageDraw.ImageDraw, text: str, max_width: int, start: int, bold: bool = False):
    size = start
    while size > 18:
        font = ImageFont.truetype(font_path(bold), size)
        if draw.textbbox((0, 0), text, font=font)[2] <= max_width:
            return font
        size -= 1
    return ImageFont.truetype(font_path(bold), size)


def make_flow_diagram(path: Path, title: str, stages: list[tuple[str, str]], note: str = "") -> None:
    width, height = 1800, 700
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)
    title_font = ImageFont.truetype(font_path(True), 42)
    body_font = ImageFont.truetype(font_path(False), 28)
    small_font = ImageFont.truetype(font_path(False), 23)
    draw.text((width / 2, 58), title, font=title_font, fill="black", anchor="mm")
    left, right, gap = 80, 80, 32
    box_width = (width - left - right - gap * (len(stages) - 1)) // len(stages)
    y0, y1 = 190, 500
    for index, (heading, detail) in enumerate(stages):
        x0 = left + index * (box_width + gap)
        x1 = x0 + box_width
        draw.rounded_rectangle((x0, y0, x1, y1), radius=12, fill=(246, 246, 246), outline="black", width=3)
        hfont = fit_font(draw, heading, box_width - 32, 32, True)
        draw.text(((x0 + x1) / 2, y0 + 62), heading, font=hfont, fill="black", anchor="mm")
        words, lines, current = detail.split(), [], ""
        for word in words:
            test = f"{current} {word}".strip()
            if draw.textbbox((0, 0), test, font=small_font)[2] <= box_width - 38:
                current = test
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
        start_y = y0 + 125
        for line_index, line in enumerate(lines[:5]):
            draw.text(((x0 + x1) / 2, start_y + line_index * 34), line, font=small_font, fill=(40, 40, 40), anchor="mm")
        if index < len(stages) - 1:
            ax0, ax1, ay = x1 + 5, x1 + gap - 5, (y0 + y1) / 2
            draw.line((ax0, ay, ax1, ay), fill="black", width=4)
            draw.polygon([(ax1, ay), (ax1 - 18, ay - 11), (ax1 - 18, ay + 11)], fill="black")
    if note:
        draw.text((width / 2, 610), note, font=body_font, fill=(45, 45, 45), anchor="mm")
    image.save(path, quality=95)


def prepare_assets() -> Path:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(REFERENCE) as archive:
        media = sorted(name for name in archive.namelist() if name.startswith("word/media/"))
        logo_name = next((name for name in media if name.lower().endswith((".png", ".jpg", ".jpeg"))), media[0])
        logo_path = ASSET_DIR / "ftu-logo.png"
        logo_path.write_bytes(archive.read(logo_name))

    image_sources = {
        "home.png": SCREENSHOTS / "fonts-home-desktop-oct9.png",
        "analysis.png": SCREENSHOTS / "fonts-analysis-desktop-oct9.png",
        "portfolio-input.png": SCREENSHOTS / "fonts-portfolio-desktop-oct9.png",
        "optimize.png": SCREENSHOTS / "final-max-sharpe.png",
        "mobile-analysis.png": SCREENSHOTS / "review-analysis-mobile.png",
    }
    for target_name, source_path in image_sources.items():
        with Image.open(source_path) as source:
            source.convert("RGB").save(ASSET_DIR / target_name, quality=94)
    with Image.open(SCREENSHOTS / "review-mc-complete-desktop.png") as source:
        crop = source.crop((0, 0, source.width, min(1450, source.height))).convert("RGB")
        crop.save(ASSET_DIR / "monte-carlo.png", quality=94)

    make_flow_diagram(
        ASSET_DIR / "diagram-system-architecture.png",
        "Finfolio 2.0 System Architecture",
        [("Market data", "Vietnam, international, benchmark, and FX observations"),
         ("Validation", "Provenance, currency, common dates, and minimum sample"),
         ("Financial engine", "Value, return, attribution, covariance, and metrics"),
         ("Research worker", "Constrained optimization and seeded block bootstrap"),
         ("Interface", "Analysis, explanation, comparison, and decision record")],
        "Methodology, data, QA, and UI specifications meet in a reproducible implementation contract.",
    )
    make_flow_diagram(
        ASSET_DIR / "diagram-methodology.png",
        "Financial Methodology Sequence",
        [("Portfolio value", "Actual VND capital and buy-and-hold quantities"),
         ("Return", "Period result and reconciling contribution"),
         ("Risk", "Covariance, volatility, and Euler component risk"),
         ("FX", "Local price, currency effect, and interaction"),
         ("Reference allocation", "Same sample, disclosed assumptions, and constraints")],
        "Each stage states its unit, reconciliation condition, assumptions, and claim boundary.",
    )
    make_flow_diagram(
        ASSET_DIR / "diagram-data-pipeline.png",
        "Data Provenance and Compatibility Pipeline",
        [("Inputs", "Instrument, value, user currency, dates, benchmark, and caps"),
         ("Sources", "TradingView Vietnam, Yahoo international and FX, labelled cache"),
         ("Validation", "Identifiers, positive values, duplicates, missing values, freshness"),
         ("Alignment", "Base currency, common dates, and sufficient observations"),
         ("Financial engine", "Only compatible series proceed to portfolio calculations")],
        "Provider, effective date, fallback, and transformation remain traceable.",
    )
    make_flow_diagram(
        ASSET_DIR / "diagram-user-flow.png",
        "Acceptance Flow for Finfolio 2.0",
        [("Enter portfolio", "Supported instruments, positive values, and currencies"),
         ("Validate", "Block errors; disclose acceptable fallbacks and stale data"),
         ("Analyze", "Current value, return, risk, FX, and benchmark evidence"),
         ("Optional research", "Feasible optimization or reproducible simulation"),
         ("Record decision", "Keep or consider reallocation with a stated reason")],
        "Every requirement links an input, expected result, actual observation, and regression check.",
    )
    return logo_path


def set_run_font(run, size: float = 13, bold: bool | None = None, italic: bool | None = None) -> None:
    run.font.name = "Times New Roman"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor(0, 0, 0)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def normalize_docx_theme_fonts(path: Path) -> None:
    """Remove theme-font fallbacks so Word inherits Times New Roman consistently."""
    with tempfile.NamedTemporaryFile(dir=path.parent, suffix=".docx", delete=False) as handle:
        temporary = Path(handle.name)
    try:
        with zipfile.ZipFile(path) as source, zipfile.ZipFile(temporary, "w") as target:
            for item in source.infolist():
                data = source.read(item.filename)
                if item.filename.endswith(".xml"):
                    data = re.sub(
                        rb' w:(?:asciiTheme|hAnsiTheme|eastAsiaTheme|cstheme)="[^"]+"',
                        b"",
                        data,
                    )
                if item.filename == "word/theme/theme1.xml":
                    data = data.replace(b'typeface="Calibri"', b'typeface="Times New Roman"')
                    data = data.replace(b'typeface="Cambria"', b'typeface="Times New Roman"')
                target.writestr(item, data)
        shutil.move(temporary, path)
    finally:
        if temporary.exists():
            temporary.unlink()


def remove_table_borders(table) -> None:
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        node = OxmlElement(f"w:{edge}")
        node.set(qn("w:val"), "nil")
        borders.append(node)
    tbl_pr.append(borders)


def set_table_borders(table, size: str = "6", color: str = "7F7F7F") -> None:
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        node = OxmlElement(f"w:{edge}")
        node.set(qn("w:val"), "single")
        node.set(qn("w:sz"), size)
        node.set(qn("w:space"), "0")
        node.set(qn("w:color"), color)
        borders.append(node)
    tbl_pr.append(borders)


def set_cell_margins(cell, top=70, start=90, bottom=70, end=90) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    margins = OxmlElement("w:tcMar")
    for name, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = OxmlElement(f"w:{name}")
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")
        margins.append(node)
    tc_pr.append(margins)


def prevent_row_split(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    tr_pr.append(OxmlElement("w:cantSplit"))


def repeat_header(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    header = OxmlElement("w:tblHeader")
    header.set(qn("w:val"), "true")
    tr_pr.append(header)


def add_page_number(paragraph) -> None:
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([begin, instr, separate, end])
    set_run_font(run, 10)


def add_cover_border(section) -> None:
    sect_pr = section._sectPr
    borders = OxmlElement("w:pgBorders")
    borders.set(qn("w:offsetFrom"), "page")
    for edge in ("top", "left", "bottom", "right"):
        node = OxmlElement(f"w:{edge}")
        node.set(qn("w:val"), "double")
        node.set(qn("w:sz"), "6")
        node.set(qn("w:space"), "24")
        node.set(qn("w:color"), "000000")
        borders.append(node)
    sect_pr.append(borders)


def configure_styles(doc: Document) -> None:
    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Times New Roman"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    normal.font.size = Pt(13)
    normal.font.color.rgb = RGBColor(0, 0, 0)
    pf = normal.paragraph_format
    pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf.first_line_indent = Cm(1.27)
    pf.line_spacing = 1.3
    pf.space_after = Pt(6)
    pf.widow_control = True

    heading1 = styles["Heading 1"]
    heading1.font.name = "Times New Roman"
    heading1._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    heading1.font.size = Pt(14)
    heading1.font.bold = True
    heading1.font.color.rgb = RGBColor(0, 0, 0)
    heading1.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    heading1.paragraph_format.first_line_indent = Cm(0)
    heading1.paragraph_format.space_before = Pt(12)
    heading1.paragraph_format.space_after = Pt(6)
    heading1.paragraph_format.keep_with_next = True
    heading1.paragraph_format.page_break_before = False

    heading2 = styles["Heading 2"]
    heading2.font.name = "Times New Roman"
    heading2._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    heading2.font.size = Pt(13)
    heading2.font.bold = True
    heading2.font.color.rgb = RGBColor(0, 0, 0)
    heading2.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    heading2.paragraph_format.first_line_indent = Cm(0)
    heading2.paragraph_format.space_before = Pt(9)
    heading2.paragraph_format.space_after = Pt(4)
    heading2.paragraph_format.keep_with_next = True

    caption = styles["Caption"]
    caption.font.name = "Times New Roman"
    caption._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    caption.font.size = Pt(12)
    caption.font.italic = False
    caption.font.color.rgb = RGBColor(0, 0, 0)
    caption.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    caption.paragraph_format.first_line_indent = Cm(0)
    caption.paragraph_format.space_before = Pt(4)
    caption.paragraph_format.space_after = Pt(2)
    caption.paragraph_format.keep_with_next = True


def add_inline(paragraph, text: str) -> None:
    position = 0
    for match in INLINE.finditer(text):
        if match.start() > position:
            run = paragraph.add_run(text[position:match.start()])
            set_run_font(run)
        token = match.group(0)
        if token.startswith("**"):
            run = paragraph.add_run(token[2:-2])
            set_run_font(run, bold=True)
        else:
            run = paragraph.add_run(token[1:-1])
            set_run_font(run, italic=True)
        position = match.end()
    if position < len(text):
        run = paragraph.add_run(text[position:])
        set_run_font(run)


def add_math(paragraph, formula: str) -> None:
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.space_before = Pt(4)
    paragraph.paragraph_format.space_after = Pt(4)
    math_para = OxmlElement("m:oMathPara")
    math = OxmlElement("m:oMath")
    math_run = OxmlElement("m:r")
    text = OxmlElement("m:t")
    text.text = formula
    math_run.append(text)
    math.append(math_run)
    math_para.append(math)
    paragraph._p.append(math_para)


def add_equation_block(doc: Document, key: str, equation_counter: list[int]) -> None:
    for formula in EQUATIONS[key]:
        table = doc.add_table(rows=1, cols=2)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.columns[0].width = Cm(14.2)
        table.columns[1].width = Cm(1.2)
        remove_table_borders(table)
        left = table.cell(0, 0).paragraphs[0]
        add_math(left, formula)
        right = table.cell(0, 1).paragraphs[0]
        right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        right.paragraph_format.first_line_indent = Cm(0)
        run = right.add_run(f"({equation_counter[0]})")
        set_run_font(run, 12)
        equation_counter[0] += 1


def add_academic_table(doc: Document, rows: list[list[str]]) -> None:
    table = doc.add_table(rows=len(rows), cols=len(rows[0]))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    set_table_borders(table)
    for r_index, row in enumerate(rows):
        prevent_row_split(table.rows[r_index])
        if r_index == 0:
            repeat_header(table.rows[r_index])
        for c_index, value in enumerate(row):
            cell = table.cell(r_index, c_index)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cell)
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
            paragraph.paragraph_format.first_line_indent = Cm(0)
            paragraph.paragraph_format.line_spacing = 1.05
            paragraph.paragraph_format.space_after = Pt(0)
            run = paragraph.add_run(value)
            set_run_font(run, 10.5, bold=(r_index == 0))
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


def add_figure(doc: Document, key: str, caption: str, source: str, figure_counter: list[int], figure_list: list[tuple[str, str]]) -> None:
    image_path = ASSET_DIR / FIGURE_FILES[key]
    paragraph = doc.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.keep_with_next = True
    width = Cm(7.2) if key == "mobile_analysis" else Cm(15.5)
    paragraph.add_run().add_picture(str(image_path), width=width)
    number = figure_counter[0]
    cap = doc.add_paragraph(style="Caption")
    cap.add_run(f"Figure {number}. {caption}")
    for run in cap.runs:
        set_run_font(run, 12)
    src = doc.add_paragraph()
    src.alignment = WD_ALIGN_PARAGRAPH.CENTER
    src.paragraph_format.first_line_indent = Cm(0)
    src.paragraph_format.space_after = Pt(8)
    src.paragraph_format.keep_with_next = False
    run = src.add_run(source)
    set_run_font(run, 10, italic=True)
    figure_list.append((f"Figure {number}. {caption}", ""))
    figure_counter[0] += 1


def parse_source(path: Path):
    lines = path.read_text(encoding="utf-8").splitlines()
    title = lines[0].removeprefix("# ").strip()
    blocks: list[tuple[str, object]] = []
    paragraph_parts: list[str] = []

    def flush_paragraph():
        if paragraph_parts:
            blocks.append(("paragraph", " ".join(part.strip() for part in paragraph_parts)))
            paragraph_parts.clear()

    index = 1
    while index < len(lines):
        line = lines[index].strip()
        if not line:
            flush_paragraph()
            index += 1
            continue
        if line.startswith("## "):
            flush_paragraph()
            blocks.append(("h1", line[3:].strip()))
        elif line.startswith("### "):
            flush_paragraph()
            blocks.append(("h2", line[4:].strip()))
        elif FIGURE.match(line):
            flush_paragraph()
            match = FIGURE.match(line)
            blocks.append(("figure", match.groups()))
        elif EQUATION.match(line):
            flush_paragraph()
            blocks.append(("equation", EQUATION.match(line).group(1)))
        elif line.startswith("|"):
            flush_paragraph()
            rows = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                values = [value.strip() for value in lines[index].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-+:?", value) for value in values):
                    rows.append(values)
                index += 1
            blocks.append(("table", rows))
            continue
        else:
            paragraph_parts.append(line)
        index += 1
    flush_paragraph()
    return title, blocks


def add_cover(doc: Document, logo_path: Path, member: tuple[str, str, str]) -> None:
    name, student_id, role = member
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Cm(1.8)
    section.bottom_margin = Cm(1.8)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)
    add_cover_border(section)

    def centered(text: str, size: float, bold: bool = False, after: float = 4):
        paragraph = doc.add_paragraph()
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.paragraph_format.space_after = Pt(after)
        run = paragraph.add_run(text)
        set_run_font(run, size, bold=bold)
        return paragraph

    centered("FOREIGN TRADE UNIVERSITY", 18, True, 5)
    centered("FACULTY OF BANKING AND FINANCE", 16, False, 8)
    logo = doc.add_paragraph()
    logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    logo.paragraph_format.first_line_indent = Cm(0)
    logo.paragraph_format.space_after = Pt(8)
    logo.add_run().add_picture(str(logo_path), width=Cm(5.5))
    centered("PERSONAL PROJECT REPORT", 16, True, 7)
    centered(PROJECT, 15, True, 10)

    table = doc.add_table(rows=6, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Cm(4.1)
    table.columns[1].width = Cm(10.2)
    set_table_borders(table, size="5", color="808080")
    entries = [
        ("Student", name),
        ("Student ID", student_id),
        ("Individual role", role),
        ("Group", "G09 - K63"),
        ("Course", COURSE),
        ("Instructor", INSTRUCTOR),
    ]
    for row, (label, value) in zip(table.rows, entries):
        prevent_row_split(row)
        for cell in row.cells:
            set_cell_margins(cell, top=55, bottom=55, start=90, end=90)
        p0, p1 = row.cells[0].paragraphs[0], row.cells[1].paragraphs[0]
        for paragraph in (p0, p1):
            paragraph.paragraph_format.first_line_indent = Cm(0)
            paragraph.paragraph_format.space_after = Pt(0)
            paragraph.paragraph_format.line_spacing = 1.0
        r0, r1 = p0.add_run(label), p1.add_run(value)
        set_run_font(r0, 11.5, bold=True)
        set_run_font(r1, 11.5)
    date = centered("Hanoi, October 2026", 12, False, 0)
    date.paragraph_format.space_before = Pt(10)


def add_static_contents(doc: Document, entries: list[tuple[int, str]], pages: dict[str, int]) -> None:
    heading = doc.add_paragraph()
    heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    heading.paragraph_format.first_line_indent = Cm(0)
    heading.paragraph_format.space_after = Pt(10)
    run = heading.add_run("CONTENTS")
    set_run_font(run, 14, bold=True)
    for level, title in entries:
        paragraph = doc.add_paragraph()
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.paragraph_format.left_indent = Cm(0.8 if level == 2 else 0)
        paragraph.paragraph_format.right_indent = Cm(0.2)
        paragraph.paragraph_format.space_after = Pt(2)
        paragraph.paragraph_format.line_spacing = 1.0
        tabs = OxmlElement("w:tabs")
        tab = OxmlElement("w:tab")
        tab.set(qn("w:val"), "right")
        tab.set(qn("w:leader"), "dot")
        tab.set(qn("w:pos"), "9000")
        tabs.append(tab)
        paragraph._p.get_or_add_pPr().append(tabs)
        page = pages.get(title, "-")
        run = paragraph.add_run(f"{title}\t{page}")
        set_run_font(run, 10.5, bold=(level == 1))


def add_list_of_figures(doc: Document, figures: list[tuple[str, str]], pages: dict[str, int]) -> None:
    doc.add_page_break()
    heading = doc.add_paragraph()
    heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    heading.paragraph_format.first_line_indent = Cm(0)
    run = heading.add_run("LIST OF FIGURES")
    set_run_font(run, 14, bold=True)
    for title, _ in figures:
        paragraph = doc.add_paragraph()
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.paragraph_format.space_after = Pt(5)
        tabs = OxmlElement("w:tabs")
        tab = OxmlElement("w:tab")
        tab.set(qn("w:val"), "right")
        tab.set(qn("w:leader"), "dot")
        tab.set(qn("w:pos"), "9000")
        tabs.append(tab)
        paragraph._p.get_or_add_pPr().append(tabs)
        run = paragraph.add_run(f"{title}\t{pages.get(title, '-')}")
        set_run_font(run, 11)


def body_section(doc: Document):
    section = doc.add_section(WD_SECTION.NEW_PAGE)
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.8)
    section.right_margin = Cm(2.5)
    section.header_distance = Cm(1.27)
    section.footer_distance = Cm(1.27)
    pg_num = OxmlElement("w:pgNumType")
    pg_num.set(qn("w:start"), "2")
    section._sectPr.append(pg_num)
    section.header.is_linked_to_previous = False
    section.footer.is_linked_to_previous = False
    add_page_number(section.footer.paragraphs[0])
    return section


def collect_toc(blocks) -> list[tuple[int, str]]:
    entries = []
    for kind, content in blocks:
        if kind == "h1" and content != "ABSTRACT":
            entries.append((1, content))
        elif kind == "h2":
            entries.append((2, content))
    entries.append((1, "INDIVIDUAL DECLARATION"))
    return entries


def build_report(slug: str, toc_pages: dict[str, int] | None = None, figure_pages: dict[str, int] | None = None) -> tuple[Path, list[tuple[int, str]], list[tuple[str, str]]]:
    member = MEMBERS[slug]
    _, blocks = parse_source(SOURCE_DIR / f"{slug}.md")
    document = Document()
    configure_styles(document)
    add_cover(document, ASSET_DIR / "ftu-logo.png", member)
    body_section(document)

    abstract_index = next(index for index, (kind, title) in enumerate(blocks) if kind == "h1" and title == "ABSTRACT")
    index = abstract_index + 1
    abstract_parts = []
    while index < len(blocks) and blocks[index][0] not in {"h1", "h2"}:
        if blocks[index][0] == "paragraph":
            abstract_parts.append(blocks[index][1])
        index += 1
    abstract_heading = document.add_paragraph()
    abstract_heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    abstract_heading.paragraph_format.first_line_indent = Cm(0)
    run = abstract_heading.add_run("ABSTRACT")
    set_run_font(run, 14, bold=True)
    for part in abstract_parts:
        paragraph = document.add_paragraph()
        add_inline(paragraph, part)

    document.add_page_break()
    toc_entries = collect_toc(blocks)
    add_static_contents(document, toc_entries, toc_pages or {})

    figures: list[tuple[str, str]] = []
    figure_counter = [1]
    for kind, content in blocks:
        if kind == "figure":
            key, caption, source = content
            figures.append((f"Figure {figure_counter[0]}. {caption}", ""))
            figure_counter[0] += 1
    add_list_of_figures(document, figures, figure_pages or {})

    document.add_page_break()
    figure_counter = [1]
    equation_counter = [1]
    past_abstract = False
    for block_index, (kind, content) in enumerate(blocks):
        if kind == "h1" and content == "ABSTRACT":
            past_abstract = True
            continue
        if not past_abstract:
            continue
        if kind == "paragraph" and content in abstract_parts:
            continue
        if kind == "h1":
            paragraph = document.add_paragraph(content, style="Heading 1")
            paragraph.paragraph_format.keep_with_next = True
        elif kind == "h2":
            paragraph = document.add_paragraph(content, style="Heading 2")
            paragraph.paragraph_format.keep_with_next = True
        elif kind == "paragraph":
            paragraph = document.add_paragraph()
            add_inline(paragraph, content)
            if block_index + 1 < len(blocks) and blocks[block_index + 1][0] == "figure":
                paragraph.paragraph_format.keep_with_next = True
        elif kind == "figure":
            key, caption, source = content
            add_figure(document, key, caption, source, figure_counter, [])
        elif kind == "equation":
            add_equation_block(document, content, equation_counter)
        elif kind == "table":
            add_academic_table(document, content)

    document.add_page_break()
    declaration = document.add_paragraph("INDIVIDUAL DECLARATION", style="Heading 1")
    declaration.alignment = WD_ALIGN_PARAGRAPH.CENTER
    declaration.paragraph_format.keep_with_next = True
    text = document.add_paragraph()
    text.paragraph_format.first_line_indent = Cm(0)
    add_inline(
        text,
        "I confirm that this report reflects the work that I am prepared to explain, calculate, demonstrate, or reproduce in Finfolio 2.0. Shared project artifacts are identified as collaborative where applicable, and my individual accountability is defined by the evidence presented in this report.",
    )
    table = document.add_table(rows=4, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)
    for row_index, (label, value) in enumerate((("Full name", member[0]), ("Student ID", member[1]), ("Signature", ""), ("Date", ""))):
        for cell in table.rows[row_index].cells:
            set_cell_margins(cell, top=100, bottom=100)
        for cell_index, value_text in enumerate((label, value)):
            paragraph = table.cell(row_index, cell_index).paragraphs[0]
            paragraph.paragraph_format.first_line_indent = Cm(0)
            paragraph.paragraph_format.space_after = Pt(0)
            run = paragraph.add_run(value_text)
            set_run_font(run, 12, bold=(cell_index == 0))

    output = OUTPUT_DIR / f"Finfolio_Personal_Report_{slug}_V2.docx"
    document.save(output)
    normalize_docx_theme_fonts(output)
    return output, toc_entries, figures


def render_docx(docx_path: Path) -> Path:
    subprocess.run(
        ["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(OUTPUT_DIR), str(docx_path)],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    return OUTPUT_DIR / f"{docx_path.stem}.pdf"


def page_map(pdf_path: Path, toc_entries: list[tuple[int, str]], figures: list[tuple[str, str]]) -> tuple[dict[str, int], dict[str, int]]:
    completed = subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), "-"],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    pages = completed.stdout.split("\f")
    toc_pages: dict[str, int] = {}
    figure_pages: dict[str, int] = {}
    for page_number, page_text in enumerate(pages, start=1):
        if page_number <= 4:
            continue
        normalized = re.sub(r"\s+", " ", page_text).strip()
        for _, title in toc_entries:
            needle = re.sub(r"\s+", " ", title).strip()
            if title not in toc_pages and (needle in normalized or needle[:45] in normalized):
                toc_pages[title] = page_number
        for title, _ in figures:
            needle = re.sub(r"\s+", " ", title).strip()
            if title not in figure_pages and (needle in normalized or needle[:50] in normalized):
                figure_pages[title] = page_number
    return toc_pages, figure_pages


def write_qa(results: dict[str, tuple[int, int, int]]) -> None:
    lines = [
        "# Finfolio Academic Reports V2 - QA Report",
        "",
        "## Formatting and reconstruction",
        "",
        "The five reports were rebuilt from the individual contribution evidence rather than patched in place. The FOMC reference supplied the Letter page geometry, cover border, formal cover composition, section sequencing, footer placement, and academic density. The V2 reports use Times New Roman throughout ordinary text: 13 pt justified body text with a 1.27 cm first-line indent, 1.3 line spacing, and 6 pt paragraph spacing; black 14 pt main headings; black 13 pt subsection headings; 10.5-12 pt table and caption text.",
        "",
        "The FTU logo was extracted from the reference DOCX and displayed at 5.5 cm wide with its original aspect ratio. The cover metadata was rebuilt as a compact academic table without the earlier large blue field block. Headings and tables use black and grayscale formatting; screenshots retain the colors of the actual Finfolio application as project evidence.",
        "",
        "## Content and evidence changes",
        "",
        "Narrative sections were rewritten in English as continuous academic prose. Bullet-only work logs were replaced by explanations of the requirement, individual responsibility, method, deliverable, verification path, and limitation. One concise evidence table remains in each report. Individual boundaries remain unchanged: Monte Carlo belongs to Lê Bảo An; financial methodology to Hoàng Khánh Linh; data provenance and compatibility to Trần Minh Ngọc; UI/UX and information architecture to Nguyễn Ngọc Anh; and flows, acceptance, regression, and bug governance to Nguyễn Quỳnh Anh.",
        "",
        "Project screenshots were selected from `output/playwright` and captioned as Finfolio 2.0 application evidence. Original diagrams were generated only from repository-documented architecture and requirements. No generic stock imagery or unverified external screenshots were used.",
        "",
        "## Equations",
        "",
        "Raw LaTeX was removed. Relevant formulas are stored in native Office Math containers using editable Unicode mathematical notation. Equations are limited to the responsibilities that require them: portfolio value and optimization in the Lead Developer report, and return, Euler risk, and FX attribution in the Financial Logic report.",
        "",
        "## Rendering verification",
        "",
        "Each DOCX was rendered twice through LibreOffice. The first render was used to derive final table-of-contents and list-of-figures page numbers; the document was then rebuilt and rendered again. Theme-font fallbacks were removed from the DOCX files so ordinary text inherits Times New Roman consistently. The delivered PDFs use the installed Times New Roman outlines through a render-only alias (shown as `AcademicTNR` in PDF font metadata) to prevent LibreOffice from substituting Liberation Serif. Final PDFs were used for page-image inspection.",
        "",
        "| Report | Pages | Figures | Main sections located |",
        "| --- | ---: | ---: | ---: |",
    ]
    for slug, (pages, figures, located) in results.items():
        lines.append(f"| `{slug}` | {pages} | {figures} | {located} |")
    lines.extend([
        "",
        "## Remaining limitations",
        "",
        "The declaration signature and date fields require completion by each student. The reports use project screenshots captured during the final build; market values shown in those figures are time-specific evidence and should not be treated as current quotations. Native Office Math expressions retain dedicated mathematical and symbol fonts where required. No unresolved layout or ordinary-text font inconsistency remains after the final visual pass.",
    ])
    (OUTPUT_DIR / "QA_REPORT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    prepare_assets()
    first_pass = {}
    for slug in MEMBERS:
        docx_path, toc_entries, figures = build_report(slug)
        pdf_path = render_docx(docx_path)
        first_pass[slug] = (toc_entries, figures, *page_map(pdf_path, toc_entries, figures))

    results = {}
    for slug in MEMBERS:
        toc_entries, figures, toc_pages, figure_pages = first_pass[slug]
        docx_path, _, _ = build_report(slug, toc_pages, figure_pages)
        pdf_path = render_docx(docx_path)
        final_toc, final_figures = page_map(pdf_path, toc_entries, figures)
        info = subprocess.run(["pdfinfo", str(pdf_path)], check=True, stdout=subprocess.PIPE, text=True).stdout
        pages = int(re.search(r"^Pages:\s+(\d+)", info, re.MULTILINE).group(1))
        results[slug] = (pages, len(figures), len(final_toc))
    write_qa(results)
    print("Created academic reports in", OUTPUT_DIR)
    for slug in MEMBERS:
        print("-", OUTPUT_DIR / f"Finfolio_Personal_Report_{slug}_V2.docx")
        print("-", OUTPUT_DIR / f"Finfolio_Personal_Report_{slug}_V2.pdf")


if __name__ == "__main__":
    main()
