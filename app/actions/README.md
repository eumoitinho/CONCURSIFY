# 📁 Server Actions - Concursify

## 🎯 Objetivo
Esta pasta contém todas as **Server Actions** do Next.js 15, que são funções server-side que executam diretamente no servidor, proporcionando uma experiência mais rápida e segura.

## 📋 Arquivos Implementados

### ✅ `concursos.ts`
**Responsabilidades:**
- 🕷️ **Web scraping** do PCI Concursos
- 🔍 **Busca e filtros** avançados de concursos
- 📊 **Estatísticas** de concursos disponíveis
- 🗃️ **CRUD** completo de concursos

**Principais Funções:**
```typescript
- scrapeConcursos()              // Faz scraping e salva no banco
- buscarConcursos(filtros)       // Busca com filtros
- getConcursoById(id)            // Busca concurso específico
- getEstadosDisponiveis()        // Lista estados disponíveis
- getOrgaosDisponiveis()         // Lista órgãos disponíveis
- getMateriasDisponiveis()       // Lista matérias disponíveis
- getEstatisticasConcursos()     // Estatísticas gerais
```

**Integração com Limitações:**
- Usa sistema de tracking automático
- Respeita limites por plano de assinatura

### ✅ `cronogramas.ts`
**Responsabilidades:**
- 🤖 **Geração com IA** usando Google Gemini
- 💾 **CRUD** de cronogramas personalizados
- 📈 **Analytics** de uso de cronogramas
- 🎯 **Dicas personalizadas** baseadas em histórico

**Principais Funções:**
```typescript
- gerarCronograma(input)         // Gera cronograma com IA
- buscarCronogramas(userId)      // Lista cronogramas do usuário
- getCronogramaById(id)          // Busca cronograma específico
- deletarCronograma(id)          // Remove cronograma
- atualizarCronograma(id, data)  // Atualiza cronograma
- gerarDicasPersonalizadas()     // Gera dicas com IA
- getEstatisticasCronogramas()   // Estatísticas de uso
```

**Integração com Limitações:**
- ✅ Verifica plano antes de gerar
- ✅ Registra uso automaticamente
- ✅ Retorna erro se limite atingido

## 🔧 Padrões de Implementação

### Autenticação
```typescript
const session = await getServerSession()
if (!session?.user?.id) {
  return { success: false, error: 'Usuário não autenticado' }
}
```

### Verificação de Limites
```typescript
const accessCheck = await checkFeatureAccess(session.user.id, 'cronogramas')
if (!accessCheck.allowed) {
  return { 
    success: false, 
    error: accessCheck.error,
    requiresUpgrade: accessCheck.upgradeRequired
  }
}
```

### Tracking de Uso
```typescript
await SubscriptionLimits.trackFeatureUsage(session.user.id, 'cronogramas')
```

### Validação de Dados
```typescript
const validatedInput = GerarCronogramaSchema.parse(input)
```

### Padrão de Resposta
```typescript
// Sucesso
return { success: true, data: result, message: 'Operação realizada' }

// Erro
return { success: false, error: 'Mensagem de erro' }

// Erro com upgrade necessário
return { 
  success: false, 
  error: 'Limite atingido',
  requiresUpgrade: true
}
```

## 🚀 Próximas Implementações

### 📝 `simulados.ts` (Em desenvolvimento)
- Geração automática de simulados
- Correção com IA
- Analytics de performance
- Sistema adaptativo

### 💬 `forum.ts` (Planejado)
- CRUD de threads e posts
- Sistema de reações
- Moderação automática
- Gamificação

### 📝 `notes.ts` (Planejado)
- Editor markdown
- Links bidirecionais
- Busca semântica
- Graph view

### ⏰ `pomodoro.ts` (Planejado)
- Sessões de estudo
- Tracking de produtividade
- Relatórios analytics

### 🎵 `spotify.ts` (Planejado)
- Integração OAuth
- Controle de player
- Playlists inteligentes

## 📊 Integração com Sistema

### Supabase
- Todas as actions usam `createServerSupabaseClient()`
- Row Level Security (RLS) aplicado automaticamente
- Triggers automáticos para tracking

### Limitações
- Sistema de cotas por plano implementado
- Verificação antes de cada operação
- Tracking automático de uso

### Cache e Performance
- `revalidatePath()` usado após mudanças
- Validação com Zod para performance
- Otimizações de query no Supabase

## 🛡️ Segurança

### Autenticação
- Verificação de sessão em todas as actions
- User ID extraído da sessão autenticada

### Autorização
- RLS no Supabase garante acesso apenas aos próprios dados
- Verificação de plano antes de operações premium

### Validação
- Schemas Zod para validação de entrada
- Sanitização automática de dados

## 📝 Convenções

### Nomenclatura
- Nomes descritivos e em português
- Prefixos indicando ação: `gerar`, `buscar`, `deletar`

### Estrutura
- Sempre retornar objeto com `success` boolean
- Incluir `data` em caso de sucesso
- Incluir `error` em caso de falha
- `message` opcional para feedback ao usuário

### Error Handling
- Try/catch em todas as funções
- Logs detalhados para debug
- Mensagens de erro amigáveis para o usuário