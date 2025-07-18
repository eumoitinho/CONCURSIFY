# 💰 Sistema de Monetização - Concursify

## 🎯 Objetivo
Esta pasta contém todo o **sistema de monetização freemium** com controle inteligente de limitações por plano, tracking de uso e conversão natural para premium.

## 📋 Arquivos Implementados

### ✅ `limits.ts`
**Funcionalidade Principal:**
Sistema completo de **controle de limitações** por plano de assinatura, com verificação em tempo real, tracking automático de uso e triggers de conversão.

## 🏗️ Arquitetura de Monetização

### Fluxo de Verificação
```
User Action → Check Plan → Verify Limits → Track Usage → Allow/Deny
                ↓
          [Free|Premium]
                ↓
        [Limited|Unlimited]
```

### Classe Principal: `SubscriptionLimits`
```typescript
export class SubscriptionLimits {
  // Métodos principais
  static async getUserPlan(userId: string): Promise<PlanType>
  static async checkFeatureLimit(userId, feature, timeframe): Promise<UsageInfo>
  static async trackFeatureUsage(userId, feature, metadata?): Promise<void>
  static async canUseFeature(userId, feature): Promise<boolean>
  static async requiresUpgrade(userId, feature): Promise<UpgradeInfo>
}
```

## 💎 Planos de Assinatura

### Estrutura de Planos
```typescript
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Gratuito',
    price: 0,
    limits: {
      cronogramas: 1,           // por mês
      notas: 10,                // total
      pomodoro_sessions: 5,     // por dia
      forum_posts: 3,           // por mês
      spotify_playlists: 1,     // total
      simulados: 3,             // por mês
      pdf_export: false,        // com marca d'água
      backup: false,            // sem backup
      priority_support: false   // suporte padrão
    }
  },
  premium: {
    name: 'Premium',
    price: 3990, // R$ 39,90 em centavos
    limits: {
      cronogramas: 'unlimited',
      notas: 'unlimited',
      pomodoro_sessions: 'unlimited',
      forum_posts: 'unlimited',
      spotify_playlists: 'unlimited',
      simulados: 'unlimited',
      pdf_export: true,         // sem marca d'água
      backup: true,             // backup automático
      priority_support: true,   // suporte prioritário
      vip_forum_access: true,   // acesso VIP ao fórum
      advanced_analytics: true  // analytics avançados
    }
  }
}
```

### Tipos de Funcionalidades
```typescript
export type FeatureType = 
  | 'cronogramas'         // Geração de cronogramas IA
  | 'notas'               // Caderno Obsidian
  | 'pomodoro_sessions'   // Sessões de estudo
  | 'forum_posts'         // Posts no fórum
  | 'spotify_playlists'   // Playlists musicais
  | 'simulados'           // Simulados de questões
  | 'pdf_export'          // Exportação PDF limpa
  | 'backup'              // Backup de dados
  | 'priority_support'    // Suporte prioritário
```

## 🔍 Sistema de Verificação

### Verificação de Limites
```typescript
// Verificar se pode usar uma funcionalidade
const usageInfo = await SubscriptionLimits.checkFeatureLimit(
  userId,
  'cronogramas',
  'monthly' // ou 'daily'
)

// Resultado estruturado
interface UsageInfo {
  current: number           // Uso atual
  limit: number | 'unlimited' // Limite do plano
  percentage: number        // Porcentagem utilizada
  canUse: boolean          // Pode usar agora?
}
```

### Timeframes Suportados
- 📅 **Monthly** (padrão): Limites mensais
- 📊 **Daily**: Limites diários (ex: sessões Pomodoro)

### Uso Atual vs Limite
```typescript
// Exemplo de retorno para usuário gratuito
{
  current: 1,           // Já gerou 1 cronograma
  limit: 1,             // Limite é 1 por mês
  percentage: 100,      // 100% utilizado
  canUse: false         // Não pode gerar mais
}

// Exemplo para usuário premium  
{
  current: 5,           // Já gerou 5 cronogramas
  limit: 'unlimited',   // Sem limite
  percentage: 0,        // Sempre 0% para unlimited
  canUse: true          // Sempre pode usar
}
```

## 📊 Tracking Automático

### Registro de Uso
```typescript
// Tracking manual
await SubscriptionLimits.trackFeatureUsage(
  userId,
  'cronogramas',
  { concurso_id: 'uuid', generated_at: new Date() }
)

// Tracking automático via triggers SQL
CREATE TRIGGER track_cronogramas_usage 
  AFTER INSERT ON cronogramas 
  FOR EACH ROW 
  EXECUTE FUNCTION auto_track_usage()
```

### Dados Coletados
```sql
-- Tabela usage_tracking
user_id UUID              -- Usuário que usou
feature VARCHAR           -- Funcionalidade usada
date DATE                 -- Data do uso
count INTEGER             -- Contador (incrementado automaticamente)
metadata JSONB            -- Dados adicionais da sessão
```

### Agregação Inteligente
- 🔄 **Auto-incremento** para uso no mesmo dia
- 📅 **Separação por data** para cálculos precisos
- 📊 **Metadata** para analytics detalhados

## 🚨 Sistema de Upgrade

### Verificação de Necessidade
```typescript
const upgradeInfo = await SubscriptionLimits.requiresUpgrade(
  userId,
  'cronogramas'
)

// Retorno estruturado
{
  requires: true,
  reason: "Você atingiu o limite de 1 cronogramas do seu plano atual."
}
```

### Triggers de Conversão
```typescript
const UPGRADE_TRIGGERS = [
  'Limite de cronogramas atingido',
  'Tentativa de busca nas notas',
  'Customização do pomodoro',
  'Acesso a grupos VIP do fórum',
  'Exportação de PDF limpo',
  'Backup de dados solicitado'
]
```

### Momentos Estratégicos
1. **🎯 Primeira necessidade** - Quando atinge limite pela primeira vez
2. **🔄 Uso recorrente** - Quando tenta usar novamente após limite
3. **💡 Descoberta de valor** - Quando explora funcionalidades premium
4. **📈 Crescimento** - Quando dados começam a ficar importantes

## 🔧 Middleware de Verificação

### Server Actions Protection
```typescript
// app/actions/cronogramas.ts
export async function gerarCronograma(input) {
  // 1. Verificar autenticação
  const session = await getServerSession()
  
  // 2. Verificar acesso à feature
  const accessCheck = await checkFeatureAccess(
    session.user.id, 
    'cronogramas'
  )
  
  if (!accessCheck.allowed) {
    return { 
      success: false, 
      error: accessCheck.error,
      requiresUpgrade: accessCheck.upgradeRequired
    }
  }
  
  // 3. Executar operação
  const result = await generateWithAI(input)
  
  // 4. Registrar uso
  await SubscriptionLimits.trackFeatureUsage(
    session.user.id, 
    'cronogramas'
  )
  
  return { success: true, data: result }
}
```

### API Routes Protection
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  // Verificar feature baseada na rota
  const feature = getFeatureFromPath(req.nextUrl.pathname)
  
  if (feature) {
    const canUse = await SubscriptionLimits.canUseFeature(
      userId, 
      feature
    )
    
    if (!canUse) {
      return NextResponse.json(
        { error: 'Limite atingido', requiresUpgrade: true },
        { status: 403 }
      )
    }
  }
}
```

## 📈 Analytics de Conversão

### Eventos Trackados
```typescript
// Tentativas de uso bloqueadas
'feature_limit_reached': {
  feature: string,
  current_usage: number,
  plan_limit: number,
  user_plan: string
}

// Visualizações de upgrade
'upgrade_modal_shown': {
  trigger_feature: string,
  user_plan: string,
  days_since_signup: number
}

// Conversões efetivas
'subscription_upgraded': {
  from_plan: string,
  to_plan: string,
  trigger_feature: string
}
```

### Métricas de Negócio
- 📊 **Conversion Rate**: % de usuários que fazem upgrade
- 🎯 **Feature Trigger**: Qual funcionalidade mais converte
- ⏱️ **Time to Upgrade**: Tempo médio até conversão
- 💰 **LTV per Feature**: Valor por funcionalidade

## 🔄 Integração com Stripe

### Sincronização de Planos
```typescript
// Webhook handler atualiza automaticamente
const { data: subscription } = await supabase
  .from('user_subscriptions')
  .upsert({
    user_id: userId,
    plan_id: planId,
    status: 'active',
    stripe_subscription_id: subscriptionId
  })
```

### Estados de Assinatura
- ✅ **Active**: Plano ativo, limitações premium
- ⏸️ **Past Due**: Pagamento atrasado, mantém acesso por 7 dias
- ❌ **Canceled**: Volta para plano gratuito
- 🔄 **Incomplete**: Pagamento pendente

## ⚡ Performance e Cache

### Cache de Planos
```typescript
// Cache do plano do usuário por 1 hora
const userPlan = await redis.get(`user_plan:${userId}`)
if (!userPlan) {
  const plan = await getUserPlanFromDB(userId)
  await redis.setex(`user_plan:${userId}`, 3600, plan)
}
```

### Otimizações
- 🚀 **Batch queries** para múltiplas verificações
- 💾 **Cache inteligente** de limites por plano
- 📊 **Pre-computed stats** para analytics
- 🔄 **Lazy loading** de dados de uso

## 🛡️ Segurança

### Proteções Implementadas
- 🔒 **Server-side validation** de todos os limites
- 🚫 **Client-side bypass prevention**
- 📝 **Audit trail** de todas as verificações
- 🔍 **Anomaly detection** para uso suspeito

### Rate Limiting
```typescript
// Múltiplas camadas de proteção
1. Feature-level limits (por plano)
2. API rate limiting (por IP)
3. User rate limiting (por usuário)
4. Burst protection (picos de uso)
```

## 🚀 Estratégia de Conversão

### Limitações Inteligentes
```typescript
const CONVERSION_STRATEGY = {
  // Limitações que geram urgência
  limitations: {
    cronogramas_expiry: '7 dias',    // Cronogramas expiram
    notes_search: false,             // Busca manual apenas
    pomodoro_customization: false,   // Timers fixos
    forum_notifications: false,      // Sem notificações
    spotify_basic: true              // Apenas 1 playlist
  },
  
  // Momentos de conversão
  upgrade_moments: [
    'Primeiro limite atingido',
    'Descoberta de funcionalidade premium',
    'Acúmulo de dados importantes',
    'Necessidade de produtividade'
  ]
}
```

### A/B Testing
- 🧪 **Diferentes limits** para grupos de teste
- 📊 **Conversion tracking** por variação
- 🎯 **Optimal thresholds** baseados em dados
- 🔄 **Continuous optimization**

## 📝 Uso Programático

### Verificação Simples
```typescript
// Verificar se pode usar
const canUse = await SubscriptionLimits.canUseFeature(
  userId, 
  'cronogramas'
)

if (!canUse) {
  // Mostrar modal de upgrade
}
```

### Verificação Detalhada
```typescript
// Obter informações completas
const usage = await SubscriptionLimits.checkFeatureLimit(
  userId,
  'cronogramas', 
  'monthly'
)

console.log(`Usado: ${usage.current}/${usage.limit}`)
console.log(`Progresso: ${usage.percentage}%`)
```

### Tracking Manual
```typescript
// Registrar uso customizado
await SubscriptionLimits.trackFeatureUsage(
  userId,
  'simulados',
  { 
    questions_count: 50,
    difficulty: 'medium',
    subject: 'Português' 
  }
)
```

## 🎯 Roadmap de Monetização

### Próximas Features
- 📊 **Analytics dashboard** para admin
- 🎁 **Promotional codes** e descontos
- 👥 **Team plans** para grupos de estudo
- 🏆 **Achievement system** com rewards
- 📱 **Mobile app** com funcionalidades exclusivas

### Otimizações Planejadas
- 🤖 **ML-powered pricing** optimization
- 📈 **Dynamic limits** baseados em comportamento
- 🎯 **Personalized upgrade offers**
- 💬 **In-app purchase flow** otimizado