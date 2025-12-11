import { 
  TextractClient, 
  AnalyzeDocumentCommand,
  DetectDocumentTextCommand,
  AnalyzeDocumentCommandInput,
  DetectDocumentTextCommandInput,
  Block
} from '@aws-sdk/client-textract';

/**
 * Servicio para interactuar con Amazon Textract
 */
export class TextractService {
  private client: TextractClient;

  constructor() {
    this.client = new TextractClient({
      region: process.env.OCR_REGION || 'us-east-1'
    });
  }

  /**
   * Analiza un documento de S3 con detección completa (tablas, formularios, etc)
   */
  async analyzeDocument(bucket: string, key: string): Promise<any> {
    const params: AnalyzeDocumentCommandInput = {
      Document: {
        S3Object: {
          Bucket: bucket,
          Name: key
        }
      },
      FeatureTypes: ['TABLES', 'FORMS']
    };

    const command = new AnalyzeDocumentCommand(params);
    const response = await this.client.send(command);

    return {
      DocumentMetadata: {
        Pages: response.DocumentMetadata?.Pages || 1
      },
      Blocks: response.Blocks || []
    };
  }

  /**
   * Detección simple de texto (más rápido, menos features)
   */
  async detectDocumentText(bucket: string, key: string): Promise<any> {
    const params: DetectDocumentTextCommandInput = {
      Document: {
        S3Object: {
          Bucket: bucket,
          Name: key
        }
      }
    };

    const command = new DetectDocumentTextCommand(params);
    const response = await this.client.send(command);

    return {
      DocumentMetadata: {
        Pages: 1
      },
      Blocks: response.Blocks || []
    };
  }

  /**
   * Extrae todo el texto del documento
   */
  extractAllText(blocks: Block[]): string {
    return blocks
      .filter(block => block.BlockType === 'LINE')
      .map(block => block.Text || '')
      .join('\n');
  }

  /**
   * Extrae pares clave-valor del documento
   */
  extractKeyValuePairs(blocks: Block[]): Record<string, string> {
    const keyValuePairs: Record<string, string> = {};
    const blockMap = new Map(blocks.filter(b => b.Id).map(block => [block.Id!, block]));

    blocks
      .filter(block => block.BlockType === 'KEY_VALUE_SET' && block.EntityTypes?.includes('KEY'))
      .forEach(keyBlock => {
        const keyText = this.getKeyText(keyBlock, blockMap);
        const valueText = this.getValueText(keyBlock, blockMap);
        
        if (keyText && valueText) {
          keyValuePairs[keyText] = valueText;
        }
      });

    return keyValuePairs;
  }

  /**
   * Extrae tablas del documento
   */
  extractTables(blocks: Block[]): string[][][] {
    const tables: string[][][] = [];
    const blockMap = new Map(blocks.filter(b => b.Id).map(block => [block.Id!, block]));

    blocks
      .filter(block => block.BlockType === 'TABLE')
      .forEach(tableBlock => {
        const table = this.extractTable(tableBlock, blockMap);
        if (table.length > 0) {
          tables.push(table);
        }
      });

    return tables;
  }

  /**
   * Helpers privados
   */
  private getKeyText(keyBlock: Block, blockMap: Map<string, Block>): string {
    const childIds = keyBlock.Relationships?.find((rel: any) => rel.Type === 'CHILD')?.Ids || [];
    return childIds
      .map((id: string) => blockMap.get(id)?.Text || '')
      .join(' ')
      .trim();
  }

  private getValueText(keyBlock: Block, blockMap: Map<string, Block>): string {
    const valueIds = keyBlock.Relationships?.find((rel: any) => rel.Type === 'VALUE')?.Ids || [];
    const valueBlock = valueIds.length > 0 ? blockMap.get(valueIds[0]) : undefined;
    
    if (!valueBlock) return '';

    const childIds = valueBlock.Relationships?.find((rel: any) => rel.Type === 'CHILD')?.Ids || [];
    return childIds
      .map((id: string) => blockMap.get(id)?.Text || '')
      .join(' ')
      .trim();
  }

  private extractTable(tableBlock: Block, blockMap: Map<string, Block>): string[][] {
    const cellIds = tableBlock.Relationships?.find((rel: any) => rel.Type === 'CHILD')?.Ids || [];
    const cells = cellIds
      .map((id: string) => blockMap.get(id))
      .filter((cell: any): cell is Block => cell !== undefined && cell.BlockType === 'CELL');

    const maxRow = Math.max(...cells.map((cell: any) => cell.RowIndex || 0));
    const maxCol = Math.max(...cells.map((cell: any) => cell.ColumnIndex || 0));

    const table: string[][] = Array(maxRow).fill(null).map(() => Array(maxCol).fill(''));

    cells.forEach(cell => {
      const rowIndex = (cell.RowIndex || 1) - 1;
      const colIndex = (cell.ColumnIndex || 1) - 1;
      const cellText = this.getCellText(cell, blockMap);
      
      if (rowIndex >= 0 && colIndex >= 0) {
        table[rowIndex][colIndex] = cellText;
      }
    });

    return table;
  }

  private getCellText(cellBlock: Block, blockMap: Map<string, Block>): string {
    const childIds = cellBlock.Relationships?.find((rel: any) => rel.Type === 'CHILD')?.Ids || [];
    return childIds
      .map((id: string) => blockMap.get(id)?.Text || '')
      .join(' ')
      .trim();
  }
}
