import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  Copy,
  Check,
  Download,
  ArrowUpDown,
  RotateCcw,
  Plus,
  Trash2,
  FileCode,
  FileText,
  Sparkles,
  HelpCircle,
  Code,
  Settings,
  Grid
} from "lucide-react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";

// ----------------------------------------------------
// CORE PARSERS & GENERATORS
// ----------------------------------------------------

function detectFormat(text) {
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

function parseHTMLTable(htmlString) {
  try {
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

function parseDelimitedText(text, delimiter) {
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

function escapeHTML(str) {
  if (typeof str !== "string") return String(str || "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateHTMLTable(data, hasHeader, styleType = "tailwind") {
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

function generateDelimitedText(data, delimiter) {
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

function generateMarkdownTable(data, hasHeader) {
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

function generateJSONArrayOfObjects(data, hasHeader) {
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

// ----------------------------------------------------
// DEFAULT SAMPLE DATA
// ----------------------------------------------------
const SAMPLE_CSV = `Product ID,Product Name,Category,Price,In Stock
P1001,Wireless Mouse,Electronics,29.99,Yes
P1002,Leather Notebook,Stationery,12.50,Yes
P1003,Water Bottle 750ml,Home & Kitchen,18.00,No
P1004,Bluetooth Headphones,Electronics,79.90,Yes
P1005,Ergonomic Chair,Office Furniture,249.00,Yes`;

export default function TableConverter() {
  const [inputText, setInputText] = useState("");
  const [data, setData] = useState([[""]]);
  const [inputFormat, setInputFormat] = useState("auto"); // auto, html, csv, tsv
  const [csvDelimiter, setCsvDelimiter] = useState(",");
  const [hasHeader, setHasHeader] = useState(true);
  const [htmlStyleType, setHtmlStyleType] = useState("tailwind"); // tailwind, inline, plain

  // Output states
  const [activeOutputTab, setActiveOutputTab] = useState("preview"); // preview, html, csv, tsv, md, json
  const [copiedSection, setCopiedSection] = useState(null);

  // Search state in Live Preview
  const [previewSearch, setPreviewSearch] = useState("");

  // Track autodetected format
  const autodetectedFormat = useMemo(() => {
    if (!inputText) return "None";
    const detected = detectFormat(inputText);
    if (detected === "csv-semi") return "CSV (Semicolon)";
    if (detected === "csv-pipe") return "CSV (Pipe)";
    if (detected === "tsv") return "TSV (Tab)";
    if (detected === "html") return "HTML Table";
    return "CSV (Comma)";
  }, [inputText]);

  // Sync Input Text -> data (only when raw text changes from textarea)
  const handleRawTextChange = (value) => {
    setInputText(value);
    if (!value.trim()) {
      setData([[""]]);
      return;
    }

    let format = inputFormat;
    let delimiter = csvDelimiter;

    if (format === "auto") {
      const detected = detectFormat(value);
      if (detected === "csv-semi") {
        format = "csv";
        delimiter = ";";
      } else if (detected === "csv-pipe") {
        format = "csv";
        delimiter = "|";
      } else if (detected === "tsv") {
        format = "tsv";
      } else if (detected === "html") {
        format = "html";
      } else {
        format = "csv";
        delimiter = ",";
      }
    } else if (format === "tsv") {
      delimiter = "\t";
    }

    let parsed = null;
    if (format === "html") {
      parsed = parseHTMLTable(value);
    } else {
      parsed = parseDelimitedText(value, delimiter);
    }

    if (parsed && parsed.length > 0) {
      setData(parsed);
    }
  };

  // Populate sample data
  const loadSample = () => {
    handleRawTextChange(SAMPLE_CSV);
    setInputFormat("auto");
    setCsvDelimiter(",");
    setHasHeader(true);
  };

  // Re-run parsing if format settings change manually
  useEffect(() => {
    if (inputText) {
      handleRawTextChange(inputText);
    }
  }, [inputFormat, csvDelimiter]);

  // Sync data -> Input Text (when user edits data in visual editor)
  const updateDataAndSyncText = (newData) => {
    setData(newData);

    let format = inputFormat;
    let delimiter = csvDelimiter;

    if (format === "auto") {
      const detected = detectFormat(inputText);
      if (detected === "csv-semi") {
        format = "csv";
        delimiter = ";";
      } else if (detected === "csv-pipe") {
        format = "csv";
        delimiter = "|";
      } else if (detected === "tsv") {
        format = "tsv";
      } else if (detected === "html") {
        format = "html";
      } else {
        format = "csv";
        delimiter = ",";
      }
    } else if (format === "tsv") {
      delimiter = "\t";
    }

    let text = "";
    if (format === "html") {
      text = generateHTMLTable(newData, hasHeader, htmlStyleType);
    } else {
      text = generateDelimitedText(newData, delimiter);
    }
    setInputText(text);
  };

  // ----------------------------------------------------
  // VISUAL TABLE EDITING ACTIONS
  // ----------------------------------------------------

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = data.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    updateDataAndSyncText(newData);
  };

  const addRow = () => {
    const colsCount = data[0]?.length || 1;
    const newRow = Array(colsCount).fill("");
    const newData = (data.length === 1 && data[0].length === 1 && data[0][0] === "")
      ? [[""]]
      : [...data, newRow];
    updateDataAndSyncText(newData);
  };

  const deleteRow = (rowIndex) => {
    if (data.length <= 1) {
      updateDataAndSyncText([[""]]);
      return;
    }
    const newData = data.filter((_, rIdx) => rIdx !== rowIndex);
    updateDataAndSyncText(newData);
  };

  const addColumn = () => {
    const newData = data.map((row) => [...row, ""]);
    updateDataAndSyncText(newData);
  };

  const deleteColumn = (colIndex) => {
    if (data[0].length <= 1) {
      updateDataAndSyncText([[""]]);
      return;
    }
    const newData = data.map((row) => row.filter((_, cIdx) => cIdx !== colIndex));
    updateDataAndSyncText(newData);
  };

  const transposeTable = () => {
    if (!data || data.length === 0 || (data.length === 1 && data[0].length === 1 && data[0][0] === "")) return;
    const colsCount = data[0].length;
    const transposed = Array.from({ length: colsCount }, (_, colIdx) =>
      data.map((row) => row[colIdx] || "")
    );
    updateDataAndSyncText(transposed);
  };

  const clearAll = () => {
    setInputText("");
    setData([[""]]);
  };

  const handlePaste = (e) => {
    const html = e.clipboardData.getData("text/html");
    if (html && (html.includes("<table") || html.includes("<tr") || html.includes("<td") || html.includes("<th"))) {
      e.preventDefault();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const table = doc.querySelector("table");
      if (table) {
        handleRawTextChange(table.outerHTML);
      } else {
        handleRawTextChange(html);
      }
    }
  };

  // ----------------------------------------------------
  // OUTPUTS MEMOIZATION
  // ----------------------------------------------------

  const outputs = useMemo(() => {
    return {
      html: generateHTMLTable(data, hasHeader, htmlStyleType),
      csv: generateDelimitedText(data, ","),
      tsv: generateDelimitedText(data, "\t"),
      md: generateMarkdownTable(data, hasHeader),
      json: generateJSONArrayOfObjects(data, hasHeader)
    };
  }, [data, hasHeader, htmlStyleType]);

  // Filtering body rows for visual preview
  const filteredBodyData = useMemo(() => {
    const mappedRows = data.map((row, index) => ({ row, index }));
    const bodyRows = hasHeader ? mappedRows.slice(1) : mappedRows;
    if (!previewSearch) return bodyRows;
    const searchLower = previewSearch.toLowerCase();

    return bodyRows.filter(({ row }) =>
      row.some(cell => String(cell).toLowerCase().includes(searchLower))
    );
  }, [data, previewSearch, hasHeader]);

  // Copy helper
  const copyToClipboard = (type, content) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopiedSection(type);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Download helper
  const downloadFile = (type, content) => {
    if (!content) return;
    const mimeTypes = {
      html: "text/html",
      csv: "text/csv",
      tsv: "text/tab-separated-values",
      md: "text/markdown",
      json: "application/json"
    };
    const extensions = {
      html: "html",
      csv: "csv",
      tsv: "tsv",
      md: "md",
      json: "json"
    };
    const blob = new Blob([content], { type: mimeTypes[type] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `table-converted.${extensions[type]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PageContext.Provider value={{ activeItem: PAGE.TABLE_CONVERTER }}>
      <Layout title="Convertable HTML, Tab, Comma Table">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto pb-16"
        >
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-2xl">
                  <Table className="w-6 h-6 text-cyan-600" />
                </div>
                Table Converter
              </h1>
              <p className="mt-2 text-slate-500 max-w-xl text-sm font-medium">
                Seamlessly convert between HTML tables, Tab-delimited (TSV), and Comma-delimited (CSV/Delimiter) formats with full interactive editing.
              </p>
            </div>

            <button
              onClick={loadSample}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 self-start md:self-center flex items-center gap-2 border border-slate-800"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 fill-cyan-400/20" /> Load Sample Data
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative overflow-hidden flex flex-col min-h-[480px]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />

                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-black text-slate-800 tracking-wider uppercase block">
                    Paste raw table text
                  </label>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">
                    Autodetect: {autodetectedFormat}
                  </span>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => handleRawTextChange(e.target.value)}
                  onPaste={handlePaste}
                  placeholder={`Example HTML:
<table><tr><td>Col1</td><td>Col2</td></tr><tr><td>Val1</td><td>Val2</td></tr></table>

Or delimited text:
Name\tAge\tCountry
Alice\t24\tUSA
Bob\t30\tUK`}
                  className="w-full flex-1 min-h-[220px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none custom-scrollbar"
                />

                {/* Clear action */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={clearAll}
                    disabled={!inputText}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-200 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-500 disabled:hover:border-slate-200 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wide flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear Input
                  </button>
                </div>

                {/* Parser Options Section */}
                <div className="border-t border-slate-100 pt-5 mt-5 space-y-4">
                  <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-slate-400" /> Parser Settings
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Input Format
                      </label>
                      <select
                        value={inputFormat}
                        onChange={(e) => setInputFormat(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-400"
                      >
                        <option value="auto">Auto Detect</option>
                        <option value="html">HTML Table</option>
                        <option value="csv">Delimited / CSV</option>
                        <option value="tsv">Tab Delimited (TSV)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        CSV Delimiter
                      </label>
                      <select
                        value={csvDelimiter}
                        onChange={(e) => setCsvDelimiter(e.target.value)}
                        disabled={inputFormat === "html" || inputFormat === "tsv"}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-400 disabled:opacity-40"
                      >
                        <option value=",">Comma (,)</option>
                        <option value=";">Semicolon (;)</option>
                        <option value="&#9;">Tab (\t)</option>
                        <option value="|">Pipe (|)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={hasHeader}
                        onChange={(e) => setHasHeader(e.target.checked)}
                        className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      First row is Header
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Grid & Output */}
            <div className="lg:col-span-7 space-y-6">
              {/* Output Tab Selector */}
              <div className="bg-[#1e1e1e] p-1.5 rounded-3xl flex gap-1 shadow-sm border border-slate-800">
                {[
                  { id: "preview", label: "Live Grid", desc: "Interactive Preview", icon: Grid },
                  { id: "html", label: "HTML Table", desc: "Clean HTML", icon: FileCode },
                  { id: "csv", label: "CSV", desc: "Comma Separated", icon: FileText },
                  { id: "tsv", label: "TSV", desc: "Tab Separated", icon: FileText },
                  { id: "md", label: "Markdown", desc: "Github Readme", icon: Code },
                  { id: "json", label: "JSON", desc: "Developer Array", icon: Code }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveOutputTab(tab.id)}
                    className={`flex-1 py-2.5 px-1.5 rounded-2xl font-black text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-200 flex flex-col items-center justify-center ${activeOutputTab === tab.id
                      ? "bg-slate-800 text-white shadow-lg border border-slate-700 bg-gradient-to-tr from-cyan-500/10 to-transparent"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#252525]"
                      }`}
                  >
                    <tab.icon className="w-3.5 h-3.5 mb-1" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Viewer viewport */}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 relative overflow-hidden min-h-[380px] flex flex-col">
                <AnimatePresence mode="wait">
                  {/* Live Interactive Grid Panel */}
                  {activeOutputTab === "preview" && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="flex-1 flex flex-col"
                    >
                      {/* Grid controls toolbar */}
                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={addRow}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors"
                            title="Add a new row at the bottom"
                          >
                            <Plus className="w-3 h-3 text-emerald-500 stroke-[3]" /> Add Row
                          </button>
                          <button
                            onClick={addColumn}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors"
                            title="Add a new column at the right edge"
                          >
                            <Plus className="w-3 h-3 text-emerald-500 stroke-[3]" /> Add Column
                          </button>
                          <button
                            onClick={transposeTable}
                            disabled={!data || data.length === 0 || (data.length === 1 && data[0].length === 1 && data[0][0] === "")}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors disabled:opacity-40"
                            title="Swap Rows & Columns"
                          >
                            <ArrowUpDown className="w-3 h-3 text-cyan-500" /> Transpose
                          </button>
                        </div>

                        {/* Live Filter input */}
                        <div className="relative">
                          <input
                            type="text"
                            value={previewSearch}
                            onChange={(e) => setPreviewSearch(e.target.value)}
                            placeholder="Filter grid rows..."
                            className="w-full sm:w-44 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-cyan-400 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Spreadsheet layout view */}
                      <div className="flex-1 w-full overflow-x-auto border border-slate-200 rounded-2xl custom-scrollbar max-h-[350px]">
                        <table className="min-w-full border-collapse text-left text-xs font-semibold text-slate-700">
                          <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="bg-slate-50 divide-x divide-slate-200 border-b border-slate-200">
                              <th className="px-2 py-2 text-center text-[10px] text-slate-400 font-bold bg-slate-100 w-10">
                                #
                              </th>
                              {(hasHeader ? data[0] : data[0])?.map((colVal, colIdx) => (
                                <th key={colIdx} className="p-0 text-slate-600 bg-slate-50/80 font-bold tracking-tight border-r border-slate-200 min-w-[100px]">
                                  <div className="flex items-center w-full group/header">
                                    {hasHeader ? (
                                      <input
                                        type="text"
                                        value={colVal || ""}
                                        onChange={(e) => handleCellChange(0, colIdx, e.target.value)}
                                        className="w-full min-w-[80px] px-3 py-2 bg-transparent border-0 outline-none text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-cyan-500"
                                        placeholder={`Header ${colIdx + 1}`}
                                      />
                                    ) : (
                                      <span className="w-full px-3 py-2 select-none text-slate-400 text-xs font-bold block whitespace-nowrap">
                                        Col {colIdx + 1}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => deleteColumn(colIdx)}
                                      className="text-slate-300 hover:text-red-500 p-1.5 rounded opacity-0 group-hover/header:opacity-100 transition-opacity shrink-0"
                                      title="Delete column"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {filteredBodyData.map(({ row, index: originalRowIndex }, rowIdx) => {
                              if (originalRowIndex === -1) return null;

                              return (
                                <tr
                                  key={rowIdx}
                                  className="divide-x divide-slate-150 transition-colors hover:bg-slate-50/50"
                                >
                                  {/* Row index indicator */}
                                  <td className="px-2 py-1 text-center bg-slate-50/50 text-[10px] text-slate-400 font-bold border-r border-slate-200 relative group/row">
                                    <span className="group-hover/row:hidden">
                                      {hasHeader ? originalRowIndex : originalRowIndex + 1}
                                    </span>
                                    <button
                                      onClick={() => deleteRow(originalRowIndex)}
                                      className="hidden group-hover/row:inline-block text-red-500 hover:text-red-700 align-middle"
                                      title="Delete row"
                                    >
                                      <Trash2 className="w-3 h-3 mx-auto" />
                                    </button>
                                  </td>

                                  {/* Row cell inputs */}
                                  {row.map((cell, colIdx) => (
                                    <td key={colIdx} className="p-0 border-r border-slate-200">
                                      <input
                                        type="text"
                                        value={cell || ""}
                                        onChange={(e) => handleCellChange(originalRowIndex, colIdx, e.target.value)}
                                        className="w-full px-3 py-2 bg-transparent border-0 outline-none text-xs font-mono font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-cyan-500 focus:shadow-inner"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Empty state visual */}
                      {(!data || data.length === 0 || (data.length === 1 && data[0].length === 1 && data[0][0] === "")) && (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                          <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            No table data loaded
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                            Paste raw data, type directly, or click "Load Sample Data" to start.
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* HTML Code Panel */}
                  {activeOutputTab === "html" && (
                    <motion.div
                      key="html"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col"
                    >
                      {/* HTML Style customizer settings */}
                      <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Settings className="w-3.5 h-3.5" /> HTML styling:
                        </span>

                        <div className="flex gap-2 text-[10px] font-bold">
                          {[
                            { id: "tailwind", label: "Tailwind Classes" },
                            { id: "inline", label: "Inline Styling (CSS)" },
                            { id: "plain", label: "Plain (Tags Only)" }
                          ].map((styleOpt) => (
                            <button
                              key={styleOpt.id}
                              onClick={() => setHtmlStyleType(styleOpt.id)}
                              className={`px-3 py-1 rounded-lg border transition-colors ${htmlStyleType === styleOpt.id
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                              {styleOpt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {renderCodeArea("html", outputs.html)}
                    </motion.div>
                  )}

                  {/* CSV Code Panel */}
                  {activeOutputTab === "csv" && (
                    <motion.div
                      key="csv"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col"
                    >
                      {renderCodeArea("csv", outputs.csv)}
                    </motion.div>
                  )}

                  {/* TSV Code Panel */}
                  {activeOutputTab === "tsv" && (
                    <motion.div
                      key="tsv"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col"
                    >
                      {renderCodeArea("tsv", outputs.tsv)}
                    </motion.div>
                  )}

                  {/* Markdown Code Panel */}
                  {activeOutputTab === "md" && (
                    <motion.div
                      key="md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col"
                    >
                      {renderCodeArea("md", outputs.md)}
                    </motion.div>
                  )}

                  {/* JSON Code Panel */}
                  {activeOutputTab === "json" && (
                    <motion.div
                      key="json"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col"
                    >
                      {renderCodeArea("json", outputs.json)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );

  // Helper render for Code outputs
  function renderCodeArea(type, codeContent) {
    return (
      <div className="flex-1 flex flex-col relative min-h-[300px]">
        {/* Actions row */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <button
            onClick={() => copyToClipboard(type, codeContent)}
            disabled={!codeContent}
            className={`p-2 rounded-xl transition-all border ${copiedSection === type
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : "bg-white text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 border-slate-200"
              }`}
            title="Copy to clipboard"
          >
            {copiedSection === type ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => downloadFile(type, codeContent)}
            disabled={!codeContent}
            className="p-2 bg-white text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all border border-slate-200"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Copy confirm text overlay */}
        <AnimatePresence>
          {copiedSection === type && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-24 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 z-10"
            >
              Copied!
            </motion.span>
          )}
        </AnimatePresence>

        <textarea
          readOnly
          value={codeContent || "No data to display."}
          className="w-full flex-1 p-4 bg-slate-900 border border-slate-850 rounded-2xl text-[11px] font-mono text-slate-300 focus:outline-none resize-none custom-scrollbar shadow-inner select-all leading-normal"
        />
      </div>
    );
  }
}
