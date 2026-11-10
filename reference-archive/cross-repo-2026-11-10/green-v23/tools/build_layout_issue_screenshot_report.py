#!/usr/bin/env python3
"""Build a review PDF from real rendered-page screenshots captured by geometry-audit-cli."""
from __future__ import annotations
import argparse, html, json
from datetime import datetime, timezone
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, KeepTogether

ROOT = Path.cwd()

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--manifest", action="append", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--combined-manifest", required=True)
    return p.parse_args()

def esc(value):
    if value is None: return ""
    if isinstance(value, (dict, list)): value = json.dumps(value, ensure_ascii=False, sort_keys=True)
    return html.escape(str(value)).replace("\\n", " ")

def issue_line(issue):
    parts = [f"kind={issue.get('kind','unknown')}", f"severity={issue.get('severity','unknown')}"]
    for key in ("gapPx","diff","overflowPx","fillRatio","from","to","childType","balanceOutcome","reason"):
        value = issue.get(key)
        if isinstance(value, (int,float)) and not isinstance(value,bool): parts.append(f"{key}={value:g}")
        elif isinstance(value,str) and value: parts.append(f"{key}={value}")
    return " | ".join(parts)

def main():
    args=parse_args()
    manifests=[]
    for name in args.manifest:
        path=ROOT/name
        if not path.is_file():
            raise SystemExit(f"Required screenshot manifest missing: {path}")
        data=json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data.get("screenshots"),list): raise SystemExit(f"Invalid screenshot manifest: {path}")
        data["_manifestPath"]=str(path.relative_to(ROOT))
        manifests.append(data)
    if not manifests: raise SystemExit("No screenshot manifests were produced; refusing to create an empty or synthetic PDF.")
    rows=[]
    for manifest in manifests:
        for row in manifest["screenshots"]:
            image_path=ROOT/row["screenshotPath"]
            if not image_path.is_file(): raise SystemExit(f"Rendered screenshot missing: {image_path}")
            rows.append({**row,"_manifest":manifest,"_imagePath":str(image_path)})
    if not rows: raise SystemExit("Screenshot manifests contain no rendered pages; refusing to create an empty PDF.")
    output=ROOT/args.output
    output.parent.mkdir(parents=True,exist_ok=True)
    styles=getSampleStyleSheet()
    styles.add(ParagraphStyle(name="ReportTitle",parent=styles["Title"],fontName="Helvetica-Bold",fontSize=16,leading=19,spaceAfter=7))
    styles.add(ParagraphStyle(name="SubTitle",parent=styles["Normal"],fontSize=9,leading=12,textColor=colors.HexColor("#444444"),spaceAfter=5))
    styles.add(ParagraphStyle(name="Issue",parent=styles["Normal"],fontSize=8,leading=10,leftIndent=8,spaceAfter=2))
    styles.add(ParagraphStyle(name="Disclaimer",parent=styles["Normal"],fontSize=8,leading=10,textColor=colors.HexColor("#7A2D2D"),spaceAfter=5))
    doc=SimpleDocTemplate(str(output),pagesize=A4,rightMargin=28,leftMargin=28,topMargin=28,bottomMargin=30,title="Rendered Layout Issue Screenshots",author="Geometry Audit CI")
    story=[
      Paragraph("Rendered Layout Issue Screenshots",styles["ReportTitle"]),
      Paragraph("Actual Chromium screenshots captured directly from rendered .a4-page DOM elements; no reconstructed or schematic images are used.",styles["SubTitle"]),
      Paragraph("Review aid only: a finding is not automatically a confirmed defect, and screenshots alone do not prove causality or resolution.",styles["Disclaimer"]),
      Paragraph("Source runs: "+esc(", ".join(str(m.get("runId") or "local")+"/"+str(m.get("configuration")) for m in manifests)),styles["SubTitle"]),
      Paragraph("Deferred investigation: DOM page indexes 375 and 376 were deliberately excluded.",styles["SubTitle"]),
      Spacer(1,8),
      PageBreak()
    ]
    pdf_rows=[]
    for pdf_page,row in enumerate(rows,start=2):
        manifest=row["_manifest"]; label=row.get("configuration",manifest.get("configuration","unknown"))
        page_idx=row.get("domPageIndex"); kinds=row.get("selectedIssueKinds") or []
        header=[
          Paragraph(f"Configuration: {esc(label)} | DOM page index: {esc(page_idx)}",styles["ReportTitle"]),
          Paragraph("Selected issue kinds: "+esc(", ".join(kinds)),styles["SubTitle"])
        ]
        issues=row.get("issues") or []
        for issue in issues: header.append(Paragraph(esc(issue_line(issue)),styles["Issue"]))
        header.append(Spacer(1,6))
        reader=ImageReader(row["_imagePath"]); width_px,height_px=reader.getSize()
        scale=min(535/width_px,660/height_px)
        story.append(KeepTogether(header))
        story.append(Image(row["_imagePath"],width=width_px*scale,height=height_px*scale))
        if pdf_page < len(rows)+1: story.append(PageBreak())
        pdf_rows.append({
          "pdfPageNumber":pdf_page,"configuration":label,"domPageIndex":page_idx,
          "sourcePageLabel":row.get("sourcePageLabel"),"screenshotFile":row.get("screenshotFile"),
          "selectedIssueKinds":kinds,"issues":issues,"sourceManifest":manifest.get("_manifestPath")
        })
    def footer(canvas,document):
        canvas.saveState(); canvas.setFont("Helvetica",7); canvas.setFillColor(colors.HexColor("#555555"))
        canvas.drawString(28,16,"Rendered DOM screenshots; not reconstructed illustrations.")
        canvas.drawRightString(A4[0]-28,16,f"PDF page {document.page}"); canvas.restoreState()
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    combined={
      "schemaVersion":1,"generatedAt":datetime.now(timezone.utc).isoformat(),
      "reportPdf":str(Path(args.output)),
      "sourceRuns":[{"repository":m.get("repository"),"ref":m.get("ref"),"gitCommit":m.get("gitCommit"),
        "runId":m.get("runId"),"configuration":m.get("configuration"),"pageCount":m.get("pageCount"),
        "manifestPath":m.get("_manifestPath")} for m in manifests],
      "issueKinds":sorted({k for row in rows for k in row.get("selectedIssueKinds",[])}),
      "deferredDomPageIndexesNotCaptured":[375,376],"screenshotCount":len(rows),"screenshots":pdf_rows,
      "interpretation":"Screenshots document measured findings for review; they do not by themselves prove causality or resolution."
    }
    combined_path=ROOT/args.combined_manifest
    combined_path.parent.mkdir(parents=True,exist_ok=True)
    combined_path.write_text(json.dumps(combined,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"pdf":str(output),"manifest":str(combined_path),"screenshots":len(rows),
      "issueKinds":combined["issueKinds"],"sourceRuns":combined["sourceRuns"]},ensure_ascii=False))

if __name__=="__main__": main()
