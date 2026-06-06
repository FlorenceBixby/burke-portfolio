"use client";
import { motion } from "framer-motion";
import { Camera, Shield, Cloud, ArrowUpRight, Linkedin, Mail } from "lucide-react";

export default function Home() {
  const experiences = [
    { company: "Cloudflare", role: "Named Account Executive", year: "2021-Present", color: "border-cloudflare" },
    { company: "Vercara", role: "Account Executive", year: "2024-2025", color: "border-gray-700" },
    { company: "Lighthouse Solar", role: "Dir. of Procurement", year: "2016-2021", color: "border-gray-700" },
    { company: "UPS", role: "Operations Manager", year: "2004-2016", color: "border-gray-800" },
  ];

  return (
    <main className="min-h-screen px-6 py-12 md:px-24 md:py-32">
      {/* HEADER SECTION */}
      <section className="max-w-6xl mx-auto mb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter leading-none mb-8">
            BURKE <br /> <span className="text-gray-500">RUDER</span>
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-6 text-gray-400 font-mono uppercase tracking-widest text-sm">
            <span className="flex items-center gap-2"><Cloud className="text-cloudflare w-4" /> Connectivity Cloud</span>
            <span className="hidden md:block">|</span>
            <span className="flex items-center gap-2"><Camera className="text-white w-4" /> Visual Storytelling</span>
            <span className="hidden md:block">|</span>
            <span>Austin, Texas</span>
          </div>
        </motion.div>
      </section>

      {/* BENTO GRID EXPERIENCE */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-32">
        {experiences.map((exp, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className={`p-8 border ${exp.color} rounded-2xl bg-zinc-900/50 flex flex-col justify-between h-64`}
          >
            <div>
              <p className="text-xs font-mono text-gray-500 mb-2">{exp.year}</p>
              <h3 className="text-2xl font-bold">{exp.company}</h3>
              <p className="text-gray-400 text-sm mt-1">{exp.role}</p>
            </div>
            <ArrowUpRight className="self-end text-gray-600" />
          </motion.div>
        ))}
        
        {/* SPECIAL PHOTOGRAPHY CARD */}
        <div className="md:col-span-2 bg-gradient-to-br from-zinc-800 to-black p-8 rounded-2xl border border-white/5 flex flex-col justify-center items-center relative overflow-hidden">
             <Camera className="w-16 h-16 text-cloudflare/20 absolute -right-4 -bottom-4" />
             <h3 className="text-4xl font-bold italic mb-2 tracking-tight">Through The Lens</h3>
             <p className="text-gray-400 text-center max-w-sm">"Sales is about the big picture; photography is about the fine details."</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto pt-12 border-t border-white/10 flex justify-between items-center">
        <p className="text-xs font-mono text-gray-600">© 2026 BR_PORTFOLIO</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-cloudflare transition-colors"><Linkedin size={20} /></a>
          <a href="#" className="hover:text-cloudflare transition-colors"><Mail size={20} /></a>
        </div>
      </footer>
    </main>
  );
}
