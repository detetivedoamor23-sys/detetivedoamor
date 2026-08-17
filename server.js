const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/api/analyze', async (req, res) => {
  try {
    // Verifica se a chave chegou ao servidor
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY não encontrada!');
      return res.status(500).json({
        error: 'OPENAI_API_KEY não configurada no servidor'
      });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Nenhum texto foi enviado'
      });
    }

    console.log('Enviando análise para OpenAI...');

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Você é o Detetive do Amor. Analise conversas e retorne um JSON com: {"analise":"texto","nivelRisco":"baixo/medio/alto","sinais":["lista"]}'
            },
            {
              role: 'user',
              content: text
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log('Status OpenAI:', response.status);
    console.log('Resposta OpenAI:', data);

    // Se a OpenAI retornar erro
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Erro na OpenAI',
        details: data
      });
    }

    res.json(data);

  } catch (error) {
    console.error('Erro no servidor:', error);

    res.status(500).json({
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
