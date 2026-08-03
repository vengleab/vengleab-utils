import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PiggyBank,
  DollarSign,
  Calendar as CalendarIcon,
  TrendingUp,
  Wallet,
  Coins
} from "lucide-react";
import moment from "moment";
import FormatNumber from "format-number";
import Layout from "../../components/Layout";
import PageContext from "../../contexts/page";
import { PAGE } from "../../constants/PageURL";
import InputMask from "../../components/InputMask";
import DatePicker from "../../components/DatePicker";

const RATE_TERM = {
  YEARLY: "yearly",
  MONTHLY: "monthly"
};

const PERIOD_UNIT = {
  YEARS: "years",
  MONTHS: "months"
};

const INTEREST_PAYOUT = {
  END_OF_MONTH: "end_of_month",
  END_OF_MATURITY: "end_of_maturity"
};

const DollarFormatter = FormatNumber({ prefix: "$ ", round: 2 });

function getTotalMonths(period, periodUnit) {
  if (!period || Number.isNaN(Number(period))) return 0;
  const numericPeriod = Number(period);
  return periodUnit === PERIOD_UNIT.MONTHS
    ? Math.round(numericPeriod)
    : Math.round(numericPeriod * 12);
}

function getMonthlyRate(rate, rateTerm) {
  if (!rate || Number.isNaN(Number(rate))) return 0;
  const numericRate = Number(rate);
  return (rateTerm === RATE_TERM.MONTHLY ? numericRate : numericRate / 12) / 100;
}

function toOrdinalNumber(number) {
  switch (number) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    case 3:
      return "3rd";
    default:
      return `${number}th`;
  }
}

function generateSavingsSchedule({
  initialDeposit = 0,
  monthlyDeposit = 0,
  monthlyRate = 0,
  totalMonths = 0,
  interestPayout = INTEREST_PAYOUT.END_OF_MONTH
}) {
  const initDep = Number(initialDeposit) || 0;
  const mDep = Number(monthlyDeposit) || 0;
  const mRate = Number(monthlyRate) || 0;
  const months = Number(totalMonths) || 0;

  if (months <= 0 || (initDep <= 0 && mDep <= 0)) {
    return [];
  }

  const schedule = [];
  let accumulatedInterest = 0;

  if (interestPayout === INTEREST_PAYOUT.END_OF_MONTH) {
    // Interest calculated & compounded monthly
    let currentBalance = initDep;
    for (let month = 1; month <= months; month++) {
      const startBalance = currentBalance;
      const balanceBeforeInterest = startBalance + mDep;
      const interestEarned = balanceBeforeInterest * mRate;
      currentBalance = balanceBeforeInterest + interestEarned;
      accumulatedInterest += interestEarned;

      schedule.push({
        month,
        startBalance,
        deposit: mDep,
        interestEarned,
        totalInterest: accumulatedInterest,
        endBalance: currentBalance
      });
    }
  } else {
    // Interest paid at end of maturity (simple interest on deposited principal)
    let currentPrincipal = initDep;
    for (let month = 1; month <= months; month++) {
      const startBalance = currentPrincipal;
      currentPrincipal += mDep;
      const interestEarned = currentPrincipal * mRate;
      accumulatedInterest += interestEarned;
      const endBalance = currentPrincipal + accumulatedInterest;

      schedule.push({
        month,
        startBalance,
        deposit: mDep,
        interestEarned,
        totalInterest: accumulatedInterest,
        endBalance
      });
    }
  }

  return schedule;
}

const MetricCard = ({
  icon,
  label,
  value,
  className = "bg-white border-slate-200 text-slate-800"
}) => (
  <div
    className={`rounded-xl p-5 border shadow-sm flex flex-col justify-between items-start space-y-4 ${className}`}
  >
    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mix-blend-luminosity">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium opacity-80 uppercase tracking-tight mb-1">
        {label}
      </p>
      <h4 className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</h4>
    </div>
  </div>
);

export default function SavingsPlanCalculator() {
  const [initialDeposit, setInitialDeposit] = useState();
  const [monthlyDeposit, setMonthlyDeposit] = useState();
  const [rate, setRate] = useState();
  const [rateTerm, setRateTerm] = useState(RATE_TERM.YEARLY);
  const [period, setPeriod] = useState();
  const [periodUnit, setPeriodUnit] = useState(PERIOD_UNIT.YEARS);
  const [interestPayout, setInterestPayout] = useState(INTEREST_PAYOUT.END_OF_MONTH);
  const [startDate, setStartDate] = useState(new Date());

  const totalMonths = getTotalMonths(period, periodUnit);
  const monthlyRate = getMonthlyRate(rate, rateTerm);

  const schedule = generateSavingsSchedule({
    initialDeposit,
    monthlyDeposit,
    monthlyRate,
    totalMonths,
    interestPayout
  });

  const lastRow = schedule.length > 0 ? schedule[schedule.length - 1] : null;
  const totalBalance = lastRow ? lastRow.endBalance : null;
  const totalInterest = lastRow ? lastRow.totalInterest : null;
  const totalDeposited = schedule.length > 0
    ? (Number(initialDeposit) || 0) + (Number(monthlyDeposit) || 0) * totalMonths
    : null;

  return (
    <PageContext.Provider value={{ activeItem: PAGE.SAVINGS_PLAN }}>
      <Layout title="Savings Plan Calculator">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 lg:mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Monthly Deposit Savings Plan Calculator
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Calculate future wealth, compound interest growth, and monthly deposit investment schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
            {/* Inputs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="xl:col-span-5"
            >
              <div className="bg-slate-200/50 rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 lg:p-7 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

                <div className="space-y-6">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Initial Deposit / Starting Balance
                    </label>
                    <InputMask
                      mask={{ prefix: "$ ", allowDecimal: true }}
                      value={initialDeposit}
                      onChange={setInitialDeposit}
                      placeholder="Optional lump sum starting amount"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Monthly Deposit Amount
                    </label>
                    <InputMask
                      mask={{ prefix: "$ ", allowDecimal: true }}
                      value={monthlyDeposit}
                      onChange={setMonthlyDeposit}
                      placeholder="Regular amount saved every month"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Interest Rate (%)
                    </label>
                    <div className="flex items-stretch rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 h-11">
                      <InputMask
                        mask={{ prefix: "", suffix: " %", allowDecimal: true }}
                        value={rate}
                        onChange={setRate}
                        placeholder="Interest rate"
                        className="flex-1 px-4 text-sm bg-transparent outline-none"
                      />
                      <select
                        className="bg-slate-50 pl-3 pr-8 py-0 border-0 border-l border-slate-200 text-sm text-slate-600 font-medium focus:ring-0 outline-none cursor-pointer h-full"
                        value={rateTerm}
                        onChange={(e) => setRateTerm(e.target.value)}
                      >
                        <option value={RATE_TERM.YEARLY}>YEARLY</option>
                        <option value={RATE_TERM.MONTHLY}>MONTHLY</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Savings Period
                    </label>
                    <div className="flex items-stretch rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 h-11">
                      <InputMask
                        value={period}
                        onChange={setPeriod}
                        placeholder="Total duration"
                        mask={{
                          prefix: "",
                          suffix: ` ${periodUnit}`,
                          allowDecimal: true
                        }}
                        className="flex-1 px-4 text-sm bg-transparent outline-none"
                      />
                      <select
                        className="bg-slate-50 pl-3 pr-8 py-0 border-0 border-l border-slate-200 text-sm text-slate-600 font-medium focus:ring-0 outline-none cursor-pointer h-full uppercase"
                        value={periodUnit}
                        onChange={(e) => setPeriodUnit(e.target.value)}
                      >
                        <option value={PERIOD_UNIT.YEARS}>YEARS</option>
                        <option value={PERIOD_UNIT.MONTHS}>MONTHS</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Interest Payment
                    </label>
                    <select
                      value={interestPayout}
                      onChange={(e) => setInterestPayout(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 font-medium cursor-pointer"
                    >
                      <option value={INTEREST_PAYOUT.END_OF_MONTH}>End of Month</option>
                      <option value={INTEREST_PAYOUT.END_OF_MATURITY}>End of Maturity</option>
                    </select>
                  </div>

                  <DatePicker
                    label="Start Date ( Optional )"
                    value={startDate}
                    onChange={(val) => setStartDate(val ? new Date(val) : new Date())}
                    focusRingClass="focus:ring-emerald-500/20"
                    className="h-11 focus:border-emerald-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Summary Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="xl:col-span-7"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <MetricCard
                  icon={<Wallet className="w-5 h-5 text-slate-100" />}
                  label="Total Future Value (Maturity Amount)"
                  value={totalBalance !== null ? DollarFormatter(totalBalance) : "--"}
                  className="bg-slate-900 border-slate-800 text-white sm:col-span-2"
                />
                <MetricCard
                  icon={<Coins className="w-5 h-5 text-emerald-600" />}
                  label="Total Principal Deposited"
                  value={totalDeposited !== null ? DollarFormatter(totalDeposited) : "--"}
                />
                <MetricCard
                  icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
                  label="Total Interest Earned"
                  value={totalInterest !== null ? DollarFormatter(totalInterest) : "--"}
                />
                <MetricCard
                  icon={<CalendarIcon className="w-5 h-5 text-blue-600" />}
                  label="Total Months"
                  value={totalMonths > 0 && schedule.length > 0 ? `${totalMonths} months` : "--"}
                />
                <MetricCard
                  icon={<DollarSign className="w-5 h-5 text-teal-600" />}
                  label="Monthly Deposit"
                  value={monthlyDeposit ? DollarFormatter(monthlyDeposit) : "--"}
                />
              </div>
            </motion.div>
          </div>

          {/* Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 lg:mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Savings Growth Schedule
                </h3>
              </div>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
                {schedule.length} Months
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left whitespace-nowrap min-w-[800px]">
                <thead className="bg-[#1e1e1e] text-slate-300 font-semibold border-b border-[#2d2d2d]">
                  <tr className="text-center">
                    <th className="px-6 py-4"># Month</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Start Balance</th>
                    <th className="px-6 py-4">Monthly Deposit</th>
                    <th className="px-6 py-4">Interest Earned</th>
                    <th className="px-6 py-4">Total Interest</th>
                    <th className="px-6 py-4">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2d2d] bg-[#1a1a1a] font-mono text-xs text-slate-300 text-center">
                  {schedule.length > 0 ? (
                    schedule.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-[#252525] transition-colors"
                      >
                        <td className="px-6 py-3 font-medium text-slate-200">
                          {toOrdinalNumber(row.month)} (
                          {toOrdinalNumber(Math.ceil(row.month / 12))} year)
                        </td>
                        <td className="px-6 py-3">
                          {moment(startDate)
                            .add(idx, "months")
                            .format("DD MMM YYYY")}
                        </td>
                        <td className="px-6 py-3 opacity-80">
                          {DollarFormatter(row.startBalance)}
                        </td>
                        <td className="px-6 py-3 font-semibold text-emerald-400">
                          {DollarFormatter(row.deposit)}
                        </td>
                        <td className="px-6 py-3 opacity-80 text-indigo-300">
                          {DollarFormatter(row.interestEarned)}
                        </td>
                        <td className="px-6 py-3 opacity-80">
                          {DollarFormatter(row.totalInterest)}
                        </td>
                        <td className="px-6 py-3 font-medium text-slate-100">
                          {DollarFormatter(row.endBalance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-slate-500 font-sans text-sm bg-white"
                      >
                        Enter deposit amount, rate, and period to view the savings schedule.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
