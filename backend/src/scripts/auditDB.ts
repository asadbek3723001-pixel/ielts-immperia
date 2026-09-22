import fs from 'fs';
import path from 'path';
import { Exercise, SectionSubject, VARIANT_GROUPS, PracticeQuestion } from '../types';

const DB_ROOT = path.resolve(__dirname, '../../question_database');

interface AuditResult {
    file: string;
    errors: string[];
    warnings: string[];
}

const auditResults: AuditResult[] = [];

function walk(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    for (let file of list) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.json')) {
            results.push(file);
        }
    }
    return results;
}

async function auditFile(filePath: string) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const relativePath = path.relative(DB_ROOT, filePath);

    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);

        // Common fields
        if (!data.id) errors.push('Missing ID');
        if (!data.subject) errors.push('Missing subject');

        // Check if it's a practice test or regular exercise
        if (relativePath.startsWith('practice_tests')) {
            // Practice Test Audit
            const pt = data as PracticeQuestion;
            if (!pt.text) errors.push('Practice question missing text');
            if (!pt.options || !Array.isArray(pt.options) || pt.options.length === 0) {
                errors.push('Practice question missing options');
            }
            if (!pt.answer) errors.push('Practice question missing answer');
        } else {
            // Exercise Audit
            const ex = data as Exercise;
            if (!ex.type) errors.push('Missing type');
            if (!ex.questions || !Array.isArray(ex.questions)) {
                errors.push('Missing or invalid questions array');
            } else {
                ex.questions.forEach((q, idx) => {
                    if (!q.id) errors.push(`Question ${idx + 1} missing ID`);

                    const hasAnswer = (q.answer !== undefined && q.answer !== null) ||
                        (Array.isArray((q as any).answers) && (q as any).answers.length > 0);

                    if (!hasAnswer) errors.push(`Question ${idx + 1} missing answer/answers`);

                    if (ex.type === 'mcq') {
                        if (!q.options || typeof q.options !== 'object') errors.push(`MCQ question ${idx + 1} missing options`);
                    }
                });

                if (ex.type === 'gap_fill') {
                    const markerRegex = /\[\d+\]/g;
                    const underscoreRegex = /___/g;

                    let totalGaps = 0;
                    if (ex.passage) {
                        const markers = ex.passage.match(markerRegex) || [];
                        const underscores = ex.passage.match(underscoreRegex) || [];
                        totalGaps += markers.length + underscores.length;
                    }

                    // Also check question texts if no gaps in passage
                    if (totalGaps === 0) {
                        ex.questions.forEach(q => {
                            if (q.text) {
                                const markers = q.text.match(markerRegex) || [];
                                const underscores = q.text.match(underscoreRegex) || [];
                                totalGaps += markers.length + underscores.length;
                            }
                        });
                    }

                    let expectedAnswersCount = 0;
                    ex.questions.forEach(q => {
                        const anyQ = q as Record<string, unknown>;
                        const blankCount = (q.text || '').split('___').length - 1;
                        if (blankCount > 1 && Array.isArray(anyQ.answers) && anyQ.answers.length > 1) {
                            expectedAnswersCount += anyQ.answers.length;
                        } else {
                            expectedAnswersCount += 1;
                        }
                    });

                    if (totalGaps === 0 && ex.questions.length > 0) {
                        // Some exercises might be "write the form of word" without explicit markers
                        // We'll warn instead of erroring if there are no markers at all but questions exist
                        warnings.push(`Gap-fill exercise has no explicit markers ([N] or ___) in passage or question texts`);
                    } else if (totalGaps > 0 && totalGaps !== expectedAnswersCount) {
                        errors.push(`Gap count (${totalGaps}) does not match expected answers count (${expectedAnswersCount})`);
                    }

                    if (ex.passage && ex.passage.includes('___')) {
                        warnings.push(`Passage uses underscores '___' instead of standard '[N]' markers`);
                    }
                }

                if (ex.type === 'matching') {
                    if (!ex.options || typeof ex.options !== 'object') errors.push('Matching exercise missing options map');
                }
            }
        }

        // ID vs Filename consistency
        const filename = path.basename(filePath, '.json');
        if (data.id && !data.id.includes(filename) && !filename.includes(data.id)) {
            warnings.push(`Internal ID '${data.id}' might not match filename '${filename}'`);
        }

    } catch (err) {
        errors.push(`Failed to parse JSON: ${err}`);
    }

    if (errors.length > 0 || warnings.length > 0) {
        auditResults.push({ file: relativePath, errors, warnings });
    }
}

async function runAudit() {
    console.log('Starting Database Audit...');
    const files = walk(DB_ROOT);
    console.log(`Found ${files.length} files. Auditing...`);

    for (const file of files) {
        await auditFile(file);
    }

    console.log('\n--- Audit Report ---');
    if (auditResults.length === 0) {
        console.log('No issues found!');
    } else {
        auditResults.sort((a, b) => b.errors.length - a.errors.length);
        auditResults.forEach(res => {
            console.log(`\nFile: ${res.file}`);
            res.errors.forEach(e => console.log(`  [ERROR] ${e}`));
            res.warnings.forEach(w => console.log(`  [WARN]  ${w}`));
        });

        const totalErrors = auditResults.reduce((acc, curr) => acc + curr.errors.length, 0);
        const totalWarnings = auditResults.reduce((acc, curr) => acc + curr.warnings.length, 0);
        console.log(`\nSummary: Found ${totalErrors} errors and ${totalWarnings} warnings in ${auditResults.length} files.`);
    }
}

runAudit();
