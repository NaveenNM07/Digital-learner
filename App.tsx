import React, { useState, useEffect, useCallback } from 'react';
import { generateVisualExplanation } from './services/gemini';
import { DiagramData, GenerationState } from './types';
import { VisualCanvas } from './components/VisualCanvas';
import { Search, Play, Pause, ChevronLeft, ChevronRight, Loader2, Sparkles, Info } from 'lucide-react';

export default function App() {
  const [topic, setTopic] = useState('');
  const [data, setData] = useState<DiagramData | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle' });
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setGenerationState({ status: 'loading' });
    setData(null);
    setIsPlaying(false);
    setCurrentFrameIndex(0);

    try {
      const result = await generateVisualExplanation(topic);
      setData(result);
      setGenerationState({ status: 'success' });
      // Auto-play after loading
      setTimeout(() => setIsPlaying(true), 500);
    } catch (error) {
      setGenerationState({ status: 'error', error: "Failed to generate visualization. Please try again." });
    }
  };

  // Playback logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isPlaying && data) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (prev >= data.frames.length - 1) {
            setIsPlaying(false); // Stop at end
            return prev; // Or return 0 to loop? Let's stop.
          }
          return prev + 1;
        });
      }, 2500); // 2.5 seconds per frame
    }

    return () => clearInterval(interval);
  }, [isPlaying, data]);

  const handleRestart = () => {
      setCurrentFrameIndex(0);
      setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-600 w-6 h-6" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Visual Explainer</h1>
          </div>
          <div className="text-xs text-gray-400 font-mono">
             Powered by Gemini 2.5
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full flex flex-col gap-8">
        
        {/* Search Input */}
        <section className="w-full">
            <form onSubmit={handleSearch} className="relative group">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a concept (e.g., Photosynthesis, Bitcoin transaction)..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl shadow-sm text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <button 
                    type="submit" 
                    disabled={generationState.status === 'loading' || !topic}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generationState.status === 'loading' ? 'Visualizing...' : 'Explain'}
                </button>
            </form>
        </section>

        {/* Error Message */}
        {generationState.status === 'error' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p>{generationState.error}</p>
            </div>
        )}

        {/* Loading State */}
        {generationState.status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-400" />
                <p className="text-sm font-medium">Generating visual diagram...</p>
                <p className="text-xs mt-2">Thinking about shapes and steps</p>
            </div>
        )}

        {/* Visualization Area */}
        {generationState.status === 'success' && data && (
            <div className="animate-fade-in-up">
                <div className="flex flex-col gap-6">
                    {/* Title & Stats */}
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">{data.title}</h2>
                        <span className="text-sm text-gray-500 font-medium">
                            Step {currentFrameIndex + 1} of {data.frames.length}
                        </span>
                    </div>

                    {/* Canvas Container */}
                    <VisualCanvas 
                        elements={data.frames[currentFrameIndex].elements} 
                        palette={data.palette}
                    />

                    {/* Explanation Text */}
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm min-h-[100px] flex items-center justify-center text-center">
                        <p className="text-lg text-gray-700 font-medium leading-relaxed">
                            {data.frames[currentFrameIndex].explanation}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-6 pb-12">
                         <button
                            onClick={() => {
                                setIsPlaying(false);
                                setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1));
                            }}
                            disabled={currentFrameIndex === 0}
                            className="p-3 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                         >
                            <ChevronLeft className="w-6 h-6" />
                         </button>

                         <button
                            onClick={() => {
                                if (currentFrameIndex === data.frames.length - 1) {
                                    handleRestart();
                                } else {
                                    setIsPlaying(!isPlaying);
                                }
                            }}
                            className="w-16 h-16 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                         >
                            {currentFrameIndex === data.frames.length - 1 ? (
                                <Sparkles className="w-6 h-6" />
                            ) : isPlaying ? (
                                <Pause className="w-8 h-8 fill-current" />
                            ) : (
                                <Play className="w-8 h-8 ml-1 fill-current" />
                            )}
                         </button>

                         <button
                            onClick={() => {
                                setIsPlaying(false);
                                setCurrentFrameIndex(Math.min(data.frames.length - 1, currentFrameIndex + 1));
                            }}
                            disabled={currentFrameIndex === data.frames.length - 1}
                            className="p-3 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                         >
                            <ChevronRight className="w-6 h-6" />
                         </button>
                    </div>

                    {/* Timeline / Progress Bar */}
                    <div className="flex gap-2 h-1.5 w-full mt-[-20px] px-12">
                        {data.frames.map((_, idx) => (
                            <div 
                                key={idx}
                                className={`flex-1 rounded-full transition-all duration-300 ${
                                    idx === currentFrameIndex ? 'bg-indigo-600' : 
                                    idx < currentFrameIndex ? 'bg-indigo-200' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>

                </div>
            </div>
        )}

        {/* Empty State Hint */}
        {generationState.status === 'idle' && (
             <div className="text-center mt-20 text-gray-400">
                <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                     <Sparkles className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-500">Ready to visualize</h3>
                <p className="max-w-sm mx-auto mt-2 text-sm text-gray-400">Try searching for things like "How an engine works", "Doppler Effect", or "Tectonic Plates".</p>
             </div>
        )}

      </main>
    </div>
  );
}