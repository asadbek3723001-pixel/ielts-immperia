const fs = require('fs');
const path = require('path');

const DB_DIR = 'c:\\Users\\user\\Desktop\\moc\\backend\\question_database\\grammar';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.json')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(DB_DIR);
const brokenFiles = [];

files.forEach(file => {
    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (data.type === 'gap_fill' && data.passage) {
            const hasMarkers = /\[\d+\]/.test(data.passage) || /___/.test(data.passage);
            if (!hasMarkers && data.questions && data.questions.length > 0) {
                brokenFiles.push({
                    file,
                    title: data.title,
                    id: data.id
                });
            }
        }
    } catch (e) {
        console.error('Error parsing', file);
    }
});

console.log(JSON.stringify(brokenFiles, null, 2));
