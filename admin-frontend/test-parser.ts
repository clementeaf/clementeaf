import { invoiceParser } from './src/services/invoiceParser';
import * as fs from 'fs';
import * as path from 'path';

// Mock the XMLParser import since we are running in node with ts-node potentially or just need to handle the import
// Actually, since the project is Vite + TS, running this directly with ts-node might require some setup for imports.
// Instead, I'll read the file and use the parser logic directly in a simple node script, 
// but I need to make sure I can import the service which uses ES modules.

// Let's try to read the file and parse it using the library directly to verify the mapping logic matches the sample.
// Or better, I will create a temporary test file that I can run with `npx tsx` if available, or just compile it.

async function testParser() {
    try {
        const __dirname = path.dirname(new URL(import.meta.url).pathname);
        const xmlContent = fs.readFileSync(path.join(__dirname, 'sample-invoice.xml'), 'utf-8');

        console.log('--- XML Content ---');
        console.log(xmlContent.substring(0, 100) + '...');

        console.log('\n--- Validating XML ---');
        const isValid = invoiceParser.validateXML(xmlContent);
        console.log('Is Valid:', isValid);

        if (isValid) {
            console.log('\n--- Parsing XML ---');
            const parsed = invoiceParser.parseXML(xmlContent);
            // console.log('Parsed Raw:', JSON.stringify(parsed, null, 2));

            console.log('\n--- Extracting Data ---');
            const extracted = invoiceParser.extractInvoiceData(parsed);
            console.log('Extracted Data:', JSON.stringify(extracted, null, 2));

            // Assertions
            if (extracted.invoiceNumber !== '12345') throw new Error('Invoice Number mismatch');
            if (extracted.totals?.total !== 1190000) throw new Error('Total mismatch');
            if (extracted.supplier?.name !== 'Empresa Ejemplo S.A.') throw new Error('Supplier Name mismatch');

            console.log('\n✅ Test Passed: Data extraction successful!');
        }
    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

testParser();
