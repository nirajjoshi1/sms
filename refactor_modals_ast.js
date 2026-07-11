const fs = require('fs');
const path = require('path');

function findClosingTag(content, startIndex) {
    let i = startIndex;
    let depth = 0;
    while (i < content.length) {
        if (content.substr(i, 4) === '<div') {
            // make sure it's not self-closing or something, but divs usually aren't
            depth++;
            i += 4;
        } else if (content.substr(i, 6) === '</div>') {
            depth--;
            if (depth === 0) {
                return i + 6; // index after the closing tag
            }
            i += 6;
        } else {
            i++;
        }
    }
    return -1;
}

function findAndReplaceModals(dir) {
    let files = fs.readdirSync(dir);
    for (let f of files) {
        let fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            findAndReplaceModals(fullPath);
        } else if (f.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Find the start of the modal
            let searchStr = '<div className="fixed inset-0 bg-black/50';
            let startIndex = content.indexOf(searchStr);
            if (startIndex !== -1) {
                console.log(`Refactoring ${fullPath}`);
                
                let endIndex = findClosingTag(content, startIndex);
                if (endIndex === -1) {
                    console.log(`Failed to find closing tag in ${fullPath}`);
                    continue;
                }
                
                let modalStr = content.substring(startIndex, endIndex);
                
                // Extract info
                // We use a looser regex to match the top part of the modal
                const topRegex = /<div className=\"fixed inset-0 bg-black\/50[^>]*\">\s*<div className=\"bg-card border border-border rounded-xl shadow-xl (max-w-[a-z0-9-]+)[^>]*\">\s*<div className=\"px-4 py-3 border-b border-border[^>]*\">\s*<h3 className=\"[^\"]*\">\s*([\s\S]*?)\s*<\/h3>\s*<button onClick=\{([^\}]+)\}[^>]*>\s*<[^>]+>\s*<\/button>\s*<\/div>/;
                
                let match = topRegex.exec(modalStr);
                if (!match) {
                    console.log(`Regex failed on the modal string in ${fullPath}`);
                    continue;
                }
                
                const maxWidth = match[1];
                const titleExpr = match[2].trim();
                const closeExpr = match[3].trim();
                
                let cleanTitleExpr = titleExpr;
                if (cleanTitleExpr.startsWith('{') && cleanTitleExpr.endsWith('}')) {
                    cleanTitleExpr = cleanTitleExpr.slice(1, -1);
                } else if (cleanTitleExpr.startsWith("'") || cleanTitleExpr.startsWith('"')) {
                    cleanTitleExpr = `"${cleanTitleExpr}"`;
                } else if (!cleanTitleExpr.includes('?')) {
                    cleanTitleExpr = `"${cleanTitleExpr}"`;
                }
                
                // The inner content is everything after the header until the last two </div>
                // Because we matched the top part exactly, we can just take substring
                let innerContentStart = match.index + match[0].length;
                let innerContentEnd = modalStr.lastIndexOf('</div>');
                innerContentEnd = modalStr.lastIndexOf('</div>', innerContentEnd - 1); // skip the two closing divs
                
                let innerContent = modalStr.substring(innerContentStart, innerContentEnd).trim();
                
                const replacement = `<CustomModal isOpen={true} onClose={${closeExpr}} title={${cleanTitleExpr}} maxWidth="${maxWidth}">\n            ${innerContent}\n          </CustomModal>`;
                
                let newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
                
                // Add import
                if (!newContent.includes('import CustomModal')) {
                    let relPath = fullPath.split('pages')[1].split(path.sep).length - 1; 
                    let relativeImport = '../'.repeat(relPath) + 'components/ui/CustomModal';
                    const importStatement = `import CustomModal from '${relativeImport}';\n`;
                    
                    const importRegex = /^import.*$/gm;
                    let lastImportMatch;
                    let lastIndex = 0;
                    while ((lastImportMatch = importRegex.exec(newContent)) !== null) {
                        lastIndex = importRegex.lastIndex;
                    }
                    
                    if (lastIndex > 0) {
                        newContent = newContent.slice(0, lastIndex) + '\n' + importStatement + newContent.slice(lastIndex);
                    } else {
                        newContent = importStatement + newContent;
                    }
                }
                
                fs.writeFileSync(fullPath, newContent);
                console.log(`Success in ${fullPath}`);
            }
        }
    }
}

findAndReplaceModals('client/src/pages');
