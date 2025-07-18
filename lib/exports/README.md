# 📤 Sistema de Exportação - Concursify

## 🎯 Objetivo
Esta pasta contém todo o sistema de **exportação** de cronogramas e dados em múltiplos formatos, permitindo que usuários compartilhem e utilizem suas informações em diferentes plataformas.

## 📋 Arquivos Implementados

### ✅ `pdf-generator.ts`
**Funcionalidade Principal:**
Sistema completo de geração de **PDFs profissionais** para cronogramas de estudos, com diferentes níveis de qualidade baseados no plano de assinatura.

### ✅ `calendar-export.ts` 
**Funcionalidade Principal:**
Sistema de exportação para **calendários** (Google Calendar, iCal) com eventos automáticos para sessões de estudo.

### ✅ `whatsapp-export.ts`
**Funcionalidade Principal:**
Sistema de formatação de **mensagens para WhatsApp** com cronogramas e lembretes de estudo otimizados para mobile.

## 🏗️ Arquitetura de Exportação

### Fluxo de Exportação
```
Cronograma Data → Formatter → Export Engine → Output File/Link
                     ↓
              [PDF|ICS|WhatsApp]
```

### Integração com Planos
```typescript
// Verificação de plano antes da exportação
const isFreePlan = userPlan === 'free'
const allowCleanPDF = await SubscriptionLimits.canUseFeature(userId, 'pdf_export')
```

## 📄 PDF Generator (`pdf-generator.ts`)

### Recursos Implementados
- 📄 **PDF profissional** com layout estruturado
- 🎨 **Marca d'água** para plano gratuito
- 📊 **Múltiplas seções** organizadas
- 📈 **Gráficos e estatísticas** (planejado)
- 🖼️ **Logotipo** e identidade visual

### Estrutura do PDF
```typescript
// Seções do PDF gerado
1. Cabeçalho com logo Concursify
2. Informações do concurso
3. Resumo do cronograma
4. Cronograma detalhado por semana
5. Dicas de estudo
6. Recursos recomendados
7. Metas e indicadores
8. Rodapé com numeração
```

### Funcionalidades por Plano
```typescript
// Plano Gratuito
- ✅ PDF completo funcional
- ⚠️ Marca d'água "CONCURSIFY - PLANO GRATUITO"
- ✅ Todas as informações incluídas
- ✅ Layout profissional mantido

// Plano Premium
- ✅ PDF limpo sem marca d'água
- ✅ Qualidade superior
- ✅ Personalização avançada
- ✅ Múltiplos templates (planejado)
```

### API de Uso
```typescript
// Gerar PDF do cronograma
const pdfBuffer = await PDFGenerator.gerarCronogramaPDF(
  cronogramaData,
  concursoInfo,
  isFreePlan // true = com marca d'água
)

// Gerar relatório personalizado
const relatorioBuffer = await PDFGenerator.gerarRelatorioPDF(
  dadosRelatorio,
  isFreePlan
)
```

## 📅 Calendar Export (`calendar-export.ts`)

### Formatos Suportados
- 📱 **Google Calendar** (links diretos)
- 📆 **iCal/ICS** (arquivo universal)
- 🍎 **Apple Calendar** (compatível via ICS)
- 📧 **Outlook** (compatível via ICS)

### Funcionalidades
```typescript
// Gerar arquivo ICS completo
const icsContent = CalendarExport.gerarEventosICS(
  cronogramaData,
  concursoInfo,
  dataInicio
)

// Gerar links do Google Calendar
const googleLinks = CalendarExport.gerarLinkGoogleCalendar(
  cronogramaData,
  concursoInfo
)

// Criar evento único
const { ics, googleLink } = CalendarExport.criarEventoUnico(
  "Estudo de Português",
  "Revisão de gramática e interpretação",
  new Date("2025-07-20 09:00"),
  90, // 90 minutos
  "Biblioteca"
)
```

### Eventos Gerados
- 📚 **Sessões de estudo** por matéria
- ⏰ **Horários inteligentes** distribuídos
- 🎯 **Descrições detalhadas** com tópicos
- 📍 **Local padrão** configurável
- 🗓️ **Evento da prova** (se data disponível)

### Metadados dos Eventos
```typescript
// Cada evento inclui:
- Título: "Matéria - Nome do Concurso"
- Descrição: Tópicos, dificuldade, tipo de estudo
- Duração: Baseada no cronograma
- Local: "Local de Estudo" (customizável)
- Categorias: Estudo, Concurso, Nome da Matéria
- Prioridade: Baseada na importância
```

## 📱 WhatsApp Export (`whatsapp-export.ts`)

### Tipos de Mensagem
1. **📋 Cronograma Completo** - Resumo geral
2. **📅 Semanal** - Foco em uma semana específica  
3. **📚 Diário** - Estudos do dia
4. **⏰ Lembretes** - Notificações de estudo
5. **📊 Motivacional** - Progresso e motivação
6. **🤝 Compartilhamento** - Para redes sociais

### Formatação Inteligente
```typescript
// Emojis por categoria
const emojis = {
  teoria: '📖',
  exercicios: '✏️',
  revisao: '🔄',
  facil: '🟢',
  medio: '🟡',
  dificil: '🔴'
}

// Formatação otimizada para mobile
- ✅ Quebras de linha estratégicas
- ✅ Emojis para visual atrativo
- ✅ Texto conciso e direto
- ✅ Informações hierarquizadas
```

### API de Uso
```typescript
// Mensagem completa do cronograma
const mensagem = WhatsAppExport.gerarMensagemCronograma(
  cronogramaData,
  concursoInfo
)

// Mensagem semanal
const mensagemSemanal = WhatsAppExport.gerarMensagemSemanal(
  semanaData,
  numeroSemana,
  concursoInfo
)

// Gerar link para WhatsApp
const whatsappLink = WhatsAppExport.gerarLinkWhatsApp(
  mensagem,
  numero // opcional: número específico
)
```

## 🔄 API de Exportação

### Endpoint Principal
```typescript
// GET /api/cronogramas/[id]/export
// Parâmetros:
- formato: 'pdf' | 'ics' | 'whatsapp'
- tipo: 'cronograma' | 'semanal' | 'diario'
```

### Resposta por Formato
```typescript
// PDF - Retorna arquivo binário
Response: PDF Buffer
Headers: {
  'Content-Type': 'application/pdf',
  'Content-Disposition': 'attachment; filename="cronograma.pdf"'
}

// ICS - Retorna arquivo de calendário
Response: ICS Content
Headers: {
  'Content-Type': 'text/calendar; charset=utf-8',
  'Content-Disposition': 'attachment; filename="cronograma.ics"'
}

// WhatsApp - Retorna JSON com mensagem e link
Response: {
  success: true,
  data: {
    mensagem: "🎯 CRONOGRAMA DE ESTUDOS...",
    link: "https://wa.me/?text=...",
    tipo: "cronograma"
  }
}
```

## 🛡️ Segurança e Limitações

### Verificações de Acesso
```typescript
// Verificação de autenticação
const session = await getServerSession()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
}

// Verificação de propriedade
.eq('user_id', session.user.id) // Só pode exportar próprios cronogramas

// Verificação de plano (para PDF limpo)
const userPlan = await SubscriptionLimits.getUserPlan(session.user.id)
const isFreePlan = userPlan === 'free'
```

### Rate Limiting
- ⏱️ **Limite por usuário**: 10 exportações/hora
- 📊 **Tracking de uso**: Registrado automaticamente
- 🔄 **Cooldown**: 1 minuto entre exportações do mesmo tipo

## ⚡ Performance e Otimização

### Caching Estratégico
```typescript
// Cache por tipo de exportação
PDF: "Sem cache (sempre fresh para marca d'água)"
ICS: "Cache 1 hora (dados relativamente estáticos)"
WhatsApp: "Cache 30 min (mensagens podem mudar)"
```

### Otimizações
- 🎯 **Lazy loading** de dados desnecessários
- 📦 **Compressão** de PDFs
- 🧹 **Cleanup** de recursos temporários
- 🚀 **Processamento assíncrono** para PDFs grandes

## 🚀 Próximas Implementações

### 📊 `excel-export.ts` (Planejado)
- Planilhas detalhadas de cronograma
- Gráficos de progresso
- Formulas automáticas de cálculo
- Templates personalizáveis

### 📱 `mobile-export.ts` (Planejado) 
- Formato otimizado para apps mobile
- Integração com calendários nativos
- Notificações push personalizadas
- Widgets para tela inicial

### 🔗 `integration-export.ts` (Planejado)
- Integração com Notion
- Sincronização com Todoist
- Export para Anki (flashcards)
- API para apps terceiros

## 📊 Monitoramento

### Métricas de Exportação
- 📈 **Quantidade** por formato
- ⏱️ **Tempo médio** de geração
- 🎯 **Formato mais popular**
- 💰 **Conversão** PDF limpo → Premium

### Analytics de Uso
```typescript
// Eventos trackados
export_pdf_generated: { user_plan: string, has_watermark: boolean }
export_ics_downloaded: { events_count: number }
export_whatsapp_shared: { message_type: string }
calendar_link_clicked: { calendar_type: string }
```

## 🛠️ Configuração

### Dependências
```typescript
// PDF Generation
import PDFDocument from 'pdfkit'

// Calendar
// Native JavaScript Date API

// WhatsApp
// Native URL encoding
```

### Uso Programático
```typescript
import { PDFGenerator } from '@/lib/exports/pdf-generator'
import { CalendarExport } from '@/lib/exports/calendar-export'
import { WhatsAppExport } from '@/lib/exports/whatsapp-export'

// Gerar PDF
const pdf = await PDFGenerator.gerarCronogramaPDF(data, info, false)

// Gerar ICS
const ics = CalendarExport.gerarEventosICS(data, info)

// Gerar mensagem WhatsApp
const msg = WhatsAppExport.gerarMensagemCronograma(data, info)
```

## 📝 Boas Práticas

### Qualidade de Output
- 🎨 **Design consistente** em todos os formatos
- 📱 **Otimização mobile** para WhatsApp
- 🔤 **Fontes seguras** para PDF
- 📅 **Fuso horário** correto para calendários

### User Experience
- ⚡ **Feedback imediato** durante geração
- 📱 **Preview** antes do download
- 🔄 **Retry** automático em caso de falha
- 💾 **Histórico** de exportações