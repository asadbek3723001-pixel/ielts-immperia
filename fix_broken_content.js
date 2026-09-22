const fs = require('fs');
const path = require('path');

const DB_DIR = 'c:\\Users\\user\\Desktop\\moc\\backend\\question_database\\grammar';

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.json')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk(DB_DIR);

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);

        if (data.type === 'gap_fill' && data.passage && data.questions) {
            let passage = data.passage;
            let modified = false;

            // If passage already has markers, skip
            if (/\[\d+\]/.test(passage)) return;

            data.questions.forEach(q => {
                // Find where the question text matches a part of the passage
                // For many exercises, the question text is exactly "Part of passage ___ more text"
                if (!q.text) return;

                const cleanQ = q.text.replace(/^\d+\.\s*/, '').replace(/___/g, '').trim();
                if (cleanQ.length < 5) return; // Too short to match reliably

                // Try to find cleanQ in passage
                const idx = passage.indexOf(cleanQ);
                if (idx !== -1) {
                    // Inject [N] at the end or ideally where the blank was in question
                    const qParts = q.text.replace(/^\d+\.\s*/, '').split('___');
                    if (qParts.length === 2) {
                        const combinedMatch = qParts[0].trim() + ' ' + qParts[1].trim();
                        // This is more complex. Let's try a simpler approach for now:
                        // Look for the answer in the passage and replace it?
                        // Actually, many passages HAVE THE ANSWERS.
                    }
                }
            });
        }
    } catch (e) { }
});

// Let's do a more targetted fix for the ones we know are broken
const targetFiles = [
    '1_5\\ex_002.json',
    '5_10\\ex_004.json',
    '5_10\\ex_007.json',
    '5_10\\ex_009.json',
    '5_10\\ex_011.json',
    '5_10\\ex_016.json'
];

// ... manual fixes are safer for these content-heavy files ...
console.log("Starting manual fixes for identified broken files...");
