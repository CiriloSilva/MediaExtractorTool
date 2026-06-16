# Media Extractor Tool

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)
![Fastify](https://img.shields.io/badge/Fastify-4.x-000000?logo=fastify)
![License](https://img.shields.io/badge/License-Educational-blue)

Ferramenta web para extração de mídia, permitindo baixar vídeos em **MP4 (vídeo + áudio)** ou apenas o áudio em **MP3**, a partir de plataformas públicas como YouTube, Instagram e Twitter.

> Projeto educacional e experimental.

---

## Funcionalidades

- Extração de vídeos em MP4 com áudio incluso  
- Extração de áudio em MP3  
- Seleção manual de qualidade (480p, 720p, 1080p, 4K quando disponível)  
- Interface responsiva (desktop e mobile)  
- Download via streaming (sem salvar arquivos no servidor)  

---

## Como funciona

### 1. Extração de opções

O frontend envia a URL para a API:

POST /api/extract

O backend utiliza **yt-dlp** apenas para listar os formatos disponíveis, retornando:
- Resoluções de vídeo (MP4)
- Opção de áudio (MP3)

Nenhum arquivo é baixado nessa etapa.

---

### 2. Download

Após o usuário escolher o formato:

GET /api/download

- **MP4**
  - Combina o melhor vídeo + melhor áudio
  - Respeita a resolução escolhida
- **MP3**
  - Extrai apenas o áudio
  - Converte para MP3

O arquivo é enviado diretamente ao navegador.

---

## Arquitetura do Projeto

### Frontend (React)
- Interface do usuário
- Envio de URLs
- Seleção de formato e qualidade
- Disparo do download

### Backend (Node.js + Fastify)
- Listagem de formatos com yt-dlp
- Download e conversão sob demanda
- Streaming direto para o navegador
- Nenhum arquivo é salvo no servidor

---

## Tecnologias utilizadas

### Frontend
- React
- Hooks (useState)
- Fetch API
- CSS-in-JS

### Backend
- Node.js
- Fastify
- yt-dlp
- FFmpeg

---

## Como rodar o projeto localmente

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Python
- FFmpeg instalado e no PATH

Verifique o FFmpeg:
ffmpeg -version

### Backend

1. Entrar na pasta:

        cd backend

2. Instalar dependências:

        npm install

3. Iniciar o servidor:

        npm run dev

Backend disponível em: http://localhost:3333

### Frontend

1. Entrar na pasta:

        cd backend

2. Instalar dependências:

        npm install

3. Iniciar o servidor:

        npm run dev

Frontend disponível: em http://localhost:5173

---

## Compatibilidade

- Desktop (Chrome, Firefox, Edge)
- Mobile (Android / iOS)
- Vídeos em 4K quando disponíveis

---

## Aviso legal

Projeto destinado exclusivamente para fins educacionais.  
O uso deve respeitar os termos de serviço das plataformas e a legislação vigente.
