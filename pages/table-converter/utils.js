// ----------------------------------------------------
// CORE PARSERS & GENERATORS (MODEL LAYER)
// ----------------------------------------------------

export function detectFormat(text) {
  if (!text || text.trim() === "") return "csv";
  const trimmed = text.trim();
  if (trimmed.startsWith("<table") || trimmed.includes("<tr") || trimmed.includes("<td") || trimmed.includes("<th")) {
    return "html";
  }
  // Count delimiter occurrences in first 5 lines
  const firstLines = trimmed.split("\n").slice(0, 5).join("\n");
  const commaCount = (firstLines.match(/,/g) || []).length;
  const tabCount = (firstLines.match(/\t/g) || []).length;
  const semiCount = (firstLines.match(/;/g) || []).length;
  const pipeCount = (firstLines.match(/\|/g) || []).length;

  if (tabCount > commaCount && tabCount > semiCount && tabCount > pipeCount) {
    return "tsv";
  }
  if (semiCount > commaCount && semiCount > tabCount && semiCount > pipeCount) {
    return "csv-semi";
  }
  if (pipeCount > commaCount && pipeCount > tabCount && pipeCount > semiCount) {
    return "csv-pipe";
  }
  return "csv";
}

export function parseHTMLTable(htmlString) {
  try {
    if (typeof window === "undefined") return null; // Safe for SSR

    let cleanHtml = (htmlString || "").trim();
    if (cleanHtml && !cleanHtml.toLowerCase().includes("<table")) {
      cleanHtml = `<table>${cleanHtml}</table>`;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHtml, "text/html");
    const table = doc.querySelector("table");
    if (!table) return null;

    const thead = table.querySelector("thead");

    // Helper to parse tr elements using rowspan/colspan grid mapping
    const parseTrs = (trElements) => {
      const grid = [];
      trElements.forEach((tr, rowIndex) => {
        if (!grid[rowIndex]) grid[rowIndex] = [];
        // Only select direct cells, not nested table cells
        const cells = Array.from(tr.children).filter(
          el => el.tagName.toLowerCase() === "th" || el.tagName.toLowerCase() === "td"
        );

        cells.forEach((cell) => {
          let colIndex = 0;
          while (grid[rowIndex][colIndex] !== undefined) {
            colIndex++;
          }
          const rowspan = parseInt(cell.getAttribute("rowspan") || "1", 10);
          const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);
          const text = cell.textContent.trim();

          for (let r = 0; r < rowspan; r++) {
            const targetRow = rowIndex + r;
            if (!grid[targetRow]) grid[targetRow] = [];
            for (let c = 0; c < colspan; c++) {
              grid[targetRow][colIndex + c] = text;
            }
          }
        });
      });
      return grid;
    };

    let headerRow = null;
    let bodyRows = [];

    if (thead) {
      const theadTrs = Array.from(thead.children).filter(el => el.tagName.toLowerCase() === "tr");
      const theadGrid = parseTrs(theadTrs);

      if (theadGrid.length > 0) {
        // Merge thead rows by column
        const maxHeaderCols = Math.max(...theadGrid.map(r => r.length), 0);
        headerRow = [];
        for (let colIdx = 0; colIdx < maxHeaderCols; colIdx++) {
          const columnValues = [];
          for (let rowIdx = 0; rowIdx < theadGrid.length; rowIdx++) {
            const val = theadGrid[rowIdx][colIdx];
            if (val !== undefined && val !== "") {
              columnValues.push(val);
            }
          }
          // De-duplicate adjacent/matching values in the column (e.g. "No" from rowspan=2)
          const uniqueValues = columnValues.filter((v, i, a) => a.indexOf(v) === i);
          headerRow.push(uniqueValues.join(" / "));
        }
      }

      const tbody = table.querySelector("tbody");
      const tbodyTrs = tbody
        ? Array.from(tbody.children).filter(el => el.tagName.toLowerCase() === "tr")
        : Array.from(table.children).filter(el => el.tagName.toLowerCase() === "tr");
      bodyRows = parseTrs(tbodyTrs);
    } else {
      // No thead, parse all rows flat
      const tbody = table.querySelector("tbody");
      const allTrs = tbody
        ? Array.from(tbody.children).filter(el => el.tagName.toLowerCase() === "tr")
        : Array.from(table.children).filter(el => el.tagName.toLowerCase() === "tr");
      bodyRows = parseTrs(allTrs);
    }

    const allParsedRows = [];
    if (headerRow) {
      allParsedRows.push(headerRow);
    }
    allParsedRows.push(...bodyRows);

    if (allParsedRows.length === 0) return null;

    // Normalize column count
    const maxCols = Math.max(...allParsedRows.map(r => r.length), 0);
    return allParsedRows.map(row => {
      const cleanRow = [];
      for (let c = 0; c < maxCols; c++) {
        cleanRow.push(row[c] === undefined ? "" : row[c]);
      }
      return cleanRow;
    });
  } catch (e) {
    console.error("HTML parsing error", e);
    return null;
  }
}

export function parseDelimitedText(text, delimiter) {
  if (!text) return [];
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          row[row.length - 1] += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        row[row.length - 1] += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        row.push("");
      } else if (char === "\r" || char === "\n") {
        lines.push(row);
        row = [""];
        if (char === "\r" && nextChar === "\n") {
          i++; // Skip \n in \r\n
        }
      } else {
        row[row.length - 1] += char;
      }
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }

  // Filter out empty rows at the end
  const cleanLines = lines.filter(r => r.length > 1 || r[0] !== "");
  if (cleanLines.length === 0) return [[""]];

  // Normalize column count
  const maxCols = Math.max(...cleanLines.map(r => r.length), 0);
  return cleanLines.map(r => {
    const padding = Array(maxCols - r.length).fill("");
    return [...r, ...padding];
  });
}

export function escapeHTML(str) {
  if (typeof str !== "string") return String(str || "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateHTMLTable(data, hasHeader, styleType = "tailwind") {
  if (!data || data.length === 0 || (data.length === 1 && data[0].length === 1 && data[0][0] === "")) return "";

  let tableClass = "";
  let thClass = "";
  let tdClass = "";

  if (styleType === "tailwind") {
    tableClass = "min-w-full border-collapse border border-slate-200 text-left text-sm text-slate-600";
    thClass = "border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-800";
    tdClass = "border border-slate-200 px-4 py-2.5 text-slate-600 bg-white hover:bg-slate-50/50";
  } else if (styleType === "inline") {
    tableClass = "width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; text-align: left; font-size: 14px; font-family: sans-serif;";
    thClass = "border: 1px solid #cbd5e1; background-color: #f8fafc; padding: 12px 16px; font-weight: 600; color: #1e293b;";
    tdClass = "border: 1px solid #cbd5e1; padding: 10px 16px; color: #475569;";
  } else {
    // plain
    tableClass = "border-collapse";
    thClass = "border";
    tdClass = "border";
  }

  let html = styleType === "inline"
    ? `<table style="${tableClass}">\n`
    : tableClass
      ? `<table class="${tableClass}">\n`
      : `<table>\n`;

  let startIndex = 0;
  if (hasHeader && data.length > 0) {
    html += "  <thead>\n    <tr>\n";
    data[0].forEach((cell) => {
      if (styleType === "inline") {
        html += `      <th style="${thClass}">${escapeHTML(cell)}</th>\n`;
      } else if (thClass) {
        html += `      <th class="${thClass}">${escapeHTML(cell)}</th>\n`;
      } else {
        html += `      <th>${escapeHTML(cell)}</th>\n`;
      }
    });
    html += "    </tr>\n  </thead>\n";
    startIndex = 1;
  }

  html += "  <tbody>\n";
  for (let i = startIndex; i < data.length; i++) {
    html += "    <tr>\n";
    data[i].forEach((cell) => {
      if (styleType === "inline") {
        html += `      <td style="${tdClass}">${escapeHTML(cell)}</td>\n`;
      } else if (tdClass) {
        html += `      <td class="${tdClass}">${escapeHTML(cell)}</td>\n`;
      } else {
        html += `      <td>${escapeHTML(cell)}</td>\n`;
      }
    });
    html += "    </tr>\n";
  }
  html += "  </tbody>\n</table>";
  return html;
}

export function generateDelimitedText(data, delimiter) {
  if (!data || data.length === 0 || (data.length === 1 && data[0].length === 1 && data[0][0] === "")) return "";
  return data
    .map((row) =>
      row
        .map((cell) => {
          const val = String(cell || "");
          if (val.includes('"') || val.includes(delimiter) || val.includes("\n") || val.includes("\r")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(delimiter)
    )
    .join("\n");
}

export function generateMarkdownTable(data, hasHeader) {
  if (!data || data.length === 0 || (data.length === 1 && data[0].length === 1 && data[0][0] === "")) return "";
  const cols = data[0].length;
  let md = "";

  if (hasHeader) {
    md += `| ${data[0].map(c => c || " ").join(" | ")} |\n`;
    md += `| ${Array(cols).fill("---").join(" | ")} |\n`;
    for (let i = 1; i < data.length; i++) {
      md += `| ${data[i].map(c => c || " ").join(" | ")} |\n`;
    }
  } else {
    md += `| ${Array(cols).fill("").map((_, idx) => `Header ${idx + 1}`).join(" | ")} |\n`;
    md += `| ${Array(cols).fill("---").join(" | ")} |\n`;
    for (let i = 0; i < data.length; i++) {
      md += `| ${data[i].map(c => c || " ").join(" | ")} |\n`;
    }
  }
  return md;
}

export function generateJSONArrayOfObjects(data, hasHeader) {
  if (!data || data.length === 0 || (data.length === 1 && data[0].length === 1 && data[0][0] === "")) return "[]";
  if (!hasHeader || data.length < 2) {
    return JSON.stringify(data, null, 2);
  }
  const headers = data[0];
  const list = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((header, index) => {
      const key = header ? String(header).trim() : `col_${index + 1}`;
      obj[key] = data[i][index] || "";
    });
    list.push(obj);
  }
  return JSON.stringify(list, null, 2);
}

export const SAMPLE_CSV = `Product ID,Product Name,Category,Price,In Stock
P1001,Wireless Mouse,Electronics,29.99,Yes
P1002,Leather Notebook,Stationery,12.50,Yes
P1003,Water Bottle 750ml,Home & Kitchen,18.00,No
P1004,Bluetooth Headphones,Electronics,79.90,Yes
P1005,Ergonomic Chair,Office Furniture,249.00,Yes`;
