const fs = require('fs');
const path = require('path');

function fixModalCSS(dir) {
    let files = fs.readdirSync(dir);
    for (let f of files) {
        let fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            fixModalCSS(fullPath);
        } else if (f.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('fixed inset-0 bg-black/50')) {
                console.log(`Fixing ${fullPath}`);
                
                // Replace the buggy flex wrapper
                // Original:
                // <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                //   <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                
                // Regex to match the wrapper and card, allowing variations in max-w
                const regex = /<div className=\"fixed inset-0 bg-black\/50 z-50 flex items-center justify-center p-4\">\s*<div className=\"bg-card border border-border rounded-xl shadow-xl max-w-[a-z0-9-]+ w-full max-h-\[90vh\] overflow-y-auto\">/g;
                
                let newContent = content.replace(regex, `<div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">\n          <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full my-auto">`);
                
                // Also check for files that might have been skipped because of different classes
                const regex2 = /<div className=\"fixed inset-0 bg-black\/50 z-50 flex items-center justify-center p-4\">\s*<div className=\"bg-card border border-border rounded-xl shadow-xl max-w-[a-z0-9-]+ w-full\">/g;
                newContent = newContent.replace(regex2, `<div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">\n          <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full my-auto">`);
                
                if (content !== newContent) {
                    fs.writeFileSync(fullPath, newContent);
                    console.log(`Updated ${fullPath}`);
                } else {
                    console.log(`No match found in ${fullPath}`);
                }
            }
        }
    }
}

fixModalCSS('client/src/pages');
