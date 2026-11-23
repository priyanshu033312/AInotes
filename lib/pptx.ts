import "server-only";
import PptxGenJS from "pptxgenjs";
import type { DiagramSpec, SlideOverride, SlideTheme, StudyMaterial } from "./types";
import { THEMES, buildDeck, type DeckSlide } from "./slides";
import { truncate } from "./utils";

const W = 13.333;
const H = 7.5;
const MARGIN = 0.72;

type Slide = ReturnType<PptxGenJS["addSlide"]>;

function slideNumberLabel(index: number, total: number) {
  return `${index + 1} / ${total}`;
}

function addChrome(
  slide: Slide,
  theme: (typeof THEMES)[SlideTheme],
  deck: DeckSlide[],
  index: number,
) {
  if (deck[index].kind === "title" || deck[index].kind === "closing") return;

  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: W,
    h: 0.14,
    fill: { color: theme.accent },
    line: { color: theme.accent, width: 0 },
  });
  slide.addShape("rect", {
    x: 0.36,
    y: 0.55,
    w: 0.06,
    h: H - 1.1,
    fill: { color: theme.accent, transparency: theme.dark ? 45 : 70 },
    line: { color: theme.accent, width: 0 },
  });
  slide.addText(slideNumberLabel(index, deck.length), {
    x: W - 1.5,
    y: H - 0.55,
    w: 1.1,
    h: 0.3,
    align: "right",
    fontSize: 9,
    color: theme.muted,
    fontFace: theme.font,
  });
  slide.addText("NoteWise AI", {
    x: MARGIN,
    y: H - 0.55,
    w: 2,
    h: 0.3,
    fontSize: 9,
    color: theme.muted,
    fontFace: theme.font,
  });
}

function addBullets(
  slide: Slide,
  bullets: string[],
  theme: (typeof THEMES)[SlideTheme],
  box: { x: number; y: number; w: number; h: number },
  size = 14,
) {
  if (bullets.length === 0) return;
  slide.addText(
    bullets.map((bullet) => ({
      text: bullet,
      options: {
        bullet: { code: "25CF" },
        breakLine: true,
        fontSize: size,
        color: theme.ink,
        fontFace: theme.font,
        paraSpaceAfter: 8,
      },
    })),
    { ...box, valign: "top", lineSpacingMultiple: 1.1 },
  );
}

function addHeading(
  slide: Slide,
  title: string,
  theme: (typeof THEMES)[SlideTheme],
  y = 0.7,
  size = 30,
) {
  slide.addText(title, {
    x: MARGIN,
    y,
    w: W - MARGIN * 2,
    h: 1.0,
    fontSize: size,
    bold: true,
    color: theme.ink,
    fontFace: theme.headingFont,
    valign: "middle",
  });
  slide.addShape("rect", {
    x: MARGIN,
    y: y + 1.02,
    w: 1.5,
    h: 0.05,
    fill: { color: theme.secondary },
    line: { color: theme.secondary, width: 0 },
  });
}

function arrow(slide: Slide, from: { x: number; y: number }, to: { x: number; y: number }, color: string) {
  slide.addShape("line", {
    x: from.x,
    y: from.y,
    w: to.x - from.x,
    h: to.y - from.y,
    line: { color, width: 1.6, endArrowType: "triangle" },
  });
}

function renderDiagram(
  pptx: PptxGenJS,
  slide: Slide,
  diagram: DiagramSpec,
  theme: (typeof THEMES)[SlideTheme],
) {
  const top = 2.5;
  const box = { x: MARGIN, y: top, w: W - MARGIN * 2, h: 4.0 };
  const nodeMap = new Map(diagram.nodes.map((node) => [node.id, node]));

  if (diagram.type === "mindmap") {
    const root = diagram.nodes.find((node) => node.id === "root") ?? diagram.nodes[0];
    const center = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
    const children = diagram.edges?.filter((edge) => edge.from === root.id).map((edge) => edge.to) ?? [];
    const leafEdges = (diagram.edges ?? []).filter((edge) => edge.from !== root.id);

    const radius = 1.55;
    const positions = new Map<string, { x: number; y: number }>();
    positions.set(root.id, center);

    children.forEach((childId, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(children.length, 1) - Math.PI / 2;
      const child = { x: center.x + Math.cos(angle) * (2.35 * (box.w / 10.5)), y: center.y + Math.sin(angle) * radius };
      positions.set(childId, child);
      arrow(slide, center, child, theme.muted);
    });

    leafEdges.forEach((edge, index) => {
      const parent = positions.get(edge.from);
      if (!parent) return;
      const angle = (Math.PI * 2 * index) / Math.max(leafEdges.length, 1) - Math.PI / 2;
      const child = {
        x: parent.x + Math.cos(angle) * 1.15,
        y: parent.y + Math.sin(angle) * 0.85,
      };
      if (
        child.x < box.x + 0.4 ||
        child.x > box.x + box.w - 1.5 ||
        child.y < box.y ||
        child.y > box.y + box.h - 0.5
      ) {
        return;
      }
      positions.set(edge.to, child);
      arrow(slide, parent, child, theme.muted);
    });

    for (const node of diagram.nodes) {
      const position = positions.get(node.id);
      if (!position) continue;
      const isRoot = node.id === root.id;
      const width = isRoot ? 2.5 : 1.85;
      const height = isRoot ? 0.75 : 0.62;
      slide.addShape("roundRect", {
        x: position.x - width / 2,
        y: position.y - height / 2,
        w: width,
        h: height,
        rectRadius: 0.08,
        fill: { color: isRoot ? theme.accent : theme.surface },
        line: { color: theme.accent, width: 1 },
      });
      slide.addText(truncate(node.label, 34), {
        x: position.x - width / 2,
        y: position.y - height / 2,
        w: width,
        h: height,
        fontSize: isRoot ? 12 : 9,
        bold: isRoot,
        color: isRoot ? (theme.dark ? "0B0D17" : "FFFFFF") : theme.ink,
        fontFace: theme.font,
        align: "center",
        valign: "middle",
      });
    }
    return;
  }

  if (diagram.type === "compare") {
    const columns = diagram.columns ?? ["A", "B"];
    const columnWidth = (box.w - 0.6) / 2;
    const groups = [diagram.nodes.slice(0, Math.ceil(diagram.nodes.length / 2)), diagram.nodes.slice(Math.ceil(diagram.nodes.length / 2))];

    columns.slice(0, 2).forEach((columnTitle, columnIndex) => {
      const x = box.x + columnIndex * (columnWidth + 0.6);
      slide.addShape("roundRect", {
        x,
        y: box.y,
        w: columnWidth,
        h: box.h,
        rectRadius: 0.06,
        fill: { color: theme.surface },
        line: { color: theme.dark ? theme.surface : "E5E7EB", width: 1 },
      });
      slide.addText(columnTitle, {
        x: x + 0.2,
        y: box.y + 0.18,
        w: columnWidth - 0.4,
        h: 0.5,
        fontSize: 15,
        bold: true,
        color: columnIndex === 0 ? theme.accent : theme.secondary,
        fontFace: theme.headingFont,
      });
      const chips = groups[columnIndex] ?? [];
      chips.forEach((node, chipIndex) => {
        const y = box.y + 0.85 + chipIndex * 0.85;
        if (y + 0.7 > box.y + box.h) return;
        slide.addShape("roundRect", {
          x: x + 0.2,
          y,
          w: columnWidth - 0.4,
          h: 0.7,
          rectRadius: 0.05,
          fill: { color: theme.dark ? "0B0D17" : "FFFFFF" },
          line: { color: theme.dark ? theme.surface : "E5E7EB", width: 1 },
        });
        slide.addText(node.label, {
          x: x + 0.3,
          y,
          w: columnWidth - 0.6,
          h: 0.7,
          fontSize: 10,
          color: theme.ink,
          fontFace: theme.font,
          valign: "middle",
        });
        if (node.note) {
          slide.addText(node.note, {
            x: x + 0.3,
            y: y + 0.5,
            w: columnWidth - 0.6,
            h: 0.25,
            fontSize: 7,
            color: theme.muted,
            fontFace: theme.font,
          });
        }
      });
    });
    return;
  }

  // flow / block — boxes in one or two rows with connecting arrows
  const nodes = diagram.nodes.slice(0, 8);
  const perRow = nodes.length <= 4 ? nodes.length : Math.ceil(nodes.length / 2);
  const rows = Math.ceil(nodes.length / perRow);
  const gap = 0.38;
  const rowHeight = rows === 1 ? 1.5 : 1.35;
  const boxWidth = (box.w - gap * (perRow - 1)) / perRow;
  const positions = new Map<string, { x: number; y: number; w: number; h: number }>();

  nodes.forEach((node, index) => {
    const row = Math.floor(index / perRow);
    const column = index % perRow;
    positions.set(node.id, {
      x: box.x + column * (boxWidth + gap),
      y: box.y + row * (rowHeight + 1.1) + (rows === 1 ? 1.0 : 0),
      w: boxWidth,
      h: rowHeight,
    });
  });

  for (const edge of diagram.edges ?? []) {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) continue;
    if (Math.abs(from.y - to.y) < 0.05) {
      arrow(
        slide,
        { x: from.x + from.w, y: from.y + from.h / 2 },
        { x: to.x - 0.03, y: to.y + to.h / 2 },
        theme.accent,
      );
    } else {
      arrow(
        slide,
        { x: from.x + from.w / 2, y: from.y + from.h },
        { x: to.x + to.w / 2, y: to.y - 0.03 },
        theme.accent,
      );
    }
    if (edge.label) {
      slide.addText(edge.label, {
        x: Math.min(from.x, to.x) + 0.1,
        y: (from.y + to.y) / 2 + from.h / 2 - 0.25,
        w: 1.6,
        h: 0.25,
        fontSize: 7.5,
        color: theme.muted,
        fontFace: theme.font,
      });
    }
  }

  for (const node of nodes) {
    const position = positions.get(node.id);
    if (!position) continue;
    slide.addShape("roundRect", {
      x: position.x,
      y: position.y,
      w: position.w,
      h: position.h,
      rectRadius: 0.08,
      fill: { color: theme.surface },
      line: { color: theme.accent, width: 1 },
    });
    slide.addText(node.label, {
      x: position.x + 0.1,
      y: position.y + (node.note ? 0.12 : 0),
      w: position.w - 0.2,
      h: node.note ? position.h * 0.6 : position.h,
      fontSize: nodes.length > 4 ? 9.5 : 11,
      bold: true,
      color: theme.ink,
      fontFace: theme.font,
      align: "center",
      valign: "middle",
    });
    if (node.note) {
      slide.addText(node.note, {
        x: position.x + 0.1,
        y: position.y + position.h * 0.58,
        w: position.w - 0.2,
        h: position.h * 0.34,
        fontSize: 7.5,
        color: theme.muted,
        fontFace: theme.font,
        align: "center",
        valign: "top",
      });
    }
  }

  if (diagram.nodes.length > 8) {
    slide.addText("+ more in the workspace", {
      x: box.x,
      y: box.y + box.h - 0.2,
      w: box.w,
      h: 0.25,
      fontSize: 8,
      color: theme.muted,
      fontFace: theme.font,
      align: "right",
    });
  }
}

function renderSlide(
  pptx: PptxGenJS,
  deck: DeckSlide[],
  index: number,
  theme: (typeof THEMES)[SlideTheme],
) {
  const item = deck[index];
  const slide = pptx.addSlide();
  slide.background = { color: theme.background };
  addChrome(slide, theme, deck, index);

  if (item.kind === "title") {
    slide.addShape("rect", {
      x: 0,
      y: 0,
      w: W,
      h: H,
      fill: { color: theme.background, transparency: 100 },
      line: { color: theme.background, width: 0 },
    });
    slide.addShape("ellipse", {
      x: W - 4.6,
      y: -1.6,
      w: 6,
      h: 6,
      fill: { color: theme.accent, transparency: theme.dark ? 72 : 88 },
      line: { color: theme.accent, width: 0 },
    });
    slide.addShape("ellipse", {
      x: -1.8,
      y: H - 3.2,
      w: 4.4,
      h: 4.4,
      fill: { color: theme.secondary, transparency: theme.dark ? 80 : 90 },
      line: { color: theme.secondary, width: 0 },
    });
    slide.addText("NOTEWISE AI", {
      x: MARGIN,
      y: 0.9,
      w: 4,
      h: 0.4,
      fontSize: 11,
      bold: true,
      charSpacing: 3,
      color: theme.accent,
      fontFace: theme.font,
    });
    slide.addText(item.title, {
      x: MARGIN,
      y: 2.0,
      w: W - MARGIN * 2 - 1.2,
      h: 1.9,
      fontSize: item.title.length > 46 ? 34 : 42,
      bold: true,
      color: theme.ink,
      fontFace: theme.headingFont,
      valign: "bottom",
    });
    if (item.subtitle) {
      slide.addText(item.subtitle, {
        x: MARGIN,
        y: 3.95,
        w: W - MARGIN * 2 - 1.2,
        h: 0.45,
        fontSize: 15,
        color: theme.secondary,
        fontFace: theme.font,
      });
    }
    if (item.body) {
      slide.addText(truncate(item.body, 260), {
        x: MARGIN,
        y: 4.55,
        w: W - MARGIN * 2 - 2.4,
        h: 1.1,
        fontSize: 12,
        color: theme.muted,
        fontFace: theme.font,
        lineSpacingMultiple: 1.25,
      });
    }
    slide.addText(item.footnote ?? "", {
      x: MARGIN,
      y: H - 0.75,
      w: 6,
      h: 0.3,
      fontSize: 9,
      color: theme.muted,
      fontFace: theme.font,
    });
    return;
  }

  if (item.kind === "closing") {
    slide.addText(item.title, {
      x: MARGIN,
      y: 2.5,
      w: W - MARGIN * 2,
      h: 1.2,
      fontSize: 44,
      bold: true,
      color: theme.ink,
      fontFace: theme.headingFont,
      align: "center",
    });
    slide.addText(item.subtitle ?? "", {
      x: MARGIN,
      y: 3.75,
      w: W - MARGIN * 2,
      h: 0.7,
      fontSize: 26,
      color: theme.accent,
      fontFace: theme.headingFont,
      align: "center",
    });
    if (item.body) {
      slide.addText(item.body, {
        x: W / 2 - 3.5,
        y: 4.75,
        w: 7,
        h: 0.8,
        fontSize: 12,
        color: theme.muted,
        fontFace: theme.font,
        align: "center",
      });
    }
    return;
  }

  if (item.kind === "diagram" && item.diagram) {
    addHeading(slide, item.title, theme, 0.62, 26);
    if (item.subtitle) {
      slide.addText(item.subtitle, {
        x: MARGIN,
        y: 1.7,
        w: W - MARGIN * 2,
        h: 0.5,
        fontSize: 11,
        color: theme.muted,
        fontFace: theme.font,
      });
    }
    renderDiagram(pptx, slide, item.diagram, theme);
    return;
  }

  if (item.kind === "formulas") {
    addHeading(slide, item.title, theme);
    const formulas = item.bullets ?? [];
    formulas.forEach((formula, index) => {
      const y = 2.15 + index * 0.74;
      slide.addShape("roundRect", {
        x: MARGIN,
        y,
        w: W - MARGIN * 2,
        h: 0.62,
        rectRadius: 0.06,
        fill: { color: theme.surface },
        line: { color: theme.dark ? theme.surface : "E5E7EB", width: 1 },
      });
      slide.addText(formula, {
        x: MARGIN + 0.22,
        y,
        w: W - MARGIN * 2 - 0.44,
        h: 0.62,
        fontSize: 13,
        color: theme.ink,
        fontFace: theme.font,
        valign: "middle",
      });
    });
    return;
  }

  addHeading(slide, item.title, theme);
  const hasBody = Boolean(item.body);
  if (item.subtitle) {
    slide.addText(item.subtitle, {
      x: MARGIN,
      y: 1.9,
      w: W - MARGIN * 2,
      h: 0.35,
      fontSize: 11,
      color: theme.secondary,
      fontFace: theme.font,
    });
  }
  if (hasBody) {
    slide.addText(truncate(item.body ?? "", 420), {
      x: MARGIN,
      y: 2.05,
      w: W - MARGIN * 2,
      h: 1.35,
      fontSize: 12.5,
      color: theme.dark ? theme.ink : "334155",
      fontFace: theme.font,
      lineSpacingMultiple: 1.22,
      valign: "top",
    });
  }
  addBullets(
    slide,
    item.bullets ?? [],
    theme,
    {
      x: MARGIN,
      y: hasBody ? 3.5 : 2.2,
      w: W - MARGIN * 2,
      h: H - (hasBody ? 4.15 : 2.9),
    },
    13,
  );
  if (item.footnote) {
    slide.addText(truncate(item.footnote, 140), {
      x: MARGIN,
      y: H - 0.88,
      w: W - MARGIN * 2 - 1.6,
      h: 0.3,
      fontSize: 8,
      italic: true,
      color: theme.muted,
      fontFace: theme.font,
    });
  }
}

export async function generatePptx(
  study: StudyMaterial,
  themeId: SlideTheme,
  overrides: Record<number, SlideOverride> = {},
): Promise<Uint8Array> {
  const theme = THEMES[themeId] ?? THEMES["modern-professional"];
  const deck = buildDeck(study, overrides);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "NoteWise AI";
  pptx.company = "NoteWise AI";
  pptx.subject = study.subject;
  pptx.title = study.title;

  deck.forEach((_, index) => renderSlide(pptx, deck, index, theme));

  const result = await pptx.write({ outputType: "uint8array", compression: true });
  if (result instanceof Uint8Array) return result;
  if (result instanceof ArrayBuffer) return new Uint8Array(result);
  if (typeof result === "string") {
    return new Uint8Array(Buffer.from(result, "binary"));
  }
  throw new Error("Unexpected PowerPoint output type.");
}

export function slideCount(study: StudyMaterial) {
  return buildDeck(study).length;
}
