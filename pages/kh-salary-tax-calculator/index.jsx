import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Receipt, DollarSign } from 'lucide-react';
import FormatNumber from "format-number";
import InputMast from "../../components/InputMask";
import Layout from "../../components/Layout";
import PageContext from "../../contexts/page";
import { PAGE } from "../../constants/PageURL";

const DollarFormatter = FormatNumber({ prefix: "$ ", round: 2 });

export default function CambodiaGrossSalary() {
  const [net, setNetSalary] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(4000);

  function calculateGrossSalary(netSalary) {
    if (Number.isNaN(netSalary) || netSalary <= 0 || exchangeRate <= 0) {
      return 0;
    }

    const brackets = [
      { limit: 1500000 / exchangeRate, rate: 0 },
      { limit: 2000000 / exchangeRate, rate: 0.05 },
      { limit: 8500000 / exchangeRate, rate: 0.1 },
      { limit: 12500000 / exchangeRate, rate: 0.15 },
      { limit: Infinity, rate: 0.2 }
    ];

    let cumulativeTax = 0;
    let lastNetMax = 0;
    let prevLimit = 0;
    for (let i = 0; i < brackets.length; i += 1) {
      const { limit, rate } = brackets[i];
      const currentRangeTaxable = (limit - prevLimit) * rate;
      const updatedCumulativeTax = currentRangeTaxable + cumulativeTax;
      const currentNetMax = limit - updatedCumulativeTax;

      if (
        netSalary > lastNetMax &&
        (netSalary <= currentNetMax || limit === Infinity)
      ) {
        const currentTaxable = (netSalary - lastNetMax) / (1 - rate);
        return currentTaxable + prevLimit;
      }

      prevLimit = limit;
      cumulativeTax = updatedCumulativeTax;
      lastNetMax = currentNetMax;
    }
    return 0;
  }

  const grossSalary = calculateGrossSalary(net);

  const MetricCard = ({ icon, label, value, className = 'bg-white border-slate-200 text-slate-800' }) => (
    <div className={`rounded-xl p-5 border shadow-sm flex flex-col justify-between items-start space-y-4 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-slate-100/50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium opacity-80 uppercase tracking-tight mb-1">{label}</p>
        <h4 className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</h4>
      </div>
    </div>
  );

  return (
    <PageContext.Provider value={{ activeItem: PAGE.KH_SALARY_TAX_CALCULATOR }}>
      <Layout title="Cambodia Gross Salary">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Cambodia Gross Salary</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">Calculate Gross Salary from your expected Net Salary (Reverse Tax).</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
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
                    <label className="text-sm font-semibold text-slate-700">Expected Net Salary</label>
                    <InputMast
                      mask={{ prefix: "$ ", allowDecimal: true }}
                      onChange={setNetSalary}
                      value={net}
                      placeholder="Amount you expect from your employer"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Exchange Rate</label>
                    <InputMast
                      mask={{ prefix: "KHR " }}
                      value={exchangeRate || 0}
                      onChange={setExchangeRate}
                      placeholder="Exchange Rate"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="xl:col-span-7"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <MetricCard
                  icon={<Banknote className="w-5 h-5 text-emerald-600" />}
                  label="Gross Salary"
                  value={!Number.isNaN(grossSalary) ? DollarFormatter(grossSalary) : "--"}
                />
                 <MetricCard
                   icon={<Receipt className="w-5 h-5 text-rose-600" />}
                   label="Total Tax"
                   value={!Number.isNaN(net) && !Number.isNaN(grossSalary) ? DollarFormatter(grossSalary - net) : "--"}
                />
                <MetricCard
                    icon={<DollarSign className="w-5 h-5 text-slate-100" />}
                    label="Net Salary"
                    value={!Number.isNaN(net) ? DollarFormatter(net) : "--"}
                    className="bg-slate-900 border-slate-800 text-white sm:col-span-2"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
