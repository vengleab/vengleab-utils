import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Calendar as CalendarIcon, TrendingUp, PieChart } from 'lucide-react';
import moment from 'moment';
import FormatNumber from 'format-number';
import Layout from '../../components/Layout';
import PageContext from '../../contexts/page';
import { PAGE } from '../../constants/PageURL';
import InputMast from '../../components/InputMask';

const TERM = {
  MONTHLY: 'month',
  YEARLY: 'year',
};
const DollarFormatter = FormatNumber({ prefix: '$ ', round: 2 });

function EMICalculator({
  principle, monthlyRate, totalMonths,
}) {
  return (principle * monthlyRate * (1 + monthlyRate) ** totalMonths) / ((1 + monthlyRate) ** totalMonths - 1);
}

function getTotalMonths(period, term) {
  return (term === TERM.MONTHLY ? period : period * 12);
}

function getMonthRate(rate, term) {
  return (term === TERM.MONTHLY ? rate : rate / 12);
}

function toOrdinalNumber(number) {
  switch (number) {
    case 1:
      return '1st';
    case 2:
      return '2nd';
    default:
      return `${number}th`;
  }
}

function generatePaymentTable({
  principle, emi, monthlyRate, totalMonths,
}) {
  let remain = principle;
  const table = [];
  for (let month = 0; month < totalMonths; month++) {
    const interest = remain * monthlyRate;
    const row = {
      principle: remain,
      remain: (remain -= emi - interest),
      interest,
    };
    table.push(row);
  }
  return table;
}

const MetricCard = ({ icon, label, value, className = 'bg-white border-slate-200 text-slate-800' }) => (
  <div className={`rounded-xl p-5 border shadow-sm flex flex-col justify-between items-start space-y-4 ${className}`}>
    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mix-blend-luminosity">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium opacity-80 uppercase tracking-tight mb-1">{label}</p>
      <h4 className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</h4>
    </div>
  </div>
);

export default function LoadCalculator() {
  const [principle, setPrinciple] = useState();
  const [rate, setRate] = useState();
  const [period, setPeriod] = useState();
  const [term, setTerm] = useState(TERM.YEARLY);
  const totalMonths = getTotalMonths(period, term);
  const monthlyRate = getMonthRate(rate, term) / 100;
  const emi = EMICalculator({ principle, monthlyRate, totalMonths });
  const [startPayingDate, setStartPayingDate] = useState(new Date());

  const schedule = !Number.isNaN(emi) && emi !== Infinity && principle > 0 ? generatePaymentTable({
    principle,
    monthlyRate,
    emi,
    totalMonths,
  }) : [];

  return (
    <PageContext.Provider value={{ activeItem: PAGE.LOAN_CALCULATOR }}>
      <Layout title="Loan Calculator">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 lg:mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">EMI Loan Calculator</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">EMI (Equated monthly installment) Calculator for Home Loan, Car Loan & Personal Loan</p>
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
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
                
                <div className="space-y-6">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Principle ( Loan amount )</label>
                    <InputMast
                      mask={{ prefix: '$ ', allowDecimal: true }}
                      value={principle}
                      onChange={setPrinciple}
                      placeholder="Amount you take from Finance institute"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Rate (%)</label>
                    <div className="flex items-stretch rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/20 h-11">
                      <InputMast
                        mask={{ prefix: '', suffix: ' %', allowDecimal: true }}
                        value={rate}
                        onChange={setRate}
                        placeholder="Year / Monthly Rate"
                        className="flex-1 px-4 text-sm bg-transparent outline-none"
                      />
                      <select 
                        className="bg-slate-50 pl-3 pr-8 py-0 border-0 border-l border-slate-200 text-sm text-slate-600 font-medium focus:ring-0 outline-none cursor-pointer h-full"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                      >
                        <option value={TERM.YEARLY}>YEARLY</option>
                        <option value={TERM.MONTHLY}>MONTHLY</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Period ( Years / Months )</label>
                    <InputMast
                      value={period}
                      onChange={setPeriod}
                      placeholder="Total Period"
                      mask={{
                        prefix: '',
                        suffix: ` ${term}`,
                        allowDecimal: true,
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Start Date ( Optional )</label>
                    <input 
                      type="date"
                      value={moment(startPayingDate).format('YYYY-MM-DD')}
                      onChange={(e) => setStartPayingDate(new Date(e.target.value))}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
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
                  icon={<DollarSign className="w-5 h-5 text-indigo-600" />}
                  label="Monthly payment"
                  value={!Number.isNaN(emi) && emi !== Infinity && principle > 0 ? DollarFormatter(emi) : '--'}
                />
                <MetricCard
                  icon={<CalendarIcon className="w-5 h-5 text-blue-600" />}
                  label="Total months"
                  value={!Number.isNaN(emi) && emi !== Infinity && principle > 0 ? totalMonths.toString() : '--'}
                />
                <MetricCard
                    icon={<TrendingUp className="w-5 h-5 text-rose-600" />}
                    label="Total Interest"
                    value={!Number.isNaN(emi) && emi !== Infinity && principle > 0 ? DollarFormatter(schedule.reduce((acc, row) => acc + row.interest, 0)) : '--'}
                />
                <MetricCard
                    icon={<PieChart className="w-5 h-5 text-slate-100" />}
                    label="Total Payment (Principal + Interest)"
                    value={!Number.isNaN(emi) && emi !== Infinity && principle > 0 ? DollarFormatter(totalMonths * emi) : '--'}
                    className="bg-slate-900 border-slate-800 text-white sm:col-span-2"
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
                  <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Amortization Schedule</h3>
              </div>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
                  {schedule.length} Payments
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left whitespace-nowrap min-w-[800px]">
                <thead className="bg-[#1e1e1e] text-slate-300 font-semibold border-b border-[#2d2d2d]">
                  <tr className="text-center">
                    <th className="px-6 py-4"># No (payment)</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Remaining</th>
                    <th className="px-6 py-4">Monthly payment</th>
                    <th className="px-6 py-4">Principle</th>
                    <th className="px-6 py-4">Interest</th>
                    <th className="px-6 py-4">Remain Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2d2d] bg-[#1a1a1a] font-mono text-xs text-slate-300 text-center">
                  {schedule.length > 0 ? schedule.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#252525] transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-200">
                        {toOrdinalNumber(idx + 1)} ({toOrdinalNumber(Math.ceil((idx + 1) / 12))} year)
                      </td>
                      <td className="px-6 py-3">
                        {moment(startPayingDate).add(idx, 'months').format('DD MMM YYYY')}
                      </td>
                      <td className="px-6 py-3">
                        {DollarFormatter(row.principle)}
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-100">
                        {DollarFormatter(emi)}
                      </td>
                      <td className="px-6 py-3 opacity-80">
                        {DollarFormatter(emi - row.interest)}
                      </td>
                      <td className="px-6 py-3 opacity-80">
                        {DollarFormatter(row.interest)}
                      </td>
                      <td className="px-6 py-3 font-medium">
                        {DollarFormatter(row.remain)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-sans text-sm bg-white">
                          Enter a valid loan amount and period to view the schedule.
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
