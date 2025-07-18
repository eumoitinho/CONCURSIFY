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
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin
} from "lucide-react"

export function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  // Preloader effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const preloader = document.getElementById('preloader')
      if (preloader) {
        preloader.style.display = 'none'
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
      image: "/img/course/01.png",
      instructor: "/img/course/in1.png",
      category: "cat1"
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
      image: "/img/course/02.png",
      instructor: "/img/course/in2.png",
      category: "cat2"
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
      image: "/img/course/03.png",
      instructor: "/img/course/in3.png",
      category: "cat3"
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
      image: "/img/course/04.png",
      instructor: "/img/course/in4.png",
      category: "cat1"
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
      image: "/img/course/05.png",
      instructor: "/img/course/in5.png",
      category: "cat2"
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
      image: "/img/course/06.png",
      instructor: "/img/course/in6.png",
      category: "cat3"
    }
  ]

  const instrutores = [
    {
      name: "Dr. João Silva",
      specialty: "Direito Constitucional",
      image: "/img/instructor/01.jpg"
    },
    {
      name: "Prof. Maria Santos",
      specialty: "Matemática Financeira",
      image: "/img/instructor/02.jpg"
    },
    {
      name: "Dr. Carlos Oliveira",
      specialty: "Direito Administrativo",
      image: "/img/instructor/03.jpg"
    },
    {
      name: "Prof. Ana Costa",
      specialty: "Português",
      image: "/img/instructor/04.jpg"
    }
  ]

  const testimonials = [
    {
      name: "Rafael Mendes",
      role: "Aprovado TCU 2024",
      image: "/img/testimonial/01.png",
      text: "Com o Concursify consegui organizar meus estudos de forma eficiente. A IA realmente entende o que preciso estudar!"
    },
    {
      name: "Marina Silva",
      role: "Aprovada PF 2024",
      image: "/img/testimonial/02.png",
      text: "Os simulados adaptativos foram fundamentais para minha aprovação. Sistema incrível!"
    },
    {
      name: "Lucas Ferreira",
      role: "Aprovado TRF 2024",
      image: "/img/testimonial/03.png",
      text: "A comunidade do fórum me ajudou muito. Compartilhar dúvidas e experiências fez toda diferença."
    }
  ]

  const blogs = [
    {
      title: "5 Estratégias para Otimizar seus Estudos",
      excerpt: "Descubra técnicas comprovadas para maximizar seu tempo de estudo",
      date: "15 de Janeiro, 2024",
      author: "Equipe Concursify",
      image: "/img/blog/01.jpg",
      tags: ["Estratégia", "Produtividade"]
    },
    {
      title: "Como a IA está Revolucionando os Concursos",
      excerpt: "Entenda como usar inteligência artificial a seu favor",
      date: "12 de Janeiro, 2024",
      author: "Dr. João Silva",
      image: "/img/blog/02.jpg",
      tags: ["Tecnologia", "IA"]
    },
    {
      title: "Técnicas de Memorização para Concursos",
      excerpt: "Métodos científicos para melhorar sua retenção",
      date: "10 de Janeiro, 2024",
      author: "Prof. Maria Santos",
      image: "/img/blog/03.jpg",
      tags: ["Memorização", "Técnicas"]
    }
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
        <div id="theme-menu-one" className="main-header-area px-4 py-3 lg:px-24 lg:py-5">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-xl-2 col-lg-2 col-5">
                <div className="logo">
                  <Link href="/">
                    <img src="/img/logo/header_logo_one.svg" alt="Concursify" />
                  </Link>
                </div>
              </div>
              <div className="col-xl-7 col-lg-8 hidden lg:block">
                <nav className="main-menu navbar navbar-expand-lg justify-content-center">
                  <div className="nav-container">
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                      <ul className="navbar-nav space-x-4">
                        <li className="nav-item dropdown mega-menu">
                          <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Todas as Áreas
                          </a>
                          <ul className="dropdown-menu submenu mega-menu__sub-menu-box" aria-labelledby="navbarDropdown">
                            <li><a href="/concursos"><span><img src="/img/icon/icon7.svg" alt="" /></span> Jurídico</a></li>
                            <li><a href="/concursos"><span><img src="/img/icon/icon8.svg" alt="" /></span> Tecnologia</a></li>
                            <li><a href="/concursos"><span><img src="/img/icon/icon9.svg" alt="" /></span> Saúde</a></li>
                            <li><a href="/concursos"><span><img src="/img/icon/icon10.svg" alt="" /></span> Educação</a></li>
                            <li><a href="/concursos"><span><img src="/img/icon/icon11.svg" alt="" /></span> Segurança</a></li>
                            <li><a href="/concursos"><span><img src="/img/icon/icon12.svg" alt="" /></span> Administração</a></li>
                            <li><a href="/concursos"><span><img src="/img/icon/icon14.svg" alt="" /></span> Tributário</a></li>
                            <li><a href="/concursos"><span><img src="/img/icon/icon13.svg" alt="" /></span> Auditoria</a></li>
                          </ul>
                        </li>
                        <li className="nav-item dropdown active">
                          <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Início
                          </a>
                          <ul className="dropdown-menu" aria-labelledby="navbarDropdown2">
                            <li><a className="dropdown-item" href="/">Página Inicial</a></li>
                            <li><a className="dropdown-item" href="/cronogramas">Cronogramas IA</a></li>
                            <li><a className="dropdown-item" href="/simulados">Simulados</a></li>
                          </ul>
                        </li>
                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown3" role="button" data-bs-toggle="dropdown" aria-expanded="false">Páginas</a>
                          <ul className="dropdown-menu" aria-labelledby="navbarDropdown3">
                            <li><a className="dropdown-item" href="/sobre">Sobre Nós</a></li>
                            <li><a className="dropdown-item" href="/concursos">Concursos</a></li>
                            <li><a className="dropdown-item" href="/simulados">Simulados</a></li>
                            <li><a className="dropdown-item" href="/forum">Fórum</a></li>
                            <li><a className="dropdown-item" href="/planos">Planos</a></li>
                            <li><a className="dropdown-item" href="/instrutores">Instrutores</a></li>
                            <li><a className="dropdown-item" href="/faq">FAQ</a></li>
                          </ul>
                        </li>
                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown4" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Blog
                          </a>
                          <ul className="dropdown-menu" aria-labelledby="navbarDropdown4">
                            <li><a className="dropdown-item" href="/blog">Blog Grid</a></li>
                            <li><a className="dropdown-item" href="/blog-details">Blog Details</a></li>
                          </ul>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" href="/contato" id="navbarDropdown5" role="button" aria-expanded="false">Contato</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </nav>
              </div>
              <div className="col-xl-3 col-lg-2 col-7">
                <div className="right-nav flex items-center justify-end space-x-4">
                  <div className="right-btn hidden md:block">
                    <div className="flex items-center space-x-4">
                      <a href="/cadastro" className="theme_btn free_btn text-sm px-4 py-2">Teste Grátis</a>
                      <a className="sign-in" href="/login">
                        <User className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                  <div className="hamburger-menu block lg:hidden">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                      {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <aside className={`slide-bar fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="close-mobile-menu p-4 text-right">
          <button onClick={() => setMobileMenuOpen(false)} className="p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="offset-sidebar p-6">
          <div className="offset-widget offset-logo mb-8">
            <a href="/">
              <img src="/img/logo/header_logo_one.svg" alt="Concursify" className="h-8" />
            </a>
          </div>
          <div className="offset-widget mb-8">
            <div className="info-widget">
              <h4 className="text-lg font-semibold mb-4">Sobre Nós</h4>
              <p className="text-sm text-gray-600 mb-6">
                Plataforma completa para preparação de concursos públicos com inteligência artificial, 
                simulados adaptativos e ferramentas avançadas.
              </p>
              <a className="theme_btn theme_btn_bg inline-block px-4 py-2 bg-[#FF723A] text-white rounded" href="/contato">Fale Conosco</a>
            </div>
          </div>
          <div className="offset-widget mb-6">
            <div className="info-widget">
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> São Paulo, SP - Brasil</p>
                <p className="flex items-center"><Phone className="h-4 w-4 mr-2" /> +55 11 99999-9999</p>
                <p className="flex items-center"><Mail className="h-4 w-4 mr-2" /> contato@concursify.com</p>
              </div>
            </div>
          </div>
          <div className="offset-widget">
            <div className="flex space-x-4 mt-6">
              <a href="/cadastro" className="flex-1 text-center py-2 px-4 bg-[#FF723A] text-white rounded">Teste Grátis</a>
              <a href="/login" className="flex-1 text-center py-2 px-4 border border-[#FF723A] text-[#FF723A] rounded">Login</a>
            </div>
          </div>
        </div>
      </aside>
      {mobileMenuOpen && <div className="body-overlay fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)}></div>}

      <main>
        {/* Hero Section */}
        <section className="slider-area pt-24 md:pt-32 lg:pt-40 pb-8">
          <img className="sl-shape shape_01" src="/img/icon/01.svg" alt="" />
          <img className="sl-shape shape_02" src="/img/icon/02.svg" alt="" />
          <img className="sl-shape shape_03" src="/img/icon/03.svg" alt="" />
          <img className="sl-shape shape_04" src="/img/icon/04.svg" alt="" />
          <img className="sl-shape shape_05" src="/img/icon/05.svg" alt="" />
          <img className="sl-shape shape_06" src="/img/icon/06.svg" alt="" />
          <img className="sl-shape shape_07" src="/img/shape/dot-box-5.svg" alt="" />
          
          <div className="main-slider pt-10">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-xl-6 col-lg-6 order-last order-lg-first">
                  <div className="slider__img__box mb-50 pr-30">
                    <img className="img-one mt-55 pr-70" src="/img/slider/01.png" alt="" />
                    <img className="slide-shape img-two" src="/img/slider/02.png" alt="" />
                    <img className="slide-shape img-three" src="/img/slider/03.png" alt="" />
                    <img className="slide-shape img-four" src="/img/shape/dot-box-1.svg" alt="" />
                    <img className="slide-shape img-five" src="/img/shape/dot-box-2.svg" alt="" />
                    <img className="slide-shape img-six" src="/img/shape/zigzg-1.svg" alt="" />
                    <img className="slide-shape img-seven wow fadeInRight animated" data-delay="1.5s" src="/img/icon/dot-plan-1.svg" alt="" />
                    <img className="slide-shape img-eight" src="/img/slider/earth-bg.svg" alt="" />
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <div className="slider__content pt-15">
                    <h1 className="main-title mb-40 wow fadeInUp2 animated" data-wow-delay='.1s'>
                      Prepare-se Todo Dia & Aprenda Novas Estratégias Online com os Melhores <span className="vec-shape">Instrutores.</span>
                    </h1>
                    <h5 className="mb-35 wow fadeInUp2 animated" data-wow-delay='.2s'>
                      Existem muitas maneiras de se preparar para concursos públicos, mas a maioria sofre com a falta de organização e estratégia adequada.
                    </h5>
                    <ul className="search__area d-md-inline-flex align-items-center justify-content-between mb-30">
                      <li>
                        <div className="widget__search">
                          <form className="input-form" action="#">
                            <input 
                              type="text" 
                              placeholder="Buscar Concursos"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </form>
                          <button className="search-icon"><i className="far fa-search"></i></button>
                        </div>
                      </li>
                      <li>
                        <div className="widget__select">
                          <select 
                            name="select-cat" 
                            id="select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                          >
                            <option value="">Áreas</option>
                            <option value="juridico">Jurídico</option>
                            <option value="saude">Saúde</option>
                            <option value="educacao">Educação</option>
                            <option value="tecnologia">Tecnologia</option>
                            <option value="seguranca">Segurança</option>
                          </select>
                        </div>
                      </li>
                      <li>
                        <button className="theme_btn search_btn ml-35">Buscar Agora</button>
                      </li>
                    </ul>
                    <p className="highlight-text">
                      <span>#1</span> Plataforma Mundial de Aprendizado Online & Preparação para Concursos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Great Deal Section */}
        <section className="great-deal-area pt-150 pb-90 pt-md-100 pb-md-40 pt-xs-100 pb-xs-40">
          <div className="container">
            <div className="row justify-content-lg-center justify-content-start">
              <div className="col-xl-3 col-lg-8">
                <div className="deal-box mb-30 text-center text-xl-start">
                  <h2 className="mb-20"><b>Ótimas</b> Oportunidades Para Você</h2>
                  <p>Existem muitas variações de preparação para concursos disponíveis, mas a maioria sofre com falta de organização.</p>
                </div>
              </div>
              <div className="col-xl-8">
                <div className="deal-active owl-carousel mb-30">
                  <div className="single-item">
                    <div className="single-box mb-30">
                      <div className="single-box__icon mb-25">
                        <img src="/img/icon/puzzle.svg" alt="" />
                      </div>
                      <h4 className="sub-title mb-20">Aprenda Novas Estratégias</h4>
                      <p>Existem muitas variações de técnicas de estudo disponíveis.</p>
                    </div>
                  </div>
                  <div className="single-item">
                    <div className="single-box s-box2 mb-30">
                      <div className="single-box__icon mb-25">
                        <img src="/img/icon/manager.svg" alt="" />
                      </div>
                      <h4 className="sub-title mb-20">Instrutores Especialistas</h4>
                      <p>Existem muitas variações de professores experientes disponíveis.</p>
                    </div>
                  </div>
                  <div className="single-item">
                    <div className="single-box s-box3 mb-30">
                      <div className="single-box__icon mb-25">
                        <img src="/img/icon/notepad.svg" alt="" />
                      </div>
                      <h4 className="sub-title mb-20">Simulados Gratuitos</h4>
                      <p>Existem muitas variações de simulados disponíveis.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Looking For Section */}
        <section className="what-looking-for pos-rel">
          <div className="what-blur-shape-one"></div>
          <div className="what-blur-shape-two"></div>
          <div className="what-look-bg gradient-bg pt-145 pb-130 pt-md-95 pb-md-80 pt-xs-95 pb-xs-80">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <div className="section-title text-center mb-55">
                    <h5 className="bottom-line mb-25">Professores & Estudantes</h5>
                    <h2>O que Você Está Procurando?</h2>
                  </div>
                </div>
              </div>
              <div className="row mb-85">
                <div className="col-xl-6 col-lg-6 col-md-6">
                  <div className="what-box text-center mb-35 wow fadeInUp2 animated" data-wow-delay='.3s'>
                    <div className="what-box__icon mb-30">
                      <img src="/img/icon/phone-operator.svg" alt="" />
                    </div>
                    <h3>Você quer ensinar aqui?</h3>
                    <p>Junte-se à nossa equipe de instrutores especialistas em concursos públicos e ajude milhares de candidatos a realizarem seus sonhos.</p>
                    <a href="/contato" className="theme_btn border_btn">Cadastre-se Agora</a>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6">
                  <div className="what-box text-center mb-35 wow fadeInUp2 animated" data-wow-delay='.3s'>
                    <div className="what-box__icon mb-30">
                      <img src="/img/icon/graduate.svg" alt="" />
                    </div>
                    <h3>Você quer estudar aqui?</h3>
                    <p>Comece sua jornada rumo à aprovação com nossa plataforma completa de preparação para concursos públicos.</p>
                    <a href="/cadastro" className="theme_btn border_btn active">Cadastre-se Agora</a>
                  </div>
                </div>
              </div>
              <div className="categoris-container">
                <div className="col-xl-12">
                  <div className="section-title text-center mb-55">
                    <h5 className="bottom-line mb-25">Navegar Categorias</h5>
                    <h2>Explore Nossas Áreas de Concursos</h2>
                  </div>
                </div>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xl-5">
                  <div className="col">
                    <div className="single-category text-center mb-30 wow fadeInUp2 animated" data-wow-delay='.1s'>
                      <img className="mb-30" src="/img/category-icon/atom.svg" alt="" />
                      <h4 className="sub-title mb-10"><a href="/concursos">Jurídico</a></h4>
                      <p>126+ Concursos Disponíveis</p>
                    </div>
                  </div>
                  <div className="col">
                    <div className="single-category text-center mb-30 wow fadeInUp2 animated" data-wow-delay='.2s'>
                      <img className="mb-30" src="/img/category-icon/web-development.svg" alt="" />
                      <h4 className="sub-title mb-10"><a href="/concursos">Tecnologia</a></h4>
                      <p>325+ Concursos Disponíveis</p>
                    </div>
                  </div>
                  <div className="col">
                    <div className="single-category text-center mb-30 wow fadeInUp2 animated" data-wow-delay='.3s'>
                      <img className="mb-30" src="/img/category-icon/atom.svg" alt="" />
                      <h4 className="sub-title mb-10"><a href="/concursos">Saúde</a></h4>
                      <p>95+ Concursos Disponíveis</p>
                    </div>
                  </div>
                  <div className="col">
                    <div className="single-category text-center mb-30 wow fadeInUp2 animated" data-wow-delay='.4s'>
                      <img className="mb-30" src="/img/category-icon/career-path.svg" alt="" />
                      <h4 className="sub-title mb-10"><a href="/concursos">Educação</a></h4>
                      <p>156+ Concursos Disponíveis</p>
                    </div>
                  </div>
                  <div className="col">
                    <div className="single-category text-center mb-30 wow fadeInUp2 animated" data-wow-delay='.5s'>
                      <img className="mb-30" src="/img/category-icon/graphic-tool.svg" alt="" />
                      <h4 className="sub-title mb-10"><a href="/concursos">Segurança</a></h4>
                      <p>136+ Concursos Disponíveis</p>
                    </div>
                  </div>
                </div>
                <div className="row justify-content-center">
                  <div className="col-md-12 mt-20 text-center mb-20 wow fadeInUp2 animated" data-wow-delay='.6s'>
                    <a href="/concursos" className="theme_btn">Todas as Categorias</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="feature-course pt-150 pb-130 pt-md-95 pb-md-80 pt-xs-95 pb-xs-80">
          <div className="container">
            <div className="row">
              <div className="col-xl-12">
                <div className="section-title text-center mb-50">
                  <h5 className="bottom-line mb-25">Concursos em Destaque</h5>
                  <h2>Explore Nossos Concursos Populares</h2>
                </div>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-xl-12 text-center">
                <div className="portfolio-menu mb-30">
                  <button className="gf_btn active" data-filter='*'>Todos</button>
                  <button className="gf_btn" data-filter='.cat1'>Jurídico</button>
                  <button className="gf_btn" data-filter='.cat2'>Segurança</button>
                  <button className="gf_btn" data-filter='.cat3'>Tributário</button>
                  <button className="gf_btn" data-filter='.cat4'>Saúde</button>
                  <button className="gf_btn" data-filter='.cat5'>Educação</button>
                </div>
              </div>
            </div>
            <div className="grid row">
              {concursos.map((concurso) => (
                <div key={concurso.id} className={`col-lg-4 col-md-6 grid-item ${concurso.category}`}>
                  <div className="z-gallery mb-30">
                    <div className="z-gallery__thumb mb-20">
                      <a href="/concursos"><img className="img-fluid" src={concurso.image} alt="" /></a>
                      <div className="feedback-tag">{concurso.rating}</div>
                      <div className="heart-icon"><i className="fas fa-heart"></i></div>
                    </div>
                    <div className="z-gallery__content">
                      <div className="course__tag mb-15">
                        <span>{concurso.area}</span>
                        <span>{concurso.nivel}</span>
                        <a className="f-right" href="/instrutores">
                          <img src={concurso.instructor} alt="" />
                        </a>
                      </div>
                      <h4 className="sub-title mb-20">
                        <a href="/concursos">{concurso.title}</a>
                      </h4>
                      <div className="course__meta">
                        <span>
                          <img className="icon" src="/img/icon/time.svg" alt="" /> 
                          {concurso.tempo}
                        </span>
                        <span>
                          <img className="icon" src="/img/icon/bar-chart.svg" alt="" /> 
                          {concurso.nivel_icon}
                        </span>
                        <span>
                          <img className="icon" src="/img/icon/user.svg" alt="" /> 
                          {concurso.estudantes}
                        </span>
                        <span>{concurso.preco}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="row">
              <div className="col-lg-12 mt-20 text-center mb-20 wow fadeInUp2 animated" data-wow-delay='.3s'>
                <a href="/concursos" className="theme_btn">Todos os Concursos</a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <div className="why-chose-section-wrapper gradient-bg mr-100 ml-100">
          <section className="why-chose-us">
            <div className="why-chose-us-bg pt-150 pb-175 pt-md-95 pb-md-90 pt-xs-95 pb-xs-90">
              <div className="container">
                <div className="row align-items-center">
                  <div className="col-xl-7 col-lg-7">
                    <div className="chose-img-wrapper mb-50 pos-rel">
                      <div className="coures-member">
                        <h5>Total de Estudantes</h5>
                        <img className="choses chose_01" src="/img/chose/01.png" alt="" />
                        <img className="choses chose_02" src="/img/chose/02.png" alt="" />
                        <img className="choses chose_03" src="/img/chose/03.png" alt="" />
                        <img className="choses chose_04" src="/img/chose/04.png" alt="" />
                        <span>25k+</span>
                      </div>
                      <div className="feature tag_01">
                        <span><img src="/img/icon/shield-check.svg" alt="" /></span> 
                        Seguro & Protegido
                      </div>
                      <div className="feature tag_02">
                        <span><img src="/img/icon/catalog.svg" alt="" /></span> 
                        120+ Concursos
                      </div>
                      <div className="feature tag_03">
                        <span><i className="fal fa-check"></i></span> 
                        Educação de Qualidade
                      </div>
                      <div className="video-wrapper">
                        <a href="https://www.youtube.com/watch?v=7omGYwdcS04" className="popup-video">
                          <i className="fas fa-play"></i>
                        </a>
                      </div>
                      <div className="img-bg pos-rel">
                        <img className="chose_05 pl-70 pl-lg-0 pl-md-0 pl-xs-0" src="/img/chose/05.png" alt="" />
                      </div>
                      <img className="chose chose_06" src="/img/shape/dot-box3.svg" alt="" />
                    </div>
                  </div>
                  <div className="col-xl-5 col-lg-5">
                    <div className="chose-wrapper pl-25 pl-lg-0 pl-md-0 pl-xs-0">
                      <div className="section-title mb-30 wow fadeInUp2 animated" data-wow-delay='.1s'>
                        <h5 className="bottom-line mb-25">Explore o Concursify</h5>
                        <h2 className="mb-25">Por que Escolher o Concursify?</h2>
                        <p>Existem muitas variações de plataformas de preparação para concursos disponíveis, mas a maioria sofre com falta de personalização. Existem muitas variações de métodos de estudo disponíveis.</p>
                      </div>
                      <ul className="text-list mb-40 wow fadeInUp2 animated" data-wow-delay='.2s'>
                        <li>Cronogramas personalizados com inteligência artificial.</li>
                        <li>Simulados adaptativos que se ajustam ao seu nível.</li>
                        <li>Comunidade ativa com milhares de concurseiros.</li>
                      </ul>
                      <a href="/sobre" className="theme_btn wow fadeInUp2 animated" data-wow-delay='.3s'>Mais Detalhes</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Instructors Section */}
          <section className="course-instructor nav-style-two pos-rel">
            <div className="course-blur-shape"></div>
            <div className="course-bg-space pt-150 pb-120 pt-md-95 pb-md-70 pt-xs-95 pb-xs-70">
              <div className="container">
                <div className="row">
                  <div className="col-xl-8 col-lg-9">
                    <div className="section-title text-center text-md-start mb-60">
                      <h5 className="bottom-line mb-25">Nossos Instrutores</h5>
                      <h2 className="mb-25">Explore Instrutores Experientes</h2>
                    </div>
                  </div>
                </div>
                <div className="instructor-active owl-carousel">
                  {instrutores.map((instrutor, index) => (
                    <div key={index} className="item">
                      <div className="z-instructors text-center mb-30">
                        <div className="z-instructors__thumb mb-15">
                          <img src={instrutor.image} alt="" />
                          <div className="social-media">
                            <a href="#"><i className="fab fa-facebook-f"></i></a>
                            <a href="#"><i className="fab fa-twitter"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
                            <a href="#"><i className="fab fa-youtube"></i></a>
                          </div>
                        </div>
                        <div className="z-instructors__content">
                          <h4 className="sub-title mb-10">
                            <a href="/instrutores">{instrutor.name}</a>
                          </h4>
                          <p>{instrutor.specialty}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Testimonials Section */}
        <section className="testimonial-area testimonial-pad pt-150 pb-120 pt-md-95 pb-md-70 pt-xs-95 pb-xs-70">
          <div className="container custom-container-testimonial">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="section-title text-center text-md-start mb-35">
                  <h5 className="bottom-line mb-25">Depoimentos</h5>
                  <h2 className="mb-25">O que Nossos Alunos Dizem</h2>
                </div>
              </div>
              <div className="col-lg-4 text-center text-lg-end">
                <a href="/depoimentos" className="theme_btn">Ler Todos os Depoimentos</a>
              </div>
            </div>
            <div className="row testimonial-active-01">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="col-xl-3">
                  <div className="item">
                    <div className="testimonial-wrapper mb-30">
                      <div className="testimonial-authors overflow-hidden mb-15">
                        <div className="testimonial-authors__avatar">
                          <img src={testimonial.image} alt="" />
                        </div>
                        <div className="testimonial-authors__content mt-10">
                          <h4 className="sub-title">{testimonial.name}</h4>
                          <p>{testimonial.role}</p>
                        </div>
                      </div>
                      <p>"{testimonial.text}"</p>
                      <div className="quote-icon mt-20">
                        <img src="/img/icon/quote.svg" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="blog-area mr-100 ml-100">
          <div className="blog-bg gradient-bg pl-100 pr-100 pt-150 pb-120 pt-md-100 pb-md-70 pt-xs-100 pb-xs-70">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <div className="section-title text-center mb-60">
                    <h5 className="bottom-line mb-25">Últimas Notícias</h5>
                    <h2 className="mb-25">Muitas Novidades & Dicas</h2>
                  </div>
                </div>
              </div>
              <div className="row">
                {blogs.map((blog, index) => (
                  <div key={index} className="col-lg-4 col-md-6">
                    <div className="z-blogs mb-30 wow fadeInUp2 animated" data-wow-delay={`.${index + 1}s`}>
                      <div className="z-blogs__thumb mb-30">
                        <a href="/blog"><img src={blog.image} alt="" /></a>
                      </div>
                      <div className="z-blogs__content">
                        <h5 className="mb-25">{blog.tags.join(' . ')}</h5>
                        <h4 className="sub-title mb-15">
                          <a href="/blog">{blog.title}</a>
                        </h4>
                        <div className="z-blogs__meta d-sm-flex justify-content-between pt-20">
                          <span>Data: {blog.date}</span>
                          <span>Por {blog.author}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="row">
                <div className="col-lg-12 text-center mt-20 mb-30 wow fadeInUp2 animated" data-wow-delay='.4s'>
                  <a href="/blog" className="theme_btn">Carregar Mais</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="subscribe-area border-bot pt-145 pb-50 pt-md-90 pt-xs-90">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-8">
                <div className="subscribe-wrapper text-center mb-30">
                  <h2>Inscreva-se na nossa Newsletter & Receba todas as atualizações.</h2>
                  <div className="subscribe-form-box pos-rel">
                    <form className="subscribe-form">
                      <input type="text" placeholder="Digite seu E-mail" />
                    </form>
                    <button className="sub_btn">Inscrever-se Agora</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-area pt-70 pb-40">
        <div className="container">
          <div className="row mb-15">
            <div className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp2 animated" data-wow-delay='.1s'>
              <div className="footer__widget mb-30">
                <div className="footer-log mb-20">
                  <a href="/" className="logo">
                    <img src="/img/logo/header_logo_one.svg" alt="" />
                  </a>
                </div>
                <p>Plataforma completa para preparação de concursos públicos com inteligência artificial e ferramentas avançadas.</p>
                <div className="social-media footer__social mt-30">
                  <a href="#"><i className="fab fa-facebook-f"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                  <a href="#"><i className="fab fa-linkedin-in"></i></a>
                  <a href="#"><i className="fab fa-google-plus-g"></i></a>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp2 animated" data-wow-delay='.3s'>
              <div className="footer__widget mb-30 pl-40 pl-md-0 pl-xs-0">
                <h6 className="widget-title mb-35">Fale Conosco</h6>
                <ul className="fot-list">
                  <li><a href="#">contato@concursify.com</a></li>
                  <li><a href="#">+55 11 99999-9999</a></li>
                  <li><a href="#">Termos & Condições</a></li>
                  <li><a href="#">Política de Privacidade</a></li>
                  <li><a href="/contato">Contatos</a></li>
                  <li><a href="#">Trabalhe Conosco</a></li>
                </ul>
              </div>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp2 animated" data-wow-delay='.5s'>
              <div className="footer__widget mb-25 pl-90 pl-md-0 pl-xs-0">
                <h6 className="widget-title mb-35">Links Rápidos</h6>
                <ul className="fot-list">
                  <li><a href="/sobre">Sobre Nós</a></li>
                  <li><a href="/concursos">Explorar Concursos</a></li>
                  <li><a href="/simulados">Nossos Simulados</a></li>
                  <li><a href="/forum">Fórum</a></li>
                </ul>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 wow fadeInUp2 animated" data-wow-delay='.7s'>
              <div className="footer__widget mb-30 pl-150 pl-lg-0 pl-md-0 pl-xs-0">
                <h6 className="widget-title mb-35">Recursos</h6>
                <ul className="fot-list mb-30">
                  <li><a href="/">Página Inicial</a></li>
                  <li><a href="/depoimentos">Depoimentos</a></li>
                  <li><a href="/blog">Últimas Notícias</a></li>
                  <li><a href="/ajuda">Central de Ajuda</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="copy-right-area border-bot pt-40">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-12">
                <div className="copyright text-center">
                  <h5>Copyright@ 2024 <a href="#">Concursify</a>. Todos os Direitos Reservados</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 