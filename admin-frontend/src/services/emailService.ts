import { sum } from 'radashi';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { CtasPorCobrar } from '../types/analytics';

export interface SendEmailRequest {
  to: string | string[];
  subject: string;
  body: string;
  htmlBody?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

/**
 * Formatea un valor numérico como moneda chilena
 */
const formatCurrency = (value: number | null): string => {
  if (value === null || value === undefined) return '$0';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(value);
};

/**
 * Formatea una fecha a formato chileno
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Genera el contenido HTML del correo con información de deudas
 */
export const generateDebtNotificationEmail = (
  companyName: string,
  companyRut: string,
  debts: CtasPorCobrar[]
): { subject: string; htmlBody: string; textBody: string } => {
  const totalDebt = sum(debts, debt => debt.deuda || 0);
  const totalDocuments = debts.length;

  const subject = `Recordatorio de Pago - ${companyName}`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Pago</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #1e40af; margin-top: 0;">Recordatorio de Pago</h1>
    <p style="margin: 0; font-size: 16px;">Estimado/a <strong>${companyName}</strong></p>
    <p style="margin: 5px 0; font-size: 14px; color: #666;">RUT: ${companyRut}</p>
  </div>

  <div style="background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <h2 style="color: #dc2626; margin-top: 0; font-size: 18px;">Resumen de Documentos Pendientes</h2>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background-color: #fef2f2; border-radius: 6px;">
      <div>
        <p style="margin: 0; font-size: 12px; color: #666;">Total Documentos</p>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #333;">${totalDocuments}</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-size: 12px; color: #666;">Deuda Total</p>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #dc2626;">${formatCurrency(totalDebt)}</p>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 12px; color: #666;">Documento</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 12px; color: #666;">Fecha Vencimiento</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-size: 12px; color: #666;">Monto</th>
          <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; font-size: 12px; color: #666;">Días Vencidos</th>
        </tr>
      </thead>
      <tbody>
        ${debts.map((debt, index) => {
    const diasVencidos = debt.dias_vencidos ?? null;
    const statusColor = diasVencidos === null || diasVencidos < 0 ? '#059669' : diasVencidos <= 30 ? '#f59e0b' : '#dc2626';
    const statusText = diasVencidos === null ? 'Pendiente' : diasVencidos < 0 ? 'Por vencer' : diasVencidos === 0 ? 'Vence hoy' : `${diasVencidos} días`;

    return `
          <tr style="border-bottom: 1px solid #e5e7eb; ${index % 2 === 0 ? 'background-color: #f9fafb;' : ''}">
            <td style="padding: 12px; font-size: 13px;">
              <strong>${debt.td || '-'} ${debt.numdocto || '-'}</strong>
              ${debt.razsoc && debt.razsoc !== companyName ? `<br><span style="color: #666; font-size: 11px;">${debt.razsoc}</span>` : ''}
            </td>
            <td style="padding: 12px; font-size: 13px;">${formatDate(debt.vencimiento)}</td>
            <td style="padding: 12px; text-align: right; font-size: 13px; font-weight: bold; color: #dc2626;">${formatCurrency(debt.deuda)}</td>
            <td style="padding: 12px; text-align: center; font-size: 13px;">
              <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
            </td>
          </tr>
          `;
  }).join('')}
      </tbody>
    </table>
  </div>

  <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
    <p style="margin: 0; font-size: 14px; color: #1e40af;">
      <strong>Importante:</strong> Por favor, proceda con el pago de los documentos pendientes para evitar inconvenientes.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
    <p style="margin: 0;">Este es un correo automático, por favor no responder.</p>
    <p style="margin: 5px 0 0 0;">Banados - Sistema de Gestión</p>
  </div>
</body>
</html>
  `.trim();

  const textBody = `
Recordatorio de Pago

Estimado/a ${companyName}
RUT: ${companyRut}

Resumen de Documentos Pendientes:
- Total Documentos: ${totalDocuments}
- Deuda Total: ${formatCurrency(totalDebt)}

Documentos:
${debts.map((debt, index) => {
    const diasVencidos = debt.dias_vencidos ?? null;
    const statusText = diasVencidos === null ? 'Pendiente' : diasVencidos < 0 ? 'Por vencer' : diasVencidos === 0 ? 'Vence hoy' : `${diasVencidos} días vencidos`;

    return `
${index + 1}. ${debt.td || '-'} ${debt.numdocto || '-'}${debt.razsoc && debt.razsoc !== companyName ? ` (${debt.razsoc})` : ''}
   Fecha Vencimiento: ${formatDate(debt.vencimiento)}
   Monto: ${formatCurrency(debt.deuda)}
   Estado: ${statusText}
  `;
  }).join('')}

Importante: Por favor, proceda con el pago de los documentos pendientes para evitar inconvenientes.

Este es un correo automático, por favor no responder.
Banados - Sistema de Gestión
  `.trim();

  return { subject, htmlBody, textBody };
};

/**
 * Servicio para enviar correos electrónicos
 */
export const emailService = {
  /**
   * Envía un correo electrónico
   * @param emailData - Datos del correo a enviar
   * @returns Respuesta del servidor
   */
  async sendEmail(emailData: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      const { data } = await apiClient.post<{ success: boolean; message: string; messageId?: string; error?: string }>(
        endpoints.email.send,
        emailData
      );
      return data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { error?: string; message?: string } } };
        if (axiosError.response?.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        const errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || 'Error al enviar correo';
        throw new Error(errorMessage);
      }
      throw error instanceof Error ? error : new Error('Error desconocido al enviar correo');
    }
  },

  /**
   * Envía notificación de deudas a una empresa
   * @param companyName - Nombre de la empresa
   * @param companyRut - RUT de la empresa
   * @param companyEmail - Email de la empresa
   * @param debts - Lista de deudas/documentos
   * @returns Respuesta del servidor
   */
  async sendDebtNotification(
    companyName: string,
    companyRut: string,
    companyEmail: string,
    debts: CtasPorCobrar[]
  ): Promise<SendEmailResponse> {
    if (!companyEmail) {
      throw new Error(`La empresa ${companyName} no tiene email registrado`);
    }

    const { subject, htmlBody, textBody } = generateDebtNotificationEmail(companyName, companyRut, debts);

    return this.sendEmail({
      to: companyEmail,
      subject,
      body: textBody,
      htmlBody
    });
  }
};

