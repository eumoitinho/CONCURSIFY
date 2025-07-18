import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const handler = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Adicionar informações do usuário à sessão
      if (session.user) {
        // Fazendo cast para incluir o campo 'id' na sessão do usuário
        (session.user as { id: string | number } & typeof session.user).id = user.id
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Criar perfil do usuário após primeiro login
      if (account?.provider === 'google' && user.email) {
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!existingProfile) {
          await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              display_name: user.name,
              bio: '',
              location: '',
              concursos_interesse: [],
              nivel_estudos: 'iniciante',
            })

          await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              notifications: { email: true, push: true },
              theme: 'light',
              language: 'pt-BR',
              pomodoro_duration: 25,
              break_duration: 5,
            })
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
})

export { handler as GET, handler as POST }