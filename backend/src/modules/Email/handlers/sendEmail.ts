import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { EmailService } from '../services/EmailService';
import { SendEmailDto } from '../dto/SendEmailDto';

/**
 * Handler para enviar correos electrónicos
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          message: 'El cuerpo de la petición es requerido'
        })
      };
    }

    const emailData: SendEmailDto = JSON.parse(event.body);

    if (!emailData.to) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          message: 'El campo "to" es requerido'
        })
      };
    }

    if (!emailData.subject) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          message: 'El campo "subject" es requerido'
        })
      };
    }

    if (!emailData.body && !emailData.htmlBody) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          message: 'Se debe proporcionar "body" o "htmlBody"'
        })
      };
    }

    const emailService = new EmailService();
    const messageId = await emailService.sendEmail({
      to: emailData.to,
      subject: emailData.subject,
      body: emailData.body || '',
      htmlBody: emailData.htmlBody,
      cc: emailData.cc,
      bcc: emailData.bcc,
      replyTo: emailData.replyTo
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Correo enviado exitosamente',
        messageId
      })
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al enviar correo:', errorMessage);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message: 'Error al enviar correo',
        error: errorMessage
      })
    };
  }
};

