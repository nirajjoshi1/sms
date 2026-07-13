const PDFDocument = require('pdfkit');

/**
 * Generates a beautiful PDF buffer for a fee payment receipt
 * @param {Object} payment - The fee payment record (with Student, FeeGroup, FeeType)
 * @param {Object} school - The school details (name, logo, phone, email, address)
 * @param {Object} adminUser - The user who processed the fee collection (optional)
 * @returns {Promise<Buffer>}
 */
exports.generateFeeReceiptPDF = (payment, school, adminUser) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            // --- Top Banner Accent ---
            doc.rect(0, 0, doc.page.width, 15).fill('#4f46e5');

            doc.moveDown(2);

            // --- School Branding Header ---
            doc.fillColor('#1e3a8a')
               .fontSize(20)
               .font('Helvetica-Bold')
               .text(school?.name || 'SCHOOL MANAGEMENT SYSTEM', { align: 'center' });

            // Contact details
            const contactInfo = [];
            if (school?.phone) contactInfo.push(`Phone: ${school.phone}`);
            if (school?.email) contactInfo.push(`Email: ${school.email}`);
            if (school?.address) contactInfo.push(`Address: ${school.address}`);
            
            if (contactInfo.length > 0) {
                doc.fillColor('#4b5563')
                   .fontSize(9)
                   .font('Helvetica')
                   .text(contactInfo.join('  |  '), { align: 'center' });
            }

            doc.moveDown(1.5);
            doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
            doc.moveDown(1.5);

            // --- Receipt Title ---
            doc.fillColor('#111827')
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('FEE COLLECTION RECEIPT', { align: 'center', characterSpacing: 1 });
            
            doc.moveDown(1.5);

            // --- Metadata Grid (Left & Right columns) ---
            const gridY = doc.y;
            doc.fontSize(9);

            // Left Column (Receipt & Payment details)
            doc.font('Helvetica-Bold').fillColor('#6b7280').text('RECEIPT NO:', 50, gridY);
            doc.font('Helvetica-Bold').fillColor('#111827').text(payment.receiptNumber || payment.receiptNo || 'N/A', 150, gridY);

            doc.font('Helvetica-Bold').fillColor('#6b7280').text('DATE PAID:', 50, gridY + 18);
            doc.font('Helvetica').fillColor('#111827').text(new Date(payment.paymentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }), 150, gridY + 18);

            doc.font('Helvetica-Bold').fillColor('#6b7280').text('PAYMENT METHOD:', 50, gridY + 36);
            doc.font('Helvetica').fillColor('#111827').text(payment.paymentMethod + (payment.transactionId ? ` (${payment.transactionId})` : ''), 150, gridY + 36);

            // Right Column (Student details)
            const rightColX = 320;
            const rightValX = 420;
            doc.font('Helvetica-Bold').fillColor('#6b7280').text('STUDENT NAME:', rightColX, gridY);
            doc.font('Helvetica-Bold').fillColor('#111827').text(`${payment.Student?.firstName} ${payment.Student?.lastName || ''}`, rightValX, gridY);

            doc.font('Helvetica-Bold').fillColor('#6b7280').text('ADMISSION NO:', rightColX, gridY + 18);
            doc.font('Helvetica').fillColor('#111827').text(payment.Student?.admissionNo || 'N/A', rightValX, gridY + 18);

            doc.font('Helvetica-Bold').fillColor('#6b7280').text('CLASS / SECTION:', rightColX, gridY + 36);
            doc.font('Helvetica').fillColor('#111827').text(`${payment.Student?.Class?.name || 'N/A'} - ${payment.Student?.Section?.name || 'N/A'}`, rightValX, gridY + 36);

            doc.moveDown(4.5);

            // --- Table Header ---
            const tableY = doc.y;
            doc.rect(50, tableY, doc.page.width - 100, 22).fill('#f9fafb');
            doc.fillColor('#475569').font('Helvetica-Bold').fontSize(9);
            doc.text('DESCRIPTION', 65, tableY + 7);
            doc.text('AMOUNT', doc.page.width - 150, tableY + 7, { align: 'right', width: 90 });

            // Table Row (Fee Details)
            doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, tableY + 22).lineTo(doc.page.width - 50, tableY + 22).stroke();
            
            let rowY = tableY + 22;
            doc.fillColor('#0f172a').font('Helvetica-Bold');
            doc.text(payment.FeeType?.name || 'School Fee', 65, rowY + 10);
            doc.font('Helvetica').fillColor('#64748b').fontSize(8.5).text(`Fee Group: ${payment.FeeGroup?.name || 'General'}`, 65, rowY + 22);
            
            doc.font('Helvetica-Bold').fillColor('#0f172a').fontSize(9);
            doc.text(`INR ${Number(payment.amount).toFixed(2)}`, doc.page.width - 150, rowY + 12, { align: 'right', width: 90 });

            rowY += 40;

            // Draw line after row
            doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, rowY).lineTo(doc.page.width - 50, rowY).stroke();

            // --- Financial Breakdown ---
            rowY += 12;
            doc.fontSize(9.5).font('Helvetica').fillColor('#475569');
            
            doc.text('Subtotal:', 300, rowY);
            doc.font('Helvetica-Bold').fillColor('#0f172a').text(`INR ${Number(payment.amount).toFixed(2)}`, doc.page.width - 150, rowY, { align: 'right', width: 90 });

            if (Number(payment.fineAmount) > 0) {
                rowY += 18;
                doc.font('Helvetica').fillColor('#dc2626').text('Late Fine / Penalty:', 300, rowY);
                doc.font('Helvetica-Bold').text(`+ INR ${Number(payment.fineAmount).toFixed(2)}`, doc.page.width - 150, rowY, { align: 'right', width: 90 });
            }

            if (Number(payment.discountAmount) > 0) {
                rowY += 18;
                doc.font('Helvetica').fillColor('#16a34a').text('Discount Applied:', 300, rowY);
                doc.font('Helvetica-Bold').text(`- INR ${Number(payment.discountAmount).toFixed(2)}`, doc.page.width - 150, rowY, { align: 'right', width: 90 });
            }

            rowY += 22;
            
            // Grand Total Row
            doc.rect(300, rowY - 4, doc.page.width - 350, 26).fill('#f1f5f9');
            doc.fillColor('#0f172a').font('Helvetica-Bold');
            doc.text('TOTAL PAID:', 310, rowY + 5);
            doc.fillColor('#4f46e5').text(`INR ${Number(payment.netAmount).toFixed(2)}`, doc.page.width - 150, rowY + 5, { align: 'right', width: 90 });

            rowY += 45;

            // Remarks
            if (payment.remarks) {
                doc.fillColor('#334155').fontSize(8.5).font('Helvetica-Oblique');
                doc.text(`Remarks: ${payment.remarks}`, 50, rowY);
                rowY += 20;
            }

            // Signatory / Admin details
            doc.fillColor('#475569').fontSize(8.5).font('Helvetica');
            const processedBy = adminUser ? `${adminUser.firstName} ${adminUser.lastName || ''}` : 'Administration';
            doc.text(`Processed By: ${processedBy}`, 50, rowY);

            // Bottom border and page footer
            doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.page.height - 65).lineTo(doc.page.width - 50, doc.page.height - 65).stroke();
            doc.fillColor('#94a3b8')
               .fontSize(7.5)
               .text('This is a computer-generated confirmation document and does not require a physical signature.', 50, doc.page.height - 50, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

const https = require('https');

function convertADtoBS(adDate) {
    if (!adDate) return 'N/A';
    const date = new Date(adDate);
    if (isNaN(date.getTime())) return 'N/A';
    
    const adYear = date.getFullYear();
    const adMonth = date.getMonth() + 1;
    const adDay = date.getDate();
    
    let bsYear = adYear + 56;
    let bsMonth = adMonth + 8;
    let bsDay = adDay + 15;
    
    if (bsDay > 30) {
        bsDay -= 30;
        bsMonth += 1;
    }
    if (bsMonth > 12) {
        bsMonth -= 12;
        bsYear += 1;
    }
    
    return `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`;
}

function getGenderPronouns(gender) {
    const g = (gender || '').toLowerCase();
    if (g === 'female' || g === 'f') {
        return {
            mrMs: 'Ms.',
            sonDaughter: 'daughter',
            heShe: 'She',
            hisHer: 'Her',
            himHer: 'her'
        };
    } else if (g === 'male' || g === 'm') {
        return {
            mrMs: 'Mr.',
            sonDaughter: 'son',
            heShe: 'He',
            hisHer: 'His',
            himHer: 'him'
        };
    }
    return {
        mrMs: 'Mr./Ms.',
        sonDaughter: 'son/daughter',
        heShe: 'He/She',
        hisHer: 'His/Her',
        himHer: 'him/her'
    };
}

function fetchQRCodeBuffer(url) {
    return new Promise((resolve, reject) => {
        const qrUrl = `https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(url)}`;
        
        function get(targetUrl) {
            https.get(targetUrl, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    return get(res.headers.location);
                }
                const data = [];
                res.on('data', (chunk) => data.push(chunk));
                res.on('end', () => resolve(Buffer.concat(data)));
            }).on('error', reject);
        }
        
        get(qrUrl);
    });
}

function fetchImageBuffer(url) {
    return new Promise((resolve, reject) => {
        if (!url) return resolve(null);
        if (url.startsWith('data:')) {
            const base64Data = url.split(',')[1];
            return resolve(Buffer.from(base64Data, 'base64'));
        }
        
        function get(targetUrl) {
            const client = targetUrl.startsWith('https') ? require('https') : require('http');
            client.get(targetUrl, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    return get(res.headers.location);
                }
                const data = [];
                res.on('data', (chunk) => data.push(chunk));
                res.on('end', () => resolve(Buffer.concat(data)));
            }).on('error', reject);
        }
        
        get(url);
    });
}

function drawFormattedCertificateText(doc, text, startX, startY, maxWidth, lineGap = 20) {
    let currentX = startX;
    let currentY = startY;
    
    const paragraphs = text.split('\n');
    
    paragraphs.forEach((para, paraIdx) => {
        if (paraIdx > 0) {
            currentX = startX;
            currentY += lineGap * 1.1;
        }
        
        const words = para.split(' ');
        
        words.forEach(word => {
            if (!word) return;
            
            let isBold = false;
            let cleanWord = word;
            
            if (word.includes('**')) {
                isBold = true;
                cleanWord = word.replace(/\*\*/g, '');
            }
            
            if (isBold) {
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#334155');
            } else {
                doc.font('Helvetica').fontSize(12).fillColor('#334155');
            }
            
            const wordWidth = doc.widthOfString(cleanWord + ' ');
            
            if (currentX + wordWidth > startX + maxWidth) {
                currentX = startX;
                currentY += lineGap;
            }
            
            doc.text(cleanWord + ' ', currentX, currentY, { lineBreak: false });
            
            currentX += wordWidth;
        });
    });
    
    return currentY;
}

/**
 * Generates a beautiful landscape A4 PDF buffer for a student certificate
 * @param {Object} issuedCert - The issued certificate record
 * @param {Object} school - The school details
 * @returns {Promise<Buffer>}
 */
exports.generateCertificatePDF = (issuedCert, school) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            const width = doc.page.width;
            const height = doc.page.height;

            // --- Draw Border ---
            doc.rect(20, 20, width - 40, height - 40).lineWidth(4).strokeColor('#1e3a8a').stroke();
            doc.rect(26, 26, width - 52, height - 52).lineWidth(1.5).strokeColor('#d97706').stroke();

            // --- Motto ---
            doc.fillColor('#4b5563')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text('"EDUCATION FOR CULTURE AND DIGNITY"', 50, 42, { align: 'center' });

            // --- Status Watermark ---
            if (issuedCert.status === 'Cancelled') {
                doc.save();
                doc.fontSize(60).fillColor('#dc2626', 0.15).font('Helvetica-Bold');
                doc.translate(width / 2, height / 2);
                doc.rotate(-30);
                doc.text('CANCELLED', -200, -30, { align: 'center', width: 400 });
                doc.restore();
            } else if (issuedCert.isDuplicate) {
                doc.save();
                doc.fontSize(60).fillColor('#6b7280', 0.12).font('Helvetica-Bold');
                doc.translate(width / 2, height / 2);
                doc.rotate(-30);
                doc.text('DUPLICATE COPY', -250, -30, { align: 'center', width: 500 });
                doc.restore();
            }

            // --- School Logo (Top Left) ---
            let headerY = 60;
            if (school?.logo) {
                try {
                    const logoBuffer = await fetchImageBuffer(school.logo);
                    if (logoBuffer) {
                        doc.image(logoBuffer, 50, headerY, { width: 60, height: 60 });
                    }
                } catch (e) {
                    console.error("Failed to load school logo in PDF:", e);
                    doc.rect(50, headerY, 60, 60).lineWidth(0.5).strokeColor('#cbd5e1').stroke();
                }
            } else {
                doc.circle(80, headerY + 30, 30).lineWidth(1).strokeColor('#1e3a8a').stroke();
            }

            // --- Student Photograph Frame (Top Right) ---
            const photoX = width - 135;
            const photoY = 55;
            const photoW = 85;
            const photoH = 100;
            doc.rect(photoX, photoY, photoW, photoH).lineWidth(1).strokeColor('#94a3b8').stroke();
            
            const student = issuedCert.Student || {};
            if (student.photo) {
                try {
                    const photoBuffer = await fetchImageBuffer(student.photo);
                    if (photoBuffer) {
                        doc.image(photoBuffer, photoX + 2, photoY + 2, { width: photoW - 4, height: photoH - 4 });
                    }
                } catch (e) {
                    console.error("Failed to load student photo in PDF:", e);
                    doc.font('Helvetica-Oblique').fontSize(8).fillColor('#94a3b8')
                       .text('Photo', photoX, photoY + 45, { align: 'center', width: photoW });
                }
            } else {
                doc.font('Helvetica-Oblique').fontSize(8).fillColor('#94a3b8')
                   .text('Photo', photoX, photoY + 45, { align: 'center', width: photoW });
            }

            // --- School Branding & Header (Top Center) ---
            doc.fillColor('#dc2626')
               .fontSize(22)
               .font('Helvetica-Bold')
               .text((school?.name || 'SCHOOL MANAGEMENT SYSTEM').toUpperCase(), 130, headerY, { align: 'center', width: width - 280 });

            const template = issuedCert.Template || {};
            const subHeader = template.headerLeftText || 'Affiliated to HSEB';
            doc.fillColor('#1e3a8a')
               .fontSize(10.5)
               .font('Helvetica-Bold')
               .text(subHeader, 130, headerY + 26, { align: 'center', width: width - 280 });

            const addressText = school?.address || 'Birtamode, Jhapa (Nepal)';
            doc.fillColor('#4b5563')
               .fontSize(10)
               .font('Helvetica')
               .text(addressText, 130, headerY + 40, { align: 'center', width: width - 280 });

            // --- Badge Ribbon / Title Banner ---
            const bannerY = 145;
            const bannerW = 360;
            const bannerH = 28;
            const bannerX = width / 2 - bannerW / 2;

            doc.save();
            doc.fillColor('#b45309');
            doc.polygon(
                [bannerX - 15, bannerY + 6],
                [bannerX, bannerY],
                [bannerX, bannerY + bannerH],
                [bannerX - 15, bannerY + bannerH + 6]
            ).fill();
            doc.polygon(
                [bannerX + bannerW + 15, bannerY + 6],
                [bannerX + bannerW, bannerY],
                [bannerX + bannerW, bannerY + bannerH],
                [bannerX + bannerW + 15, bannerY + bannerH + 6]
            ).fill();
            doc.restore();

            doc.rect(bannerX, bannerY, bannerW, bannerH).lineWidth(1.5).fillAndStroke('#fef08a', '#b45309');
            
            doc.fillColor('#dc2626')
               .fontSize(12.5)
               .font('Helvetica-Bold')
               .text((template.name || 'CHARACTER / TRANSFER CERTIFICATE').toUpperCase(), bannerX, bannerY + 8, { align: 'center', width: bannerW, characterSpacing: 0.5 });

            // --- Date Block ---
            const dateStr = `Date: ${issuedCert.nepaliDate || new Date(issuedCert.issueDate).toLocaleDateString()}`;
            doc.fillColor('#334155')
               .fontSize(10.5)
               .font('Helvetica-Bold')
               .text(dateStr, width - 190, 185, { align: 'right', width: 140 });

            // --- Main Citation Body ---
            const studentName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName || ''}`.trim();
            const fatherName = student.fatherName || 'Siddi Bahadur Subedi';
            
            const isTransfer = template.name?.toLowerCase().includes('transfer');
            let citationText = '';

            if (isTransfer) {
                const pronouns = getGenderPronouns(student.gender);
                const className = student.Class?.name || 'N/A';
                
                const admissionDateBS = convertADtoBS(student.admissionDate || new Date(new Date(issuedCert.dynamicFields?.leavingDate || issuedCert.issueDate).getFullYear() - 2, 4, 15));
                const leavingDateBS = convertADtoBS(issuedCert.dynamicFields?.leavingDate || issuedCert.issueDate);
                const leavingYearBS = new Date(issuedCert.dynamicFields?.leavingDate || issuedCert.issueDate).getFullYear() + 57;
                const dobBS = convertADtoBS(student.dob || '2047-04-01');

                citationText = `This is to certify that ${pronouns.mrMs} **${studentName}** ${pronouns.sonDaughter} of Mr. **${fatherName}** was a student of **${className}** in this school. ${pronouns.hisHer} admission date is **${admissionDateBS} BS** and leaving date is **${leavingDateBS} BS**. ${pronouns.heShe} has passed the **${className}** examination in the year **${leavingYearBS} BS** and was placed in **First** Division.\n\n${pronouns.hisHer} conduct and character during this period was **good**. ${pronouns.hisHer} date of birth according to the school record is **${dobBS} BS**.\n\nI wish ${pronouns.himHer} successful career and a bright future.`;
            } else {
                const stream = issuedCert.dynamicFields?.stream || template.headerRightText || 'Humanities / Management / Education';
                const admissionYear = issuedCert.dynamicFields?.admissionYear || '2065';
                const leavingYear = issuedCert.dynamicFields?.leavingYear || '2067';
                const examYear = issuedCert.dynamicFields?.examYear || '2067';
                const division = issuedCert.dynamicFields?.division || 'Second';
                const registrationNo = issuedCert.dynamicFields?.registrationNo || student.rollNumber || '660306266';
                let dob = '2047-04-01';
                if (student.dob) {
                    dob = new Date(student.dob).toISOString().split('T')[0];
                }
                if (issuedCert.dynamicFields?.dob) {
                    dob = issuedCert.dynamicFields.dob;
                }
                const address = student.guardianAddress || 'Chandragadi - 08, Jhapa';
                
                citationText = `This is to certify that Mr./Ms. **${studentName}** a resident of **${address}** son/daughter of Mr. **${fatherName}** studied the prescribed course in **${stream}** in this school from **${admissionYear}** to **${leavingYear}** as a regular student and duly passed the Higher Secondary Examination held in **${examYear}** and was placed in **${division}** Division. His/Her Registration no. is **${registrationNo}** and the date of birth is **${dob}**.\n\nHe/She bears good moral character.\n\nI wish him/her successful career and a bright future.`;
            }

            drawFormattedCertificateText(doc, citationText, 60, 230, width - 120, 24);

            // --- Signatures & QR Code Footer ---
            let footerY = height - 110;

            if (!isTransfer) {
                try {
                    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
                    const verificationUrl = `${clientUrl}/verify/certificate/${issuedCert.certificateNumber}`;
                    const qrBuffer = await fetchQRCodeBuffer(verificationUrl);
                    if (qrBuffer) {
                        doc.image(qrBuffer, width / 2 - 30, footerY - 20, { width: 60, height: 60 });
                        doc.fontSize(7).fillColor('#94a3b8').text('Scan to Verify', width / 2 - 50, footerY + 43, { align: 'center', width: 100 });
                    }
                } catch (e) {
                    console.error("Failed to draw QR verification code:", e);
                }
            }

            const sigWidth = 150;
            doc.strokeColor('#94a3b8').lineWidth(0.8).moveTo(60, footerY + 20).lineTo(210, footerY + 20).stroke();
            doc.fillColor('#475569').fontSize(9.5).font('Helvetica-Bold');
            doc.text(template.footerLeftText || 'Class Teacher', 60, footerY + 26, { align: 'center', width: sigWidth });

            doc.strokeColor('#94a3b8').lineWidth(0.8).moveTo(width - 210, footerY + 20).lineTo(width - 60, footerY + 20).stroke();
            doc.text(template.footerRightText || 'Principal', width - 210, footerY + 26, { align: 'center', width: sigWidth });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
