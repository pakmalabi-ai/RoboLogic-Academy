import React from 'react';
import { Bot, Brain, Code, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-full p-6 md:p-12 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="max-w-3xl w-full text-center space-y-8">
        
        {/* Hero Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <Bot size={80} className="text-blue-400 relative z-10 animate-float" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white font-tech tracking-tight">
          RoboLogic Academy
        </h1>

        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 shadow-2xl text-lg leading-relaxed text-slate-200">
          <p className="mb-6 font-medium text-blue-200">
            Selamat datang! Website ini adalah sebuah ruang belajar digital yang dirancang khusus dengan penuh semangat oleh <span className="text-yellow-400 font-bold">Malabi Wibowo Susanto menggunakan Tool Kecerdasan Artifisial</span>.
          </p>
          <p className="mb-4">
            Berawal dari keinginan kuat untuk membekali anak saya tercinta yang masih duduk di bangku Sekolah Dasar, dengan kemampuan masa depan, media ini hadir sebagai sarana pengenalan <strong className="text-white">Berpikir Komputasional (Computational Thinking)</strong>.
          </p>
          <p className="mb-4">
            Di sini, belajar logika dan pemecahan masalah tidak lagi membosankan, tetapi menjadi sebuah perjalanan yang seru dan bermakna.
          </p>
          <p className="font-semibold text-white">
            Semoga semangat belajar ini dapat menular dan bermanfaat bagi siapa saja yang berkunjung. Selamat belajar dan bertumbuh!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition shadow-lg">
            <Brain className="w-10 h-10 text-pink-400 mb-4 mx-auto" />
            <h3 className="font-bold text-white mb-2">Logika</h3>
            <p className="text-sm text-slate-400">Belajar urutan, pola, dan sebab-akibat.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-green-500 transition shadow-lg">
            <Code className="w-10 h-10 text-green-400 mb-4 mx-auto" />
            <h3 className="font-bold text-white mb-2">Algoritma</h3>
            <p className="text-sm text-slate-400">Menyusun langkah-langkah penyelesaian masalah.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-yellow-500 transition shadow-lg">
            <Cpu className="w-10 h-10 text-yellow-400 mb-4 mx-auto" />
            <h3 className="font-bold text-white mb-2">Debugging</h3>
            <p className="text-sm text-slate-400">Mencari dan memperbaiki kesalahan kode.</p>
          </div>
        </div>

        <div className="pt-8">
            <Link to="/level/mars-1" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-full shadow-lg transition transform hover:scale-105">
                Mulai Petualangan 🚀
            </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;