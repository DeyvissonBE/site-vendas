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

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
app.get('/produtos', (req, res) => {
  res.json(produtos);
});

/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Cria um novo produto com upload de imagem
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               preco:
 *                 type: number
 *               quantidade:
 *                 type: integer
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 */
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

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Obtém um produto pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
app.get('/produtos/:id', (req, res) => {
  const produto = produtos.find(p => p.id === parseInt(req.params.id));
  if (!produto) return res.status(404).send('Produto não encontrado');
  res.json(produto);
});

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     summary: Atualiza um produto pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               preco:
 *                 type: number
 *               imagem:
 *                 type: string
 *               quantidade:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
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

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Exclui um produto pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Produto excluído com sucesso
 *       404:
 *         description: Produto não encontrado
 */
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
