import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  body: string;
  htmlBody?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  from?: string;
}

/**
 * Servicio para enviar correos electrónicos usando AWS SES
 */
export class EmailService {
  private sesClient: SESClient;
  private defaultFromEmail: string;

  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT_URL || undefined
    });
    this.defaultFromEmail = process.env.SES_FROM_EMAIL || 'carriagadafalcone@gmail.com';
  }

  /**
   * Convierte un string o array de strings a array de strings
   * @param value - String o array de strings
   * @returns Array de strings
   */
  private normalizeEmailAddresses(value: string | string[] | undefined): string[] {
    if (!value) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }

  /**
   * Valida que una dirección de correo tenga formato válido
   * @param email - Dirección de correo a validar
   * @returns true si el formato es válido
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida todas las direcciones de correo
   * @param emails - Array de direcciones de correo
   * @throws Error si alguna dirección no es válida
   */
  private validateEmailAddresses(emails: string[]): void {
    for (const email of emails) {
      if (!this.isValidEmail(email)) {
        throw new Error(`Dirección de correo inválida: ${email}`);
      }
    }
  }

  /**
   * Envía un correo electrónico usando AWS SES
   * @param options - Opciones del correo electrónico
   * @returns ID del mensaje enviado
   */
  async sendEmail(options: EmailOptions): Promise<string> {
    const toAddresses = this.normalizeEmailAddresses(options.to);
    const ccAddresses = this.normalizeEmailAddresses(options.cc);
    const bccAddresses = this.normalizeEmailAddresses(options.bcc);
    const fromEmail = options.from || this.defaultFromEmail;

    if (toAddresses.length === 0) {
      throw new Error('Se debe especificar al menos un destinatario');
    }

    this.validateEmailAddresses([fromEmail, ...toAddresses, ...ccAddresses, ...bccAddresses]);

    const fromDisplayName = process.env.SES_FROM_NAME || 'Banados';
    const sourceEmail = `${fromDisplayName} <${fromEmail}>`;

    const command = new SendEmailCommand({
      Source: sourceEmail,
      Destination: {
        ToAddresses: toAddresses,
        CcAddresses: ccAddresses.length > 0 ? ccAddresses : undefined,
        BccAddresses: bccAddresses.length > 0 ? bccAddresses : undefined
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Text: options.htmlBody
            ? undefined
            : {
                Data: options.body,
                Charset: 'UTF-8'
              },
          Html: options.htmlBody
            ? {
                Data: options.htmlBody,
                Charset: 'UTF-8'
              }
            : undefined
        }
      },
      ReplyToAddresses: options.replyTo ? [options.replyTo] : undefined
    });

    try {
      const response = await this.sesClient.send(command);
      return response.MessageId || '';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al enviar correo';
      throw new Error(`Error al enviar correo: ${errorMessage}`);
    }
  }

  /**
   * Envía un correo HTML
   * @param to - Destinatario(s)
   * @param subject - Asunto del correo
   * @param htmlBody - Cuerpo del correo en HTML
   * @param options - Opciones adicionales
   * @returns ID del mensaje enviado
   */
  async sendHtmlEmail(
    to: string | string[],
    subject: string,
    htmlBody: string,
    options?: {
      cc?: string | string[];
      bcc?: string | string[];
      replyTo?: string;
      from?: string;
    }
  ): Promise<string> {
    return this.sendEmail({
      to,
      subject,
      body: '',
      htmlBody,
      cc: options?.cc,
      bcc: options?.bcc,
      replyTo: options?.replyTo,
      from: options?.from
    });
  }

  /**
   * Envía un correo de texto plano
   * @param to - Destinatario(s)
   * @param subject - Asunto del correo
   * @param body - Cuerpo del correo en texto plano
   * @param options - Opciones adicionales
   * @returns ID del mensaje enviado
   */
  async sendTextEmail(
    to: string | string[],
    subject: string,
    body: string,
    options?: {
      cc?: string | string[];
      bcc?: string | string[];
      replyTo?: string;
      from?: string;
    }
  ): Promise<string> {
    return this.sendEmail({
      to,
      subject,
      body,
      cc: options?.cc,
      bcc: options?.bcc,
      replyTo: options?.replyTo,
      from: options?.from
    });
  }
}

