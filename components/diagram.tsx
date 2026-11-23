"use client";

import { useMemo } from "react";
import type { DiagramSpec } from "@/lib/types";
import { truncate } from "@/lib/utils";

const W = 960;
const H = 520;

interface Box {
  id?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  note?: string;
}

function wrapLabel(label: string, perLine: number, maxLines = 3) {
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > perLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = truncate(kept[maxLines - 1] + " …", perLine + 4);
    return kept;
  }
  return lines;
}

function NodeBox({
  box,
  accent = false,
  perLine = 20,
}: {
  box: Box;
  accent?: boolean;
  perLine?: number;
}) {
  const lines = wrapLabel(box.label, perLine);
  const hasNote = Boolean(box.note);
  const lineHeight = 17;
  const textBlockHeight = lines.length * lineHeight;
  const noteOffset = hasNote ? 14 : 0;
  const startY =
    box.y + box.h / 2 - (textBlockHeight + noteOffset) / 2 + lineHeight * 0.72;

  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={12}
        className={accent ? "fill-accent/15 stroke-accent" : "fill-panel-2/90 stroke-line"}
        strokeWidth={1.2}
      />
      {lines.map((line, index) => (
        <text
          key={index}
          x={box.x + box.w / 2}
          y={startY + index * lineHeight}
          textAnchor="middle"
          className={accent ? "fill-ink" : "fill-ink"}
          style={{ fontSize: 13.5, fontWeight: 600, fontFamily: "var(--font-sans)" }}
        >
          {line}
        </text>
      ))}
      {box.note ? (
        <text
          x={box.x + box.w / 2}
          y={startY + lines.length * lineHeight + 4}
          textAnchor="middle"
          className="fill-muted"
          style={{ fontSize: 10.5, fontFamily: "var(--font-sans)" }}
        >
          {truncate(box.note, 34)}
        </text>
      ) : null}
    </g>
  );
}

function Arrow({
  from,
  to,
  label,
  curvature = 0,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
  curvature?: number;
}) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const cx = midX - (dy / length) * curvature;
  const cy = midY + (dx / length) * curvature;
  const path = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;

  return (
    <g>
      <path
        d={path}
        fill="none"
        className="stroke-accent/60"
        strokeWidth={1.6}
        markerEnd="url(#notewise-arrow)"
      />
      {label ? (
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          className="fill-faint"
          style={{ fontSize: 10, fontFamily: "var(--font-sans)" }}
        >
          {truncate(label, 18)}
        </text>
      ) : null}
    </g>
  );
}

interface DiagramLayout {
  positions: Map<string, { x: number; y: number; w: number; h: number }>;
  rootId?: string;
  columns?: string[];
  columnWidth?: number;
}

export function Diagram({
  spec,
  className,
  compact = false,
}: {
  spec: DiagramSpec;
  className?: string;
  compact?: boolean;
}) {
  const layout = useMemo<DiagramLayout>(() => {
    const nodes = spec.nodes.slice(0, 12);
    const map = new Map(nodes.map((node) => [node.id, node]));

    if (spec.type === "mindmap") {
      const root = nodes.find((node) => node.id === "root") ?? nodes[0];
      const children = (spec.edges ?? [])
        .filter((edge) => edge.from === root.id)
        .map((edge) => edge.to)
        .filter((id) => map.has(id));
      const leaves = (spec.edges ?? []).filter(
        (edge) => edge.from !== root.id && map.has(edge.from) && map.has(edge.to),
      );

      const center = { x: W / 2, y: H / 2 };
      const positions = new Map<string, { x: number; y: number; w: number; h: number }>();
      const rootSize = { w: 210, h: 66 };
      positions.set(root.id, { x: center.x, y: center.y, ...rootSize });

      const radiusX = 315;
      const radiusY = 172;
      const childPositions = new Map<string, { x: number; y: number }>();
      children.forEach((id, index) => {
        const angle = (Math.PI * 2 * index) / Math.max(children.length, 1) - Math.PI / 2;
        const position = {
          x: center.x + Math.cos(angle) * radiusX,
          y: center.y + Math.sin(angle) * radiusY,
        };
        childPositions.set(id, position);
        positions.set(id, { ...position, w: 176, h: 52 });
      });

      const leafGroups = new Map<string, number>();
      leaves.forEach((edge) => {
        leafGroups.set(edge.from, (leafGroups.get(edge.from) ?? 0) + 1);
      });
      const leafSeen = new Map<string, number>();
      leaves.forEach((edge) => {
        const parent = childPositions.get(edge.from);
        if (!parent) return;
        const index = leafSeen.get(edge.from) ?? 0;
        leafSeen.set(edge.from, index + 1);
        const total = leafGroups.get(edge.from) ?? 1;
        const spread = total === 1 ? 0 : (index - (total - 1) / 2) * 34;
        const columnOffset = parent.x < W / 2 ? -1 : 1;
        positions.set(edge.to, {
          x: parent.x + columnOffset * 72,
          y: parent.y + 62 + spread,
          w: 158,
          h: 44,
        });
      });

      return { positions, rootId: root.id };
    }

    if (spec.type === "compare") {
      const columns = spec.columns ?? ["Option A", "Option B"];
      const half = Math.ceil(nodes.length / 2);
      const groups = [nodes.slice(0, half), nodes.slice(half)];
      const positions = new Map<string, { x: number; y: number; w: number; h: number }>();
      const columnWidth = 420;
      groups.forEach((group, columnIndex) => {
        const x = 40 + columnIndex * (columnWidth + 40);
        group.forEach((node, index) => {
          positions.set(node.id, {
            x: x + 16,
            y: 120 + index * 78,
            w: columnWidth - 32,
            h: 60,
          });
        });
      });
      return { positions, columns, columnWidth };
    }

    // flow / block
    const perRow = nodes.length <= 4 ? nodes.length : Math.ceil(nodes.length / 2);
    const rows = Math.ceil(nodes.length / perRow);
    const gap = 26;
    const usable = W - 80;
    const boxWidth = (usable - gap * (perRow - 1)) / perRow;
    const boxHeight = rows === 1 ? 110 : 92;
    const positions = new Map<string, { x: number; y: number; w: number; h: number }>();

    nodes.forEach((node, index) => {
      const row = Math.floor(index / perRow);
      const column = index % perRow;
      positions.set(node.id, {
        x: 40 + column * (boxWidth + gap),
        y: rows === 1 ? 190 : 100 + row * (boxHeight + 96),
        w: boxWidth,
        h: boxHeight,
      });
    });

    return { positions };
  }, [spec]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={spec.title}
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <marker
          id="notewise-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-accent/80" />
        </marker>
        <linearGradient id="notewise-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={W} height={H} rx="18" fill="url(#notewise-panel)" />

      {spec.type === "mindmap" ? (
        <g>
          {(spec.edges ?? []).map((edge, index) => {
            const from = layout.positions.get(edge.from);
            const to = layout.positions.get(edge.to);
            if (!from || !to) return null;
            return (
              <Arrow
                key={`edge-${index}`}
                from={{ x: from.x, y: from.y + from.h / 2 - 6 }}
                to={{ x: to.x, y: to.y - to.h / 2 + 4 }}
              />
            );
          })}
          {spec.nodes.slice(0, 12).map((node) => {
            const box = layout.positions.get(node.id);
            if (!box) return null;
            return (
              <NodeBox
                key={node.id}
                accent={node.id === layout.rootId}
                box={{
                  id: node.id,
                  x: box.x - box.w / 2,
                  y: box.y - box.h / 2,
                  w: box.w,
                  h: box.h,
                  label: node.label,
                  note: node.note,
                }}
                perLine={22}
              />
            );
          })}
        </g>
      ) : null}

      {spec.type === "compare" ? (
        <g>
          {(layout.columns ?? ["Option A", "Option B"]).slice(0, 2).map((column, index) => {
            const columnWidth = layout.columnWidth ?? 420;
            const x = 40 + index * (columnWidth + 40);
            return (
              <g key={column}>
                <rect
                  x={x}
                  y={58}
                  width={columnWidth}
                  height={H - 108}
                  rx={16}
                  className="fill-panel/70 stroke-line"
                  strokeWidth={1}
                />
                <text
                  x={x + 24}
                  y={92}
                  className={index === 0 ? "fill-accent-2" : "fill-cyan"}
                  style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)" }}
                >
                  {column}
                </text>
              </g>
            );
          })}
          {spec.nodes.slice(0, 12).map((node) => {
            const box = layout.positions.get(node.id);
            if (!box) return null;
            return <NodeBox key={node.id} box={{ ...box, label: node.label, note: node.note }} perLine={46} />;
          })}
        </g>
      ) : null}

      {(spec.type === "flow" || spec.type === "block") ? (
        <g>
          {(spec.edges ?? []).map((edge, index) => {
            const from = layout.positions.get(edge.from);
            const to = layout.positions.get(edge.to);
            if (!from || !to) return null;
            const sameRow = Math.abs(from.y - to.y) < 4;
            return (
              <Arrow
                key={`edge-${index}`}
                from={
                  sameRow
                    ? { x: from.x + from.w, y: from.y + from.h / 2 }
                    : { x: from.x + from.w / 2, y: from.y + from.h }
                }
                to={
                  sameRow
                    ? { x: to.x - 4, y: to.y + to.h / 2 }
                    : { x: to.x + to.w / 2, y: to.y - 4 }
                }
                label={edge.label}
              />
            );
          })}
          {spec.nodes.slice(0, 12).map((node) => {
            const box = layout.positions.get(node.id);
            if (!box) return null;
            return (
              <NodeBox
                key={node.id}
                box={{ ...box, label: node.label, note: node.note }}
                perLine={compact ? 22 : 24}
              />
            );
          })}
        </g>
      ) : null}

      {spec.type === "mindmap" && !compact ? (
        <text
          x={W - 28}
          y={H - 20}
          textAnchor="end"
          className="fill-faint"
          style={{ fontSize: 10, fontFamily: "var(--font-sans)" }}
        >
          {spec.title}
        </text>
      ) : null}
    </svg>
  );
}
