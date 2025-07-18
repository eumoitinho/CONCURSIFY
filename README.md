# 🎯 Concursify - Plataforma de Estudos para Concursos Públicos

Uma plataforma completa de preparação para concursos públicos com inteligência artificial, simulados adaptativos e ferramentas de produtividade.

## 🚀 Funcionalidades

### 📚 **Cronogramas Inteligentes**
- IA cria cronogramas personalizados baseados no edital
- Adapta-se ao seu ritmo de estudos
- Recomendações personalizadas

### 📝 **Simulados Adaptativos**
- Questões que se ajustam ao seu nível
- Banco de dados com milhares de questões
- Correção automática com explicações detalhadas

### 💬 **Fórum Colaborativo**
- Discussões sobre questões e dúvidas
- Comunidade ativa de concurseiros
- Suporte mútuo entre estudantes

### 📖 **Caderno Digital**
- Sistema de notas interconectadas
- Busca semântica inteligente
- Organização automática do conteúdo

### ⏰ **Pomodoro Integrado**
- Técnica de estudos com timer
- Integração com Spotify para música
- Tracking de produtividade

### 📊 **Analytics Avançado**
- Acompanhamento de progresso
- Identificação de pontos fracos
- Relatórios detalhados

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI/UX**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Supabase (Database, Auth, Storage)
- **IA**: Google Gemini API, OpenAI
- **Pagamentos**: Stripe
- **Integrações**: Spotify Web API

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/concursify.git
cd concursify
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Configure suas chaves de API no `.env.local`:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🎨 Design System

### Cores Principais
- **Primary**: Azul escuro profissional
- **Secondary**: Azul claro complementar
- **Accent**: Verde para sucessos e CTAs
- **Muted**: Cinza para textos secundários

### Componentes
- Cards com hover effects
- Botões com animações
- Inputs com validação
- Modais responsivos
- Navegação mobile-friendly

## 📱 Responsividade

A plataforma é totalmente responsiva e otimizada para:
- **Desktop**: Experiência completa
- **Tablet**: Layout adaptado
- **Mobile**: Interface mobile-first

## 🌙 Tema Escuro

Suporte completo ao tema escuro com:
- Transições suaves
- Cores otimizadas
- Contraste aprimorado
- Modo automático baseado no sistema

## 🎯 Estrutura do Projeto

```
foco-no-edital/
├── app/                    # App Router do Next.js
│   ├── (main)/            # Rotas principais
│   │   ├── concursos/     # Módulo de concursos
│   │   ├── simulados/     # Módulo de simulados
│   │   ├── forum/         # Módulo do fórum
│   │   ├── caderno/       # Módulo de notas
│   │   └── pomodoro/      # Módulo Pomodoro
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticação
│   │   ├── ai/            # Endpoints de IA
│   │   └── payments/      # Webhooks Stripe
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   └── home-page.tsx     # Componente da home
├── lib/                  # Utilitários
├── public/               # Assets estáticos
└── styles/               # Estilos adicionais
```

## 🔧 Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run start      # Servidor de produção
npm run lint       # Linter ESLint
npm run type-check # Verificação de tipos
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel --prod
```

### Docker
```bash
docker build -t concursify .
docker run -p 3000:3000 concursify
```

## 📝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Suporte

- 📧 Email: contato@concursify.com
- 💬 Discord: [Link do Discord]
- 📞 WhatsApp: +55 11 99999-9999

## 🎉 Agradecimentos

- Comunidade Next.js
- Equipe do Supabase
- Contribuidores do projeto
- Beta testers

---

**Desenvolvido com ❤️ para concurseiros brasileiros**
