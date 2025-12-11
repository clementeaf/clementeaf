import { Block } from '@aws-sdk/client-textract';
import { ExtractedPurchaseOrder, PurchaseOrderItem } from '../types';

/**
 * Servicio para parsear datos extraídos de Textract
 * y convertirlos en estructuras de datos de orden de compra
 */
export class DocumentParser {
  /**
   * Parsea bloques de Textract a orden de compra
   */
  parsePurchaseOrder(
    blocks: Block[],
    keyValuePairs: Record<string, string>,
    tables: string[][][]
  ): ExtractedPurchaseOrder {
    return {
      orderNumber: this.extractOrderNumber(keyValuePairs),
      issueDate: this.extractDate(keyValuePairs, 'fecha'),
      deliveryDate: this.extractDate(keyValuePairs, 'entrega'),
      companyName: this.extractCompanyName(keyValuePairs),
      companyRut: this.extractRut(keyValuePairs),
      items: this.extractItems(tables),
      subtotal: this.extractAmount(keyValuePairs, 'subtotal'),
      tax: this.extractAmount(keyValuePairs, 'iva'),
      total: this.extractAmount(keyValuePairs, 'total'),
      paymentTerms: this.extractPaymentTerms(keyValuePairs),
      notes: this.extractNotes(blocks)
    };
  }

  /**
   * Extrae número de orden
   */
  private extractOrderNumber(kvPairs: Record<string, string>): string | undefined {
    const keys = ['orden', 'order', 'número de orden', 'n° orden', 'oc'];
    
    for (const key of keys) {
      const value = this.findValueByKeyPattern(kvPairs, key);
      if (value) return value;
    }
    
    return undefined;
  }

  /**
   * Extrae fecha
   */
  private extractDate(kvPairs: Record<string, string>, type: string): string | undefined {
    const patterns = [type, `fecha ${type}`, `fecha de ${type}`];
    
    for (const pattern of patterns) {
      const value = this.findValueByKeyPattern(kvPairs, pattern);
      if (value) return this.normalizeDate(value);
    }
    
    return undefined;
  }

  /**
   * Extrae nombre de empresa
   */
  private extractCompanyName(kvPairs: Record<string, string>): string | undefined {
    const keys = ['empresa', 'razón social', 'proveedor', 'cliente'];
    
    for (const key of keys) {
      const value = this.findValueByKeyPattern(kvPairs, key);
      if (value) return value;
    }
    
    return undefined;
  }

  /**
   * Extrae RUT
   */
  private extractRut(kvPairs: Record<string, string>): string | undefined {
    const keys = ['rut', 'r.u.t', 'tax id'];
    
    for (const key of keys) {
      const value = this.findValueByKeyPattern(kvPairs, key);
      if (value) return this.normalizeRut(value);
    }
    
    // Buscar en todos los valores con regex de RUT
    for (const value of Object.values(kvPairs)) {
      const rut = this.extractRutFromText(value);
      if (rut) return rut;
    }
    
    return undefined;
  }

  /**
   * Extrae items de las tablas
   */
  private extractItems(tables: string[][][]): PurchaseOrderItem[] {
    const items: PurchaseOrderItem[] = [];
    
    for (const table of tables) {
      // Asumimos que la primera fila son headers
      if (table.length < 2) continue;
      
      const headers = table[0].map(h => h.toLowerCase());
      
      // Encontrar índices de columnas
      const descIndex = this.findColumnIndex(headers, ['descripción', 'producto', 'item']);
      const qtyIndex = this.findColumnIndex(headers, ['cantidad', 'qty', 'cant']);
      const priceIndex = this.findColumnIndex(headers, ['precio', 'price', 'valor']);
      const totalIndex = this.findColumnIndex(headers, ['total']);
      const skuIndex = this.findColumnIndex(headers, ['sku', 'código', 'code']);
      
      // Parsear filas
      for (let i = 1; i < table.length; i++) {
        const row = table[i];
        
        const description = descIndex >= 0 ? row[descIndex] : '';
        if (!description) continue;
        
        const quantity = qtyIndex >= 0 ? this.parseNumber(row[qtyIndex]) : 0;
        const unitPrice = priceIndex >= 0 ? this.parseNumber(row[priceIndex]) : 0;
        const totalPrice = totalIndex >= 0 
          ? this.parseNumber(row[totalIndex]) 
          : quantity * unitPrice;
        const sku = skuIndex >= 0 ? row[skuIndex] : undefined;
        
        items.push({
          description,
          quantity,
          unitPrice,
          totalPrice,
          sku
        });
      }
    }
    
    return items;
  }

  /**
   * Extrae monto
   */
  private extractAmount(kvPairs: Record<string, string>, type: string): number | undefined {
    const value = this.findValueByKeyPattern(kvPairs, type);
    return value ? this.parseNumber(value) : undefined;
  }

  /**
   * Extrae términos de pago
   */
  private extractPaymentTerms(kvPairs: Record<string, string>): string | undefined {
    const keys = ['condiciones de pago', 'forma de pago', 'payment terms'];
    
    for (const key of keys) {
      const value = this.findValueByKeyPattern(kvPairs, key);
      if (value) return value;
    }
    
    return undefined;
  }

  /**
   * Extrae notas del documento
   */
  private extractNotes(blocks: Block[]): string | undefined {
    const text = blocks
      .filter(b => b.BlockType === 'LINE')
      .map(b => b.Text || '')
      .join('\n');
    
    // Buscar sección de notas
    const notesPattern = /notas?:?\s*(.+)/i;
    const match = text.match(notesPattern);
    
    return match ? match[1].trim() : undefined;
  }

  /**
   * Helpers
   */
  private findValueByKeyPattern(kvPairs: Record<string, string>, pattern: string): string | undefined {
    const normalizedPattern = pattern.toLowerCase();
    
    for (const [key, value] of Object.entries(kvPairs)) {
      if (key.toLowerCase().includes(normalizedPattern)) {
        return value;
      }
    }
    
    return undefined;
  }

  private findColumnIndex(headers: string[], patterns: string[]): number {
    for (const pattern of patterns) {
      const index = headers.findIndex(h => h.includes(pattern));
      if (index >= 0) return index;
    }
    return -1;
  }

  private parseNumber(text: string): number {
    // Remover caracteres no numéricos excepto punto y coma
    const cleaned = text.replace(/[^\d.,]/g, '');
    // Reemplazar coma por punto
    const normalized = cleaned.replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  private normalizeDate(text: string): string {
    // Aquí puedes implementar lógica más compleja de normalización de fechas
    return text.trim();
  }

  private normalizeRut(text: string): string {
    // Formato: XX.XXX.XXX-X
    return text.replace(/\./g, '').replace(/-/g, '').trim();
  }

  private extractRutFromText(text: string): string | undefined {
    // Regex para RUT chileno: 12.345.678-9 o 12345678-9
    const rutPattern = /\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/;
    const match = text.match(rutPattern);
    return match ? this.normalizeRut(match[0]) : undefined;
  }
}
