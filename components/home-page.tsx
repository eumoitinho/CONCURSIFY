"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Menu,
  X,
  Heart,
  Play,
  Check,
  Clock,
  User,
  BarChart,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"

export function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  // Preloader effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const preloader = document.getElementById("preloader")
      if (preloader) {
        preloader.style.display = "none"
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const concursos = [
    {
      id: 1,
      title: "Tribunal de Contas da União - TCU",
      area: "Auditoria",
      nivel: "Superior",
      tempo: "12 Semanas",
      nivel_icon: "higher",
      estudantes: "6395+",
      preco: "R$ 450",
      rating: "4.8(256)",
      image: "/placeholder.svg?height=200&width=300&text=TCU",
      instructor: "/placeholder.svg?height=40&width=40&text=Prof",
      category: "cat1",
    },
    {
      id: 2,
      title: "Polícia Federal - Agente",
      area: "Segurança",
      nivel: "Superior",
      tempo: "16 Semanas",
      nivel_icon: "higher",
      estudantes: "8234+",
      preco: "R$ 520",
      rating: "4.9(312)",
      image: "/placeholder.svg?height=200&width=300&text=PF",
      instructor: "/placeholder.svg?height=40&width=40&text=Prof",
      category: "cat2",
    },
    {
      id: 3,
      title: "Receita Federal - Auditor",
      area: "Tributário",
      nivel: "Superior",
      tempo: "20 Semanas",
      nivel_icon: "higher",
      estudantes: "5678+",
      preco: "R$ 680",
      rating: "4.9(189)",
      image: "/placeholder.svg?height=200&width=300&text=RF",
      instructor: "/placeholder.svg?height=40&width=40&text=Prof",
      category: "cat3",
    },
    {
      id: 4,
      title: "Ministério Público - Promotor",
      area: "Jurídico",
      nivel: "Superior",
      tempo: "24 Semanas",
      nivel_icon: "higher",
      estudantes: "4521+",
      preco: "R$ 750",
      rating: "4.8(156)",
      image: "/placeholder.svg?height=200&width=300&text=MP",
      instructor: "/placeholder.svg?height=40&width=40&text=Prof",
      category: "cat1",
    },
    {
      id: 5,
      title: "Tribunal Regional Federal - TRF",
      area: "Jurídico",
      nivel: "Superior",
      tempo: "18 Semanas",
      nivel_icon: "higher",
      estudantes: "3892+",
      preco: "R$ 580",
      rating: "4.7(201)",
      image: "/placeholder.svg?height=200&width=300&text=TRF",
      instructor: "/placeholder.svg?height=40&width=40&text=Prof",
      category: "cat2",
    },
    {
      id: 6,
      title: "Defensoria Pública - Defensor",
      area: "Jurídico",
      nivel: "Superior",
      tempo: "22 Semanas",
      nivel_icon: "higher",
      estudantes: "2945+",
      preco: "R$ 640",
      rating: "4.8(134)",
      image: "/placeholder.svg?height=200&width=300&text=DP",
      instructor: "/placeholder.svg?height=40&width=40&text=Prof",
      category: "cat3",
    },
  ]

  const instrutores = [
    {
      name: "Dr. João Silva",
      specialty: "Direito Constitucional",
      image: "/placeholder.svg?height=250&width=200&text=João",
    },
    {
      name: "Prof. Maria Santos",
      specialty: "Matemática Financeira",
      image: "/placeholder.svg?height=250&width=200&text=Maria",
    },
    {
      name: "Dr. Carlos Oliveira",
      specialty: "Direito Administrativo",
      image: "/placeholder.svg?height=250&width=200&text=Carlos",
    },
    {
      name: "Prof. Ana Costa",
      specialty: "Português",
      image: "/placeholder.svg?height=250&width=200&text=Ana",
    },
  ]

  const testimonials = [
    {
      name: "Rafael Mendes",
      role: "Aprovado TCU 2024",
      image: "/placeholder.svg?height=60&width=60&text=RM",
      text: "Com o Concursify consegui organizar meus estudos de forma eficiente. A IA realmente entende o que preciso estudar!",
    },
    {
      name: "Marina Silva",
      role: "Aprovada PF 2024",
      image: "/placeholder.svg?height=60&width=60&text=MS",
      text: "Os simulados adaptativos foram fundamentais para minha aprovação. Sistema incrível!",
    },
    {
      name: "Lucas Ferreira",
      role: "Aprovado TRF 2024",
      image: "/placeholder.svg?height=60&width=60&text=LF",
      text: "A comunidade do fórum me ajudou muito. Compartilhar dúvidas e experiências fez toda diferença.",
    },
  ]

  const blogs = [
    {
      title: "5 Estratégias para Otimizar seus Estudos",
      excerpt: "Descubra técnicas comprovadas para maximizar seu tempo de estudo",
      date: "15 de Janeiro, 2024",
      author: "Equipe Concursify",
      image: "/placeholder.svg?height=200&width=300&text=Blog1",
      tags: ["Estratégia", "Produtividade"],
    },
    {
      title: "Como a IA está Revolucionando os Concursos",
      excerpt: "Entenda como usar inteligência artificial a seu favor",
      date: "12 de Janeiro, 2024",
      author: "Dr. João Silva",
      image: "/placeholder.svg?height=200&width=300&text=Blog2",
      tags: ["Tecnologia", "IA"],
    },
    {
      title: "Técnicas de Memorização para Concursos",
      excerpt: "Métodos científicos para melhorar sua retenção",
      date: "10 de Janeiro, 2024",
      author: "Prof. Maria Santos",
      image: "/placeholder.svg?height=200&width=300&text=Blog3",
      tags: ["Memorização", "Técnicas"],
    },
  ]

  return (
    <div className="zoomy-template">
      {/* Preloader */}
      <div id="preloader" className="preloader-container">
        <div className="preloader">
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Header */}
      <header className="header-fixed">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-3 px-4 lg:px-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <img
                  src="/placeholder.svg?height=32&width=120&text=Concursify"
                  alt="Concursify"
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <a
                  href="#"
                  className="nav-link text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
                >
                  Todas as Áreas
                </a>
                <a href="#" className="nav-link text-sm font-medium text-orange-500 transition-colors">
                  Início
                </a>
                <a
                  href="#"
                  className="nav-link text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
                >
                  Páginas
                </a>
                <a
                  href="#"
                  className="nav-link text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
                >
                  Blog
                </a>
                <a
                  href="/contato"
                  className="nav-link text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
                >
                  Contato
                </a>
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/cadastro"
                  className="theme_btn free_btn text-xs px-3 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-md font-semibold transition-all duration-300 border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  Teste Grátis
                </Link>
                <Link
                  href="/auth/signin"
                  className="sign-in flex items-center justify-center w-8 h-8 border-2 border-gray-800 rounded-md text-gray-800 hover:bg-orange-500 hover:text-white transition-all duration-300"
                >
                  <User className="h-4 w-4" />
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-orange-500 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <aside
        className={`slide-bar fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-700 hover:text-orange-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="mb-8">
            <Link href="/" className="block">
              <img src="/placeholder.svg?height=32&width=120&text=Concursify" alt="Concursify" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Sobre Nós</h4>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Plataforma completa para preparação de concursos públicos com inteligência artificial, simulados
              adaptativos e ferramentas avançadas.
            </p>
            <Link
              href="/contato"
              className="inline-block px-4 py-2 bg-orange-500 text-white rounded-md font-semibold hover:bg-orange-600 transition-colors"
            >
              Fale Conosco
            </Link>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">Contato</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-3 text-orange-500" />
                <span>São Paulo, SP - Brasil</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-orange-500" />
                <span>+55 11 99999-9999</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-orange-500" />
                <span>contato@concursify.com</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/cadastro"
              className="text-center py-2 px-4 bg-orange-500 text-white rounded-md font-semibold hover:bg-orange-600 transition-colors"
            >
              Teste Grátis
            </Link>
            <Link
              href="/auth/signin"
              className="text-center py-2 px-4 border border-orange-500 text-orange-500 rounded-md font-semibold hover:bg-orange-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="body-overlay fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main>
        {/* Hero Section */}
        <section className="hero-section relative pt-20 md:pt-24 lg:pt-28 pb-16 lg:pb-20 overflow-hidden">
          {/* Background Shapes */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              className="absolute top-1/4 left-[5%] w-10 h-10 animate-float"
              src="/placeholder.svg?height=40&width=40&text=Shape1"
              alt=""
            />
            <img
              className="absolute top-1/3 right-[10%] w-10 h-10 animate-float-reverse"
              src="/placeholder.svg?height=40&width=40&text=Shape2"
              alt=""
            />
            <img
              className="absolute bottom-1/3 left-[10%] w-10 h-10 animate-bounce-slow"
              src="/placeholder.svg?height=40&width=40&text=Shape3"
              alt=""
            />
            <img
              className="absolute top-3/5 right-1/5 w-10 h-10 animate-float-slow"
              src="/placeholder.svg?height=40&width=40&text=Shape4"
              alt=""
            />
            <img
              className="absolute bottom-1/5 right-[5%] w-10 h-10 animate-bounce-slow"
              src="/placeholder.svg?height=40&width=40&text=Shape5"
              alt=""
            />
            <img
              className="absolute top-[10%] left-1/5 w-10 h-10 animate-float"
              src="/placeholder.svg?height=40&width=40&text=Shape6"
              alt=""
            />
            <img
              className="absolute bottom-[10%] left-[30%] w-15 h-15 opacity-30"
              src="/placeholder.svg?height=60&width=60&text=Dots"
              alt=""
            />
          </div>

          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Content */}
              <div className="order-2 lg:order-1 text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Sua Aprovação em Concursos com{" "}
                  <span className="relative text-orange-500">
                    Inteligência Artificial
                    <span className="absolute bottom-0 left-0 w-full h-2 bg-orange-500 opacity-30 rounded-sm"></span>
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Cronogramas personalizados, simulados adaptativos, comunidade ativa e ferramentas inteligentes para turbinar seus estudos e garantir sua aprovação.
                </p>

                {/* Search Area */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto lg:mx-0">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Buscar Concursos"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg text-base shadow-[2px_2px_0px_0px_#2d2d2d] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors">
                      <Search className="h-5 w-5" />
                    </button>
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-800 rounded-lg bg-white text-base shadow-[2px_2px_0px_0px_#2d2d2d] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[150px]"
                  >
                    <option value="">Áreas</option>
                    <option value="juridico">Jurídico</option>
                    <option value="saude">Saúde</option>
                    <option value="educacao">Educação</option>
                    <option value="tecnologia">Tecnologia</option>
                    <option value="seguranca">Segurança</option>
                  </select>

                  <button className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300 whitespace-nowrap">
                    Buscar Agora
                  </button>
                </div>

                <div className="flex items-center justify-center lg:justify-start text-gray-600">
                  <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold mr-2">#1</span>
                  <span className="text-sm">Plataforma de Preparação para Concursos com Inteligência Artificial</span>
                </div>
              </div>

              {/* Image */}
              <div className="order-1 lg:order-2 relative">
                <div className="relative max-w-lg mx-auto">
                  <img
                    src="/placeholder.svg?height=400&width=500&text=Hero+Image"
                    alt="Hero"
                    className="w-full h-auto relative z-10"
                  />

                  {/* Floating Elements */}
                  <img
                    className="absolute top-1/5 -right-[10%] w-20 h-20 animate-float z-0"
                    src="/placeholder.svg?height=80&width=80&text=Float1"
                    alt=""
                  />
                  <img
                    className="absolute bottom-1/5 -left-[5%] w-20 h-20 animate-bounce-slow z-0"
                    src="/placeholder.svg?height=80&width=80&text=Float2"
                    alt=""
                  />
                  <img
                    className="absolute top-[10%] left-[10%] w-15 h-15 opacity-30 z-0"
                    src="/placeholder.svg?height=60&width=60&text=Dots1"
                    alt=""
                  />
                  <img
                    className="absolute bottom-[10%] right-[10%] w-15 h-15 opacity-30 z-0"
                    src="/placeholder.svg?height=60&width=60&text=Dots2"
                    alt=""
                  />
                  <img
                    className="absolute top-1/2 -left-[10%] w-25 h-25 opacity-20 z-0"
                    src="/placeholder.svg?height=100&width=100&text=Zigzag"
                    alt=""
                  />
                  <img
                    className="absolute top-[30%] right-1/5 w-10 h-10 animate-pulse z-0"
                    src="/placeholder.svg?height=40&width=40&text=Plan"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-4 gap-8 items-start">
              {/* Title */}
              <div className="lg:col-span-1 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  <span className="font-normal">Recursos</span> Inteligentes Para Você
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Nossa plataforma utiliza inteligência artificial para personalizar sua experiência de estudos e maximizar suas chances de aprovação.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="lg:col-span-3">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="feature-card bg-white p-6 rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[6px_6px_0px_0px_#2d2d2d] hover:-translate-y-1 transition-all duration-300 text-center">
                    <div className="w-20 h-20 bg-orange-500 rounded-full border-3 border-gray-800 flex items-center justify-center mx-auto mb-6">
                      <img src="/placeholder.svg?height=40&width=40&text=Puzzle" alt="" className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Cronogramas com IA</h3>
                    <p className="text-gray-600">Cronogramas personalizados que se adaptam ao seu ritmo e objetivos de estudo.</p>
                  </div>

                  <div className="feature-card bg-orange-200 p-6 rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[6px_6px_0px_0px_#2d2d2d] hover:-translate-y-1 transition-all duration-300 text-center">
                    <div className="w-20 h-20 bg-orange-500 rounded-full border-3 border-gray-800 flex items-center justify-center mx-auto mb-6">
                      <img src="/placeholder.svg?height=40&width=40&text=Manager" alt="" className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Simulados Adaptativos</h3>
                    <p className="text-gray-600">Simulados que se ajustam automaticamente ao seu nível de conhecimento.</p>
                  </div>

                  <div className="feature-card bg-orange-300 p-6 rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[6px_6px_0px_0px_#2d2d2d] hover:-translate-y-1 transition-all duration-300 text-center">
                    <div className="w-20 h-20 bg-orange-500 rounded-full border-3 border-gray-800 flex items-center justify-center mx-auto mb-6">
                      <img src="/placeholder.svg?height=40&width=40&text=Notepad" alt="" className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Comunidade Ativa</h3>
                    <p className="text-gray-600">Fórum com milhares de concurseiros compartilhando experiências e dicas.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section relative py-16 lg:py-20 bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden">
          {/* Background Blur Shapes */}
          <div className="absolute top-1/5 left-[10%] w-48 h-48 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/5 right-[10%] w-48 h-48 bg-white bg-opacity-10 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 lg:px-6 relative z-10">
            {/* Section Header */}
            <div className="text-center mb-12 lg:mb-16">
              <h5 className="text-orange-200 text-sm font-semibold uppercase tracking-wider mb-4">
                Professores & Estudantes
              </h5>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                O que Você Está Procurando?
              </h2>
            </div>

            {/* CTA Cards */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16 lg:mb-20">
              <div className="cta-card bg-white p-8 lg:p-10 rounded-xl border-3 border-gray-800 shadow-[6px_6px_0px_0px_#2d2d2d] hover:shadow-[8px_8px_0px_0px_#2d2d2d] hover:-translate-y-2 transition-all duration-300 text-center">
                <div className="w-24 h-24 bg-orange-500 rounded-full border-3 border-gray-800 flex items-center justify-center mx-auto mb-6">
                  <img src="/placeholder.svg?height=50&width=50&text=Teacher" alt="" className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Você quer ensinar aqui?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Junte-se à nossa equipe de instrutores especialistas em concursos públicos e ajude milhares de
                  candidatos a realizarem seus sonhos.
                </p>
                <Link
                  href="/contato"
                  className="inline-block px-6 py-3 bg-transparent border-2 border-gray-800 text-gray-900 font-semibold rounded-lg shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-gray-900 hover:text-white hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300"
                >
                  Cadastre-se Agora
                </Link>
              </div>

              <div className="cta-card bg-white p-8 lg:p-10 rounded-xl border-3 border-gray-800 shadow-[6px_6px_0px_0px_#2d2d2d] hover:shadow-[8px_8px_0px_0px_#2d2d2d] hover:-translate-y-2 transition-all duration-300 text-center">
                <div className="w-24 h-24 bg-orange-500 rounded-full border-3 border-gray-800 flex items-center justify-center mx-auto mb-6">
                  <img src="/placeholder.svg?height=50&width=50&text=Student" alt="" className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Você quer estudar aqui?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Comece sua jornada rumo à aprovação com nossa plataforma completa de preparação para concursos
                  públicos.
                </p>
                <Link
                  href="/cadastro"
                  className="inline-block px-6 py-3 bg-orange-500 border-2 border-gray-800 text-white font-semibold rounded-lg shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-orange-600 hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300"
                >
                  Cadastre-se Agora
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div className="text-center mb-12">
              <h5 className="text-orange-200 text-sm font-semibold uppercase tracking-wider mb-4">
                Navegar Categorias
              </h5>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Explore Nossas Áreas de Concursos</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-12">
              {[
                { name: "Jurídico", count: "126+", icon: "Law" },
                { name: "Tecnologia", count: "325+", icon: "Tech" },
                { name: "Saúde", count: "95+", icon: "Health" },
                { name: "Educação", count: "156+", icon: "Education" },
                { name: "Segurança", count: "136+", icon: "Security" },
              ].map((category, index) => (
                <div
                  key={index}
                  className="category-card bg-white p-4 lg:p-6 rounded-xl border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[5px_5px_0px_0px_#2d2d2d] hover:-translate-y-1 hover:bg-orange-500 hover:text-white group transition-all duration-300 text-center"
                >
                  <img
                    src={`/placeholder.svg?height=48&width=48&text=${category.icon}`}
                    alt=""
                    className="w-12 h-12 mx-auto mb-4"
                  />
                  <h4 className="font-bold text-gray-900 group-hover:text-white mb-2">
                    <Link href="/concursos">{category.name}</Link>
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-orange-100">
                    {category.count} Concursos Disponíveis
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/concursos"
                className="inline-block px-8 py-3 bg-white text-orange-500 font-semibold rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-gray-50 hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300"
              >
                Todas as Categorias
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="courses-section py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-6">
            {/* Section Header */}
            <div className="text-center mb-12 lg:mb-16">
              <h5 className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4">
                Concursos em Destaque
              </h5>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Explore Nossos Concursos Populares
              </h2>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {["Todos", "Jurídico", "Segurança", "Tributário", "Saúde", "Educação"].map((filter, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 font-semibold rounded-lg border-2 border-gray-800 shadow-[2px_2px_0px_0px_#2d2d2d] hover:shadow-[3px_3px_0px_0px_#2d2d2d] hover:-translate-y-0.5 transition-all duration-300 ${
                    index === 0
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-900 hover:bg-orange-500 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
              {concursos.map((concurso) => (
                <div
                  key={concurso.id}
                  className="course-card bg-white rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[6px_6px_0px_0px_#2d2d2d] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={concurso.image || "/placeholder.svg"}
                      alt={concurso.title}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-semibold border-2 border-gray-800">
                      {concurso.rating}
                    </div>
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-orange-300 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold border border-gray-800">
                        {concurso.area}
                      </span>
                      <span className="bg-orange-300 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold border border-gray-800">
                        {concurso.nivel}
                      </span>
                      <img
                        src={concurso.instructor || "/placeholder.svg"}
                        alt="Instructor"
                        className="w-8 h-8 rounded-full border-2 border-gray-800 ml-auto"
                      />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-4 hover:text-orange-500 transition-colors">
                      <Link href="/concursos">{concurso.title}</Link>
                    </h3>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{concurso.tempo}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart className="h-4 w-4" />
                          <span>{concurso.nivel_icon}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{concurso.estudantes}</span>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-orange-500">{concurso.preco}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/concursos"
                className="inline-block px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-orange-600 hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300"
              >
                Todos os Concursos
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="why-choose-section py-16 lg:py-20 bg-gradient-to-br from-orange-500 to-orange-600 mx-4 lg:mx-12 rounded-2xl overflow-hidden relative">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Image Side */}
              <div className="relative">
                {/* Stats Card */}
                <div className="absolute top-8 left-8 bg-white p-4 rounded-xl border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] z-10">
                  <h5 className="text-sm font-semibold text-gray-600 mb-2">Total de Estudantes</h5>
                  <div className="flex items-center mb-2">
                    <img
                      className="w-8 h-8 rounded-full border-2 border-white -mr-2"
                      src="/placeholder.svg?height=32&width=32&text=U1"
                      alt=""
                    />
                    <img
                      className="w-8 h-8 rounded-full border-2 border-white -mr-2"
                      src="/placeholder.svg?height=32&width=32&text=U2"
                      alt=""
                    />
                    <img
                      className="w-8 h-8 rounded-full border-2 border-white -mr-2"
                      src="/placeholder.svg?height=32&width=32&text=U3"
                      alt=""
                    />
                    <img
                      className="w-8 h-8 rounded-full border-2 border-white"
                      src="/placeholder.svg?height=32&width=32&text=U4"
                      alt=""
                    />
                  </div>
                  <span className="text-xl font-bold text-orange-500">25k+</span>
                </div>

                {/* Feature Tags */}
                <div className="absolute top-1/2 -right-8 bg-white px-4 py-2 rounded-full border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] flex items-center gap-2 text-sm font-semibold text-gray-900 z-10">
                  <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <img src="/placeholder.svg?height=16&width=16&text=Shield" alt="" className="w-4 h-4" />
                  </span>
                  Seguro & Protegido
                </div>

                <div className="absolute bottom-1/3 -left-8 bg-white px-4 py-2 rounded-full border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] flex items-center gap-2 text-sm font-semibold text-gray-900 z-10">
                  <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <img src="/placeholder.svg?height=16&width=16&text=Catalog" alt="" className="w-4 h-4" />
                  </span>
                  120+ Concursos
                </div>

                <div className="absolute bottom-12 right-8 bg-white px-4 py-2 rounded-full border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] flex items-center gap-2 text-sm font-semibold text-gray-900 z-10">
                  <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  Educação de Qualidade
                </div>

                {/* Video Button */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <a
                    href="https://www.youtube.com/watch?v=7omGYwdcS04"
                    className="w-20 h-20 bg-orange-500 border-3 border-white rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 animate-pulse"
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </a>
                </div>

                {/* Main Image */}
                <div className="relative z-0">
                  <img
                    src="/placeholder.svg?height=400&width=500&text=Why+Choose+Us"
                    alt="Why Choose Us"
                    className="w-full h-auto rounded-xl"
                  />
                </div>

                {/* Decorative Dots */}
                <img
                  className="absolute -bottom-8 -right-8 w-15 h-15 opacity-30"
                  src="/placeholder.svg?height=60&width=60&text=Dots"
                  alt=""
                />
              </div>

              {/* Content Side */}
              <div className="text-white">
                <h5 className="text-orange-200 text-sm font-semibold uppercase tracking-wider mb-4">
                  Explore o Concursify
                </h5>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Por que Escolher o Concursify?</h2>
                <p className="text-orange-100 text-lg mb-8 leading-relaxed">
                  Nossa plataforma revoluciona a preparação para concursos com inteligência artificial, oferecendo estudos personalizados, simulados adaptativos e uma comunidade engajada para sua aprovação.
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    "Cronogramas personalizados com inteligência artificial.",
                    "Simulados adaptativos que se ajustam ao seu nível.",
                    "Comunidade ativa com milhares de concurseiros.",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-orange-100">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sobre"
                  className="inline-block px-8 py-3 bg-white text-orange-500 font-semibold rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-gray-50 hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300"
                >
                  Mais Detalhes
                </Link>
              </div>
            </div>
          </div>

          {/* Instructors Section */}
          <div className="mt-16 lg:mt-20 bg-gray-50 py-16 lg:py-20 -mx-4 lg:-mx-6 relative">
            {/* Background Blur */}
            <div className="absolute top-1/5 right-[10%] w-72 h-72 bg-orange-500 bg-opacity-10 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 lg:px-6 relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 lg:mb-16">
                <div className="text-center lg:text-left mb-8 lg:mb-0">
                  <h5 className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4">
                    Nossos Instrutores
                  </h5>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Instrutores Experientes</h2>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {instrutores.map((instrutor, index) => (
                  <div
                    key={index}
                    className="instructor-card bg-white p-6 rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[6px_6px_0px_0px_#2d2d2d] hover:-translate-y-1 transition-all duration-300 text-center group"
                  >
                    <div className="relative mb-6">
                      <img
                        src={instrutor.image || "/placeholder.svg"}
                        alt={instrutor.name}
                        className="w-24 h-24 rounded-full border-3 border-gray-800 object-cover mx-auto"
                      />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 border-2 border-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex space-x-1">
                          <Facebook className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 mb-2 hover:text-orange-500 transition-colors">
                      <Link href="/instrutores">{instrutor.name}</Link>
                    </h4>
                    <p className="text-gray-600 text-sm">{instrutor.specialty}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 lg:mb-16">
              <div className="text-center lg:text-left mb-8 lg:mb-0">
                <h5 className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4">Depoimentos</h5>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">O que Nossos Alunos Dizem</h2>
              </div>
              <Link
                href="/depoimentos"
                className="inline-block px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-orange-600 hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300 mx-auto lg:mx-0"
              >
                Ler Todos os Depoimentos
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="testimonial-card bg-white p-6 rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[6px_6px_0px_0px_#2d2d2d] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full border-2 border-gray-800 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-orange-500 text-sm font-semibold">{testimonial.role}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 italic leading-relaxed mb-4">"{testimonial.text}"</p>

                  <div className="text-right">
                    <img
                      src="/placeholder.svg?height=24&width=24&text=Quote"
                      alt="Quote"
                      className="w-6 h-6 opacity-30 ml-auto"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="blog-section py-16 lg:py-20 bg-gradient-to-br from-orange-500 to-orange-600 mx-4 lg:mx-12 rounded-2xl">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-12 lg:mb-16">
              <h5 className="text-orange-200 text-sm font-semibold uppercase tracking-wider mb-4">Últimas Notícias</h5>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">Muitas Novidades & Dicas</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
              {blogs.map((blog, index) => (
                <div
                  key={index}
                  className="blog-card bg-white rounded-xl border-2 border-gray-800 shadow-[4px_4px_0px_0px_#2d2d2d] hover:shadow-[6px_6px_0px_0px_#2d2d2d] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={blog.image || "/placeholder.svg"}
                      alt={blog.title}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex gap-2 mb-4">
                      {blog.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="text-orange-500 text-xs font-semibold uppercase tracking-wider">
                          {tag}
                          {tagIndex < blog.tags.length - 1 && " • "}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight hover:text-orange-500 transition-colors">
                      <Link href="/blog">{blog.title}</Link>
                    </h3>

                    <div className="flex justify-between items-center text-sm text-gray-600 pt-4 border-t border-gray-200">
                      <span>Data: {blog.date}</span>
                      <span>Por {blog.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/blog"
                className="inline-block px-8 py-3 bg-white text-orange-500 font-semibold rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-gray-50 hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300"
              >
                Carregar Mais
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="newsletter-section py-16 lg:py-20 border-b border-gray-200">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Inscreva-se na nossa Newsletter & Receba todas as atualizações
              </h2>

              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <input
                  type="email"
                  placeholder="Digite seu E-mail"
                  className="flex-1 px-4 py-3 border-2 border-gray-800 rounded-lg text-base shadow-[3px_3px_0px_0px_#2d2d2d] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-orange-600 hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-300 whitespace-nowrap">
                  Inscrever-se Agora
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-section bg-gray-50 py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link href="/" className="block mb-6">
                <img
                  src="/placeholder.svg?height=32&width=120&text=Concursify"
                  alt="Concursify"
                  className="h-8 w-auto"
                />
              </Link>
              <p className="text-gray-600 leading-relaxed mb-6">
                Plataforma completa para preparação de concursos públicos com inteligência artificial e ferramentas
                avançadas.
              </p>
              <div className="flex space-x-3">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center border-2 border-gray-800 hover:bg-orange-600 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h6 className="text-lg font-bold text-gray-900 mb-6">Fale Conosco</h6>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <a href="mailto:contato@concursify.com" className="hover:text-orange-500 transition-colors">
                    contato@concursify.com
                  </a>
                </li>
                <li>
                  <a href="tel:+5511999999999" className="hover:text-orange-500 transition-colors">
                    +55 11 99999-9999
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Termos & Condições
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="/contato" className="hover:text-orange-500 transition-colors">
                    Contatos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition-colors">
                    Trabalhe Conosco
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h6 className="text-lg font-bold text-gray-900 mb-6">Links Rápidos</h6>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <a href="/sobre" className="hover:text-orange-500 transition-colors">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="/concursos" className="hover:text-orange-500 transition-colors">
                    Explorar Concursos
                  </a>
                </li>
                <li>
                  <a href="/simulados" className="hover:text-orange-500 transition-colors">
                    Nossos Simulados
                  </a>
                </li>
                <li>
                  <a href="/forum" className="hover:text-orange-500 transition-colors">
                    Fórum
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h6 className="text-lg font-bold text-gray-900 mb-6">Recursos</h6>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <a href="/" className="hover:text-orange-500 transition-colors">
                    Página Inicial
                  </a>
                </li>
                <li>
                  <a href="/depoimentos" className="hover:text-orange-500 transition-colors">
                    Depoimentos
                  </a>
                </li>
                <li>
                  <a href="/blog" className="hover:text-orange-500 transition-colors">
                    Últimas Notícias
                  </a>
                </li>
                <li>
                  <a href="/ajuda" className="hover:text-orange-500 transition-colors">
                    Central de Ajuda
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 pt-8">
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Copyright© 2024{" "}
                <a href="#" className="text-orange-500 hover:text-orange-600 transition-colors">
                  Concursify
                </a>
                . Todos os Direitos Reservados
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
