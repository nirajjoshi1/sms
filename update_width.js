const fs = require('fs');
const path = require('path');

function updateMaxWidth(dir) {
    let files = fs.readdirSync(dir);
    for (let f of files) {
        let fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            updateMaxWidth(fullPath);
        } else if (f.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('<CustomModal')) {
                const regex = /maxWidth="max-w-[a-z0-9-]+"/g;
                let newContent = content.replace(regex, 'maxWidth="max-w-md"');
                if (content !== newContent) {
                    fs.writeFileSync(fullPath, newContent);
                    console.log('Updated ' + fullPath);
                }
            }
        }
    }
}

updateMaxWidth('client/src/pages');
