import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Receipt, DollarSign } from 'lucide-react';
import FormatNumber from "format-number";
import InputMast from "../../components/InputMask";
import Layout from "../../components/Layout";
import PageContext from "../../contexts/page";
import { PAGE } from "../../constants/PageURL";

const DollarFormatter = FormatNumber({ prefix: "$ ", round: 2 });

export default function CambodiaNetSalary() {
  const [net, setNetSalary] = useState(0);
  const [grossSalary, setGrossSalary] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(4000);

  const brackets = [
    { limit: 1500000 / exchangeRate, rate: 0 },
    { limit: 2000000 / exchangeRate, rate: 0.05 },
    { limit: 8500000 / exchangeRate, rate: 0.1 },
    { limit: 12500000 / exchangeRate, rate: 0.15 },
    { limit: Infinity, rate: 0.2 }
  ];

  function calculateNetSalary(grossSalary) {
    let netSalary = grossSalary;
    let prevLimit = 0;
    for (let i = 0; i < brackets.length; i += 1) {
      const { limit, rate } = brackets[i];

      if (grossSalary > prevLimit) {
        if (grossSalary > limit) {
          const tax = (limit - prevLimit) * rate;
          netSalary -= tax;
        } else {
          const tax = (grossSalary - prevLimit) * rate;
          netSalary -= tax;
          return netSalary; // Return here if grossSalary is within the current bracket
        }
      } else {
        return netSalary; // Return here if grossSalary is within previous brackets
      }
      prevLimit = limit;
    }
    return netSalary; // Should return the correct netSalary after all tax deductions
  }

  useEffect(() => {
    setNetSalary(calculateNetSalary(grossSalary));
  }, [grossSalary, exchangeRate]);

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
    <PageContext.Provider value={{ activeItem: PAGE.KH_SALARY_TAX_CALCULATOR_GROSS }}>
      <Layout title="Cambodia Net Salary">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Cambodia Net Salary</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">Calculate Net Salary from your Gross Salary (Direct Tax).</p>
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
                    <label className="text-sm font-semibold text-slate-700">Gross Salary</label>
                    <InputMast
                      mask={{ prefix: "$ ", allowDecimal: true }}
                      onChange={setGrossSalary}
                      value={grossSalary}
                      placeholder="Amount you expect from your employer"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Exchange Rate</label>
                    <InputMast
                      mask={{ prefix: "KHR " }}
                      value={exchangeRate || 0}
                      onChange={setExchangeRate}
                      placeholder="Exchange Rate"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
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
