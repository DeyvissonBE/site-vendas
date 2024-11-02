# Usa a imagem oficial do Node.js
FROM node:14

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e o package-lock.json (se existir) e instala as dependências
COPY package.json package-lock.json ./
RUN npm install

# Instala swagger-jsdoc e swagger-ui-express
RUN npm install swagger-jsdoc swagger-ui-express

# Copia o restante dos arquivos para o diretório de trabalho
COPY . .

# Exponha a porta que a aplicação vai usar (exemplo: 3000)
EXPOSE 3000

# Comando para rodar o servidor
CMD ["node", "src/server.js"]
