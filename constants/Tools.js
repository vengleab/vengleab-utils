import {
  Code,
  Hash,
  Type,
  Calculator,
  CalendarDays,
  Key,
  Users,
  Regex,
  Keyboard,
  Monitor,
  QrCode,
  Sparkles,
  Table
} from "lucide-react";

export const TOOLS = [
  {
    id: "json_beautifier",
    name: "JSON Beautifier",
    description: "Format, validate and beautify your JSON data instantly.",
    icon: Code,
    color: "text-amber-600",
    bg: "bg-amber-100/50",
    border: "hover:border-amber-500/30 group-hover:shadow-amber-500/10"
  },
  {
    id: "base_64_encode_decoder",
    name: "Base64 Encoder",
    description:
      "Encode and decode Base64 strings with a developer-friendly interface.",
    icon: Hash,
    color: "text-indigo-600",
    bg: "bg-indigo-100/50",
    border: "hover:border-indigo-500/30 group-hover:shadow-indigo-500/10"
  },
  {
    id: "str_len",
    name: "String Length",
    description: "Real-time string character counting utility.",
    icon: Type,
    color: "text-blue-600",
    bg: "bg-blue-100/50",
    border: "hover:border-blue-500/30 group-hover:shadow-blue-500/10"
  },
  {
    id: "emi",
    name: "EMI Calculator",
    description: "Calculate Equated Monthly Installments for various loans.",
    icon: Calculator,
    color: "text-teal-600",
    bg: "bg-teal-100/50",
    border: "hover:border-teal-500/30 group-hover:shadow-teal-500/10"
  },
  {
    id: "kh_tax",
    name: "Salary Tax Calc",
    description:
      "Reverse calculate gross salary from expected net income in Cambodia.",
    icon: CalendarDays,
    color: "text-emerald-600",
    bg: "bg-emerald-100/50",
    border: "hover:border-emerald-500/30 group-hover:shadow-emerald-500/10"
  },
  {
    id: "password_generator",
    name: "Password Gen",
    description: "Generate secure, random passwords with custom requirements.",
    icon: Key,
    color: "text-purple-600",
    bg: "bg-purple-100/50",
    border: "hover:border-purple-500/30 group-hover:shadow-purple-500/10"
  },
  {
    id: "random_group_generator",
    name: "Random & Grouping",
    description: "Split lists into random groups or pick winners easily.",
    icon: Users,
    color: "text-rose-600",
    bg: "bg-rose-100/50",
    border: "hover:border-rose-500/30 group-hover:shadow-rose-500/10"
  },
  {
    id: "regex_tester",
    name: "RegEx Tester",
    description: "Validate and test regular expressions in real-time with visual match highlighting and capture group details.",
    icon: Regex,
    color: "text-sky-600",
    bg: "bg-sky-100/50",
    border: "hover:border-sky-500/30 group-hover:shadow-sky-500/10"
  },
  {
    id: "keyboard_tester",
    name: "Keyboard Tester",
    description: "Test keyboard keys, multi-key rollover (NKRO), and synthesized mechanical switches.",
    icon: Keyboard,
    color: "text-amber-500",
    bg: "bg-amber-100/50",
    border: "hover:border-amber-500/30 group-hover:shadow-amber-500/10"
  },
  {
    id: "display_color_tester",
    name: "Display Tester",
    description: "Calibrate screens, detect dead pixels, test contrast limits, and check screen backlight bleeding.",
    icon: Monitor,
    color: "text-rose-500",
    bg: "bg-rose-100/50",
    border: "hover:border-rose-500/30 group-hover:shadow-rose-500/10"
  },
  {
    id: "qr_code_generator",
    name: "QR Code Gen",
    description: "Generate and customize QR codes with solid/gradient fills, unique eyeball shapes, and custom logo inserts.",
    icon: QrCode,
    color: "text-violet-600",
    bg: "bg-violet-100/50",
    border: "hover:border-violet-500/30 group-hover:shadow-violet-500/10"
  },
  {
    id: "lucky_draw",
    name: "Lucky Draw",
    description: "Spin wheels, shake mystery boxes, or scratch cards to pick winners dynamically with elegant synthesized sound and confetti.",
    icon: Sparkles,
    color: "text-amber-600",
    bg: "bg-amber-100/50",
    border: "hover:border-amber-500/30 group-hover:shadow-amber-500/10"
  },
  {
    id: "table_converter",
    name: "Table Converter",
    description: "Convert seamlessly between HTML tables, CSV (comma-separated), and TSV (tab-separated) data with live preview and editing.",
    icon: Table,
    color: "text-cyan-600",
    bg: "bg-cyan-100/50",
    border: "hover:border-cyan-500/30 group-hover:shadow-cyan-500/10"
  },
  {
    id: "day_count",
    name: "Day Count",
    description: "Calculate days between dates, adjust dates, and track custom countdowns/milestones with local storage.",
    icon: CalendarDays,
    color: "text-violet-600",
    bg: "bg-violet-100/50",
    border: "hover:border-violet-500/30 group-hover:shadow-violet-500/10"
  }
];

