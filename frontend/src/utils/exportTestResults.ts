import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface Student { fullName: string; username: string; phoneNumber?: string }
interface Result {
    id: string;
    totalScore: number;
    vocabScore: number | null;
    vocabCorrect: number | null;
    vocabTotal: number | null;
    grammarScore: number | null;
    grammarCorrect: number | null;
    grammarTotal: number | null;
    submittedAt: string;
    student: Student;
}
interface Section {
    sectionOrder: number;
    subject: string;
    sectionType: string;
    numberOfExercises: number;
    timeAllocated: number;
}
export interface ExportTestData {
    title: string;
    pinCode: string;
    createdAt: string;
    sections: Section[];
    results: Result[];
}

const FOOTER_TEXT = "Ushbu hujjat IELTS Imperia platformasi tomonidan yaratilgan. Developed by TriCorp agency.";

const fmt = (s: number | null | undefined) => s != null ? `${s.toFixed(1)}%` : '—';
const fmtFraction = (c: number | null | undefined, t: number | null | undefined) =>
    c != null && t != null ? `${c}/${t}` : '—';
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─────────────────────────────────────────────────────────────────────────────
// EXCEL
// ─────────────────────────────────────────────────────────────────────────────
export async function exportToExcel(data: ExportTestData) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Natijalar');

    // Title Row
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'IELTS Imperia — Test Natijalari';
    titleCell.font = { name: 'Calibri', bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Meta Info
    const avgScore = data.results.length
        ? data.results.reduce((s, r) => s + r.totalScore, 0) / data.results.length
        : null;

    worksheet.addRow(['']); // Spacer
    worksheet.addRow(['Test nomi:', data.title]);
    worksheet.addRow(['PIN kodi:', data.pinCode]);
    worksheet.addRow(['Yaratilgan:', fmtDate(data.createdAt)]);
    worksheet.addRow(['Ishtirokchilar:', data.results.length]);
    worksheet.addRow(["O'rtacha ball:", avgScore != null ? `${avgScore.toFixed(1)}%` : '—']);
    worksheet.addRow(['Hisobot sanasi:', fmtDateTime(new Date().toISOString())]);
    worksheet.addRow(['']); // Spacer

    // Header Row
    const headerRow = worksheet.addRow(['#', "Ism Familiya", 'Username', 'Telefon', "Umumiy ball", 'Vocabulary (%)', 'Vocabulary (t/s)', 'Grammar (%)', 'Grammar (t/s)', 'Sana']);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a1a' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Data Rows
    data.results.forEach((r, i) => {
        const rowData = [
            i + 1,
            r.student.fullName,
            '@' + r.student.username,
            r.student.phoneNumber || '—',
            parseFloat(r.totalScore.toFixed(1)) / 100, // Format as percentage later
            r.vocabScore != null ? parseFloat(r.vocabScore.toFixed(1)) / 100 : '—',
            fmtFraction(r.vocabCorrect, r.vocabTotal),
            r.grammarScore != null ? parseFloat(r.grammarScore.toFixed(1)) / 100 : '—',
            fmtFraction(r.grammarCorrect, r.grammarTotal),
            fmtDateTime(r.submittedAt),
        ];
        const row = worksheet.addRow(rowData);

        // Styling per cell
        row.eachCell((cell, colNum) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                right: { style: 'thin', color: { argb: 'FFEEEEEE' } },
            };

            // Alignment: Center all, but name is Left
            if (colNum === 2) {
                cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
            } else {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }

            // Number formatting for scores
            if ([5, 6, 8].includes(colNum) && typeof cell.value === 'number') {
                cell.numFmt = '0.0%';
            }
        });

        // Alternating row background
        if (i % 2 === 0) {
            row.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
            });
        }
    });

    // Footer at end of sheet
    worksheet.addRow(['']);
    const footerRow = worksheet.addRow([FOOTER_TEXT]);
    footerRow.font = { color: { argb: 'FFAAAAAA' }, italic: true, size: 9 };
    worksheet.mergeCells(`A${footerRow.number}:J${footerRow.number}`);
    footerRow.alignment = { horizontal: 'center' };

    // Set Column Widths
    worksheet.columns = [
        { width: 22 }, { width: 33 }, { width: 18 }, { width: 18 },
        { width: 15 }, { width: 16 }, { width: 18 }, { width: 15 }, { width: 16 }, { width: 22 },
    ];

    // Style meta rows (3 to 8)
    for (let i = 3; i <= 8; i++) {
        const cell = worksheet.getCell(`A${i}`);
        cell.font = { bold: true, name: 'Calibri' };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${data.title.replace(/[/\\?%*:|"<>]/g, '_')}_natijalar.xlsx`);
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF
// ─────────────────────────────────────────────────────────────────────────────
export function exportToPdf(data: ExportTestData) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const now = fmtDateTime(new Date().toISOString());

    // Header block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('IELTS Imperia', 14, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Test Natijalari Hisoboti', 14, 23);
    doc.text(`Sana: ${now}`, pageW - 14, 23, { align: 'right' });

    // Horizontal line
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(14, 27, pageW - 14, 27);

    // Meta info
    doc.setTextColor(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(data.title, 14, 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80);
    const avgScore = data.results.length
        ? data.results.reduce((s, r) => s + r.totalScore, 0) / data.results.length
        : null;
    const metaLine = [
        `PIN: ${data.pinCode}`,
        `Yaratilgan: ${fmtDate(data.createdAt)}`,
        `Ishtirokchilar: ${data.results.length}`,
        `O'rtacha ball: ${avgScore != null ? avgScore.toFixed(1) + '%' : '—'}`,
    ].join('     ');
    doc.text(metaLine, 14, 41);

    // Results table
    autoTable(doc, {
        startY: 47,
        head: [['#', "Ism Familiya", 'Username', "Umumiy ball", 'Vocab (%)', "Vocab (t/s)", 'Grammar (%)', "Grammar (t/s)", 'Sana']],
        body: data.results.map((r, i) => [
            i + 1,
            r.student.fullName,
            '@' + r.student.username,
            `${r.totalScore.toFixed(1)}%`,
            fmt(r.vocabScore),
            fmtFraction(r.vocabCorrect, r.vocabTotal),
            fmt(r.grammarScore),
            fmtFraction(r.grammarCorrect, r.grammarTotal),
            fmtDateTime(r.submittedAt),
        ]),
        styles: {
            fontSize: 8.5,
            cellPadding: 3,
            font: 'helvetica',
            textColor: [30, 30, 30],
        },
        headStyles: {
            fillColor: [30, 30, 30],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8.5,
        },
        alternateRowStyles: {
            fillColor: [248, 248, 248],
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { cellWidth: 42 },
            2: { cellWidth: 26 },
            3: { halign: 'center', cellWidth: 20 },
            4: { halign: 'center', cellWidth: 18 },
            5: { halign: 'center', cellWidth: 22 },
            6: { halign: 'center', cellWidth: 18 },
            7: { halign: 'center', cellWidth: 24 },
            8: { cellWidth: 30 },
        },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1,
        margin: { left: 14, right: 14 },
    });

    // Footer on each page
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(7.5);
    doc.setTextColor(170);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const y = doc.internal.pageSize.getHeight() - 8;
        doc.text(FOOTER_TEXT, pageW / 2, y, { align: 'center' });
        doc.text(`Sahifa ${i} / ${pageCount}`, pageW - 14, y, { align: 'right' });
    }

    doc.save(`${data.title.replace(/[/\\?%*:|"<>]/g, '_')}_natijalar.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// WORD (DOCX)
// ─────────────────────────────────────────────────────────────────────────────
export async function exportToWord(data: ExportTestData) {
    const avgScore = data.results.length
        ? data.results.reduce((s, r) => s + r.totalScore, 0) / data.results.length
        : null;

    const borderAll = {
        top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
        left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
        right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
    };

    const cell = (text: string, header = false, shade?: string, width?: number) =>
        new TableCell({
            width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
            shading: shade ? { fill: shade, type: 'clear' } : undefined,
            borders: borderAll,
            children: [new Paragraph({
                alignment: header ? AlignmentType.CENTER : (text.includes('%') || !isNaN(Number(text)) || text.includes('/') ? AlignmentType.CENTER : AlignmentType.LEFT),
                children: [new TextRun({
                    text,
                    bold: header,
                    size: header ? 18 : 17,
                    font: 'Calibri',
                    color: header ? 'FFFFFF' : '1a1a1a',
                })],
            })],
        });

    const widths = [5, 20, 12, 10, 10, 10, 10, 10, 13];
    const headerRow = new TableRow({
        tableHeader: true,
        children: ['#', "Ism Familiya", 'Username', "Umumiy", 'Vocab (%)', "Vocab (t/s)", 'Grammar (%)', "Grammar (t/s)", 'Sana'].map((h, i) => cell(h, true, '1e1e1e', widths[i])),
    });

    const dataRows = data.results.map((r, i) =>
        new TableRow({
            children: [
                cell(String(i + 1), false, i % 2 === 0 ? 'F8F8F8' : 'FFFFFF', widths[0]),
                cell(r.student.fullName, false, i % 2 === 0 ? 'F8F8F8' : 'FFFFFF', widths[1]),
                cell('@' + r.student.username, false, i % 2 === 0 ? 'F8F8F8' : 'FFFFFF', widths[2]),
                cell(`${r.totalScore.toFixed(1)}%`, false, i % 2 === 0 ? 'F8F8F8' : 'FFFFFF', widths[3]),
                cell(fmt(r.vocabScore), false, i % 2 === 0 ? 'F8F8F8' : 'FFFFFF', widths[4]),
                cell(fmtFraction(r.vocabCorrect, r.vocabTotal), false, i % 2 === 0 ? 'F8F8F8' : 'FFFFFF', widths[5]),
                cell(fmt(r.grammarScore), false, i % 2 === 0 ? 'F8F8F8' : 'FFFFFF', widths[6]),
                cell(fmtFraction(r.grammarCorrect, r.grammarTotal), false, i % 2 === 0 ? 'F8F8F8' : 'FFFFFF', widths[7]),
                cell(fmtDate(r.submittedAt), false, i % 2 === 0 ? 'F8F8F8' : 'FFFFFF', widths[8]),
            ],
        })
    );

    const doc = new Document({
        creator: 'TriCorp agency',
        description: 'IELTS Imperia Test Natijalari',
        title: data.title,
        sections: [{
            properties: { page: { margin: { top: 800, bottom: 800, left: 900, right: 900 } } },
            children: [
                new Paragraph({
                    heading: HeadingLevel.TITLE,
                    children: [new TextRun({ text: 'IELTS Imperia', bold: true, size: 36, font: 'Calibri', color: '1a1a1a' })],
                }),
                new Paragraph({
                    children: [new TextRun({ text: 'Test Natijalari Hisoboti', size: 22, font: 'Calibri', color: '555555' })],
                }),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                new Paragraph({
                    children: [new TextRun({ text: `Test nomi: ${data.title}`, bold: true, size: 22, font: 'Calibri' })],
                }),
                new Paragraph({
                    children: [new TextRun({ text: `PIN kodi: ${data.pinCode}   |   Sana: ${fmtDate(data.createdAt)}   |   Ball: ${avgScore != null ? avgScore.toFixed(1) + '%' : '—'}`, size: 20, font: 'Calibri', color: '444444' })],
                }),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [headerRow, ...dataRows],
                }),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: FOOTER_TEXT, size: 16, font: 'Calibri', color: 'AAAAAA', italics: true })],
                }),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${data.title.replace(/[/\\?%*:|"<>]/g, '_')}_natijalar.docx`);
}

