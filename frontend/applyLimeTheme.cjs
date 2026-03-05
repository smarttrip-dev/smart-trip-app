const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    files.forEach(function (file) {
        if (!file.endsWith('.jsx')) return;
        
        const filePath = path.join(directoryPath, file);
        let c = fs.readFileSync(filePath, 'utf8');

        // Backgrounds with text
        c = c.replace(/bg-purple-600\s+text-white/g, 'bg-lime-500 text-slate-950');
        // Any remaining bg-purple-600 that didn't have text-white right next to it
        c = c.replace(/bg-purple-600/g, 'bg-lime-500 text-slate-950');
        
        c = c.replace(/hover:bg-purple-700/g, 'hover:bg-lime-400');
        c = c.replace(/bg-purple-500/g, 'bg-lime-500 text-slate-950');
        c = c.replace(/bg-purple-100/g, 'bg-lime-100');
        c = c.replace(/bg-purple-50/g, 'bg-lime-50');

        // Text colors
        c = c.replace(/text-purple-600/g, 'text-lime-400');
        c = c.replace(/text-purple-500/g, 'text-lime-400');
        c = c.replace(/text-purple-400/g, 'text-lime-300');
        c = c.replace(/text-purple-300/g, 'text-lime-200');

        // Borders
        c = c.replace(/border-purple-600/g, 'border-lime-500');
        c = c.replace(/border-purple-500/g, 'border-lime-500');
        c = c.replace(/border-purple-400/g, 'border-lime-400');

        // Rings
        c = c.replace(/ring-purple-600/g, 'ring-lime-500');
        c = c.replace(/ring-purple-500/g, 'ring-lime-500');
        
        // Special patterns with opacity e.g. text-purple-400 bg-purple-500/10
        c = c.replace(/bg-purple-([0-9]{3})\/([0-9]{1,2})/g, 'bg-lime-$1/$2');
        c = c.replace(/text-purple-([0-9]{3})\/([0-9]{1,2})/g, 'text-lime-$1/$2');
        c = c.replace(/border-purple-([0-9]{3})\/([0-9]{1,2})/g, 'border-lime-$1/$2');

        // Blue replacements to lime
        // Only doing blue if we want them unified as well. Let's do it to keep the theme distinct
        c = c.replace(/bg-blue-600\s+text-white/g, 'bg-lime-500 text-slate-950');
        c = c.replace(/bg-blue-600/g, 'bg-lime-500 text-slate-950');
        c = c.replace(/hover:bg-blue-700/g, 'hover:bg-lime-400');
        c = c.replace(/text-blue-600/g, 'text-lime-400');
        c = c.replace(/text-blue-500/g, 'text-lime-400');
        c = c.replace(/text-blue-400/g, 'text-lime-300');
        c = c.replace(/border-blue-600/g, 'border-lime-500');
        c = c.replace(/border-blue-500/g, 'border-lime-500');
        c = c.replace(/ring-blue-600/g, 'ring-lime-500');
        c = c.replace(/bg-blue-([0-9]{3})\/([0-9]{1,2})/g, 'bg-lime-$1/$2');
        c = c.replace(/text-blue-([0-9]{3})\/([0-9]{1,2})/g, 'text-lime-$1/$2');
        c = c.replace(/border-blue-([0-9]{3})\/([0-9]{1,2})/g, 'border-lime-$1/$2');

        // Double text-slate-950 fixes (if bg-purple-600 was replaced and already had text-slate-950)
        c = c.replace(/text-slate-950\s+text-slate-950/g, 'text-slate-950');

        fs.writeFileSync(filePath, c);
        console.log('Fixed themes for', file);
    });
});
