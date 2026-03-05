const fs = require('fs');

const pages = [
  'src/pages/VendorLogin.jsx', 
  'src/pages/VendorRegisterPage.jsx', 
  'src/pages/ForgotPasswordPage.jsx', 
  'src/pages/ResetPasswordPage.jsx', 'src/pages/VendorRegistration.jsx'
];

for (let f of pages) {
  let c = fs.readFileSync(f, 'utf8');

  // Fix main container
  c = c.replace(/className="[^"]*min-h-[^"]*"/, 'className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans flex flex-col items-center justify-center p-4 z-0"');
  
  const effects = '\n      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.15),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.05),_transparent_35%)]" />\n      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30" style={{ backgroundImage: \\\'url("https://grainy-gradients.vercel.app/noise.svg")\\\' }} />\n';

  if (!c.includes('noise.svg')) {
     c = c.replace(/(className="relative min-h-screen bg-slate-950[^>]+>)/, '$1' + effects.replace(/\\'/g, "'"));
  }

  // Z-index patches
  c = c.replace(/className="max-w-md/g, 'className="relative z-10 max-w-md');
  c = c.replace(/className="max-w-lg/g, 'className="relative z-10 max-w-lg'); 
  c = c.replace(/className="max-w-4xl/g, 'className="relative z-10 max-w-4xl'); 
  c = c.replace(/className="w-full max-w-md/g, 'className="relative z-10 w-full max-w-md'); 

  // Card themes
  c = c.replace(/className="bg-white/g, 'className="bg-slate-900 border border-white/10 shadow-2xl relative z-10 backdrop-blur-md');
  
  // Specific styling updates
  c = c.replace(/bg-blue-[5010]+/g, 'bg-slate-900/50 border border-white/10 text-slate-300');
  c = c.replace(/text-gray-[0-9]{3}/g, 'text-slate-400');
  c = c.replace(/text-gray-900/g, 'text-white');
  c = c.replace(/border-gray-[0-9]{3}/g, 'border-white/10');
  c = c.replace(/bg-indigo-600/g, 'bg-lime-500 text-slate-950 font-bold tracking-wide');
  c = c.replace(/hover:bg-indigo-700/g, 'hover:bg-lime-400 hover:shadow-[0_0_20px_rgba(190,242,100,0.4)] transition-all');
  c = c.replace(/text-indigo-600/g, 'text-lime-400');
  c = c.replace(/hover:text-indigo-500/g, 'hover:text-lime-300');
  c = c.replace(/text-purple-600/g, 'text-lime-400');
  c = c.replace(/ring-indigo-500/g, 'ring-lime-500');

  // Strip generic literal inline styles
  c = c.replace(/<style>\{`[\s\S]*?`\}<\/style>/, '');
  
  c = c.replace(/<div className="mt-6 bg-blue-50/g, '<div className="mt-6 bg-slate-900/50 text-slate-300');

  fs.writeFileSync(f, c);
  console.log('Fixed ', f);
}
