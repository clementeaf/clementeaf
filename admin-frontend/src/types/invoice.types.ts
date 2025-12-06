export interface InvoiceData {
    [key: string]: unknown;
}

export interface ParsedInvoice {
    id: string;
    fileName: string;
    uploadDate: Date;
    rawData: InvoiceData;
    extractedData?: ExtractedInvoiceData;
}

export interface ExtractedInvoiceData {
    invoiceNumber?: string;
    issueDate?: string;
    dueDate?: string;
    supplier?: {
        name?: string;
        taxId?: string;
        address?: string;
    };
    customer?: {
        name?: string;
        taxId?: string;
        address?: string;
    };
    items?: InvoiceItem[];
    totals?: {
        subtotal?: number;
        tax?: number;
        total?: number;
        currency?: string;
    };
}

export interface InvoiceItem {
    description?: string;
    quantity?: number;
    unitPrice?: number;
    total?: number;
    taxAmount?: number;
}

export interface UploadState {
    isUploading: boolean;
    progress: number;
    error: string | null;
}
