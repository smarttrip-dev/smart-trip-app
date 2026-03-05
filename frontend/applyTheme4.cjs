const fs = require('fs');

const pages = [
  'src/pages/LoginPage.jsx',
  'src/pages/RegisterPage.jsx',
  'src/pages/LandingPageAlt.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/InventoryManagement.jsx'
];

for (let f of pages) {
  if (!fs.existsSync(f)) {
     console.log('Skipping', f);
     continue;
  }
  let c = fs.readFileSync(f, 'utf8');

  // Fix main container
  c = c.replace(/className="[^"]*min-h-[^"]*"/, 'className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans flex flex-col items-center justify-center p-4 z-0"');
  const effects = '\n      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.15),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.05),_transparent_35%)]" />\n      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30" style={{ backgroundImage: \'url("https://grainy-gradients.vercel.app/noise.svg")\' }} />\n';
  if (!c.includes('noise.svg')) {
     c = c.replace(/(className="relative min-h-screen bg-slate-950[^>]+>)/, '$1' + effects);
  }

  // Cards
  c = c.replace(/className="[^"]*bg-white[^"]*p-8[^"]*"/g, 'className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl"');
  c = c.replace(/className="[^"]*bg-white[^"]*"/g, 'className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"');

  // Headings
  c = c.replace(/text-gray-900/g, 'text-slate-100');
  c = c.replace(/text-gray-800/g, 'text-slate-200');
  c = c.replace(/text-gray-600/g, 'text-slate-400');
  c = c.replace(/text-gray-500/g, 'text-slate-500');

  // Inputs
  c = c.replace(/className="[^"]*block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600[^"]*"/g, 'className="block w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:border-lime-500/50 focus:ring-2 focus:ring-lime-500/20 transition-all outline-none"');
  c = c.replace(/border-gray-300/g, 'border-white/10');
  c = c.replace(/border-gray-200/g, 'border-white/5');

  // Buttons
  c = c.replace(/className="[^"]*w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg[^"]*"/g, 'className="w-full py-3.5 px-4 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)] transition-all active:scale-[0.98] mt-2"');
  c = c.replace(/bg-indigo-600/g, 'bg-lime-500');
  c = c.replace(/hover:bg-indigo-700/g, 'hover:bg-lime-400');
  c = c.replace(/text-indigo-600/g, 'text-lime-400');
  c = c.replace(/hover:text-indigo-500/g, 'hover:text-lime-300');

  // Any leftover gray backings
  c = c.replace(/bg-gray-50/g, 'bg-slate-950');
  c = c.replace(/bg-gray-100/g, 'bg-slate-900');

  fs.writeFileSync(f, c);
  console.log('Fixed', f);
}
