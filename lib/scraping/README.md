# 🕷️ Web Scraping - Concursify

## 🎯 Objetivo
Esta pasta contém todo o sistema de **web scraping** para extrair dados de concursos públicos de diversas fontes, com foco principal no **PCI Concursos**.

## 📋 Arquivos Implementados

### ✅ `pci-scraper.ts`
**Funcionalidade Principal:**
Sistema completo de scraping do site PCI Concursos para extrair informações de editais de concursos públicos.

**Recursos Implementados:**
- 🔍 **Scraping inteligente** com tratamento de erros
- 🧹 **Limpeza e validação** de dados extraídos
- 🔄 **Deduplicação automática** de concursos
- 📊 **Extração estruturada** de informações
- ⚡ **Cache estratégico** para performance

## 🏗️ Arquitetura do Scraper

### Classe Principal: `PCIScraper`
```typescript
export class PCIScraper {
  private baseUrl = 'https://www.pciconcursos.com.br'
  private headers = { /* Headers para evitar bloqueio */ }
  
  // Métodos principais
  async scrapeLatestConcursos(limit: number = 50)
  async scrapeConcursoDetails(url: string)
  async scrapeWithFilters(filters: object)
}
```

### Schema de Validação
```typescript
const ConcursoSchema = z.object({
  titulo: z.string().min(1),
  orgao: z.string().min(1),
  vagas: z.string().optional(),
  inscricoes: z.string().optional(),
  link: z.string().url(),
  data_prova: z.string().optional(),
  materias: z.array(z.string()).default([]),
  estado: z.string().length(2).optional(),
})
```

## 🔧 Funcionalidades Implementadas

### 1. **Scraping Básico**
```typescript
await pciScraper.scrapeLatestConcursos(100)
```
- Extrai últimos concursos da página principal
- Limita quantidade para evitar sobrecarga
- Valida todos os dados extraídos

### 2. **Scraping com Filtros**
```typescript
await pciScraper.scrapeWithFilters({
  estado: 'SP',
  cargo: 'Analista',
  escolaridade: 'Superior',
  salarioMin: 5000
})
```
- Permite busca direcionada
- Múltiplos filtros simultâneos
- Cache inteligente por configuração

### 3. **Detalhes Expandidos**
```typescript
await pciScraper.scrapeConcursoDetails(url)
```
- Extrai informações detalhadas
- Requisitos e salários
- Matérias específicas
- Descrição completa

## 📊 Dados Extraídos

### Informações Básicas
- ✅ **Título** do concurso
- ✅ **Órgão** responsável  
- ✅ **Vagas** disponíveis
- ✅ **Período de inscrições**
- ✅ **Link** para edital
- ✅ **Data da prova**
- ✅ **Estado/UF**

### Informações Estruturadas
- ✅ **Matérias** categorizadas
- ✅ **Área de conhecimento**
- ✅ **Nível de escolaridade**
- ✅ **Faixa salarial**

### Metadados
- ✅ **Data de extração**
- ✅ **Fonte dos dados**
- ✅ **Status de validação**

## 🛡️ Tratamento de Erros

### Headers Anti-Bloqueio
```typescript
private headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
  'Accept': 'text/html,application/xhtml+xml,application/xml...',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
}
```

### Retry Logic
- ⏱️ **Timeout** configurável (padrão: 10s)
- 🔄 **Retry automático** em caso de falha
- 📝 **Logs detalhados** para debug

### Validação Robusta
- ✅ **Schema Zod** para validação
- 🧹 **Sanitização** de dados
- 🚫 **Rejeição** de dados inválidos

## ⚡ Performance e Cache

### Estratégias de Cache
```typescript
// Cache por tipo de requisição
next: { 
  revalidate: 3600    // Busca geral: 1 hora
  revalidate: 1800    // Com filtros: 30 min  
  revalidate: 86400   // Detalhes: 24 horas
}
```

### Otimizações
- 🎯 **Seletores CSS eficientes**
- 📦 **Batch processing** para múltiplos concursos
- 🚀 **Lazy loading** de detalhes
- 💾 **Deduplicação** por URL

## 🔄 Integração com Sistema

### Uso nas Server Actions
```typescript
// app/actions/concursos.ts
import { pciScraper } from '@/lib/scraping/pci-scraper'

export async function scrapeConcursos() {
  const concursosData = await pciScraper.scrapeLatestConcursos(100)
  // Processamento e salvamento no banco
}
```

### Salvamento Inteligente
- 🔍 **Verificação de duplicatas** por URL
- 🔄 **Update** de dados existentes
- ➕ **Inserção** de novos concursos
- 📊 **Tracking** de mudanças

## 🚀 Próximas Implementações

### 📝 `questoes-scraper.ts` (Em desenvolvimento)
**Objetivo:** Extrair questões de concursos anteriores
- Múltiplas fontes (Questões de Concursos, QConcursos)
- Categorização automática com IA
- Extração de gabaritos
- Classificação por dificuldade

### 🎯 Fontes Planejadas
1. **Questões de Concursos** (qconcursos.com)
2. **Gran Cursos** (questões abertas)
3. **TEC Concursos** (questões públicas)
4. **Estratégia Concursos** (questões gratuitas)

### 🔧 Melhorias Planejadas
- **Scraping distribuído** para múltiplas fontes
- **Rate limiting** inteligente
- **Proxy rotation** para alta disponibilidade
- **Machine learning** para classificação automática

## 📊 Monitoramento

### Métricas Coletadas
- 📈 **Taxa de sucesso** do scraping
- ⏱️ **Tempo médio** de extração
- 🔢 **Quantidade** de concursos extraídos
- 🚫 **Taxa de erro** por fonte

### Alertas Configurados
- 🚨 **Falha consecutiva** (>3 tentativas)
- ⚠️ **Queda de performance** (>10s por página)
- 📉 **Redução drástica** de dados extraídos

## 🛠️ Configuração e Uso

### Variáveis de Ambiente
```bash
# Opcional: configurações de scraping
SCRAPING_TIMEOUT=10000        # 10 segundos
SCRAPING_RETRY_COUNT=3        # 3 tentativas
SCRAPING_RATE_LIMIT=1000      # 1 req/segundo
```

### Uso Programático
```typescript
import { pciScraper } from '@/lib/scraping/pci-scraper'

// Scraping básico
const concursos = await pciScraper.scrapeLatestConcursos(50)

// Com filtros
const filtrados = await pciScraper.scrapeWithFilters({
  estado: 'RJ',
  cargo: 'Técnico'
})

// Detalhes específicos
const detalhes = await pciScraper.scrapeConcursoDetails(url)
```

## 📝 Boas Práticas

### Ética de Scraping
- ⏱️ **Rate limiting** respeitoso
- 🤝 **Respeito ao robots.txt**
- 📄 **Cache** para reduzir requisições
- 🔄 **Retry** com backoff exponencial

### Manutenibilidade
- 🧪 **Testes** para mudanças de layout
- 📝 **Documentação** de seletores
- 🔍 **Monitoring** automático de falhas
- 🔄 **Fallbacks** para diferentes layouts