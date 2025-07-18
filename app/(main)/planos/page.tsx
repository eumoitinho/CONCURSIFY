import { Suspense } from 'react'
import { PricingPlans } from '@/components/subscription/pricing-plans'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { getSubscriptionPlans } from '@/app/actions/subscription'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Star, 
  Users, 
  Zap, 
  Shield,
  TrendingUp,
  Target,
  Heart
} from 'lucide-react'

export default async function PlanosPage() {
  const { plans, error } = await getSubscriptionPlans()

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar planos: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="bg-[#FF723A] text-white mb-6">
            🚀 Escolha seu plano ideal
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Acelere sua aprovação com o 
            <span className="text-[#FF723A]"> Concursify</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Planos flexíveis para todos os perfis de concurseiros. 
            Comece grátis e evolua conforme sua necessidade.
          </p>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-[#FF723A]" />
              <span>Teste grátis por 7 dias</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-[#FF723A]" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-[#FF723A]" />
              <span>Suporte brasileiro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-[#FF723A] text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">25k+</div>
              <div className="text-[#FFB08A]">Estudantes ativos</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">1.2k+</div>
              <div className="text-[#FFB08A]">Aprovados em 2024</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-[#FFB08A]">Taxa de satisfação</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">150+</div>
              <div className="text-[#FFB08A]">Concursos disponíveis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Suspense fallback={<PricingPlansSkeleton />}>
            <PricingPlans plans={plans} />
          </Suspense>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compare todos os recursos
            </h2>
            <p className="text-lg text-gray-600">
              Veja em detalhes o que cada plano oferece
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-6 font-semibold text-gray-900">Recursos</th>
                    <th className="text-center p-6 font-semibold text-gray-900">Gratuito</th>
                    <th className="text-center p-6 font-semibold text-gray-900">
                      <div className="flex items-center justify-center space-x-2">
                        <span>Estudante</span>
                        <Badge className="bg-[#FF723A] text-white">Popular</Badge>
                      </div>
                    </th>
                    <th className="text-center p-6 font-semibold text-gray-900">Profissional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <FeatureRow 
                    feature="Cronogramas de estudo"
                    free="1 cronograma"
                    student="Ilimitado"
                    pro="Ilimitado"
                  />
                  <FeatureRow 
                    feature="Simulados adaptativos"
                    free="5 por mês"
                    student="Ilimitado"
                    pro="Ilimitado"
                  />
                  <FeatureRow 
                    feature="Notas e anotações"
                    free="10 notas"
                    student="Ilimitado"
                    pro="Ilimitado"
                  />
                  <FeatureRow 
                    feature="Fórum e comunidade"
                    free="5 posts por mês"
                    student="Ilimitado"
                    pro="Acesso premium"
                  />
                  <FeatureRow 
                    feature="Sessões Pomodoro"
                    free="10 por mês"
                    student="Ilimitado"
                    pro="Analytics avançados"
                  />
                  <FeatureRow 
                    feature="Playlists Spotify"
                    free="❌"
                    student="10 playlists"
                    pro="Ilimitado"
                  />
                  <FeatureRow 
                    feature="Exportação PDF"
                    free="❌"
                    student="✅"
                    pro="✅"
                  />
                  <FeatureRow 
                    feature="Backup automático"
                    free="❌"
                    student="❌"
                    pro="✅"
                  />
                  <FeatureRow 
                    feature="Suporte prioritário"
                    free="❌"
                    student="Email"
                    pro="Chat + Email"
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perguntas frequentes
            </h2>
            <p className="text-lg text-gray-600">
              Tire suas principais dúvidas sobre nossos planos
            </p>
          </div>

          <div className="space-y-6">
            <FAQItem 
              question="Posso cancelar minha assinatura a qualquer momento?"
              answer="Sim! Você pode cancelar sua assinatura a qualquer momento através do painel de controle. Não há multas ou taxas de cancelamento."
            />
            <FAQItem 
              question="O que acontece com meus dados se eu cancelar?"
              answer="Seus dados são mantidos por 30 dias após o cancelamento. Durante esse período, você pode reativar sua conta e recuperar tudo."
            />
            <FAQItem 
              question="Posso mudar de plano depois?"
              answer="Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações são proporcionais ao período restante."
            />
            <FAQItem 
              question="Há desconto no plano anual?"
              answer="Sim! O plano anual oferece 2 meses grátis (equivalente a 17% de desconto) comparado ao pagamento mensal."
            />
            <FAQItem 
              question="Vocês oferecem reembolso?"
              answer="Oferecemos garantia de 7 dias. Se não ficar satisfeito, devolvemos 100% do valor pago, sem perguntas."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#FF723A] to-[#E55A2B] text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-xl mb-8 text-[#FFB08A]">
            Junte-se a milhares de concurseiros que já estão aprovando com o Concursify
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-3">
              <Users className="h-5 w-5" />
              <span>25k+ estudantes</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-3">
              <TrendingUp className="h-5 w-5" />
              <span>1.2k+ aprovados</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-3">
              <Target className="h-5 w-5" />
              <span>98% satisfação</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureRow({ 
  feature, 
  free, 
  student, 
  pro 
}: { 
  feature: string
  free: string
  student: string
  pro: string
}) {
  return (
    <tr>
      <td className="p-6 font-medium text-gray-900">{feature}</td>
      <td className="p-6 text-center text-gray-600">{free}</td>
      <td className="p-6 text-center text-gray-600">{student}</td>
      <td className="p-6 text-center text-gray-600">{pro}</td>
    </tr>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{question}</h3>
        <p className="text-gray-600">{answer}</p>
      </CardContent>
    </Card>
  )
}

function PricingPlansSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-8 w-20" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}