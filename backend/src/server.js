const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: 'API de Vendas',
      description: 'Documentação da API de Vendas',
      version: '1.0.0',
    },
  },
  apis: ['./src/server.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Simulação de banco de dados em memória
let produtos = [];

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Certifique-se de que o diretório 'uploads' existe
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Endpoint para listar produtos
app.get('/produtos', (req, res) => {
  res.json(produtos);
});

// Endpoint para criar um novo produto com upload de imagem
app.post('/produtos', upload.single('imagem'), (req, res) => {
  const { nome, preco, quantidade } = req.body;
  const imagem = req.file ? `/uploads/${req.file.filename}` : null;

  const produto = {
    id: produtos.length + 1,
    nome,
    preco,
    quantidade,
    imagem,
  };

  produtos.push(produto);
  res.status(201).json(produto);
});

// Endpoint para obter um produto pelo ID
app.get('/produtos/:id', (req, res) => {
  const produto = produtos.find(p => p.id === parseInt(req.params.id));
  if (!produto) return res.status(404).send('Produto não encontrado');
  res.json(produto);
});

// Endpoint para atualizar um produto pelo ID
app.put('/produtos/:id', (req, res) => {
  const produto = produtos.find(p => p.id === parseInt(req.params.id));
  if (!produto) return res.status(404).send('Produto não encontrado');

  const { nome, preco, imagem, quantidade } = req.body;
  produto.nome = nome;
  produto.preco = preco;
  produto.imagem = imagem;
  produto.quantidade = quantidade;

  res.json(produto);
});

// Endpoint para excluir um produto pelo ID
app.delete('/produtos/:id', (req, res) => {
  const produtoIndex = produtos.findIndex(p => p.id === parseInt(req.params.id));
  if (produtoIndex === -1) return res.status(404).send('Produto não encontrado');

  produtos.splice(produtoIndex, 1);
  res.status(204).send();
});

// Rota para servir as imagens
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
