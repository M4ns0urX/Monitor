# Cardio Monitor

Simulação visual interativa de um monitor de ECG construída com Next.js, React, TypeScript e Canvas 2D.

> Este projeto é uma experiência visual e não possui finalidade médica, diagnóstica ou de monitoramento clínico.

## Funcionalidades

- traçado de ECG animado em Canvas;
- cinco estados visuais: Baixo, Normal, Médio, Alto e Sem Batimento;
- transição progressiva do BPM;
- personalização das cores dos estados e do fundo;
- controle do espaçamento visual dos pulsos;
- texto decorativo configurável, com diferentes fontes e animações;
- editor de sequências com etapas, duração, status e presets;
- reprodução, pausa, navegação, reinício e repetição de sequências;
- atalho `Space` para iniciar a animação;
- painel de configurações em drawer lateral;
- gravação da aba e exportação em vídeo WebM;
- interface responsiva e suporte a movimento reduzido.

## Tecnologias

- Next.js 16;
- React 19;
- TypeScript;
- Tailwind CSS 4;
- CSS Modules;
- Canvas 2D;
- Screen Capture API e MediaRecorder API;
- Node.js Test Runner.

## Requisitos

- Node.js 20 ou superior;
- npm;
- navegador moderno com suporte a Canvas.

A gravação de vídeo também requer suporte a `getDisplayMedia` e `MediaRecorder`. O navegador solicitará autorização e a escolha manual da aba ou janela.

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone <URL_DO_REPOSITORIO>
cd cardio-monitor
npm ci
```

## Desenvolvimento

Inicie o servidor local:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Como usar

1. Abra o botão de configurações na lateral direita.
2. Na aba **Aparência**, ajuste texto, cores, fundo e ritmo visual.
3. Na aba **Sequência**, adicione ou edite etapas e escolha o status de cada uma.
4. Clique em **Iniciar** ou feche o painel e pressione `Space`.

O atalho `Space` é ignorado quando o foco está em campos, botões ou outros controles interativos.

## Gravação de vídeo

1. Abra o painel lateral.
2. Clique em **Gravar vídeo**.
3. Na janela nativa do navegador, escolha a aba do Cardio Monitor.
4. Execute a animação desejada.
5. Pare a gravação.
6. Reabra o painel e clique em **Baixar WebM**.

A escolha da fonte de captura sempre depende de autorização explícita do usuário. Exportação para GIF e MP4 não faz parte da versão atual.

## Scripts

```bash
npm run dev       # servidor de desenvolvimento
npm run test      # testes automatizados
npm run lint      # análise estática
npm run build     # build otimizado de produção
npm run start     # servidor de produção após o build
```

Para executar a verificação de tipos separadamente:

```bash
npx tsc --noEmit --incremental false
```

## Estrutura principal

```text
src/
├── app/                 # App Router, layout e página principal
├── components/
│   └── ecg/             # Canvas, painel, sequência e controles
├── hooks/               # reprodução, BPM e gravação
└── lib/
    └── ecg/             # perfis, waveform, regras e testes
```

## Build de produção

```bash
npm run build
npm run start
```

## Aviso

Os valores de BPM, formas de onda, estados e transições são simulados para fins visuais. Não utilize este projeto para tomar decisões médicas.
