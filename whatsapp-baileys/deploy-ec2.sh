#!/bin/bash
set -e

echo "=== Instalando Node.js 18 ==="
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

echo "=== Instalando PM2 ==="
sudo npm install -g pm2

echo "=== Clonando repositorio ==="
cd /home/ec2-user
git clone -b feature/ficha-cliente https://github.com/clementeaf/clementeaf.git repo
cd repo/whatsapp-baileys

echo "=== Instalando dependencias ==="
npm install

echo "=== Compilando TypeScript ==="
npm run build

echo "=== Creando .env ==="
cat > .env << 'EOF'
PORT=3001
LOG_LEVEL=info
NODE_ENV=production
EOF

echo "=== Iniciando servicio con PM2 ==="
pm2 start dist/src/index.js --name whatsapp-baileys
pm2 save
pm2 startup

echo "=== Deployment completado ==="
echo "Servicio corriendo en http://44.200.30.66:3001"
