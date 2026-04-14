import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      <div className="atmosphere absolute inset-0 -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl"
      >
        <div className="flex justify-center mb-6">
          <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-aura-accent" />
            <span className="text-xs font-medium uppercase tracking-widest text-white/70">
              Introducing Aura AI 2.0
            </span>
          </div>
        </div>
        
        <h1 className="font-display text-7xl md:text-9xl mb-8 leading-[0.85] tracking-tighter">
          CREATIVE <br />
          <span className="text-aura-accent italic">INTELLIGENCE</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-12 font-light leading-relaxed">
          A sophisticated studio for the modern creator. Harness the power of 
          Gemini to transform your ideas into reality with unprecedented precision.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="group relative px-8 py-4 bg-white text-black rounded-full font-medium overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Enter the Studio <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <button className="px-8 py-4 glass rounded-full font-medium hover:bg-white/10 transition-colors">
            View Showcase
          </button>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">Scroll to explore</span>
      </motion.div>
    </div>
  );
}
