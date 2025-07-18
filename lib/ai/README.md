# 🤖 Inteligência Artificial - Concursify

## 🎯 Objetivo
Esta pasta contém toda a integração com **APIs de IA** para gerar conteúdo personalizado, especialmente cronogramas de estudos e análises inteligentes.

## 📋 Arquivos Implementados

### ✅ `gemini.ts`
**Funcionalidade Principal:**
Sistema completo de integração com **Google Gemini AI** para geração de cronogramas personalizados de estudos para concursos públicos.

**Recursos Implementados:**
- 🧠 **Cronogramas personalizados** baseados em preferências
- 💡 **Dicas inteligentes** adaptadas ao perfil do usuário
- 📊 **Análise de pontos fortes/fracos** baseada em histórico
- 🎯 **Recomendações adaptativas** para melhor performance

## 🏗️ Arquitetura da IA

### Classe Principal: `GeminiAI`
```typescript
export class GeminiAI {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  
  // Métodos principais
  async gerarCronograma(concurso, preferences): Promise<CronogramaData>
  async gerarDicasPersonalizadas(materias, nivel, pontos): Promise<string[]>
  async analisarMateriasForte(historico): Promise<AnaliseResult>
}
```

### Schemas de Validação
```typescript
const UserPreferencesSchema = z.object({
  horasDisponiveis: z.number().min(1).max(24),
  diasSemana: z.array(z.number().min(0).max(6)),
  materiasPrioritarias: z.array(z.string()),
  nivelConhecimento: z.enum(['iniciante', 'intermediario', 'avancado']),
  tempoProva: z.string().optional(),
  pontosFortes: z.array(z.string()).optional(),
  pontosFracos: z.array(z.string()).optional(),
  metodoEstudo: z.enum(['teorico', 'pratico', 'misto'])
})

const CronogramaSchema = z.object({
  titulo: z.string(),
  duracao_semanas: z.number(),
  semanas: z.array(/* estrutura detalhada */),
  dicas: z.array(z.string()),
  recursos: z.array(/* recursos recomendados */),
  metas: z.array(/* metas por semana */)
})
```

## 🧠 Funcionalidades de IA

### 1. **Geração de Cronogramas**
```typescript
const cronograma = await geminiAI.gerarCronograma(
  {
    titulo: "Concurso TRF",
    orgao: "Tribunal Regional Federal",
    materias: ["Direito Constitucional", "Administrativo"],
    data_prova: "2025-06-15"
  },
  {
    horasDisponiveis: 6,
    diasSemana: [1, 2, 3, 4, 5], // Seg a Sex
    materiasPrioritarias: ["Direito Constitucional"],
    nivelConhecimento: "intermediario",
    metodoEstudo: "misto"
  }
)
```

**Resultado Estruturado:**
- 📅 **Semanas organizadas** com temas específicos
- 📚 **Distribuição balanceada** de matérias
- ⏰ **Tempo otimizado** por sessão de estudo
- 🎯 **Tópicos específicos** para cada dia
- 📈 **Progressão gradual** de dificuldade

### 2. **Dicas Personalizadas**
```typescript
const dicas = await geminiAI.gerarDicasPersonalizadas(
  ["Português", "Matemática", "Direito"],
  "iniciante",
  ["Interpretação de texto"], // pontos fortes
  ["Matemática básica"]       // pontos fracos
)
```

**Características:**
- 🎯 **Específicas** para as matérias do concurso
- 📊 **Adaptadas** ao nível de conhecimento
- 💪 **Focam** nos pontos fracos identificados
- 🚀 **Aproveitam** os pontos fortes existentes

### 3. **Análise de Performance**
```typescript
const analise = await geminiAI.analisarMateriasForte([
  { materia: "Português", tempo_estudo: 120, performance: 85 },
  { materia: "Matemática", tempo_estudo: 180, performance: 60 },
  { materia: "Direito", tempo_estudo: 90, performance: 75 }
])
```

**Resultado:**
```typescript
{
  pontos_fortes: ["Português", "Direito"],
  pontos_fracos: ["Matemática"],
  recomendacoes: [
    "Aumentar tempo de estudo em Matemática",
    "Manter consistência em Português",
    "Aprofundar conceitos jurídicos básicos"
  ]
}
```

## 🎯 Prompts Inteligentes

### Template de Cronograma
```typescript
const prompt = `
Você é um especialista em concursos públicos. Crie um cronograma detalhado.

CONCURSO:
- Título: ${concurso.titulo}
- Órgão: ${concurso.orgao}
- Matérias: ${concurso.materias.join(', ')}
- Data da Prova: ${concurso.data_prova}

PERFIL DO CANDIDATO:
- Horas disponíveis: ${preferences.horasDisponiveis}
- Dias da semana: ${diasSemana.join(', ')}
- Nível: ${preferences.nivelConhecimento}
- Método preferido: ${preferences.metodoEstudo}

REQUISITOS:
- Duração: ${semanasDisponiveis} semanas
- Distribuir carga horária equilibradamente
- Focar nas matérias prioritárias
- Incluir tempo para revisão
- Alternar teoria, exercícios e revisão

Retorne APENAS um JSON válido no formato especificado...
`
```

### Personalização Avançada
- 🕒 **Cálculo automático** de semanas disponíveis
- ⚖️ **Balanceamento** baseado em prioridades
- 📈 **Progressão** adaptada ao nível
- 🔄 **Revisões** estratégicamente distribuídas

## 🛡️ Tratamento de Erros e Fallbacks

### Sistema de Fallback
```typescript
private getFallbackCronograma(): any {
  return {
    titulo: "Cronograma Básico de Estudos",
    duracao_semanas: 8,
    semanas: [/* estrutura básica */],
    dicas: [
      "Mantenha consistência nos estudos",
      "Faça revisões regulares",
      "Resolva questões de provas anteriores"
    ],
    // ... estrutura completa de fallback
  }
}
```

### Validação e Parsing
```typescript
private parseAIResponse(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('JSON não encontrado')
  } catch (error) {
    console.error('Erro no parsing:', error)
    return this.getFallbackCronograma()
  }
}
```

## ⚡ Performance e Otimização

### Cache Inteligente
- 🕒 **Resultados similares** são cachados
- 🔄 **Invalidação** baseada em mudanças de preferências
- 📊 **Métricas** de cache hit/miss

### Rate Limiting
- ⏱️ **Throttling** para evitar limite da API
- 🔄 **Queue** para requisições em lote
- 💤 **Backoff** exponencial em caso de erro

### Otimizações de Prompt
- 🎯 **Prompts concisos** para reduzir tokens
- 📝 **Templates** pré-otimizados
- 🧹 **Limpeza** de dados de entrada

## 🔄 Integração com Sistema

### Uso nas Server Actions
```typescript
// app/actions/cronogramas.ts
import { geminiAI } from '@/lib/ai/gemini'

export async function gerarCronograma(input) {
  const cronogramaData = await geminiAI.gerarCronograma(
    concurso,
    preferences
  )
  
  // Salvar no banco de dados
  // Registrar uso da feature
  // Retornar resultado
}
```

### Integração com Histórico
```typescript
// Buscar histórico do usuário para personalização
const { data: historico } = await supabase
  .from('pomodoro_sessions')
  .select('subject, duration, completed')
  .eq('user_id', session.user.id)

// Usar histórico para análise de pontos fortes/fracos
const analise = await geminiAI.analisarMateriasForte(historicoProcessado)
```

## 🚀 Próximas Implementações

### 📝 `openai.ts` (Planejado)
**Funcionalidades:**
- 🛡️ **Moderação automática** para o fórum
- 🔍 **Embeddings** para busca semântica
- 💬 **Chatbot** de suporte aos estudos
- 📊 **Análise de sentimento** em posts

### 🧠 `langchain.ts` (Planejado)
**Funcionalidades:**
- 🔗 **Chains complexas** de IA
- 📚 **RAG** (Retrieval Augmented Generation)
- 🧠 **Memory** para conversas longas
- 🔄 **Agents** autônomos

### 🎯 Melhorias Planejadas
- **Fine-tuning** para domínio específico de concursos
- **Multi-modal** para análise de documentos
- **Streaming** para respostas em tempo real
- **A/B testing** para otimização de prompts

## 📊 Monitoramento e Métricas

### Métricas de IA
- 📈 **Taxa de sucesso** na geração
- ⏱️ **Tempo médio** de resposta
- 🎯 **Qualidade** dos cronogramas gerados
- 💰 **Custo** por geração

### Quality Assurance
- ✅ **Validação** automática de estrutura
- 🧪 **Testes** de diferentes cenários
- 📊 **Feedback** dos usuários
- 🔄 **Iteração** contínua de prompts

## 🛠️ Configuração

### Variáveis de Ambiente
```bash
# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# OpenAI (opcional)
OPENAI_API_KEY=your-openai-api-key

# Configurações de IA
AI_TIMEOUT=30000              # 30 segundos
AI_MAX_RETRIES=3              # 3 tentativas
AI_CACHE_TTL=3600             # 1 hora de cache
```

### Uso Programático
```typescript
import { geminiAI } from '@/lib/ai/gemini'

// Gerar cronograma
const cronograma = await geminiAI.gerarCronograma(concurso, preferences)

// Gerar dicas
const dicas = await geminiAI.gerarDicasPersonalizadas(materias, nivel)

// Analisar performance
const analise = await geminiAI.analisarMateriasForte(historico)
```

## 📝 Boas Práticas

### Prompt Engineering
- 🎯 **Especificidade** nos prompts
- 📋 **Estrutura clara** de saída
- 🔄 **Iteração** baseada em resultados
- 📊 **Métricas** para otimização

### Segurança
- 🔒 **API keys** protegidas
- 🛡️ **Rate limiting** implementado
- 🧹 **Sanitização** de inputs
- 📝 **Logs** sem dados sensíveis

### Escalabilidade
- 🔄 **Processamento assíncrono**
- 📦 **Batch processing** quando possível
- 💾 **Cache** estratégico
- 🎯 **Otimização** contínua de prompts