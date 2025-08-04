import {
  degrees,
  layoutMultilineText,
  PDFFont,
  PDFPage,
  RGB,
  rgb,
  TextAlignment,
} from 'pdf-lib';

interface FillBoxProps {
  page: PDFPage;
  font: PDFFont;
  text: string;
  size: number;
  x: number;
  y: number;
  width: number;
  height: number;
  align?: 'left' | 'center' | 'right';
  maxLines?: number;
  color?: RGB;
  rotate?: number;
}

export const fillBox = ({
  page,
  font,
  text,
  size,
  x,
  y,
  width,
  height,
  align = 'left',
  maxLines,
  rotate = 0,
  color = rgb(0.2, 0.2, 0.2),
}: FillBoxProps) => {
  let alignment;
  if (align === 'left') alignment = TextAlignment.Left;
  if (align === 'center') alignment = TextAlignment.Center;
  if (align === 'right') alignment = TextAlignment.Right;

  const { lines } = layoutMultilineText(text, {
    font,
    alignment: alignment,
    fontSize: size,
    bounds: { width, height, x, y },
  });

  if (lines.length === 1) {
    page.drawText(lines[0].text, {
      x: lines[0].x,
      y: y + (height - size) / 2,
      size,
      color,
      rotate: degrees(rotate),
    });
  } else {
    lines.forEach((line, i) => {
      if (i >= maxLines) return;
      page.drawText(line.text, {
        x: line.x,
        y: line.y,
        size,
        color,
        rotate: degrees(rotate),
      });
    });
  }

  return lines.length;
};

export const markPage = (page: PDFPage) => {
  for (let i = 0; i <= 1000; i += 20) {
    page.drawText(`${i}`, {
      x: i,
      y: 10,
      size: 9,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawLine({
      start: { x: i, y: 0 },
      end: { x: i, y: 1000 },
      thickness: 0.01,
    });
  }

  for (let i = 10; i <= 1000; i += 20) {
    page.drawText(`${i}`, {
      x: 0,
      y: i,
      size: 8,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawLine({
      start: { x: 0, y: i },
      end: { x: 1000, y: i },
      thickness: 0.01,
    });
  }
};
