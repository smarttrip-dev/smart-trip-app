const fs = require('fs');
const path = require('path');

const applyTheme = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // 1. Remove old styles
  newContent = newContent.replace(/<style>\{`[\s\S]*?`\}<\/style>\s*/, '');
  
  // 2. Change the main wrapper div
  // For most files it starts with <div className="min-h-screen...
  // We'll replace it with the exact dark theme boilerplate structure
  const effects = `<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.15),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.05),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />`;

  newContent = newContent.replace(/<div className="([^"]*min-h-screen[^"]*)"/, (match, group) => {
      // Keep existing classes except background and text colors
      let classes = group.replace(/bg-\w+-50/g, '').replace(/bg-gradient-to-[a-z]+( from-\S+)?( to-\S+)?/g, '').replace('min-h-screen', '');
      return `<div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans \${classes}">\n      ${effects}`;
  });

  // Since we use max-w-md w-full space-y-8 inside, we should add relative z-10 to the inner container
  newContent = newContent.replace(/className="max-w-md/g, 'className="relative z-10 max-w-md');

  // Let's replace card backgrounds. Many use `bg-white` or `bg-slate-900 border border-white/10`
  newContent = newContent.replace(/className="bg-white/g, 'className="bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10');
  newContent = newContent.replace(/bg-slate-900\/80([^"]*?)shadow-lg/g, 'bg-slate-900/80$1shadow-[0_0_40px_rgba(0,0,0,0.5)]');

  // Specific to vendor login / generic elements
  newContent = newContent.replace(/text-gray-900/g, 'text-white');
  newContent = newContent.replace(/text-gray-800/g, 'text-slate-200');
  newContent = newContent.replace(/text-gray-600/g, 'text-slate-400');
  newContent = newContent.replace(/text-gray-500/g, 'text-slate-500');
  newContent = newContent.replace(/border-gray-200/g, 'border-white/10');
  newContent = newContent.replace(/border-gray-300/g, 'border-white/20');
  newContent = newContent.replace(/bg-gray-50/g, 'bg-slate-950');
  newContent = newContent.replace(/bg-indigo-600/g, 'bg-lime-500 text-slate-950 border-none shadow-[0_0_15px_rgba(190,242,100,0.4)]');
  newContent = newContent.replace(/hover:bg-indigo-700/g, 'hover:bg-lime-400 hover:shadow-[0_0_25px_rgba(190,242,100,0.6)] text-slate-950 transition-all');
  newContent = newContent.replace(/text-indigo-600/g, 'text-lime-400');
  newContent = newContent.replace(/hover:text-indigo-500/g, 'hover:text-lime-300');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated theme for ${filePath}`);
  }
};

const pagesToUpdate = [
  'src/pages/VendorLogin.jsx',
  'src/pages/VendorRegisterPage.jsx',
  'src/pages/ForgotPasswordPage.jsx',
  'src/pages/ResetPasswordPage.jsx',
];

pagesToUpdate.forEach(applyTheme);
