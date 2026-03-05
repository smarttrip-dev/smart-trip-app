const fs = require('fs');
const path = require('path');
const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const effects = `\n      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.15),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.05),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />\n`;

for (const file of files) {
  if (['LandingPage.jsx', 'HomePage.jsx', 'LoginPage.jsx', 'RegisterPage.jsx', 'LandingPageAlt.jsx'].includes(file)) continue;

  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let original = content;

  // Change bg-slate-950 and add relative
  content = content.replace(/className=(["'])[^"']*min-h-screen[^"']*\1/g, 'className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans flex flex-col items-center justify-center p-4 z-0"');
  
  // Insert noise & gradient right inside the main wrapper
  if (!content.includes('radial-gradient(')) {
    content = content.replace(/(<div className="relative min-h-screen[^>]+>)/, '$1' + effects);
  }

  // Common inner container to ensure it stays above absolute backgrounds
  content = content.replace(/className="max-w-md w-full/g, 'className="relative z-10 max-w-md w-full');
  content = content.replace(/className="max-w-md w-full/g, 'className="relative z-10 max-w-lg w-full'); // Adjust to generic

  // Remove <style> font blocks since they are now global
  content = content.replace(/<style>\{`[\s\S]*?`\}<\/style>/, '');
  content = content.replace(/<style>[\s\S]*?<\/style>/, '');

  content = content.replace(/\bbg-white\b/gi, 'bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-md relative z-10');
  content = content.replace(/\bbg-gray-50\b/gi, 'bg-slate-950');
  content = content.replace(/\bbg-gray-100\b/gi, 'bg-slate-800/50');
  content = content.replace(/\bbg-gray-200\b/gi, 'bg-slate-700');
  content = content.replace(/\btext-gray-900\b/gi, 'text-white');
  content = content.replace(/\btext-gray-800\b/gi, 'text-slate-200');
  content = content.replace(/\btext-gray-700\b/gi, 'text-slate-300');
  content = content.replace(/\btext-gray-600\b/gi, 'text-slate-400');
  content = content.replace(/\btext-gray-500\b/gi, 'text-slate-500');
  content = content.replace(/\bborder-gray-200\b/gi, 'border-white/10');
  content = content.replace(/\bborder-gray-300\b/gi, 'border-white/20');
  content = content.replace(/\bbg-blue-500\b/gi, 'bg-lime-500 text-slate-950 border-none');
  content = content.replace(/\bhover:bg-blue-600\b/gi, 'hover:bg-lime-400');
  content = content.replace(/\btext-blue-600\b/gi, 'text-lime-400');
  content = content.replace(/\bhover:text-blue-500\b/gi, 'hover:text-lime-300');
  content = content.replace(/\bring-blue-500\b/gi, 'ring-lime-500');
  content = content.replace(/\bbg-indigo-600\b/gi, 'bg-lime-500 text-slate-950 border border-lime-400 border-none shadow-[0_0_15px_rgba(190,242,100,0.4)]');
  content = content.replace(/\bhover:bg-indigo-700\b/gi, 'hover:bg-lime-400 hover:shadow-[0_0_25px_rgba(190,242,100,0.6)] text-slate-950 transition-all');
  content = content.replace(/\btext-indigo-600\b/gi, 'text-lime-400');
  content = content.replace(/\btext-indigo-500\b/gi, 'text-lime-300');
  content = content.replace(/\bp-8 bg-slate-900\b/gi, 'p-8 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative z-10');
  content = content.replace(/bg-slate-900 border border-white\/10 shadow-2xl backdrop-blur-md relative z-10 rounded-lg shadow-xl/gi, 'bg-slate-900/80 border border-white/10 backdrop-blur-xl rounded-3xl p-8 relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)]');

  // Vendor logins specific
  content = content.replace(/\bfrom-purple-50\b/gi, 'from-slate-900');
  content = content.replace(/\bto-blue-50\b/gi, 'to-slate-950');
  content = content.replace(/\bbg-blue-[50]\b/gi, 'bg-lime-500/10');
  content = content.replace(/\bborder-blue-[200]\b/gi, 'border-lime-500/20');
  
  if (content !== original) {
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log('Fixed:', file);
  }
}