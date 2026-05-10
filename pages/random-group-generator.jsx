import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Shuffle, 
  UserPlus, 
  Copy, 
  Trash2, 
  RotateCcw,
  Plus,
  Check,
  LayoutGrid,
  ListOrdered,
  GripVertical
} from "lucide-react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";

export default function RandomGroupGenerator() {
  const [inputText, setInputText] = useState("");
  const [groupSize, setGroupSize] = useState(2);
  const [groupMode, setGroupMode] = useState("count"); // 'count' or 'size'
  const [results, setResults] = useState(null);
  const [pickedWinner, setPickedWinner] = useState(null);
  const [copied, setCopied] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  const getItems = () => {
    return inputText
      .split("\n")
      .map(item => item.trim())
      .filter(item => item !== "");
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handlePickRandom = () => {
    const items = getItems();
    if (items.length === 0) return;
    const winner = items[Math.floor(Math.random() * items.length)];
    setPickedWinner(winner);
    setResults(null);
  };

  const handleShuffle = () => {
    const items = getItems();
    if (items.length === 0) return;
    const shuffled = shuffleArray(items);
    setResults([{ title: "Shuffled List", items: shuffled }]);
    setPickedWinner(null);
  };

  const handleGenerateGroups = () => {
    const items = shuffleArray(getItems());
    if (items.length === 0) return;

    let groups = [];
    if (groupMode === "count") {
      // Split into X number of groups
      const numGroups = Math.max(1, Math.min(items.length, groupSize));
      for (let i = 0; i < numGroups; i++) {
        groups.push({ title: `Group ${i + 1}`, items: [] });
      }
      items.forEach((item, index) => {
        groups[index % numGroups].items.push(item);
      });
    } else {
      // Split into groups of size X
      const size = Math.max(1, groupSize);
      for (let i = 0; i < items.length; i += size) {
        groups.push({ 
          title: `Group ${Math.floor(i / size) + 1}`, 
          items: items.slice(i, i + size) 
        });
      }
    }

    setResults(groups);
    setPickedWinner(null);
  };

  const onDragStart = (e, groupIndex, itemIndex) => {
    setDraggedItem({ groupIndex, itemIndex });
    // This makes the ghost image look nicer
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e, targetGroupIndex) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    const { groupIndex: sourceGroupIndex, itemIndex } = draggedItem;
    if (sourceGroupIndex === targetGroupIndex) return;

    const newResults = [...results];
    const [item] = newResults[sourceGroupIndex].items.splice(itemIndex, 1);
    newResults[targetGroupIndex].items.push(item);
    
    setResults(newResults);
    setDraggedItem(null);
  };

  const handleClear = () => {
    setInputText("");
    setResults(null);
    setPickedWinner(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageContext.Provider value={{ activeItem: PAGE.RANDOM_GROUP_GENERATOR }}>
      <Layout title="Random & Grouping">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-xl">
                <Users className="w-6 h-6 text-rose-600" />
              </div>
              Random & Grouping
            </h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Split people into teams, shuffle lists, or pick a random winner instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-orange-500" />
                
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-rose-500" />
                    Enter List (One per line)
                  </label>
                  <button 
                    onClick={handleClear}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="John Doe&#10;Jane Smith&#10;Alex Johnson..."
                  className="w-full h-[300px] p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-rose-200 focus:ring-0 transition-all font-medium text-slate-700 resize-none"
                />
                
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-50 p-2 rounded-lg">
                  <LayoutGrid className="w-3 h-3" />
                  {getItems().length} items detected
                </div>
              </div>

              {/* Configuration */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Grouping Options
                  </label>
                  
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    <button 
                      onClick={() => setGroupMode("count")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${groupMode === 'count' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Number of Groups
                    </button>
                    <button 
                      onClick={() => setGroupMode("size")}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${groupMode === 'size' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Group Size
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <input 
                      type="range"
                      min="1"
                      max={Math.max(1, getItems().length)}
                      value={groupSize}
                      onChange={(e) => setGroupSize(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
                    />
                    <div className="bg-rose-50 text-rose-600 font-bold px-4 py-2 rounded-xl border border-rose-100 min-w-[3rem] text-center">
                      {groupSize}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={handleGenerateGroups}
                    disabled={getItems().length === 0}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-900/10"
                  >
                    <Users className="w-5 h-5" /> Generate Groups
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handlePickRandom}
                      disabled={getItems().length === 0}
                      className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" /> Pick One
                    </button>
                    <button 
                      onClick={handleShuffle}
                      disabled={getItems().length === 0}
                      className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
                    >
                      <Shuffle className="w-4 h-4" /> Shuffle
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {pickedWinner ? (
                  <motion.div
                    key="winner"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-[2.5rem] p-1 shadow-2xl shadow-rose-500/20 h-full flex flex-col items-center justify-center text-center min-h-[400px]"
                  >
                    <div className="bg-white/10 backdrop-blur-xl rounded-[2.25rem] w-full h-full flex flex-col items-center justify-center p-8 text-white">
                      <div className="bg-white text-rose-500 p-6 rounded-full mb-6 shadow-xl animate-bounce">
                        <Users className="w-12 h-12" />
                      </div>
                      <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-2 opacity-80">And the winner is...</h2>
                      <div className="text-5xl sm:text-7xl font-black mb-8 break-all">
                        {pickedWinner}
                      </div>
                      <button 
                        onClick={() => handlePickRandom()}
                        className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-rose-50 transition-all flex items-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" /> Pick Again
                      </button>
                    </div>
                  </motion.div>
                ) : results ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <ListOrdered className="w-5 h-5 text-rose-500" />
                        Generated Results
                      </h3>
                      <button 
                        onClick={() => copyToClipboard(results.map(g => `${g.title}:\n${g.items.join('\n')}`).join('\n\n'))}
                        className={`text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${copied ? 'bg-emerald-50 text-emerald-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied All' : 'Copy All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {results.map((group, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onDragOver={onDragOver}
                          onDrop={(e) => onDrop(e, idx)}
                          className={`bg-white rounded-3xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-all group ${draggedItem && draggedItem.groupIndex !== idx ? 'border-dashed border-rose-200 bg-rose-50/30' : 'border-slate-200'}`}
                        >
                          <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-900 text-sm tracking-tight">{group.title}</span>
                            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">
                              {group.items.length} items
                            </span>
                          </div>
                          <div className="p-4 space-y-2 min-h-[100px]">
                            {group.items.map((item, i) => (
                              <div 
                                key={i} 
                                draggable={true}
                                onDragStart={(e) => onDragStart(e, idx, i)}
                                className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-xl text-slate-600 group/item cursor-grab active:cursor-grabbing hover:border-rose-200 hover:shadow-sm transition-all"
                              >
                                <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-rose-400" />
                                <span className="text-sm font-medium truncate">{item}</span>
                              </div>
                            ))}
                            {group.items.length === 0 && (
                              <div className="h-full flex items-center justify-center text-slate-300 text-xs font-medium py-8 italic">
                                Drop items here
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                      <LayoutGrid className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400 mb-2">No results yet</h3>
                    <p className="text-slate-400 max-w-xs text-sm">
                      Enter a list of items and choose an action to see the magic happen.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
