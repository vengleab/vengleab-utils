import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';
import JsonViewer from '../components/JsonViewer';
import JSONBeautifierStorage from '../utils/storage/JSON';

export default function JSONBeautifier() {
  const [JSONText, setJSONText] = useState('');

  useEffect(() => {
    setJSONText(JSONBeautifierStorage.get('JSONText'));
  });

  function handleTextChange(e) {
    const { value } = e.target;
    setJSONText(value);
    JSONBeautifierStorage.set('JSONText', value);
  }

  let json;
  try {
    json = JSON.parse(JSONText);
  } catch (error) {
    json = {};
  }
  
  return (
    <PageContext.Provider value={{ activeItem: PAGE.JSON_BEAUTIFIER }}>
      <Layout title="JSON Beautifier">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">JSON Beautifier</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">Format, validate and beautify your JSON data.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 lg:p-7 relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-800 mb-3 block">Input JSON string</label>
              <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/20">
                <textarea
                   value={JSONText}
                   onChange={handleTextChange}
                   name="text"
                   placeholder="Please enter json"
                   className="w-full min-h-[200px] p-4 font-mono text-sm outline-none resize-y text-slate-900 bg-transparent placeholder:text-slate-400"
                   spellCheck={false}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-800 mb-3 block">Formatted Result</label>
              <div className="bg-[#1e1e1e] rounded-xl shadow-inner border border-[#2d2d2d] overflow-hidden min-h-[300px] p-5 custom-scrollbar overflow-auto">
                <JsonViewer json={json} />
              </div>
            </div>

          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
