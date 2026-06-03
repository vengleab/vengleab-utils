import { useState, useEffect, useMemo } from "react";
import {
  detectFormat,
  parseHTMLTable,
  parseDelimitedText,
  generateHTMLTable,
  generateDelimitedText,
  generateMarkdownTable,
  generateJSONArrayOfObjects,
  SAMPLE_CSV
} from "./utils";

export function useTableConverterViewModel() {
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

  return {
    inputText,
    setInputText,
    data,
    setData,
    inputFormat,
    setInputFormat,
    csvDelimiter,
    setCsvDelimiter,
    hasHeader,
    setHasHeader,
    htmlStyleType,
    setHtmlStyleType,
    activeOutputTab,
    setActiveOutputTab,
    copiedSection,
    previewSearch,
    setPreviewSearch,
    autodetectedFormat,
    outputs,
    filteredBodyData,
    handleRawTextChange,
    loadSample,
    handleCellChange,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    transposeTable,
    clearAll,
    handlePaste,
    copyToClipboard,
    downloadFile
  };
}
