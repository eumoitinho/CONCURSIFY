"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Search, 
  Menu,
  X,
  Star,
  Heart,
  Play,
  Check,
  Clock,
  User,
  BarChart,
  Users,
  BookOpen,
  Target,
  Award,
  Zap,
  Brain,
  Timer,
  Music,
  Coffee,
  TrendingUp,
  Shield,
  ArrowRight,
  ChevronRight
} from "lucide-react"

export function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#FF723A] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-[#2D2D2D]">Concursify</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/concursos" className="text-[#2D2D2D] hover:text-[#FF723A] transition-colors">
                Concursos
              </Link>
              <Link href="/simulados" className="text-[#2D2D2D] hover:text-[#FF723A] transition-colors">
                Simulados
              </Link>
              <Link href="/forum" className="text-[#2D2D2D] hover:text-[#FF723A] transition-colors">
                Fórum
              </Link>
              <Link href="/blog" className="text-[#2D2D2D] hover:text-[#FF723A] transition-colors">
                Blog
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-[#2D2D2D]">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button className="bg-[#FF723A] hover:bg-[#E55A2B] text-white border-2 border-[#2D2D2D]">
                  Teste Grátis
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link href="/concursos" className="block text-[#2D2D2D]">Concursos</Link>
              <Link href="/simulados" className="block text-[#2D2D2D]">Simulados</Link>
              <Link href="/forum" className="block text-[#2D2D2D]">Fórum</Link>
              <Link href="/blog" className="block text-[#2D2D2D]">Blog</Link>
              <div className="pt-4 border-t space-y-2">
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full">Entrar</Button>
                </Link>
                <Link href="/cadastro" className="block">
                  <Button className="w-full bg-[#FF723A] hover:bg-[#E55A2B]">Teste Grátis</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFB08A] to-white pt-20 pb-16">
        {/* Background Geometric Shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-[#FF8F5A] rounded-full opacity-30"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-[#FF723A] rotate-45 opacity-20"></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-[#E55A2B] rounded-full opacity-40"></div>
          <div className="absolute top-60 right-1/3 w-8 h-20 bg-[#FF8F5A] rounded-full opacity-25"></div>
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-[#FF723A] rotate-12 opacity-30"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center min-h-[600px]">
            {/* Left Side - Content (40%) */}
            <div className="lg:w-2/5 mb-12 lg:mb-0">
              <div className="text-center lg:text-left">
                <Badge className="bg-[#FF8F5A] text-[#2D2D2D] border-2 border-[#2D2D2D] mb-6">
                  🚀 #1 Plataforma de Concursos
                </Badge>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-6 leading-tight">
                  Prepare-se para
                  <span className="relative mx-3">
                    <span className="relative z-10">Concursos</span>
                    <div className="absolute -bottom-2 left-0 w-full h-4 bg-[#FF723A] opacity-30 rounded"></div>
                  </span>
                  com IA
                </h1>
                
                <p className="text-lg text-gray-600 mb-8 max-w-md">
                  Cronogramas personalizados, simulados adaptativos e comunidade colaborativa. 
                  Tudo isso com inteligência artificial.
                </p>

                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <div className="flex-1">
                    <Input 
                      placeholder="Buscar concursos..."
                      className="h-12 text-base border-2 border-[#2D2D2D] focus:border-[#FF723A]"
                    />
                  </div>
                  <Button className="h-12 px-6 bg-[#FF723A] hover:bg-[#E55A2B] text-white border-2 border-[#2D2D2D]">
                    <Search className="w-5 h-5 mr-2" />
                    Buscar
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-[#FF723A]" />
                    <span>25k+ estudantes</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-1 text-[#FF723A]" />
                    <span>1.2k+ aprovados</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Corporate Memphis Illustration (60%) */}
            <div className="lg:w-3/5 relative">
              {/* Main Character - Person studying (40% of space) */}
              <div className="relative mx-auto w-80 h-80 lg:w-96 lg:h-96">
                {/* Person */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Body */}
                    <ellipse cx="100" cy="140" rx="35" ry="50" fill="#FF8F5A" stroke="#2D2D2D" strokeWidth="3"/>
                    
                    {/* Head */}
                    <circle cx="100" cy="70" r="25" fill="#FFB08A" stroke="#2D2D2D" strokeWidth="3"/>
                    
                    {/* Hair */}
                    <path d="M 75 55 Q 100 45 125 55 Q 130 65 125 70 Q 100 60 75 70 Z" fill="#2D2D2D"/>
                    
                    {/* Eyes */}
                    <circle cx="92" cy="68" r="2" fill="#2D2D2D"/>
                    <circle cx="108" cy="68" r="2" fill="#2D2D2D"/>
                    
                    {/* Smile */}
                    <path d="M 90 80 Q 100 85 110 80" stroke="#2D2D2D" strokeWidth="2" fill="none"/>
                    
                    {/* Arms */}
                    <ellipse cx="70" cy="120" rx="8" ry="25" fill="#FFB08A" stroke="#2D2D2D" strokeWidth="3" transform="rotate(-20 70 120)"/>
                    <ellipse cx="130" cy="120" rx="8" ry="25" fill="#FFB08A" stroke="#2D2D2D" strokeWidth="3" transform="rotate(45 130 120)"/>
                    
                    {/* Legs */}
                    <ellipse cx="85" cy="180" rx="8" ry="20" fill="#FFB08A" stroke="#2D2D2D" strokeWidth="3"/>
                    <ellipse cx="115" cy="180" rx="8" ry="20" fill="#FFB08A" stroke="#2D2D2D" strokeWidth="3"/>
                  </svg>
                </div>

                {/* Laptop Screen (30% of space) */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 translate-y-4">
                  <svg viewBox="0 0 120 80" className="w-32 h-20">
                    {/* Laptop Base */}
                    <rect x="10" y="50" width="100" height="25" rx="5" fill="#E55A2B" stroke="#2D2D2D" strokeWidth="3"/>
                    
                    {/* Laptop Screen */}
                    <rect x="20" y="10" width="80" height="50" rx="5" fill="#FFFFFF" stroke="#2D2D2D" strokeWidth="3"/>
                    
                    {/* Screen Content - Dashboard */}
                    <rect x="25" y="15" width="70" height="5" fill="#FF723A"/>
                    <rect x="25" y="25" width="30" height="15" fill="#FFB08A"/>
                    <rect x="60" y="25" width="35" height="15" fill="#FF8F5A"/>
                    <rect x="25" y="45" width="50" height="3" fill="#E55A2B"/>
                    <rect x="25" y="50" width="40" height="3" fill="#FF723A"/>
                  </svg>
                </div>

                {/* Environment Elements (30% of space) */}
                {/* Coffee Cup */}
                <div className="absolute top-4 right-8">
                  <svg viewBox="0 0 40 40" className="w-12 h-12">
                    <rect x="8" y="15" width="20" height="20" rx="3" fill="#FFFFFF" stroke="#2D2D2D" strokeWidth="2"/>
                    <path d="M 28 20 Q 35 20 35 25 Q 35 30 28 30" stroke="#2D2D2D" strokeWidth="2" fill="none"/>
                    <rect x="10" y="17" width="16" height="2" fill="#E55A2B"/>
                    {/* Steam */}
                    <path d="M 15 10 Q 16 5 15 0" stroke="#FF8F5A" strokeWidth="2" fill="none"/>
                    <path d="M 20 12 Q 21 7 20 2" stroke="#FF8F5A" strokeWidth="2" fill="none"/>
                  </svg>
                </div>

                {/* Stack of Books */}
                <div className="absolute bottom-20 left-4">
                  <svg viewBox="0 0 50 60" className="w-16 h-20">
                    <rect x="5" y="40" width="40" height="8" fill="#FF723A" stroke="#2D2D2D" strokeWidth="2"/>
                    <rect x="8" y="30" width="35" height="8" fill="#E55A2B" stroke="#2D2D2D" strokeWidth="2"/>
                    <rect x="10" y="20" width="32" height="8" fill="#FF8F5A" stroke="#2D2D2D" strokeWidth="2"/>
                    {/* Book details */}
                    <rect x="12" y="22" width="3" height="4" fill="#FFFFFF"/>
                    <rect x="10" y="32" width="3" height="4" fill="#FFFFFF"/>
                  </svg>
                </div>

                {/* Plant */}
                <div className="absolute top-8 left-8">
                  <svg viewBox="0 0 40 50" className="w-10 h-12">
                    {/* Pot */}
                    <path d="M 15 35 L 25 35 L 28 45 L 12 45 Z" fill="#E55A2B" stroke="#2D2D2D" strokeWidth="2"/>
                    
                    {/* Plant */}
                    <path d="M 20 35 Q 15 25 10 15 Q 12 18 20 25" fill="#4ADE80" stroke="#2D2D2D" strokeWidth="2"/>
                    <path d="M 20 35 Q 25 25 30 15 Q 28 18 20 25" fill="#4ADE80" stroke="#2D2D2D" strokeWidth="2"/>
                    <path d="M 20 35 Q 20 20 18 10 Q 22 12 20 25" fill="#4ADE80" stroke="#2D2D2D" strokeWidth="2"/>
                  </svg>
                </div>

                {/* Floating UI Elements */}
                <div className="absolute top-16 right-4 animate-bounce">
                  <div className="w-8 h-8 bg-[#FF723A] rounded-full border-2 border-[#2D2D2D] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="absolute bottom-8 right-16 animate-pulse">
                  <div className="w-10 h-6 bg-[#FF8F5A] rounded-full border-2 border-[#2D2D2D] flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#2D2D2D]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-4">
              Por que escolher o Concursify?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma combina tecnologia avançada com metodologia comprovada 
              para maximizar suas chances de aprovação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card className="text-center border-2 border-[#2D2D2D] hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-[#FF723A] rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-[#2D2D2D]">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">IA Personalizada</h3>
                <p className="text-gray-600">
                  Cronogramas adaptativos que se ajustam ao seu ritmo e estilo de aprendizado
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center border-2 border-[#2D2D2D] hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-[#E55A2B] rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-[#2D2D2D]">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">Simulados Adaptativos</h3>
                <p className="text-gray-600">
                  Questões que evoluem com seu desempenho, focando em suas dificuldades
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center border-2 border-[#2D2D2D] hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-[#FF8F5A] rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-[#2D2D2D]">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">Comunidade Ativa</h3>
                <p className="text-gray-600">
                  Fórum colaborativo com milhares de concurseiros compartilhando experiências
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="text-center border-2 border-[#2D2D2D] hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-[#FFB08A] rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-[#2D2D2D]">
                  <Timer className="w-8 h-8 text-[#2D2D2D]" />
                </div>
                <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">Método Pomodoro+</h3>
                <p className="text-gray-600">
                  Timer inteligente que otimiza seus ciclos de estudo com música personalizada
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-[#FF723A] to-[#E55A2B]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">25k+</div>
              <div className="text-[#FFB08A]">Estudantes Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1.2k+</div>
              <div className="text-[#FFB08A]">Aprovados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-[#FFB08A]">Concursos Disponíveis</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-[#FFB08A]">Taxa de Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-6">
              Comece sua jornada rumo à aprovação
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Junte-se a milhares de concurseiros que já estão usando a tecnologia 
              para turbinar seus estudos. Teste grátis por 7 dias!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cadastro">
                <Button size="lg" className="bg-[#FF723A] hover:bg-[#E55A2B] text-white border-2 border-[#2D2D2D] px-8">
                  Começar Teste Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="border-2 border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#FFB08A]">
                  Ver Demo
                  <Play className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D2D2D] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-[#FF723A] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-xl font-bold">Concursify</span>
              </div>
              <p className="text-gray-300 mb-4">
                A plataforma mais completa para preparação de concursos públicos.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-[#FF723A] rounded flex items-center justify-center">
                  <span className="text-white text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-[#FF723A] rounded flex items-center justify-center">
                  <span className="text-white text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-[#FF723A] rounded flex items-center justify-center">
                  <span className="text-white text-sm">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/concursos" className="hover:text-[#FF723A]">Concursos</Link></li>
                <li><Link href="/simulados" className="hover:text-[#FF723A]">Simulados</Link></li>
                <li><Link href="/forum" className="hover:text-[#FF723A]">Fórum</Link></li>
                <li><Link href="/pomodoro" className="hover:text-[#FF723A]">Pomodoro</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/ajuda" className="hover:text-[#FF723A]">Central de Ajuda</Link></li>
                <li><Link href="/contato" className="hover:text-[#FF723A]">Contato</Link></li>
                <li><Link href="/blog" className="hover:text-[#FF723A]">Blog</Link></li>
                <li><Link href="/sobre" className="hover:text-[#FF723A]">Sobre</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/privacidade" className="hover:text-[#FF723A]">Privacidade</Link></li>
                <li><Link href="/termos" className="hover:text-[#FF723A]">Termos</Link></li>
                <li><Link href="/cookies" className="hover:text-[#FF723A]">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Concursify. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}