/**
 * Script de prueba para WebSocket Chat
 * Prueba la conexión, envío y recepción de mensajes
 */

const WebSocket = require('ws');
const axios = require('axios');

const WSS_ENDPOINT = 'wss://us3x8rdme1.execute-api.us-east-1.amazonaws.com/dev';
const REST_API_ENDPOINT = 'https://z9hjvrr8b3.execute-api.us-east-1.amazonaws.com/dev';

// Test 1: Conexión WebSocket
async function testWebSocketConnection() {
  console.log('\n=== Test 1: Conexión WebSocket ===');
  
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WSS_ENDPOINT}?userId=1`);
    
    ws.on('open', () => {
      console.log('✅ Conexión WebSocket establecida');
      resolve(ws);
    });
    
    ws.on('error', (error) => {
      console.error('❌ Error en conexión WebSocket:', error.message);
      reject(error);
    });
    
    ws.on('message', (data) => {
      console.log('📨 Mensaje recibido:', data.toString());
    });
    
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log('✅ Conexión WebSocket activa');
        ws.close();
        resolve(ws);
      }
    }, 2000);
  });
}

// Test 2: Crear conversación y enviar mensaje vía WebSocket
async function testSendMessageViaWebSocket() {
  console.log('\n=== Test 2: Crear conversación y enviar mensaje vía WebSocket ===');
  
  // Primero crear usuarios de prueba si no existen
  try {
    console.log('📝 Creando usuarios de prueba...');
    await axios.post(`${REST_API_ENDPOINT}/auth/register`, {
      email: 'test1@test.com',
      password: 'test123',
      name: 'Usuario Test 1'
    }).catch(() => {});
    
    await axios.post(`${REST_API_ENDPOINT}/auth/register`, {
      email: 'test2@test.com',
      password: 'test123',
      name: 'Usuario Test 2'
    }).catch(() => {});
    
    console.log('✅ Usuarios listos');
  } catch (error) {
    console.log('ℹ️ Usuarios ya existen o error:', error.message);
  }
  
  // Crear una conversación vía REST API
  try {
    console.log('📝 Creando conversación...');
    const conversationResponse = await axios.post(`${REST_API_ENDPOINT}/chat/conversations`, {
      participant1Id: 1,
      participant2Id: 2
    });
    
    const conversationId = conversationResponse.data.data.id;
    console.log(`✅ Conversación creada: ${conversationId}`);
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WSS_ENDPOINT}?userId=1`);
      
      ws.on('open', () => {
        console.log('✅ Conexión WebSocket establecida');
        
        const message = {
          action: 'sendMessage',
          conversationId: conversationId,
          senderId: 1,
          content: 'Mensaje de prueba desde WebSocket'
        };
        
        console.log('📤 Enviando mensaje:', JSON.stringify(message));
        ws.send(JSON.stringify(message));
      });
      
      ws.on('message', (data) => {
        try {
          const response = JSON.parse(data.toString());
          console.log('📨 Respuesta recibida:', JSON.stringify(response, null, 2));
          ws.close();
          resolve(response);
        } catch (error) {
          console.log('📨 Mensaje recibido (texto):', data.toString());
          ws.close();
          resolve({ message: data.toString() });
        }
      });
      
      ws.on('error', (error) => {
        console.error('❌ Error:', error.message);
        reject(error);
      });
      
      setTimeout(() => {
        ws.close();
        reject(new Error('Timeout esperando respuesta'));
      }, 10000);
    });
  } catch (error) {
    console.error('❌ Error creando conversación:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Verificar tabla DynamoDB de conexiones
async function testDynamoDBConnections() {
  console.log('\n=== Test 3: Verificar conexiones en DynamoDB ===');
  
  const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
  const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
  
  const client = new DynamoDBClient({ region: 'us-east-1' });
  const docClient = DynamoDBDocumentClient.from(client);
  
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: 'backend-dev-connections'
      })
    );
    
    console.log(`✅ Conexiones encontradas: ${result.Items?.length || 0}`);
    if (result.Items && result.Items.length > 0) {
      console.log('Conexiones:', JSON.stringify(result.Items, null, 2));
    }
    return result.Items || [];
  } catch (error) {
    console.error('❌ Error consultando DynamoDB:', error.message);
    throw error;
  }
}

// Ejecutar tests
async function runTests() {
  try {
    console.log('🚀 Iniciando tests de WebSocket Chat...\n');
    
    // Test 1: Conexión
    await testWebSocketConnection();
    
    // Test 2: Envío de mensaje
    await testSendMessageViaWebSocket();
    
    // Test 3: DynamoDB
    await testDynamoDBConnections();
    
    console.log('\n✅ Todos los tests completados');
  } catch (error) {
    console.error('\n❌ Error en tests:', error.message);
    process.exit(1);
  }
}

runTests();

