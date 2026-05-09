import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, ShieldCheck } from "lucide-react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";
import JsonViewer from "../components/JsonViewer";
import JWTStorage from "../utils/storage/JWT";
import { decodeToBase64 } from "../utils/base64";

const uncatchFunction = fn => (...args) => {
  try {
    return fn(...args);
  } catch (error) {
    return undefined;
  }
};

export default function JWT() {
  const [JWTText, setJWTText] = useState("");

  useEffect(() => {
    const saved = JWTStorage.get("JWTText");
    if (saved) setJWTText(saved);
  }, []);

  const [header, payload] = (JWTText || "")
    .split(".")
    .slice(0, 2)
    .map(decodeToBase64)
    .map(uncatchFunction(JSON.parse));

  const json = { header, payload };

  function handleTextChange(e) {
    const { value } = e.target;
    setJWTText(value);
    JWTStorage.set("JWTText", value);
  }

  return (
    <PageContext.Provider value={{ activeItem: PAGE.JWT_TOKEN_VIEWER }}>
      <Layout title="JWT Token Viewer">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              JWT Token Viewer
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Decode and inspect JSON Web Tokens (JWT) easily.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 lg:p-7 relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-800 mb-3 block">
                Input JWT Token
              </label>
              <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <textarea
                  value={JWTText}
                  onChange={handleTextChange}
                  placeholder="Please enter JWT"
                  className="w-full min-h-[150px] p-4 font-mono text-sm outline-none resize-y text-slate-900 bg-transparent placeholder:text-slate-400 break-all"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-violet-500" />
                  <label className="text-sm font-semibold text-slate-800">
                    Header
                  </label>
                </div>
                <div className="bg-[#1e1e1e] rounded-xl shadow-inner border border-[#2d2d2d] overflow-hidden min-h-[200px] p-5">
                  {header ? (
                    <div className="custom-scrollbar overflow-auto">
                      <JsonViewer json={header} />
                    </div>
                  ) : (
                    <div className="p-5 font-mono text-sm text-slate-500 flex items-center justify-center h-full min-h-[200px]">
                      <span className="italic opacity-50">
                        Waiting for valid token...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="w-4 h-4 text-fuchsia-500" />
                  <label className="text-sm font-semibold text-slate-800">
                    Payload
                  </label>
                </div>
                <div className="bg-[#1e1e1e] rounded-xl shadow-inner border border-[#2d2d2d] overflow-hidden min-h-[200px] p-5">
                  {payload ? (
                    <div className="custom-scrollbar overflow-auto">
                      <JsonViewer json={payload} />
                    </div>
                  ) : (
                    <div className="p-5 font-mono text-sm text-slate-500 flex items-center justify-center h-full min-h-[200px]">
                      <span className="italic opacity-50">
                        Waiting for valid token...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
