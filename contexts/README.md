# Contextos - Concursify

Este diretório contém os contextos React para gerenciamento de estado global da aplicação.

## AuthContext

O `AuthContext` é responsável por gerenciar o estado de autenticação do usuário em toda a aplicação.

### Funcionalidades

- **Autenticação**: Login, cadastro e logout
- **Perfil**: Gerenciamento de perfil do usuário
- **Assinatura**: Verificação de plano e limitações
- **Monitoramento**: Tracking de uso de funcionalidades

### Como usar

```tsx
import { useAuth } from '@/contexts/auth-context'

function MeuComponente() {
  const { 
    user, 
    profile, 
    isPremium, 
    signIn, 
    signOut, 
    hasFeatureAccess,
    getRemainingUsage 
  } = useAuth()

  if (!user) {
    return <div>Faça login para continuar</div>
  }

  return (
    <div>
      <h1>Olá, {profile?.display_name}!</h1>
      <p>Plano: {isPremium ? 'Premium' : 'Gratuito'}</p>
    </div>
  )
}
```

### Verificação de Acesso

```tsx
// Verificar se tem acesso a uma funcionalidade
if (hasFeatureAccess('adaptive_simulados')) {
  // Mostrar simulados adaptativos
}

// Verificar uso restante
const remainingCronogramas = await getRemainingUsage('cronogramas')
if (remainingCronogramas === 0) {
  // Mostrar upgrade para premium
}
```

### Sistema de Limitações

#### Plano Gratuito
- **Cronogramas**: 1 por mês
- **Simulados**: 3 por mês
- **Notas**: 10 máximo
- **Posts no fórum**: 3 por mês
- **Sessões Pomodoro**: 5 por dia
- **Playlists Spotify**: 1 playlist

#### Plano Premium
- **Todos os recursos**: Ilimitados
- **Funcionalidades exclusivas**:
  - Simulados adaptativos
  - Relatórios avançados
  - Busca em notas
  - Links bidirecionais
  - Backup automático
  - Pomodoro customizável
  - Spotify premium
  - PDF sem marca d'água

### Funcionalidades Bloqueadas no Plano Gratuito

- `adaptive_simulados`
- `advanced_reports`
- `note_search`
- `bidirectional_links`
- `backup`
- `custom_pomodoro`
- `spotify_premium`
- `pdf_clean`

### Eventos de Tracking

O sistema registra automaticamente:
- Cadastro de usuário
- Login/logout
- Uso de funcionalidades
- Tentativas de acesso a recursos premium

### Configuração

O `AuthProvider` deve estar no layout raiz da aplicação:

```tsx
// app/layout.tsx
import { AuthProvider } from '@/contexts/auth-context'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### Integração com Supabase

O contexto utiliza o cliente Supabase para:
- Autenticação de usuários
- Gerenciamento de perfis
- Verificação de assinaturas
- Tracking de uso

### Tipos TypeScript

```typescript
interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  concursos_interesse: string[]
  nivel_estudos: 'iniciante' | 'intermediario' | 'avancado'
  created_at: string
  updated_at: string
}

interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  current_period_start: string
  current_period_end: string
  created_at: string
}
``` 