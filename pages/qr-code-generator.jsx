import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  Link as LinkIcon,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  UserCheck,
  Sliders,
  Palette,
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Upload,
  ArrowRight,
  Info
} from "lucide-react";
import Layout from "../components/Layout";
import qrcode from "../utils/qrcode";

const SHAPE = {
  SQUARE: "square",
  ROUNDED: "rounded",
  CIRCLE: "circle"
};

const PRESET_LOGOS = {
  github: {
    name: "GitHub",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
    color: "#181717"
  },
  google: {
    name: "Google",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.444-2.889-6.444-6.444s2.889-6.444 6.444-6.444c1.604 0 3.06.595 4.17 1.583l3.078-3.078C18.665 1.702 15.65 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.7 0 12.24-5.48 12.24-12.24 0-.82-.07-1.61-.2-2.385H12.24z"/></svg>`,
    color: "#ea4335"
  },
  wifi: {
    name: "Wi-Fi",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M12 20h.01"/><path d="M8.5 16.5c3.5-3.5 3.5-3.5 7 0"/><path d="M5 13c5-5 9-5 14 0"/><path d="M1.5 9.5c7-7 14-7 21 0"/></svg>`,
    color: "#4f46e5"
  },
  link: {
    name: "Link",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    color: "#2563eb"
  },
  mail: {
    name: "Email",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    color: "#e11d48"
  },
  phone: {
    name: "Phone",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    color: "#059669"
  }
};

export default function QRCodeGenerator() {
  // Navigation / Tabs state
  const [activeTab, setActiveTab] = useState("url"); // url, wifi, email, phone, sms, vcard
  const [optionTab, setOptionTab] = useState("content"); // content, style, color, logo

  // Input Data States
  const [url, setUrl] = useState("https://google.com");
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA"); // WPA, WEP, nopass
  const [wifiHidden, setWifiHidden] = useState(false);

  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [phoneNum, setPhoneNum] = useState("");

  const [smsNum, setSmsNum] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  const [vcardFirst, setVcardFirst] = useState("");
  const [vcardLast, setVcardLast] = useState("");
  const [vcardOrg, setVcardOrg] = useState("");
  const [vcardTitle, setVcardTitle] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardUrl, setVcardUrl] = useState("");
  const [vcardAddress, setVcardAddress] = useState("");

  // Styling Customizations
  const [fgType, setFgType] = useState("solid"); // solid, gradient
  const [fgColor, setFgColor] = useState("#4f46e5"); // indigo-600
  const [fgColor2, setFgColor2] = useState("#06b6d4"); // cyan-500
  const [gradientType, setGradientType] = useState("linear"); // linear, radial
  const [gradientAngle, setGradientAngle] = useState(45);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgTransparent, setBgTransparent] = useState(false);

  const [moduleShape, setModuleShape] = useState(SHAPE.SQUARE); // square, circle, rounded
  const [eyeFrameShape, setEyeFrameShape] = useState(SHAPE.SQUARE); // square, rounded, circle
  const [eyeBallShape, setEyeBallShape] = useState(SHAPE.SQUARE); // square, rounded, circle

  const [errorCorrection, setErrorCorrection] = useState("H"); // L, M, Q, H

  const [logoType, setLogoType] = useState("none"); // none, preset, custom
  const [presetLogo, setPresetLogo] = useState("link");
  const [customLogoFile, setCustomLogoFile] = useState(null);
  const [logoSize, setLogoSize] = useState(22); // 15% to 30%
  const [logoMask, setLogoMask] = useState(true);
  const [logoShape, setLogoShape] = useState(SHAPE.CIRCLE); // circle, square, rounded
  const [logoBgColor, setLogoBgColor] = useState("#ffffff");
  const [logoPadding, setLogoPadding] = useState(1);

  // App Output States
  const [qrSize, setQrSize] = useState(512); // export resolution
  const [copied, setCopied] = useState(false);
  const [copiedSVG, setCopiedSVG] = useState(false);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const logoImageRef = useRef(null);

  // Parse fields into a standardized QR Code payload
  const getPayload = () => {
    switch (activeTab) {
      case "url":
        return url || "";
      case "wifi":
        const escape = (str) => str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/:/g, "\\:").replace(/,/g, "\\,");
        return `WIFI:S:${escape(wifiSSID)};T:${wifiSecurity};P:${escape(wifiPassword)};${wifiHidden ? "H:true" : ""};`;
      case "email":
        return `mailto:${emailRecipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case "phone":
        return `tel:${phoneNum}`;
      case "sms":
        return `smsto:${smsNum}:${smsMessage}`;
      case "vcard":
        let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
        if (vcardLast || vcardFirst) vcard += `N:${vcardLast};${vcardFirst};;;\nFN:${vcardFirst} ${vcardLast}\n`;
        if (vcardOrg) vcard += `ORG:${vcardOrg}\n`;
        if (vcardTitle) vcard += `TITLE:${vcardTitle}\n`;
        if (vcardPhone) vcard += `TEL;TYPE=CELL:${vcardPhone}\n`;
        if (vcardEmail) vcard += `EMAIL;TYPE=INTERNET:${vcardEmail}\n`;
        if (vcardUrl) vcard += `URL:${vcardUrl}\n`;
        if (vcardAddress) vcard += `ADR;TYPE=WORK:;;${vcardAddress};;;;\n`;
        vcard += "END:VCARD";
        return vcard;
      default:
        return "";
    }
  };

  // Helper to determine if cell is inside the corner eyes (7x7 zones)
  const isEye = (row, col, moduleCount) => {
    // Top-Left Eye
    if (row < 7 && col < 7) return true;
    // Top-Right Eye
    if (row < 7 && col >= moduleCount - 7) return true;
    // Bottom-Left Eye
    if (row >= moduleCount - 7 && col < 7) return true;
    return false;
  };

  // Generate QR Code Matrix and Draw to HTML5 Canvas
  const drawQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const text = getPayload();
    if (!text) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    setLoading(true);

    try {
      // 0 means auto-detect QR Version size
      const qr = qrcode(0, errorCorrection);
      qr.addData(text, "Byte");
      qr.make();

      const moduleCount = qr.getModuleCount();
      const canvasSize = 1024; // Draw at a high double-resolution for razor-sharp rendering
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      const cellSize = canvasSize / moduleCount;

      // 1. Draw Background
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      if (!bgTransparent) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasSize, canvasSize);
      }

      // 2. Set Up Color Gradient / Solid
      let fillStyle = fgColor;
      if (fgType === "gradient") {
        if (gradientType === "linear") {
          const angleRad = (gradientAngle * Math.PI) / 180;
          const r = canvasSize / 2;
          const cx = canvasSize / 2;
          const cy = canvasSize / 2;
          const startX = cx - Math.cos(angleRad) * r;
          const startY = cy - Math.sin(angleRad) * r;
          const endX = cx + Math.cos(angleRad) * r;
          const endY = cy + Math.sin(angleRad) * r;

          const linearGrad = ctx.createLinearGradient(startX, startY, endX, endY);
          linearGrad.addColorStop(0, fgColor);
          linearGrad.addColorStop(1, fgColor2);
          fillStyle = linearGrad;
        } else {
          const radialGrad = ctx.createRadialGradient(
            canvasSize / 2,
            canvasSize / 2,
            50,
            canvasSize / 2,
            canvasSize / 2,
            canvasSize * 0.7
          );
          radialGrad.addColorStop(0, fgColor);
          radialGrad.addColorStop(1, fgColor2);
          fillStyle = radialGrad;
        }
      }
      ctx.fillStyle = fillStyle;

      // 3. Define Masking Region for Logo
      let logoStart = -1;
      let logoEnd = -1;
      if (logoType !== "none" && logoMask) {
        // Calculate size of the logo in terms of modules
        const logoModules = Math.ceil(moduleCount * (logoSize / 100));
        // Force the alignment to match moduleCount's parity so it centers perfectly
        const alignedModules = logoModules % 2 === moduleCount % 2 ? logoModules : logoModules + 1;
        logoStart = Math.floor((moduleCount - alignedModules) / 2);
        logoEnd = logoStart + alignedModules;
      }

      // Helper: Draw rounded rect
      const drawRoundRect = (x, y, w, h, r) => {
        if (r > w / 2) r = w / 2;
        if (r > h / 2) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      // 4. Draw Modules
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          // Skip drawing eyes inside standard loop (eyes drawn in specialized styling loop next)
          if (isEye(r, c, moduleCount)) continue;

          // Skip drawing if inside logo mask region
          if (r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd) continue;

          if (qr.isDark(r, c)) {
            const x = c * cellSize;
            const y = r * cellSize;

            ctx.fillStyle = fillStyle;

            if (moduleShape === SHAPE.SQUARE) {
              // Add +0.5 to prevent tiny rendering gaps between neighboring sub-pixels
              ctx.fillRect(x, y, cellSize + 0.5, cellSize + 0.5);
            } else if (moduleShape === SHAPE.CIRCLE) {
              ctx.beginPath();
              ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.4, 0, 2 * Math.PI);
              ctx.fill();
            } else if (moduleShape === SHAPE.ROUNDED) {
              drawRoundRect(x + cellSize * 0.1, y + cellSize * 0.1, cellSize * 0.8, cellSize * 0.8, cellSize * 0.25);
              ctx.fill();
            }
          }
        }
      }

      // 5. Draw Eye Structures
      const drawCustomEye = (startX, startY) => {
        const eyeSize = 7 * cellSize;

        // Path subtraction for Eye Frame to look clean even on transparent backgrounds
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        if (eyeFrameShape === SHAPE.SQUARE) {
          ctx.rect(startX, startY, eyeSize, eyeSize);
          ctx.rect(startX + cellSize, startY + cellSize, eyeSize - 2 * cellSize, eyeSize - 2 * cellSize);
        } else if (eyeFrameShape === SHAPE.ROUNDED) {
          drawRoundRect(startX, startY, eyeSize, eyeSize, cellSize * 1.8);
          drawRoundRect(startX + cellSize, startY + cellSize, eyeSize - 2 * cellSize, eyeSize - 2 * cellSize, cellSize * 1.0);
        } else if (eyeFrameShape === SHAPE.CIRCLE) {
          ctx.arc(startX + eyeSize / 2, startY + eyeSize / 2, eyeSize / 2, 0, 2 * Math.PI);
          ctx.arc(startX + eyeSize / 2, startY + eyeSize / 2, (eyeSize - 2 * cellSize) / 2, 0, 2 * Math.PI);
        }
        ctx.fill("evenodd");

        // Eye Ball
        const ballSize = 3 * cellSize;
        const ballX = startX + 2 * cellSize;
        const ballY = startY + 2 * cellSize;

        ctx.beginPath();
        if (eyeBallShape === SHAPE.SQUARE) {
          ctx.rect(ballX, ballY, ballSize, ballSize);
        } else if (eyeBallShape === SHAPE.ROUNDED) {
          drawRoundRect(ballX, ballY, ballSize, ballSize, cellSize * 0.8);
        } else if (eyeBallShape === SHAPE.CIRCLE) {
          ctx.arc(ballX + ballSize / 2, ballY + ballSize / 2, ballSize / 2, 0, 2 * Math.PI);
        }
        ctx.fill();
      };

      // Draw 3 Corner Eyes
      drawCustomEye(0, 0); // Top Left
      drawCustomEye((moduleCount - 7) * cellSize, 0); // Top Right
      drawCustomEye(0, (moduleCount - 7) * cellSize); // Bottom Left

      // 6. Draw Logo Integration
      if (logoType !== "none") {
        const logoTargetSize = canvasSize * (logoSize / 100);
        const logoX = (canvasSize - logoTargetSize) / 2;
        const logoY = (canvasSize - logoTargetSize) / 2;

        // Draw backing mask
        ctx.fillStyle = logoBgColor;
        ctx.beginPath();
        if (logoShape === SHAPE.CIRCLE) {
          ctx.arc(canvasSize / 2, canvasSize / 2, logoTargetSize / 2 + logoPadding * 8, 0, 2 * Math.PI);
          ctx.fill();
        } else if (logoShape === SHAPE.ROUNDED) {
          drawRoundRect(
            logoX - logoPadding * 6,
            logoY - logoPadding * 6,
            logoTargetSize + logoPadding * 12,
            logoTargetSize + logoPadding * 12,
            logoTargetSize * 0.25
          );
          ctx.fill();
        } else if (logoShape === SHAPE.SQUARE) {
          ctx.fillRect(
            logoX - logoPadding * 6,
            logoY - logoPadding * 6,
            logoTargetSize + logoPadding * 12,
            logoTargetSize + logoPadding * 12
          );
        }

        // Draw the logo itself
        const renderLogoImage = (img) => {
          ctx.beginPath();
          ctx.save();
          // Clip logo into matching shape
          if (logoShape === SHAPE.CIRCLE) {
            ctx.arc(canvasSize / 2, canvasSize / 2, logoTargetSize / 2, 0, 2 * Math.PI);
            ctx.clip();
          } else if (logoShape === SHAPE.ROUNDED) {
            drawRoundRect(logoX, logoY, logoTargetSize, logoTargetSize, logoTargetSize * 0.2);
            ctx.clip();
          }
          ctx.drawImage(img, logoX, logoY, logoTargetSize, logoTargetSize);
          ctx.restore();
        };

        if (logoType === "preset") {
          const preset = PRESET_LOGOS[presetLogo];
          if (preset) {
            // Draw Preset Logo Vector via temporary Image Element
            const svgString = preset.svg.replace("fill=\"currentColor\"", `fill="${preset.color || fgColor}"`);
            const blob = new Blob([svgString], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              renderLogoImage(img);
              URL.revokeObjectURL(url);
            };
            img.src = url;
          }
        } else if (logoType === "custom" && customLogoFile) {
          const img = new Image();
          img.onload = () => {
            renderLogoImage(img);
          };
          img.src = customLogoFile;
        }
      }
    } catch (e) {
      console.error("Error drawing QR Code matrix", e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger drawing on customizations or active values change
  useEffect(() => {
    drawQRCode();
  }, [
    activeTab,
    url,
    wifiSSID,
    wifiPassword,
    wifiSecurity,
    wifiHidden,
    emailRecipient,
    emailSubject,
    emailBody,
    phoneNum,
    smsNum,
    smsMessage,
    vcardFirst,
    vcardLast,
    vcardOrg,
    vcardTitle,
    vcardPhone,
    vcardEmail,
    vcardUrl,
    vcardAddress,
    fgType,
    fgColor,
    fgColor2,
    gradientType,
    gradientAngle,
    bgColor,
    bgTransparent,
    moduleShape,
    eyeFrameShape,
    eyeBallShape,
    errorCorrection,
    logoType,
    presetLogo,
    customLogoFile,
    logoSize,
    logoMask,
    logoShape,
    logoBgColor,
    logoPadding
  ]);

  // Handle Logo Uploading
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCustomLogoFile(uploadEvent.target.result);
        setLogoType("custom");
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear upload file
  const removeCustomLogo = () => {
    setCustomLogoFile(null);
    setLogoType("none");
  };

  // SVG String builder for scalable vectors export
  const generateSVGString = () => {
    const text = getPayload();
    if (!text) return "";

    try {
      const qr = qrcode(0, errorCorrection);
      qr.addData(text, "Byte");
      qr.make();

      const moduleCount = qr.getModuleCount();
      const size = qrSize;
      const cellSize = size / moduleCount;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">\n`;

      // 1. Add Gradients Defs
      if (fgType === "gradient") {
        svg += `  <defs>\n`;
        if (gradientType === "linear") {
          const angleRad = (gradientAngle * Math.PI) / 180;
          const r = size / 2;
          const cx = size / 2;
          const cy = size / 2;
          const startX = ((cx - Math.cos(angleRad) * r) / size) * 100;
          const startY = ((cy - Math.sin(angleRad) * r) / size) * 100;
          const endX = ((cx + Math.cos(angleRad) * r) / size) * 100;
          const endY = ((cy + Math.sin(angleRad) * r) / size) * 100;

          svg += `    <linearGradient id="qr-grad" x1="${startX.toFixed(1)}%" y1="${startY.toFixed(1)}%" x2="${endX.toFixed(1)}%" y2="${endY.toFixed(1)}%">\n`;
        } else {
          svg += `    <radialGradient id="qr-grad" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">\n`;
        }
        svg += `      <stop offset="0%" stop-color="${fgColor}" />\n`;
        svg += `      <stop offset="100%" stop-color="${fgColor2}" />\n`;
        svg += `    </radialGradient>\n`;
        svg += `  </defs>\n`;
      }

      // 2. Background
      if (!bgTransparent) {
        svg += `  <rect width="100%" height="100%" fill="${bgColor}" />\n`;
      }

      const fillRef = fgType === "gradient" ? "url(#qr-grad)" : fgColor;

      // 3. Mask calculation
      let logoStart = -1;
      let logoEnd = -1;
      if (logoType !== "none" && logoMask) {
        const logoModules = Math.ceil(moduleCount * (logoSize / 100));
        const alignedModules = logoModules % 2 === moduleCount % 2 ? logoModules : logoModules + 1;
        logoStart = Math.floor((moduleCount - alignedModules) / 2);
        logoEnd = logoStart + alignedModules;
      }

      // Helper: SVG Rounded Rect Path
      const getRoundedRectPath = (x, y, w, h, r) => {
        if (r > w / 2) r = w / 2;
        return `M ${x + r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} L ${x + r} ${y + h} A ${r} ${r} 0 0 1 ${x} ${y + h - r} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
      };

      // 4. Modules Path
      let pathData = "";
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (isEye(r, c, moduleCount)) continue;
          if (r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd) continue;

          if (qr.isDark(r, c)) {
            const x = c * cellSize;
            const y = r * cellSize;

            if (moduleShape === SHAPE.SQUARE) {
              pathData += `M ${x.toFixed(2)} ${y.toFixed(2)} h ${(cellSize + 0.1).toFixed(2)} v ${(cellSize + 0.1).toFixed(2)} h -${(cellSize + 0.1).toFixed(2)} Z `;
            } else if (moduleShape === SHAPE.CIRCLE) {
              const cx = x + cellSize / 2;
              const cy = y + cellSize / 2;
              const rad = cellSize * 0.4;
              pathData += `M ${cx.toFixed(2)} ${(cy - rad).toFixed(2)} a ${rad.toFixed(2)} ${rad.toFixed(2)} 0 1 1 0 ${(rad * 2).toFixed(2)} a ${rad.toFixed(2)} ${rad.toFixed(2)} 0 1 1 0 -${(rad * 2).toFixed(2)} Z `;
            } else if (moduleShape === SHAPE.ROUNDED) {
              pathData += getRoundedRectPath(x + cellSize * 0.1, y + cellSize * 0.1, cellSize * 0.8, cellSize * 0.8, cellSize * 0.25) + " ";
            }
          }
        }
      }

      if (pathData) {
        svg += `  <path d="${pathData.trim()}" fill="${fillRef}" />\n`;
      }

      // 5. Custom Eyes Paths
      const getCustomEyeSVG = (startX, startY) => {
        const eyeSize = 7 * cellSize;
        let framePath = "";

        if (eyeFrameShape === SHAPE.SQUARE) {
          framePath += `M ${startX} ${startY} h ${eyeSize} v ${eyeSize} h -${eyeSize} Z M ${startX + cellSize} ${startY + cellSize} v ${eyeSize - 2 * cellSize} h ${eyeSize - 2 * cellSize} v -${eyeSize - 2 * cellSize} Z`;
        } else if (eyeFrameShape === SHAPE.ROUNDED) {
          const outerRounded = getRoundedRectPath(startX, startY, eyeSize, eyeSize, cellSize * 1.8);
          const innerRounded = getRoundedRectPath(startX + cellSize, startY + cellSize, eyeSize - 2 * cellSize, eyeSize - 2 * cellSize, cellSize * 1.0);
          // Combine using EvenOdd fill rule by reversing direction
          framePath += `${outerRounded} ${innerRounded}`;
        } else if (eyeFrameShape === SHAPE.CIRCLE) {
          const cx = startX + eyeSize / 2;
          const cy = startY + eyeSize / 2;
          const r1 = eyeSize / 2;
          const r2 = (eyeSize - 2 * cellSize) / 2;
          framePath += `M ${cx} ${cy - r1} a ${r1} ${r1} 0 1 1 0 ${r1 * 2} a ${r1} ${r1} 0 1 1 0 -${r1 * 2} Z M ${cx} ${cy - r2} a ${r2} ${r2} 0 1 0 0 ${r2 * 2} a ${r2} ${r2} 0 1 0 0 -${r2 * 2} Z`;
        }

        // Eyeball path
        const ballSize = 3 * cellSize;
        const ballX = startX + 2 * cellSize;
        const ballY = startY + 2 * cellSize;
        let ballPath = "";

        if (eyeBallShape === SHAPE.SQUARE) {
          ballPath += `M ${ballX} ${ballY} h ${ballSize} v ${ballSize} h -${ballSize} Z`;
        } else if (eyeBallShape === SHAPE.ROUNDED) {
          ballPath += getRoundedRectPath(ballX, ballY, ballSize, ballSize, cellSize * 0.8);
        } else if (eyeBallShape === SHAPE.CIRCLE) {
          const cx = ballX + ballSize / 2;
          const cy = ballY + ballSize / 2;
          const r = ballSize / 2;
          ballPath += `M ${cx} ${cy - r} a ${r} ${r} 0 1 1 0 ${r * 2} a ${r} ${r} 0 1 1 0 -${r * 2} Z`;
        }

        return `  <path d="${framePath}" fill="${fillRef}" fill-rule="evenodd" />\n  <path d="${ballPath}" fill="${fillRef}" />\n`;
      };

      svg += getCustomEyeSVG(0, 0); // Top Left
      svg += getCustomEyeSVG((moduleCount - 7) * cellSize, 0); // Top Right
      svg += getCustomEyeSVG(0, (moduleCount - 7) * cellSize); // Bottom Left

      // 6. Logo Integration
      if (logoType !== "none") {
        const logoTargetSize = size * (logoSize / 100);
        const logoX = (size - logoTargetSize) / 2;
        const logoY = (size - logoTargetSize) / 2;

        // backing mask
        let backingPath = "";
        const paddingOffset = logoPadding * 6;
        if (logoShape === SHAPE.CIRCLE) {
          const rad = logoTargetSize / 2 + paddingOffset;
          backingPath = `M ${size / 2} ${(size / 2 - rad)} a ${rad} ${rad} 0 1 1 0 ${rad * 2} a ${rad} ${rad} 0 1 1 0 -${rad * 2} Z`;
        } else if (logoShape === SHAPE.ROUNDED) {
          backingPath = getRoundedRectPath(logoX - paddingOffset, logoY - paddingOffset, logoTargetSize + paddingOffset * 2, logoTargetSize + paddingOffset * 2, logoTargetSize * 0.25);
        } else {
          backingPath = `M ${logoX - paddingOffset} ${logoY - paddingOffset} h ${logoTargetSize + paddingOffset * 2} v ${logoTargetSize + paddingOffset * 2} h -${logoTargetSize + paddingOffset * 2} Z`;
        }
        svg += `  <path d="${backingPath}" fill="${logoBgColor}" />\n`;

        // SVG Presets embedding
        if (logoType === "preset") {
          const preset = PRESET_LOGOS[presetLogo];
          if (preset) {
            let logoSvgStr = preset.svg
              .replace(/fill="currentColor"/g, `fill="${preset.color || fgColor}"`)
              .replace("<svg", `<svg x="${logoX.toFixed(2)}" y="${logoY.toFixed(2)}" width="${logoTargetSize.toFixed(2)}" height="${logoTargetSize.toFixed(2)}"`);

            svg += `  ${logoSvgStr}\n`;
          }
        } else if (logoType === "custom" && customLogoFile) {
          // Embed Base64 image
          svg += `  <g>\n`;
          if (logoShape === SHAPE.CIRCLE) {
            svg += `    <clipPath id="logo-clip">\n      <circle cx="${size / 2}" cy="${size / 2}" r="${logoTargetSize / 2}" />\n    </clipPath>\n`;
            svg += `    <image href="${customLogoFile}" x="${logoX.toFixed(2)}" y="${logoY.toFixed(2)}" width="${logoTargetSize.toFixed(2)}" height="${logoTargetSize.toFixed(2)}" clip-path="url(#logo-clip)" />\n`;
          } else if (logoShape === SHAPE.ROUNDED) {
            svg += `    <clipPath id="logo-clip">\n      <rect x="${logoX.toFixed(2)}" y="${logoY.toFixed(2)}" width="${logoTargetSize.toFixed(2)}" height="${logoTargetSize.toFixed(2)}" rx="${(logoTargetSize * 0.2).toFixed(2)}" ry="${(logoTargetSize * 0.2).toFixed(2)}" />\n    </clipPath>\n`;
            svg += `    <image href="${customLogoFile}" x="${logoX.toFixed(2)}" y="${logoY.toFixed(2)}" width="${logoTargetSize.toFixed(2)}" height="${logoTargetSize.toFixed(2)}" clip-path="url(#logo-clip)" />\n`;
          } else {
            svg += `    <image href="${customLogoFile}" x="${logoX.toFixed(2)}" y="${logoY.toFixed(2)}" width="${logoTargetSize.toFixed(2)}" height="${logoTargetSize.toFixed(2)}" />\n`;
          }
          svg += `  </g>\n`;
        }
      }

      svg += `</svg>`;
      return svg;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  // Download QR Code as PNG
  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Redraw at export resolution
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = qrSize;
    tempCanvas.height = qrSize;
    const tempCtx = tempCanvas.getContext("2d");

    // Copy drawing from high-res canvas
    tempCtx.drawImage(canvas, 0, 0, qrSize, qrSize);

    const dataURL = tempCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `qrcode-${activeTab}-${qrSize}x${qrSize}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Scalable Vector Graphics (SVG)
  const downloadSVG = () => {
    const svgStr = generateSVGString();
    if (!svgStr) return;

    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `qrcode-${activeTab}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy SVG string markup to clipboard
  const copySVGMarkup = () => {
    const svgStr = generateSVGString();
    if (!svgStr) return;

    navigator.clipboard.writeText(svgStr).then(() => {
      setCopiedSVG(true);
      setTimeout(() => setCopiedSVG(false), 2000);
    });
  };

  // Copy PNG image direct data URL to clipboard
  const copyImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      try {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      } catch (err) {
        // Fallback for browsers not fully supporting ClipboardItem for images
        const dataURL = canvas.toDataURL("image/png");
        navigator.clipboard.writeText(dataURL).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    }, "image/png");
  };

  const INPUT_TABS = [
    { id: "url", name: "URL / Text", icon: LinkIcon },
    { id: "wifi", name: "Wi-Fi Network", icon: Wifi },
    { id: "vcard", name: "vCard Contact", icon: UserCheck },
    { id: "email", name: "Email Envelope", icon: Mail },
    { id: "sms", name: "SMS Message", icon: MessageSquare },
    { id: "phone", name: "Phone Number", icon: Phone }
  ];

  return (
    <Layout
      title="Interactive QR Code Hub"
      description="Create premium fully-customizable QR codes client-side with radial/linear color gradients, custom corner eyeboxes shapes, and adjustable brand logo inserts."
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              Premium Designer Toolkit
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              QR Code Generator
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Create beautifully customized vectors entirely on your device. High error correction, pixel shape adjustments, brand presets, and high-res vector outputs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-ping" />
              100% Secure & Client-Side
            </span>
          </div>
        </div>

        {/* Input Format Selector Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-200/50 backdrop-blur rounded-2xl border border-slate-200/50 shrink-0 custom-scrollbar-horizontal scroll-smooth">
          {INPUT_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
                  active
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/30 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Main Work Area Splitter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Block - Controls & Options (8 Columns) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Customization Sub-Tabs */}
            <div className="flex border-b border-slate-100 pb-1 gap-6">
              {[
                { id: "content", name: "Content", icon: Sliders },
                { id: "style", name: "Shapes", icon: QrCode },
                { id: "color", name: "Colors", icon: Palette },
                { id: "logo", name: "Logo Overlays", icon: ImageIcon }
              ].map((opt) => {
                const Icon = opt.icon;
                const active = optionTab === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setOptionTab(opt.id)}
                    className={`flex items-center gap-2 pb-3.5 text-sm font-semibold relative transition-colors ${
                      active ? "text-indigo-600" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.name}
                    {active && (
                      <motion.div
                        layoutId="active-opt-tab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sub-Tab Panels */}
            <div className="pt-2">
              <AnimatePresence mode="wait">
                {/* 1. CONTENT INPUTS PANEL */}
                {optionTab === "content" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {activeTab === "url" && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          URL / Plain Text Payload
                        </label>
                        <textarea
                          rows={4}
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="Type or paste any URL (e.g. https://github.com) or custom text here..."
                          className="w-full p-4 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono resize-y"
                        />
                      </div>
                    )}

                    {activeTab === "wifi" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Network SSID (Name)
                            </label>
                            <input
                              type="text"
                              value={wifiSSID}
                              onChange={(e) => setWifiSSID(e.target.value)}
                              placeholder="SSID Name"
                              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Security Type
                            </label>
                            <select
                              value={wifiSecurity}
                              onChange={(e) => setWifiSecurity(e.target.value)}
                              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-500"
                            >
                              <option value="WPA">WPA / WPA2 (Recommended)</option>
                              <option value="WEP">WEP</option>
                              <option value="nopass">None (Open Network)</option>
                            </select>
                          </div>
                        </div>

                        {wifiSecurity !== "nopass" && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Network Password
                            </label>
                            <input
                              type="password"
                              value={wifiPassword}
                              onChange={(e) => setWifiPassword(e.target.value)}
                              placeholder="Network Password"
                              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2.5 pt-1">
                          <input
                            type="checkbox"
                            id="wifi-hidden"
                            checked={wifiHidden}
                            onChange={(e) => setWifiHidden(e.target.checked)}
                            className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <label htmlFor="wifi-hidden" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                            This network SSID is hidden (not broadcasting)
                          </label>
                        </div>
                      </div>
                    )}

                    {activeTab === "email" && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Recipient Address
                          </label>
                          <input
                            type="email"
                            value={emailRecipient}
                            onChange={(e) => setEmailRecipient(e.target.value)}
                            placeholder="recipient@example.com"
                            className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Email Subject
                          </label>
                          <input
                            type="text"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="Hello from DevTools!"
                            className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Message Body
                          </label>
                          <textarea
                            rows={3}
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            placeholder="Write message content here..."
                            className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-y"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "phone" && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Recipient Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phoneNum}
                          onChange={(e) => setPhoneNum(e.target.value)}
                          placeholder="+855 12 345 678"
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {activeTab === "sms" && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Recipient Phone Number
                          </label>
                          <input
                            type="tel"
                            value={smsNum}
                            onChange={(e) => setSmsNum(e.target.value)}
                            placeholder="+855 12 345 678"
                            className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            SMS Message Text
                          </label>
                          <textarea
                            rows={3}
                            value={smsMessage}
                            onChange={(e) => setSmsMessage(e.target.value)}
                            placeholder="Type text message content..."
                            className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-y"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "vcard" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={vcardFirst}
                              onChange={(e) => setVcardFirst(e.target.value)}
                              placeholder="John"
                              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={vcardLast}
                              onChange={(e) => setVcardLast(e.target.value)}
                              placeholder="Doe"
                              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Company / Organization
                            </label>
                            <input
                              type="text"
                              value={vcardOrg}
                              onChange={(e) => setVcardOrg(e.target.value)}
                              placeholder="Acme Corp"
                              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Job Title
                            </label>
                            <input
                              type="text"
                              value={vcardTitle}
                              onChange={(e) => setVcardTitle(e.target.value)}
                              placeholder="Software Architect"
                              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={vcardPhone}
                              onChange={(e) => setVcardPhone(e.target.value)}
                              placeholder="+855 12 345 678"
                              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={vcardEmail}
                              onChange={(e) => setVcardEmail(e.target.value)}
                              placeholder="john.doe@example.com"
                              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Website URL
                          </label>
                          <input
                            type="url"
                            value={vcardUrl}
                            onChange={(e) => setVcardUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Office Address
                          </label>
                          <input
                            type="text"
                            value={vcardAddress}
                            onChange={(e) => setVcardAddress(e.target.value)}
                            placeholder="Preah Monivong Blvd, Phnom Penh"
                            className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 2. STYLE/SHAPES PANEL */}
                {optionTab === "style" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-6"
                  >
                    {/* Module Shape Config */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Body Pixel Shape
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "square", name: "Squares", desc: "Classic block pixels" },
                          { id: "circle", name: "Circles", desc: "Trendy dotted grid" },
                          { id: "rounded", name: "Rounded", desc: "Smooth bubble shape" }
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setModuleShape(m.id)}
                            className={`p-3 border rounded-xl text-left transition-all ${
                              moduleShape === m.id
                                ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                            }`}
                          >
                            <div className="font-semibold text-sm">{m.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Eye Frame Shape Config */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Eye Frame Shape (Outer Ring)
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "square", name: "Sharp Square", desc: "Standard alignment" },
                          { id: "rounded", name: "Smooth Rounded", desc: "Slight corner radius" },
                          { id: "circle", name: "Circular Ring", desc: "Perfect radial circle" }
                        ].map((ef) => (
                          <button
                            key={ef.id}
                            onClick={() => setEyeFrameShape(ef.id)}
                            className={`p-3 border rounded-xl text-left transition-all ${
                              eyeFrameShape === ef.id
                                ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                            }`}
                          >
                            <div className="font-semibold text-sm">{ef.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{ef.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Eye Ball Shape Config */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Eye Ball Shape (Inner Core)
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "square", name: "Sharp Square", desc: "Pure alignment block" },
                          { id: "rounded", name: "Soft Rounded", desc: "Gentle rounded ball" },
                          { id: "circle", name: "Circular Dot", desc: "Perfect inner circle" }
                        ].map((eb) => (
                          <button
                            key={eb.id}
                            onClick={() => setEyeBallShape(eb.id)}
                            className={`p-3 border rounded-xl text-left transition-all ${
                              eyeBallShape === eb.id
                                ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                            }`}
                          >
                            <div className="font-semibold text-sm">{eb.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{eb.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error Correction Level */}
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          Error Correction Level
                          <Info className="w-3.5 h-3.5 text-slate-400" title="Higher level allows scanning even if the QR code is partially damaged or masked by logos" />
                        </label>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                          {errorCorrection === "L" && "Low (7% recovery)"}
                          {errorCorrection === "M" && "Medium (15% recovery)"}
                          {errorCorrection === "Q" && "Quartile (25% recovery)"}
                          {errorCorrection === "H" && "High (30% recovery)"}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "L", name: "Level L" },
                          { id: "M", name: "Level M" },
                          { id: "Q", name: "Level Q" },
                          { id: "H", name: "Level H" }
                        ].map((ec) => (
                          <button
                            key={ec.id}
                            onClick={() => setErrorCorrection(ec.id)}
                            className={`py-2 text-sm font-semibold border rounded-lg transition-all ${
                              errorCorrection === ec.id
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                            }`}
                          >
                            {ec.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. COLORS PANEL */}
                {optionTab === "color" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-6"
                  >
                    {/* Foreground Styling Types */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Foreground Fill Type
                      </label>
                      <div className="flex gap-2">
                        {[
                          { id: "solid", name: "Solid Color" },
                          { id: "gradient", name: "Linear/Radial Gradient" }
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setFgType(t.id)}
                            className={`flex-1 py-2.5 border rounded-xl text-sm font-semibold transition-all ${
                              fgType === t.id
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                            }`}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Pickers */}
                    <div className="space-y-4 border-t border-slate-100 pt-4">
                      {fgType === "solid" ? (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Foreground Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={fgColor}
                              onChange={(e) => setFgColor(e.target.value)}
                              className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer overflow-hidden bg-transparent p-0"
                            />
                            <input
                              type="text"
                              value={fgColor}
                              onChange={(e) => setFgColor(e.target.value)}
                              placeholder="#000000"
                              className="p-3 border border-slate-200 rounded-xl text-sm font-mono w-32 focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Gradient Start
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={fgColor}
                                  onChange={(e) => setFgColor(e.target.value)}
                                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer overflow-hidden p-0"
                                />
                                <input
                                  type="text"
                                  value={fgColor}
                                  onChange={(e) => setFgColor(e.target.value)}
                                  className="p-2 border border-slate-200 rounded-lg text-xs font-mono w-24 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Gradient End
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={fgColor2}
                                  onChange={(e) => setFgColor2(e.target.value)}
                                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer overflow-hidden p-0"
                                />
                                <input
                                  type="text"
                                  value={fgColor2}
                                  onChange={(e) => setFgColor2(e.target.value)}
                                  className="p-2 border border-slate-200 rounded-lg text-xs font-mono w-24 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Gradient Shape
                              </label>
                              <select
                                value={gradientType}
                                onChange={(e) => setGradientType(e.target.value)}
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white"
                              >
                                <option value="linear">Linear Gradient</option>
                                <option value="radial">Radial Circular</option>
                              </select>
                            </div>

                            {gradientType === "linear" && (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Angle
                                  </label>
                                  <span className="text-xs text-indigo-600 font-semibold">{gradientAngle}°</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="360"
                                  value={gradientAngle}
                                  onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                                  className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Background Color Config */}
                    <div className="space-y-4 border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Background Styling
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="bg-trans"
                            checked={bgTransparent}
                            onChange={(e) => setBgTransparent(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 cursor-pointer"
                          />
                          <label htmlFor="bg-trans" className="text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer">
                            Transparent Background
                          </label>
                        </div>
                      </div>

                      {!bgTransparent && (
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer overflow-hidden p-0"
                          />
                          <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            placeholder="#ffffff"
                            className="p-2 border border-slate-200 rounded-lg text-xs font-mono w-28 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 4. LOGO PANEL */}
                {optionTab === "logo" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-6"
                  >
                    {/* Logo Overlay Selector Types */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Logo Center Mode
                      </label>
                      <div className="flex gap-2">
                        {[
                          { id: "none", name: "No Logo" },
                          { id: "preset", name: "Brand Preset" },
                          { id: "custom", name: "Upload Image" }
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setLogoType(m.id);
                              if (m.id === "none") {
                                // Default to L if no logo is active to optimize scan density,
                                // default to H if logo is enabled to safeguard readability
                                setErrorCorrection("L");
                              } else {
                                setErrorCorrection("H");
                              }
                            }}
                            className={`flex-1 py-2.5 border rounded-xl text-sm font-semibold transition-all ${
                              logoType === m.id
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                            }`}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logo Details options */}
                    {logoType === "preset" && (
                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Select Brand Preset
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {Object.entries(PRESET_LOGOS).map(([key, logo]) => {
                            const isSelected = presetLogo === key;
                            return (
                              <button
                                key={key}
                                onClick={() => setPresetLogo(key)}
                                className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                                  isSelected
                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                                }`}
                              >
                                <span dangerouslySetInnerHTML={{ __html: logo.svg }} className="w-5 h-5 block shrink-0" />
                                <span className="text-[10px] font-semibold">{logo.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {logoType === "custom" && (
                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Upload Custom Brand Asset (JPG/PNG)
                        </label>
                        {customLogoFile ? (
                          <div className="flex items-center gap-4 p-3 border border-slate-200 bg-slate-50/50 rounded-2xl">
                            <img src={customLogoFile} alt="Preview Logo" className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-white shadow-sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 truncate">Asset ready for integration</p>
                              <button onClick={removeCustomLogo} className="text-xs text-rose-500 font-bold hover:underline mt-0.5">
                                Delete Asset
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-sm font-semibold text-slate-600">Select image file</span>
                            <span className="text-[10px] text-slate-400 mt-1">Recommended square dimension, up to 2MB</span>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    )}

                    {logoType !== "none" && (
                      <div className="space-y-4 border-t border-slate-100 pt-4">
                        {/* Sizing Slider */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Logo Dimension Ratio
                            </label>
                            <span className="text-xs text-indigo-600 font-semibold">{logoSize}%</span>
                          </div>
                          <input
                            type="range"
                            min="15"
                            max="30"
                            value={logoSize}
                            onChange={(e) => setLogoSize(parseInt(e.target.value))}
                            className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Shape selectors */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Logo Framing Shape
                            </label>
                            <select
                              value={logoShape}
                              onChange={(e) => setLogoShape(e.target.value)}
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                            >
                              <option value="circle">Circular</option>
                              <option value="rounded">Rounded Box</option>
                              <option value="square">Sharp Square</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Frame Background
                            </label>
                            <input
                              type="color"
                              value={logoBgColor}
                              onChange={(e) => setLogoBgColor(e.target.value)}
                              className="w-full h-8.5 rounded-lg border border-slate-200 cursor-pointer overflow-hidden p-0"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Clear Behind Pixels
                            </label>
                            <div className="flex items-center h-8.5 pl-1.5">
                              <input
                                type="checkbox"
                                id="logo-mask"
                                checked={logoMask}
                                onChange={(e) => setLogoMask(e.target.checked)}
                                className="w-4.5 h-4.5 text-indigo-600 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Block - Live Rendering Box & Downloads (5 Columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-between h-full space-y-6">
            {/* Showroom visual frame with interactive glow */}
            <div className="relative group w-full flex items-center justify-center p-6 bg-slate-100/70 border border-slate-200/50 rounded-2xl overflow-hidden aspect-square">
              {/* Background gradient grid highlights */}
              <div className="absolute inset-0 z-0 bg-grid-slate-100 opacity-20 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

              <div className="relative z-10 w-full max-w-[260px] aspect-square rounded-2xl bg-white p-4 shadow-xl border border-slate-200/30 group-hover:-translate-y-1 transition-all duration-300">
                <canvas ref={canvasRef} className="w-full h-full object-contain rounded-lg" />
                {loading && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Layout Options Controls */}
            <div className="w-full space-y-4">
              {/* Export Dimension Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Export Resolution</span>
                  <span className="text-indigo-600 font-bold">{qrSize} × {qrSize} px</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[256, 512, 1024, 2048].map((size) => (
                    <button
                      key={size}
                      onClick={() => setQrSize(size)}
                      className={`py-1.5 text-xs font-bold border rounded-lg transition-all ${
                        qrSize === size
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-500"
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={downloadPNG}
                  className="px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  Download PNG
                </button>
                <button
                  onClick={downloadSVG}
                  className="px-4 py-3 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download SVG
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={copyImage}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[11px] font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied PNG!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copy PNG Image
                    </>
                  )}
                </button>
                <button
                  onClick={copySVGMarkup}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[11px] font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedSVG ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied SVG!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copy SVG Markup
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="border-t border-slate-200 pt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Dynamic Rendering System</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time high-fidelity Canvas updates ensure all curves, dots, and eyeball alignments recalculate instantly as you adjust dimensions or values.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Gradient-Mapping Fills</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Inject modern digital vibes. Map dual-color gradients in linear or radial layouts with custom angle offsets across the entire grid module.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">VCard & vCal Standard Compatibility</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generated code adheres fully to standard parsing specifications for Wi-Fi tags, mailto structures, and vCard schema formats for perfect hardware detection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
