"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  BookOpen,
  Bookmark,
  Calendar,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Filter,
  Heart,
  Home,
  Lightbulb,
  Menu,
  MessageSquare,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Share2,
  Star,
  TrendingUp,
  Users,
  Eye,
  Archive,
  ArrowUpDown,
  MoreHorizontal,
  X,
  MapPin,
  GraduationCap,
  Target,
  BarChart3,
  CalendarIcon,
  FileSpreadsheet,
  Bot,
  RefreshCw,
  CheckCircle,
  ExternalLink,
  Send,
  Pin,
  Hash,
  Link,
  MoreVertical,
  Tags,
  Network,
  DollarSign,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data for editais
const editais = [
  {
    id: 1,
    title: "Tribunal Regional Federal da 1ª Região - TRF1",
    organization: "TRF1",
    state: "DF",
    category: "Judiciário",
    positions: 15,
    salary: "R$ 13.994,78",
    education: "Superior",
    status: "Inscrições Abertas",
    deadline: "2025-02-15",
    examDate: "2025-04-20",
    subjects: ["Direito Constitucional", "Direito Administrativo", "Português", "Raciocínio Lógico"],
    description: "Concurso para Analista Judiciário - Área Administrativa",
    link: "https://exemplo.com/edital1",
    views: 2847,
    favorites: 156,
    new: true,
    featured: true,
  },
  {
    id: 2,
    title: "Polícia Federal - PF",
    organization: "PF",
    state: "Nacional",
    category: "Policial",
    positions: 1500,
    salary: "R$ 23.692,74",
    education: "Superior",
    status: "Previsto",
    deadline: "2025-03-01",
    examDate: "2025-05-15",
    subjects: ["Direito Penal", "Direito Processual Penal", "Português", "Inglês", "Informática"],
    description: "Concurso para Delegado de Polícia Federal",
    link: "https://exemplo.com/edital2",
    views: 5234,
    favorites: 892,
    new: true,
    featured: true,
  },
  {
    id: 3,
    title: "Receita Federal do Brasil - RFB",
    organization: "RFB",
    state: "Nacional",
    category: "Fiscal",
    positions: 699,
    salary: "R$ 21.029,09",
    education: "Superior",
    status: "Inscrições Abertas",
    deadline: "2025-01-30",
    examDate: "2025-03-25",
    subjects: ["Direito Tributário", "Contabilidade", "Português", "Raciocínio Lógico", "Inglês"],
    description: "Concurso para Auditor-Fiscal da Receita Federal",
    link: "https://exemplo.com/edital3",
    views: 4156,
    favorites: 723,
    new: false,
    featured: true,
  },
  {
    id: 4,
    title: "Tribunal de Contas da União - TCU",
    organization: "TCU",
    state: "DF",
    category: "Controle",
    positions: 20,
    salary: "R$ 19.224,34",
    education: "Superior",
    status: "Previsto",
    deadline: "2025-04-15",
    examDate: "2025-06-10",
    subjects: ["Controle Externo", "Direito Constitucional", "Português", "Administração Pública"],
    description: "Concurso para Auditor Federal de Controle Externo",
    link: "https://exemplo.com/edital4",
    views: 1892,
    favorites: 234,
    new: false,
    featured: false,
  },
  {
    id: 5,
    title: "Banco Central do Brasil - BACEN",
    organization: "BACEN",
    state: "Nacional",
    category: "Bancário",
    positions: 300,
    salary: "R$ 18.976,61",
    education: "Superior",
    status: "Inscrições Abertas",
    deadline: "2025-02-28",
    examDate: "2025-04-30",
    subjects: ["Economia", "Finanças", "Português", "Inglês", "Estatística"],
    description: "Concurso para Analista do Banco Central",
    link: "https://exemplo.com/edital5",
    views: 3421,
    favorites: 567,
    new: true,
    featured: false,
  },
]

// Sample data for cronogramas
const cronogramas = [
  {
    id: 1,
    title: "Cronograma TRF1 - Analista Judiciário",
    edital: "TRF1",
    createdAt: "2025-01-15",
    examDate: "2025-04-20",
    daysRemaining: 95,
    subjects: [
      { name: "Direito Constitucional", hours: 120, progress: 45 },
      { name: "Direito Administrativo", hours: 100, progress: 30 },
      { name: "Português", hours: 80, progress: 60 },
      { name: "Raciocínio Lógico", hours: 60, progress: 25 },
    ],
    totalHours: 360,
    weeklyHours: 25,
    studyLevel: "Intermediário",
    aiGenerated: true,
    shared: false,
  },
  {
    id: 2,
    title: "Cronograma Polícia Federal - Delegado",
    edital: "PF",
    createdAt: "2025-01-10",
    examDate: "2025-05-15",
    daysRemaining: 120,
    subjects: [
      { name: "Direito Penal", hours: 150, progress: 20 },
      { name: "Direito Processual Penal", hours: 130, progress: 15 },
      { name: "Português", hours: 80, progress: 40 },
      { name: "Inglês", hours: 70, progress: 35 },
      { name: "Informática", hours: 50, progress: 50 },
    ],
    totalHours: 480,
    weeklyHours: 30,
    studyLevel: "Avançado",
    aiGenerated: true,
    shared: true,
  },
  {
    id: 3,
    title: "Cronograma Receita Federal - Auditor",
    edital: "RFB",
    createdAt: "2025-01-08",
    examDate: "2025-03-25",
    daysRemaining: 70,
    subjects: [
      { name: "Direito Tributário", hours: 140, progress: 55 },
      { name: "Contabilidade", hours: 120, progress: 40 },
      { name: "Português", hours: 60, progress: 70 },
      { name: "Raciocínio Lógico", hours: 50, progress: 45 },
      { name: "Inglês", hours: 40, progress: 60 },
    ],
    totalHours: 410,
    weeklyHours: 35,
    studyLevel: "Avançado",
    aiGenerated: true,
    shared: false,
  },
]

// Sample data for forum posts
const forumPosts = [
  {
    id: 1,
    title: "Dicas para Direito Constitucional - TRF1",
    author: "João Silva",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Dicas de Estudo",
    replies: 23,
    views: 456,
    likes: 34,
    createdAt: "2 horas atrás",
    pinned: true,
    solved: false,
    tags: ["TRF1", "Direito Constitucional", "Dicas"],
    content:
      "Pessoal, queria compartilhar algumas dicas que têm me ajudado muito no estudo de Direito Constitucional para o TRF1...",
  },
  {
    id: 2,
    title: "Cronograma de estudos para PF - Delegado",
    author: "Maria Santos",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Cronogramas",
    replies: 15,
    views: 289,
    likes: 28,
    createdAt: "5 horas atrás",
    pinned: false,
    solved: true,
    tags: ["PF", "Delegado", "Cronograma"],
    content: "Galera, montei um cronograma bem detalhado para o concurso da PF. Quem quiser, posso compartilhar...",
  },
  {
    id: 3,
    title: "Materiais gratuitos para Receita Federal",
    author: "Pedro Costa",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Materiais",
    replies: 42,
    views: 1234,
    likes: 67,
    createdAt: "1 dia atrás",
    pinned: false,
    solved: false,
    tags: ["RFB", "Materiais", "Gratuito"],
    content: "Encontrei alguns materiais excelentes e gratuitos para quem está estudando para a Receita Federal...",
  },
  {
    id: 4,
    title: "Grupo de estudos TCU - Brasília",
    author: "Ana Oliveira",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Grupos de Estudo",
    replies: 8,
    views: 156,
    likes: 12,
    createdAt: "2 dias atrás",
    pinned: false,
    solved: false,
    tags: ["TCU", "Grupo de Estudos", "Brasília"],
    content: "Estou organizando um grupo de estudos presencial em Brasília para o TCU. Interessados, me chamem...",
  },
]

// Sample data for notes (Obsidian-style)
const notes = [
  {
    id: 1,
    title: "Direito Constitucional - Princípios Fundamentais",
    content: `# Princípios Fundamentais da Constituição

## Art. 1º - Fundamentos da República
- Soberania
- Cidadania  
- Dignidade da pessoa humana
- Valores sociais do trabalho e da livre iniciativa
- Pluralismo político

## Art. 2º - Separação dos Poderes
- Poder Legislativo
- Poder Executivo
- Poder Judiciário

### Características
- Independentes e harmônicos entre si
- Sistema de freios e contrapesos

## Links Relacionados
[[Direitos e Garantias Fundamentais]]
[[Organização do Estado]]`,
    tags: ["direito-constitucional", "principios", "fundamentos"],
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-16T14:20:00Z",
    linkedNotes: ["Direitos e Garantias Fundamentais", "Organização do Estado"],
    category: "Direito Constitucional",
    edital: "TRF1",
  },
  {
    id: 2,
    title: "Direito Administrativo - Atos Administrativos",
    content: `# Atos Administrativos

## Conceito
Manifestação unilateral de vontade da Administração Pública que, agindo nessa qualidade, tenha por fim imediato adquirir, resguardar, transferir, modificar, extinguir e declarar direitos, ou impor obrigações aos administrados ou a si própria.

## Elementos/Requisitos
1. **Competência** - poder legal
2. **Finalidade** - resultado que a lei quer alcançar
3. **Forma** - revestimento exterior do ato
4. **Motivo** - situação de direito ou de fato
5. **Objeto** - efeito jurídico imediato

## Atributos
- **Presunção de legitimidade**
- **Imperatividade** 
- **Autoexecutoriedade**

## Classificação
### Quanto aos destinatários
- Gerais (normativos)
- Individuais (concretos)

### Quanto ao alcance
- Internos
- Externos

## Links Relacionados
[[Princípios do Direito Administrativo]]
[[Processo Administrativo]]`,
    tags: ["direito-administrativo", "atos-administrativos", "elementos"],
    createdAt: "2025-01-14T09:15:00Z",
    updatedAt: "2025-01-15T16:45:00Z",
    linkedNotes: ["Princípios do Direito Administrativo", "Processo Administrativo"],
    category: "Direito Administrativo",
    edital: "TRF1",
  },
  {
    id: 3,
    title: "Português - Concordância Verbal",
    content: `# Concordância Verbal

## Regra Geral
O verbo concorda com o sujeito em número e pessoa.

## Casos Especiais

### Sujeito Composto
- **Antes do verbo**: plural
  - *João e Maria chegaram.*
- **Depois do verbo**: plural ou singular
  - *Chegaram João e Maria.* ✓
  - *Chegou João e Maria.* ✓

### Sujeito Coletivo
- **Coletivo específico**: singular
  - *A multidão gritava.*
- **Coletivo + complemento**: singular ou plural
  - *Um bando de pássaros voava.* ✓
  - *Um bando de pássaros voavam.* ✓

### Pronomes de Tratamento
- Sempre 3ª pessoa
  - *Vossa Excelência chegou.*

### Verbos Impessoais
- **Haver** (existir, tempo): singular
  - *Há muitos candidatos.*
  - *Há dois anos não o vejo.*
- **Fazer** (tempo): singular
  - *Faz dois meses que estudamos.*

## Links Relacionados
[[Concordância Nominal]]
[[Regência Verbal]]`,
    tags: ["português", "concordância", "verbal", "gramática"],
    createdAt: "2025-01-13T11:20:00Z",
    updatedAt: "2025-01-14T08:30:00Z",
    linkedNotes: ["Concordância Nominal", "Regência Verbal"],
    category: "Português",
    edital: "TRF1",
  },
]

// Sample data for sidebar navigation
const sidebarItems = [
  {
    title: "Dashboard",
    icon: <Home />,
    isActive: true,
  },
  {
    title: "Editais",
    icon: <FileText />,
    badge: "5",
    items: [
      { title: "Buscar Editais", url: "#" },
      { title: "Favoritos", url: "#", badge: "3" },
      { title: "Inscrições", url: "#" },
      { title: "Histórico", url: "#" },
    ],
  },
  {
    title: "Cronogramas",
    icon: <Calendar />,
    badge: "3",
    items: [
      { title: "Meus Cronogramas", url: "#", badge: "3" },
      { title: "Gerar com IA", url: "#" },
      { title: "Templates", url: "#" },
      { title: "Compartilhados", url: "#" },
    ],
  },
  {
    title: "Caderno",
    icon: <BookOpen />,
    items: [
      { title: "Todas as Notas", url: "#" },
      { title: "Por Matéria", url: "#" },
      { title: "Favoritas", url: "#" },
      { title: "Recentes", url: "#" },
    ],
  },
  {
    title: "Fórum",
    icon: <MessageSquare />,
    badge: "12",
    items: [
      { title: "Discussões", url: "#", badge: "12" },
      { title: "Dicas de Estudo", url: "#" },
      { title: "Grupos", url: "#" },
      { title: "Materiais", url: "#" },
    ],
  },
  {
    title: "Estatísticas",
    icon: <BarChart3 />,
    items: [
      { title: "Progresso", url: "#" },
      { title: "Tempo de Estudo", url: "#" },
      { title: "Relatórios", url: "#" },
    ],
  },
]

export function Dashboard() {
  const [progress, setProgress] = useState(0)
  const [notifications, setNotifications] = useState(8)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [selectedState, setSelectedState] = useState("todos")
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [searchQuery, setSearchQuery] = useState("")

  // Simulate progress loading
  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 1000)
    return () => clearTimeout(timer)
  }, [])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const filteredEditais = editais.filter((edital) => {
    const matchesState = selectedState === "todos" || edital.state === selectedState
    const matchesCategory = selectedCategory === "todos" || edital.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      edital.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edital.organization.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesState && matchesCategory && matchesSearch
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.5) 0%, rgba(147, 51, 234, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 30% 70%, rgba(16, 185, 129, 0.5) 0%, rgba(59, 130, 246, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 70% 30%, rgba(245, 158, 11, 0.5) 0%, rgba(16, 185, 129, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.5) 0%, rgba(147, 51, 234, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
          ],
        }}
        transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col border-r">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">ConcursoIA</h2>
                <p className="text-xs text-muted-foreground">Estude Inteligente</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title} className="mb-1">
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                      item.isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                    onClick={() => item.items && toggleExpanded(item.title)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.items && (
                      <ChevronDown
                        className={cn(
                          "ml-2 h-4 w-4 transition-transform",
                          expandedItems[item.title] ? "rotate-180" : "",
                        )}
                      />
                    )}
                  </button>

                  {item.items && expandedItems[item.title] && (
                    <div className="mt-1 ml-6 space-y-1 border-l pl-3">
                      {item.items.map((subItem) => (
                        <a
                          key={subItem.title}
                          href={subItem.url}
                          className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          {subItem.title}
                          {"badge" in subItem && subItem.badge && (
                            <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                              {subItem.badge}
                            </Badge>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </button>
              <button className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <span>João Silva</span>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Premium
                </Badge>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">ConcursoIA</h2>
                <p className="text-xs text-muted-foreground">Estude Inteligente</p>
              </div>
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title} className="mb-1">
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                      item.isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                    onClick={() => item.items && toggleExpanded(item.title)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.items && (
                      <ChevronDown
                        className={cn(
                          "ml-2 h-4 w-4 transition-transform",
                          expandedItems[item.title] ? "rotate-180" : "",
                        )}
                      />
                    )}
                  </button>

                  {item.items && expandedItems[item.title] && (
                    <div className="mt-1 ml-6 space-y-1 border-l pl-3">
                      {item.items.map((subItem) => (
                        <a
                          key={subItem.title}
                          href={subItem.url}
                          className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          {subItem.title}
                          {"badge" in subItem &&  subItem.badge && (
                            <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                              {subItem.badge}
                            </Badge>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </button>
              <button className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <span>João Silva</span>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Premium
                </Badge>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("min-h-screen transition-all duration-300 ease-in-out", sidebarOpen ? "md:pl-64" : "md:pl-0")}>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">ConcursoIA</h1>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl">
                      <Bot className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>IA Assistant</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fórum</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl relative">
                      <Bell className="h-5 w-5" />
                      {notifications > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {notifications}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notificações</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Avatar className="h-9 w-9 border-2 border-primary">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList className="grid w-full max-w-[600px] grid-cols-5 rounded-2xl p-1">
                <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:rounded-xl">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="editais" className="rounded-xl data-[state=active]:rounded-xl">
                  Editais
                </TabsTrigger>
                <TabsTrigger value="cronogramas" className="rounded-xl data-[state=active]:rounded-xl">
                  Cronogramas
                </TabsTrigger>
                <TabsTrigger value="caderno" className="rounded-xl data-[state=active]:rounded-xl">
                  Caderno
                </TabsTrigger>
                <TabsTrigger value="forum" className="rounded-xl data-[state=active]:rounded-xl">
                  Fórum
                </TabsTrigger>
              </TabsList>
              <div className="hidden md:flex gap-2">
                <Button variant="outline" className="rounded-2xl bg-transparent">
                  <Bot className="mr-2 h-4 w-4" />
                  Gerar com IA
                </Button>
                <Button className="rounded-2xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cronograma
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="dashboard" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-4">
                          <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">
                            <Bot className="mr-1 h-3 w-3" />
                            Powered by AI
                          </Badge>
                          <h2 className="text-3xl font-bold">Bem-vindo ao ConcursoIA</h2>
                          <p className="max-w-[600px] text-white/80">
                            Sua plataforma inteligente para buscar editais, gerar cronogramas personalizados e estudar
                            de forma eficiente para concursos públicos.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <Button className="rounded-2xl bg-white text-indigo-700 hover:bg-white/90">
                              <Search className="mr-2 h-4 w-4" />
                              Buscar Editais
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-2xl bg-transparent border-white text-white hover:bg-white/10"
                            >
                              <Bot className="mr-2 h-4 w-4" />
                              Gerar Cronograma
                            </Button>
                          </div>
                        </div>
                        <div className="hidden lg:block">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 50, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="relative h-40 w-40"
                          >
                            <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                            <div className="absolute inset-4 rounded-full bg-white/20" />
                            <div className="absolute inset-8 rounded-full bg-white/30" />
                            <div className="absolute inset-12 rounded-full bg-white/40" />
                            <div className="absolute inset-16 rounded-full bg-white/50 flex items-center justify-center">
                              <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <Badge variant="outline" className="rounded-xl">
                            Hoje
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">127</h3>
                          <p className="text-sm text-muted-foreground">Editais Disponíveis</p>
                          <div className="flex items-center text-xs text-green-600">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            +12 novos hoje
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
                            <Calendar className="h-6 w-6 text-purple-600" />
                          </div>
                          <Badge variant="outline" className="rounded-xl">
                            Ativos
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">3</h3>
                          <p className="text-sm text-muted-foreground">Cronogramas Ativos</p>
                          <div className="flex items-center text-xs text-blue-600">
                            <Bot className="mr-1 h-3 w-3" />
                            Gerados com IA
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
                            <Clock className="h-6 w-6 text-green-600" />
                          </div>
                          <Badge variant="outline" className="rounded-xl">
                            Esta semana
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">28h</h3>
                          <p className="text-sm text-muted-foreground">Horas de Estudo</p>
                          <div className="flex items-center text-xs text-green-600">
                            <Target className="mr-1 h-3 w-3" />
                            Meta: 30h/semana
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                            <BookOpen className="h-6 w-6 text-amber-600" />
                          </div>
                          <Badge variant="outline" className="rounded-xl">
                            Total
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">47</h3>
                          <p className="text-sm text-muted-foreground">Notas Criadas</p>
                          <div className="flex items-center text-xs text-amber-600">
                            <BookOpen className="mr-1 h-3 w-3" />
                            Estilo Obsidian
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Editais em Destaque</h2>
                        <Button variant="ghost" className="rounded-2xl" onClick={() => setActiveTab("editais")}>
                          Ver Todos
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {editais.slice(0, 3).map((edital) => (
                          <motion.div
                            key={edital.id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="rounded-2xl border p-4 hover:border-primary/50 transition-all duration-300"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="rounded-xl">
                                    {edital.organization}
                                  </Badge>
                                  {edital.new && <Badge className="rounded-xl bg-green-500">Novo</Badge>}
                                  {edital.featured && <Badge className="rounded-xl bg-amber-500">Destaque</Badge>}
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{edital.title}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{edital.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {edital.state}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="mr-1 h-3 w-3" />
                                    {edital.positions} vagas
                                  </div>
                                  <div className="flex items-center">
                                    <DollarSign className="mr-1 h-3 w-3" />
                                    {edital.salary}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                  <Heart className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Meus Cronogramas</h2>
                        <Button variant="ghost" className="rounded-2xl" onClick={() => setActiveTab("cronogramas")}>
                          Ver Todos
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {cronogramas.slice(0, 3).map((cronograma) => (
                          <motion.div
                            key={cronograma.id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="rounded-2xl border p-4 hover:border-primary/50 transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="rounded-xl">
                                    {cronograma.edital}
                                  </Badge>
                                  {cronograma.aiGenerated && (
                                    <Badge className="rounded-xl bg-purple-500">
                                      <Bot className="mr-1 h-3 w-3" />
                                      IA
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{cronograma.title}</h3>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {cronograma.daysRemaining} dias restantes
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {cronograma.weeklyHours}h/semana
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progresso Geral</span>
                                <span>
                                  {Math.round(
                                    cronograma.subjects.reduce((acc, subject) => acc + subject.progress, 0) /
                                      cronograma.subjects.length,
                                  )}
                                  %
                                </span>
                              </div>
                              <Progress
                                value={
                                  cronograma.subjects.reduce((acc, subject) => acc + subject.progress, 0) /
                                  cronograma.subjects.length
                                }
                                className="h-2 rounded-xl"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Atividade do Fórum</h2>
                      <Button variant="ghost" className="rounded-2xl" onClick={() => setActiveTab("forum")}>
                        Ver Fórum
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {forumPosts.slice(0, 4).map((post) => (
                        <motion.div
                          key={post.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="rounded-2xl border p-4 hover:border-primary/50 transition-all duration-300"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                              <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {post.pinned && <Pin className="h-3 w-3 text-amber-500" />}
                                {post.solved && <CheckCircle className="h-3 w-3 text-green-500" />}
                                <Badge variant="outline" className="rounded-xl text-xs">
                                  {post.category}
                                </Badge>
                              </div>
                              <h3 className="font-medium text-sm mb-1 truncate">{post.title}</h3>
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{post.content}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{post.author}</span>
                                <div className="flex items-center">
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  {post.replies}
                                </div>
                                <div className="flex items-center">
                                  <Heart className="mr-1 h-3 w-3" />
                                  {post.likes}
                                </div>
                                <span>{post.createdAt}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="editais" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Busca Inteligente de Editais</h2>
                          <p className="max-w-[600px] text-white/80">
                            Encontre os melhores concursos públicos com nossa tecnologia de web scraping do PCI
                            Concursos.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button className="rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Atualizar Base
                          </Button>
                          <Button className="rounded-2xl bg-white text-teal-700 hover:bg-white/90">
                            <Bot className="mr-2 h-4 w-4" />
                            Busca com IA
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-3">
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger className="w-[180px] rounded-2xl">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Estados</SelectItem>
                          <SelectItem value="Nacional">Nacional</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px] rounded-2xl">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas as Categorias</SelectItem>
                          <SelectItem value="Judiciário">Judiciário</SelectItem>
                          <SelectItem value="Policial">Policial</SelectItem>
                          <SelectItem value="Fiscal">Fiscal</SelectItem>
                          <SelectItem value="Controle">Controle</SelectItem>
                          <SelectItem value="Bancário">Bancário</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" className="rounded-2xl bg-transparent">
                        <Filter className="mr-2 h-4 w-4" />
                        Mais Filtros
                      </Button>
                    </div>

                    <div className="relative w-full md:w-auto">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar editais..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl pl-9 md:w-[300px]"
                      />
                    </div>
                  </div>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Editais Encontrados ({filteredEditais.length})</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-2xl bg-transparent">
                          <ArrowUpDown className="mr-2 h-4 w-4" />
                          Ordenar
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-2xl bg-transparent">
                          <Download className="mr-2 h-4 w-4" />
                          Exportar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {filteredEditais.map((edital) => (
                        <motion.div
                          key={edital.id}
                          whileHover={{ scale: 1.01, y: -2 }}
                          className="rounded-3xl border p-6 hover:border-primary/50 transition-all duration-300"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge variant="outline" className="rounded-xl">
                                  {edital.organization}
                                </Badge>
                                <Badge variant="outline" className="rounded-xl">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {edital.state}
                                </Badge>
                                <Badge variant="outline" className="rounded-xl">
                                  {edital.category}
                                </Badge>
                                {edital.new && <Badge className="rounded-xl bg-green-500">Novo</Badge>}
                                {edital.featured && <Badge className="rounded-xl bg-amber-500">Destaque</Badge>}
                                <Badge
                                  className={cn(
                                    "rounded-xl",
                                    edital.status === "Inscrições Abertas" ? "bg-green-500" : "bg-blue-500",
                                  )}
                                >
                                  {edital.status}
                                </Badge>
                              </div>

                              <h3 className="text-xl font-semibold mb-2">{edital.title}</h3>
                              <p className="text-muted-foreground mb-4">{edital.description}</p>

                              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{edital.positions}</p>
                                    <p className="text-xs text-muted-foreground">Vagas</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{edital.salary}</p>
                                    <p className="text-xs text-muted-foreground">Salário</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{edital.education}</p>
                                    <p className="text-xs text-muted-foreground">Escolaridade</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{edital.examDate}</p>
                                    <p className="text-xs text-muted-foreground">Prova</p>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-4">
                                <p className="text-sm font-medium mb-2">Matérias:</p>
                                <div className="flex flex-wrap gap-1">
                                  {edital.subjects.map((subject) => (
                                    <Badge key={subject} variant="secondary" className="rounded-xl text-xs">
                                      {subject}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Eye className="mr-1 h-4 w-4" />
                                  {edital.views} visualizações
                                </div>
                                <div className="flex items-center">
                                  <Heart className="mr-1 h-4 w-4" />
                                  {edital.favorites} favoritos
                                </div>
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-4 w-4" />
                                  Inscrições até {edital.deadline}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 md:w-auto w-full">
                              <Button className="rounded-2xl">
                                <Bot className="mr-2 h-4 w-4" />
                                Gerar Cronograma
                              </Button>
                              <Button variant="outline" className="rounded-2xl bg-transparent">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver Edital
                              </Button>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="rounded-2xl">
                                  <Heart className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-2xl">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-2xl">
                                  <Bookmark className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {filteredEditais.length === 0 && (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhum edital encontrado</h3>
                        <p className="text-muted-foreground mb-4">Tente ajustar os filtros ou termos de busca</p>
                        <Button variant="outline" className="rounded-2xl bg-transparent">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Limpar Filtros
                        </Button>
                      </div>
                    )}
                  </section>
                </TabsContent>

                <TabsContent value="cronogramas" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Cronogramas Inteligentes</h2>
                          <p className="max-w-[600px] text-white/80">
                            Crie cronogramas personalizados com IA baseados no seu perfil e tempo disponível.
                          </p>
                        </div>
                        <Button className="w-fit rounded-2xl bg-white text-indigo-700 hover:bg-white/90">
                          <Bot className="mr-2 h-4 w-4" />
                          Gerar com IA
                        </Button>
                      </div>
                    </motion.div>
                  </section>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Calendar className="mr-2 h-4 w-4" />
                      Todos
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Bot className="mr-2 h-4 w-4" />
                      Gerados com IA
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Users className="mr-2 h-4 w-4" />
                      Compartilhados
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Archive className="mr-2 h-4 w-4" />
                      Arquivados
                    </Button>
                    <div className="flex-1"></div>
                    <div className="relative w-full md:w-auto mt-3 md:mt-0">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar cronogramas..."
                        className="w-full rounded-2xl pl-9 md:w-[200px]"
                      />
                    </div>
                  </div>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Meus Cronogramas</h2>
                      <Button className="rounded-2xl">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Cronograma
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {cronogramas.map((cronograma) => (
                        <motion.div
                          key={cronograma.id}
                          whileHover={{ scale: 1.02, y: -5 }}
                          className="rounded-3xl border p-6 hover:border-primary/50 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="rounded-xl">
                                  {cronograma.edital}
                                </Badge>
                                {cronograma.aiGenerated && (
                                  <Badge className="rounded-xl bg-purple-500">
                                    <Bot className="mr-1 h-3 w-3" />
                                    IA
                                  </Badge>
                                )}
                                {cronograma.shared && (
                                  <Badge variant="outline" className="rounded-xl">
                                    <Users className="mr-1 h-3 w-3" />
                                    Compartilhado
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{cronograma.title}</h3>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{cronograma.daysRemaining}</p>
                                    <p className="text-xs text-muted-foreground">Dias restantes</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{cronograma.weeklyHours}h</p>
                                    <p className="text-xs text-muted-foreground">Por semana</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-2xl">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progresso Geral</span>
                              <span>
                                {Math.round(
                                  cronograma.subjects.reduce((acc, subject) => acc + subject.progress, 0) /
                                    cronograma.subjects.length,
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={
                                cronograma.subjects.reduce((acc, subject) => acc + subject.progress, 0) /
                                cronograma.subjects.length
                              }
                              className="h-2 rounded-xl"
                            />
                          </div>

                          <div className="space-y-2 mb-4">
                            <p className="text-sm font-medium">Matérias:</p>
                            {cronograma.subjects.map((subject) => (
                              <div key={subject.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                                  <span className="text-sm">{subject.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{subject.hours}h</span>
                                  <div className="w-16">
                                    <Progress value={subject.progress} className="h-1" />
                                  </div>
                                  <span className="text-xs font-medium w-8">{subject.progress}%</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Button variant="secondary" className="flex-1 rounded-2xl">
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Button>
                            <Button variant="outline" className="rounded-2xl bg-transparent">
                              <Download className="mr-2 h-4 w-4" />
                              Exportar
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}

                      <motion.div whileHover={{ scale: 1.02, y: -5 }}>
                        <Card className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 hover:border-primary/50 transition-all duration-300">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Bot className="h-8 w-8" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Gerar com IA</h3>
                          <p className="mb-4 text-center text-sm text-muted-foreground">
                            Crie um cronograma personalizado baseado no seu perfil e tempo disponível
                          </p>
                          <Button className="rounded-2xl">
                            <Bot className="mr-2 h-4 w-4" />
                            Começar
                          </Button>
                        </Card>
                      </motion.div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Opções de Exportação</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                      <Card className="p-4 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-red-500" />
                        <p className="text-sm font-medium">PDF</p>
                        <p className="text-xs text-muted-foreground">Formatado</p>
                      </Card>
                      <Card className="p-4 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-sm font-medium">Google</p>
                        <p className="text-xs text-muted-foreground">Calendar</p>
                      </Card>
                      <Card className="p-4 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <p className="text-sm font-medium">ICS</p>
                        <p className="text-xs text-muted-foreground">Apple/Outlook</p>
                      </Card>
                      <Card className="p-4 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer">
                        <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm font-medium">Excel</p>
                        <p className="text-xs text-muted-foreground">Planilha</p>
                      </Card>
                      <Card className="p-4 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer">
                        <Hash className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm font-medium">Markdown</p>
                        <p className="text-xs text-muted-foreground">Notion/Obsidian</p>
                      </Card>
                      <Card className="p-4 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer">
                        <Send className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">WhatsApp</p>
                        <p className="text-xs text-muted-foreground">Compartilhar</p>
                      </Card>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="caderno" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Caderno Digital</h2>
                          <p className="max-w-[600px] text-white/80">
                            Organize suas anotações com links bidirecionais, tags e busca avançada, estilo Obsidian.
                          </p>
                        </div>
                        <Button className="w-fit rounded-2xl bg-white text-orange-700 hover:bg-white/90">
                          <Plus className="mr-2 h-4 w-4" />
                          Nova Nota
                        </Button>
                      </div>
                    </motion.div>
                  </section>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Todas as Notas
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Tags className="mr-2 h-4 w-4" />
                      Por Matéria
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Star className="mr-2 h-4 w-4" />
                      Favoritas
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Clock className="mr-2 h-4 w-4" />
                      Recentes
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Network className="mr-2 h-4 w-4" />
                      Grafo de Conexões
                    </Button>
                    <div className="flex-1"></div>
                    <div className="relative w-full md:w-auto mt-3 md:mt-0">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar notas..."
                        className="w-full rounded-2xl pl-9 md:w-[200px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Suas Notas</h2>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-2xl bg-transparent">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Ordenar
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-2xl bg-transparent">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtrar
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {notes.map((note) => (
                          <motion.div
                            key={note.id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="rounded-2xl border p-4 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="rounded-xl text-xs">
                                    {note.category}
                                  </Badge>
                                  <Badge variant="outline" className="rounded-xl text-xs">
                                    {note.edital}
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{note.title}</h3>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="mb-3">
                              <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded-lg line-clamp-4">
                                {note.content.split("\n").slice(0, 4).join("\n")}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {note.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="rounded-xl text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Link className="h-3 w-3" />
                                <span>{note.linkedNotes.length} links</span>
                              </div>
                              <span>{new Date(note.updatedAt).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </motion.div>
                        ))}

                        <motion.div whileHover={{ scale: 1.02, y: -2 }}>
                          <Card className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                              <Plus className="h-6 w-6" />
                            </div>
                            <h3 className="font-medium mb-1">Nova Nota</h3>
                            <p className="text-center text-xs text-muted-foreground">
                              Crie uma nova anotação com markdown
                            </p>
                          </Card>
                        </motion.div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Card className="p-4">
                        <h3 className="font-semibold mb-3">Estatísticas</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total de Notas</span>
                            <Badge variant="outline" className="rounded-xl">
                              {notes.length}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Links Criados</span>
                            <Badge variant="outline" className="rounded-xl">
                              {notes.reduce((acc, note) => acc + note.linkedNotes.length, 0)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Tags Únicas</span>
                            <Badge variant="outline" className="rounded-xl">
                              {new Set(notes.flatMap((note) => note.tags)).size}
                            </Badge>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h3 className="font-semibold mb-3">Matérias</h3>
                        <div className="space-y-2">
                          {Array.from(new Set(notes.map((note) => note.category))).map((category) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-sm">{category}</span>
                              <Badge variant="outline" className="rounded-xl">
                                {notes.filter((note) => note.category === category).length}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h3 className="font-semibold mb-3">Tags Populares</h3>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(notes.flatMap((note) => note.tags)))
                            .slice(0, 10)
                            .map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="rounded-xl text-xs cursor-pointer hover:bg-primary/20"
                              >
                                #{tag}
                              </Badge>
                            ))}
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h3 className="font-semibold mb-3">Recursos</h3>
                        <div className="space-y-2">
                          <Button variant="ghost" size="sm" className="w-full justify-start rounded-xl">
                            <Network className="mr-2 h-4 w-4" />
                            Visualizar Grafo
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full justify-start rounded-xl">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar Notas
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full justify-start rounded-xl">
                            <Archive className="mr-2 h-4 w-4" />
                            Backup
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="forum" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">Fórum da Comunidade</h2>
                          <p className="max-w-[600px] text-white/80">
                            Conecte-se com outros concurseiros, compartilhe dicas e tire dúvidas sobre seus estudos.
                          </p>
                        </div>
                        <Button className="w-fit rounded-2xl bg-white text-pink-700 hover:bg-white/90">
                          <Plus className="mr-2 h-4 w-4" />
                          Nova Discussão
                        </Button>
                      </div>
                    </motion.div>
                  </section>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Todas
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Dicas de Estudo
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Calendar className="mr-2 h-4 w-4" />
                      Cronogramas
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Materiais
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <Users className="mr-2 h-4 w-4" />
                      Grupos de Estudo
                    </Button>
                    <Button variant="outline" className="rounded-2xl bg-transparent">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Resolvidas
                    </Button>
                    <div className="flex-1"></div>
                    <div className="relative w-full md:w-auto mt-3 md:mt-0">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar discussões..."
                        className="w-full rounded-2xl pl-9 md:w-[200px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <div className="lg:col-span-3 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Discussões Recentes</h2>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-2xl bg-transparent">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Ordenar
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-2xl bg-transparent">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtrar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {forumPosts.map((post) => (
                          <motion.div
                            key={post.id}
                            whileHover={{ scale: 1.01, y: -2 }}
                            className="rounded-2xl border p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                          >
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  {post.pinned && <Pin className="h-4 w-4 text-amber-500" />}
                                  {post.solved && <CheckCircle className="h-4 w-4 text-green-500" />}
                                  <Badge variant="outline" className="rounded-xl">
                                    {post.category}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">{post.createdAt}</span>
                                </div>

                                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                                <p className="text-muted-foreground mb-3 line-clamp-2">{post.content}</p>

                                <div className="flex flex-wrap gap-1 mb-3">
                                  {post.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="rounded-xl text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="font-medium">{post.author}</span>
                                    <div className="flex items-center">
                                      <MessageSquare className="mr-1 h-4 w-4" />
                                      {post.replies} respostas
                                    </div>
                                    <div className="flex items-center">
                                      <Eye className="mr-1 h-4 w-4" />
                                      {post.views} visualizações
                                    </div>
                                    <div className="flex items-center">
                                      <Heart className="mr-1 h-4 w-4" />
                                      {post.likes} curtidas
                                    </div>
                                  </div>

                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                      <Heart className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                      <Bookmark className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex justify-center">
                        <Button variant="outline" className="rounded-2xl bg-transparent">
                          Carregar Mais Discussões
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Card className="p-4">
                        <h3 className="font-semibold mb-3">Estatísticas</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Discussões Ativas</span>
                            <Badge variant="outline" className="rounded-xl">
                              {forumPosts.length}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Membros Online</span>
                            <Badge className="rounded-xl bg-green-500">247</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Respostas Hoje</span>
                            <Badge variant="outline" className="rounded-xl">
                              89
                            </Badge>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h3 className="font-semibold mb-3">Categorias Populares</h3>
                        <div className="space-y-2">
                          {Array.from(new Set(forumPosts.map((post) => post.category))).map((category) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-sm">{category}</span>
                              <Badge variant="outline" className="rounded-xl">
                                {forumPosts.filter((post) => post.category === category).length}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h3 className="font-semibold mb-3">Membros Ativos</h3>
                        <div className="space-y-3">
                          {forumPosts.slice(0, 5).map((post) => (
                            <div key={post.id} className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{post.author}</p>
                                <p className="text-xs text-muted-foreground">{post.replies} respostas</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h3 className="font-semibold mb-3">Regras do Fórum</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>• Seja respeitoso com outros membros</p>
                          <p>• Mantenha as discussões relevantes</p>
                          <p>• Use tags apropriadas</p>
                          <p>• Não faça spam ou autopromocão</p>
                          <p>• Marque como resolvido quando aplicável</p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
