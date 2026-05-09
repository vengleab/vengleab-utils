import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';
import { encodeToBase64, decodeToBase64 } from '../utils/base64';
import Base64Storage from '../utils/storage/Base64';

export default function Base64Decoder() {
  const [text, setText] = useState('');
  const [encode, setEncode] = useState('');

  function textUpdate(value) {
    const val = value || '';
    setText(val);
    Base64Storage.set('text', val);
    setEncode(encodeToBase64(val));
  }

  useEffect(() => {
    textUpdate(Base64Storage.get('text'));
  }, []);

  function handleTextChange(e) {
    const { value } = e.target;
    textUpdate(value);
  }

  function handleDecodeBase64(e) {
    const { value } = e.target;
    const txt = decodeToBase64(value);
    textUpdate(txt);
    setEncode(value); // Keep the base64 text as entered while updating the literal text
  }

  return (
    <PageContext.Provider value={{ activeItem: PAGE.BASE_64_ENCODE_DECODER }}>
      <Layout title="Base64 Encode / Decode">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Base64 Encode / Decode</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">Encode standard text to Base64 or decode Base64 back to text instantly.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 lg:p-7 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            
            <div className="flex flex-col lg:flex-row items-stretch gap-6">
              <div className="flex-1 flex flex-col min-h-[300px]">
                 <label className="text-sm font-semibold text-slate-800 mb-3 block">Literal text</label>
                 <textarea 
                   value={text}
                   onChange={handleTextChange}
                   className="flex-1 w-full p-4 rounded-xl border border-slate-200 bg-slate-50 shadow-sm outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm placeholder:text-slate-400 text-slate-900"
                   placeholder="Please enter text you want to convert to base64"
                 />
              </div>

              <div className="flex justify-center items-center py-4 lg:py-0">
                 <div className="bg-white p-3 rounded-full shadow-sm border border-slate-200 text-slate-400">
                    <ArrowLeftRight className="w-5 h-5 lg:rotate-0 rotate-90" />
                 </div>
              </div>

              <div className="flex-1 flex flex-col min-h-[300px]">
                 <label className="text-sm font-semibold text-slate-800 mb-3 block">base64 text</label>
                 <textarea 
                   value={encode}
                   onChange={handleDecodeBase64}
                   className="flex-1 w-full p-4 rounded-xl border border-slate-200 bg-slate-50 shadow-sm outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm placeholder:text-slate-400 text-slate-900"
                   placeholder="Please enter text you want to convert to base64"
                 />
              </div>
            </div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
