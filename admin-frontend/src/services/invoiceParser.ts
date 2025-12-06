import { XMLParser } from 'fast-xml-parser';
import { get } from 'radashi';
import type { InvoiceData, ExtractedInvoiceData } from '../types/invoice.types';

const parserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    parseAttributeValue: true,
    trimValues: true,
    parseTrueNumberOnly: true,
};

export class InvoiceParserService {
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser(parserOptions);
    }

    /**
     * Parse XML string to JSON object
     */
    parseXML(xmlString: string): InvoiceData {
        try {
            const result = this.parser.parse(xmlString);
            return result;
        } catch (error) {
            console.error('Error parsing XML:', error);
            throw new Error('Failed to parse XML file. Please ensure it is a valid XML document.');
        }
    }

    /**
     * Extract common invoice fields from parsed data
     * This is a generic extraction - can be customized for specific invoice formats
     */
    extractInvoiceData(parsedData: InvoiceData): ExtractedInvoiceData {
        const extracted: ExtractedInvoiceData = {};

        try {
            // Try to find common invoice fields
            // This is a generic approach - adjust based on your specific XML structure

            // Look for invoice number
            extracted.invoiceNumber = this.findValue(parsedData, [
                'Invoice.InvoiceNumber',
                'Factura.Folio',
                'Document.ID',
                'invoiceNumber',
                'folio',
            ]);

            // Look for dates
            extracted.issueDate = this.findValue(parsedData, [
                'Invoice.IssueDate',
                'Factura.Fecha',
                'Document.IssueDate',
                'issueDate',
                'fecha',
            ]);

            extracted.dueDate = this.findValue(parsedData, [
                'Invoice.DueDate',
                'Factura.FechaVencimiento',
                'Document.DueDate',
                'dueDate',
            ]);

            // Extract supplier info
            extracted.supplier = {
                name: this.findValue(parsedData, [
                    'Invoice.Supplier.Name',
                    'Factura.Emisor.Nombre',
                    'Document.Supplier.Name',
                ]),
                taxId: this.findValue(parsedData, [
                    'Invoice.Supplier.TaxID',
                    'Factura.Emisor.RUT',
                    'Document.Supplier.TaxID',
                ]),
            };

            // Extract customer info
            extracted.customer = {
                name: this.findValue(parsedData, [
                    'Invoice.Customer.Name',
                    'Factura.Receptor.Nombre',
                    'Document.Customer.Name',
                ]),
                taxId: this.findValue(parsedData, [
                    'Invoice.Customer.TaxID',
                    'Factura.Receptor.RUT',
                    'Document.Customer.TaxID',
                ]),
            };

            // Extract totals
            extracted.totals = {
                subtotal: this.findNumericValue(parsedData, [
                    'Invoice.Totals.Subtotal',
                    'Factura.Totales.MntNeto',
                    'Document.Totals.Subtotal',
                ]),
                tax: this.findNumericValue(parsedData, [
                    'Invoice.Totals.Tax',
                    'Factura.Totales.IVA',
                    'Document.Totals.Tax',
                ]),
                total: this.findNumericValue(parsedData, [
                    'Invoice.Totals.Total',
                    'Factura.Totales.MntTotal',
                    'Document.Totals.Total',
                ]),
                currency: this.findValue(parsedData, [
                    'Invoice.Currency',
                    'Factura.Moneda',
                    'Document.Currency',
                ]) || 'CLP',
            };

        } catch (error) {
            console.error('Error extracting invoice data:', error);
        }

        return extracted;
    }

    /**
     * Find a value in nested object using multiple possible paths
     */
    private findValue(obj: unknown, paths: string[]): string | undefined {
        for (const path of paths) {
            const value = get(obj, path);
            if (value !== undefined && value !== null) {
                return String(value);
            }
        }
        return undefined;
    }

    /**
     * Find a numeric value in nested object
     */
    private findNumericValue(obj: unknown, paths: string[]): number | undefined {
        const value = this.findValue(obj, paths);
        if (value) {
            const num = parseFloat(value);
            return isNaN(num) ? undefined : num;
        }
        return undefined;
    }

    /**
     * Validate if string is valid XML
     */
    validateXML(xmlString: string): boolean {
        try {
            this.parser.parse(xmlString);
            return true;
        } catch {
            return false;
        }
    }
}

export const invoiceParser = new InvoiceParserService();
