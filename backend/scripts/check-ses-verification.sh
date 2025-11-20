#!/bin/bash

# Script para verificar el estado de verificación de SES

EMAIL="noreply@banados.cl"
REGION="us-east-1"
MAX_ATTEMPTS=60
INTERVAL=30

echo "🔍 Verificando estado de verificación de $EMAIL"
echo "⏱️  Intervalo: $INTERVAL segundos"
echo "🔄 Máximo de intentos: $MAX_ATTEMPTS"
echo ""

for i in $(seq 1 $MAX_ATTEMPTS); do
    STATUS=$(aws sesv2 get-email-identity --email-identity "$EMAIL" --region "$REGION" --query 'VerificationStatus' --output text 2>&1)
    VERIFIED=$(aws sesv2 get-email-identity --email-identity "$EMAIL" --region "$REGION" --query 'VerifiedForSendingStatus' --output text 2>&1)
    PRODUCTION=$(aws sesv2 get-account --region "$REGION" --query 'ProductionAccessEnabled' --output text 2>&1)
    
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$TIMESTAMP] Intento $i/$MAX_ATTEMPTS"
    echo "   Estado: $STATUS"
    echo "   Verificado para envío: $VERIFIED"
    echo "   Modo Producción: $PRODUCTION"
    
    if [ "$STATUS" = "SUCCESS" ] && [ "$VERIFIED" = "true" ]; then
        echo ""
        echo "✅ ¡VERIFICACIÓN EXITOSA!"
        echo "   $EMAIL está verificado y listo para usar."
        
        if [ "$PRODUCTION" = "true" ]; then
            echo "   ✅ Modo Producción activado - Puede enviar a cualquier dirección"
        else
            echo "   ⚠️  Modo Sandbox - Solo puede enviar a direcciones verificadas"
            echo "   📝 Solicita Production Access en AWS SES Console para enviar a cualquier dirección"
        fi
        exit 0
    fi
    
    if [ $i -lt $MAX_ATTEMPTS ]; then
        echo "   ⏳ Esperando $INTERVAL segundos..."
        echo ""
        sleep $INTERVAL
    fi
done

echo ""
echo "⏱️  Tiempo de espera agotado. El correo aún no ha sido verificado."
echo "📧 Asegúrate de:"
echo "   1. Revisar la bandeja de entrada de $EMAIL"
echo "   2. Buscar el correo de verificación de AWS SES"
echo "   3. Hacer clic en el enlace de verificación"
echo ""
echo "💡 Puedes ejecutar este script nuevamente para seguir verificando."

