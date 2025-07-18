import PDFDocument from 'pdfkit'
import { createWriteStream } from 'fs'
import { promisify } from 'util'
import path from 'path'

export interface SimuladoReportData {
  simulado: {
    id: string
    titulo: string
    configuracao: any
    pontuacao: number
    tempo_total: number
    data_realizacao: string
  }
  respostas: Array<{
    questao_id: string
    questao_texto: string
    resposta_usuario: string
    resposta_correta: string
    is_correct: boolean
    tempo_resposta: number
    materia: string
    assunto: string
    explicacao?: string
  }>
  feedback: {
    pontuacao_geral: number
    pontuacao_por_materia: Record<string, { acertos: number; total: number; percentual: number }>
    pontos_fortes: string[]
    pontos_fracos: string[]
    recomendacoes: string[]
    tempo_medio_por_questao: number
    questoes_mais_demoradas: Array<{ questao_id: string; tempo: number; materia: string }>
    nivel_sugerido: string
    plano_estudo_sugerido: {
      materias_prioritarias: string[]
      tempo_sugerido_por_materia: Record<string, number>
      proximos_assuntos: string[]
    }
  }
  usuario: {
    nome: string
    email: string
    plano: string
  }
}

export class SimuladoReportGenerator {
  private doc: PDFKit.PDFDocument
  private readonly pageWidth = 595.28
  private readonly pageHeight = 841.89
  private readonly margin = 50
  private readonly contentWidth = this.pageWidth - (this.margin * 2)
  private currentY = this.margin

  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: this.margin,
        bottom: this.margin,
        left: this.margin,
        right: this.margin
      }
    })
  }

  async generateReport(data: SimuladoReportData, outputPath: string): Promise<string> {
    try {
      const stream = createWriteStream(outputPath)
      this.doc.pipe(stream)

      // Gerar relatório
      await this.generateHeader(data)
      await this.generateResumoExecutivo(data)
      await this.generateAnaliseDetalhada(data)
      await this.generateQuestionario(data)
      await this.generateRecomendacoes(data)
      await this.generateFooter(data)

      // Finalizar documento
      this.doc.end()

      // Aguardar conclusão do stream
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve)
        stream.on('error', reject)
      })

      return outputPath

    } catch (error) {
      console.error('Erro ao gerar relatório PDF:', error)
      throw new Error('Falha na geração do relatório')
    }
  }

  private async generateHeader(data: SimuladoReportData) {
    // Logo/Título do sistema
    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#1a365d')
      .text('CONCURSIFY', this.margin, this.currentY)

    this.currentY += 30

    // Título do relatório
    this.doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#2d3748')
      .text('RELATÓRIO DE DESEMPENHO - SIMULADO', this.margin, this.currentY)

    this.currentY += 25

    // Informações básicas
    this.doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#4a5568')
      .text(`Simulado: ${data.simulado.titulo}`, this.margin, this.currentY)

    this.currentY += 15

    this.doc.text(`Candidato: ${data.usuario.nome}`, this.margin, this.currentY)
    this.currentY += 15

    this.doc.text(`Data: ${new Date(data.simulado.data_realizacao).toLocaleDateString('pt-BR')}`, this.margin, this.currentY)
    this.currentY += 15

    this.doc.text(`Plano: ${data.usuario.plano.toUpperCase()}`, this.margin, this.currentY)
    this.currentY += 30

    // Linha separadora
    this.doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(this.margin, this.currentY)
      .lineTo(this.pageWidth - this.margin, this.currentY)
      .stroke()

    this.currentY += 20
  }

  private async generateResumoExecutivo(data: SimuladoReportData) {
    // Título da seção
    this.addSectionTitle('RESUMO EXECUTIVO')

    // Box de estatísticas principais
    const boxHeight = 120
    const boxY = this.currentY

    // Background do box
    this.doc
      .fillColor('#f7fafc')
      .rect(this.margin, boxY, this.contentWidth, boxHeight)
      .fill()

    // Estatísticas em colunas
    const colWidth = this.contentWidth / 4
    const statsY = boxY + 20

    // Pontuação Geral
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1a365d')
      .text('PONTUAÇÃO', this.margin + 20, statsY)

    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor(data.feedback.pontuacao_geral >= 70 ? '#38a169' : data.feedback.pontuacao_geral >= 50 ? '#d69e2e' : '#e53e3e')
      .text(`${data.feedback.pontuacao_geral.toFixed(1)}%`, this.margin + 20, statsY + 20)

    // Questões certas
    const acertos = data.respostas.filter(r => r.is_correct).length
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1a365d')
      .text('ACERTOS', this.margin + 20 + colWidth, statsY)

    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#2d3748')
      .text(`${acertos}/${data.respostas.length}`, this.margin + 20 + colWidth, statsY + 20)

    // Tempo total
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1a365d')
      .text('TEMPO TOTAL', this.margin + 20 + colWidth * 2, statsY)

    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#2d3748')
      .text(`${data.simulado.tempo_total}min`, this.margin + 20 + colWidth * 2, statsY + 20)

    // Tempo médio
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1a365d')
      .text('TEMPO/QUESTÃO', this.margin + 20 + colWidth * 3, statsY)

    this.doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#2d3748')
      .text(`${Math.round(data.feedback.tempo_medio_por_questao)}s`, this.margin + 20 + colWidth * 3, statsY + 20)

    this.currentY = boxY + boxHeight + 30
  }

  private async generateAnaliseDetalhada(data: SimuladoReportData) {
    this.addSectionTitle('ANÁLISE POR MATÉRIA')

    // Gráfico de performance por matéria
    const chartHeight = 200
    const chartY = this.currentY

    // Background do gráfico
    this.doc
      .fillColor('#ffffff')
      .rect(this.margin, chartY, this.contentWidth, chartHeight)
      .stroke()

    const materias = Object.keys(data.feedback.pontuacao_por_materia)
    const barWidth = (this.contentWidth - 40) / materias.length
    const maxHeight = chartHeight - 60

    materias.forEach((materia, index) => {
      const stats = data.feedback.pontuacao_por_materia[materia]
      const barHeight = (stats.percentual / 100) * maxHeight
      const barX = this.margin + 20 + (index * barWidth)
      const barY = chartY + chartHeight - 40 - barHeight

      // Barra
      this.doc
        .fillColor(stats.percentual >= 70 ? '#38a169' : stats.percentual >= 50 ? '#d69e2e' : '#e53e3e')
        .rect(barX, barY, barWidth - 10, barHeight)
        .fill()

      // Label da matéria
      this.doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#4a5568')
        .text(materia.substring(0, 12), barX, chartY + chartHeight - 35, {
          width: barWidth - 10,
          align: 'center'
        })

      // Percentual
      this.doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#1a365d')
        .text(`${stats.percentual}%`, barX, barY - 15, {
          width: barWidth - 10,
          align: 'center'
        })
    })

    this.currentY = chartY + chartHeight + 30
  }

  private async generateQuestionario(data: SimuladoReportData) {
    // Verificar se há espaço, senão criar nova página
    this.checkPageBreak(100)

    this.addSectionTitle('DETALHAMENTO DAS QUESTÕES')

    data.respostas.forEach((resposta, index) => {
      this.checkPageBreak(150)

      // Número da questão
      this.doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1a365d')
        .text(`Questão ${index + 1}`, this.margin, this.currentY)

      // Status (certo/errado)
      const statusColor = resposta.is_correct ? '#38a169' : '#e53e3e'
      const statusText = resposta.is_correct ? 'CORRETA' : 'INCORRETA'

      this.doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(statusColor)
        .text(statusText, this.pageWidth - this.margin - 60, this.currentY)

      this.currentY += 20

      // Matéria e assunto
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#718096')
        .text(`${resposta.materia} - ${resposta.assunto}`, this.margin, this.currentY)

      this.currentY += 15

      // Texto da questão (truncado)
      const questaoTexto = resposta.questao_texto.length > 200 
        ? resposta.questao_texto.substring(0, 200) + '...'
        : resposta.questao_texto

      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#2d3748')
        .text(questaoTexto, this.margin, this.currentY, {
          width: this.contentWidth,
          align: 'justify'
        })

      this.currentY += 40

      // Respostas
      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#4a5568')
        .text(`Sua resposta: ${resposta.resposta_usuario}`, this.margin + 20, this.currentY)

      this.doc.text(`Resposta correta: ${resposta.resposta_correta}`, this.margin + 150, this.currentY)

      this.doc.text(`Tempo: ${resposta.tempo_resposta}s`, this.margin + 300, this.currentY)

      this.currentY += 25

      // Linha separadora
      this.doc
        .strokeColor('#e2e8f0')
        .lineWidth(0.5)
        .moveTo(this.margin, this.currentY)
        .lineTo(this.pageWidth - this.margin, this.currentY)
        .stroke()

      this.currentY += 15
    })
  }

  private async generateRecomendacoes(data: SimuladoReportData) {
    this.checkPageBreak(200)

    this.addSectionTitle('RECOMENDAÇÕES DE ESTUDO')

    // Pontos fortes
    if (data.feedback.pontos_fortes.length > 0) {
      this.doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#38a169')
        .text('✓ PONTOS FORTES', this.margin, this.currentY)

      this.currentY += 15

      data.feedback.pontos_fortes.forEach(ponto => {
        this.doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#2d3748')
          .text(`• ${ponto}`, this.margin + 20, this.currentY)

        this.currentY += 12
      })

      this.currentY += 10
    }

    // Pontos fracos
    if (data.feedback.pontos_fracos.length > 0) {
      this.doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#e53e3e')
        .text('⚠ ÁREAS DE MELHORIA', this.margin, this.currentY)

      this.currentY += 15

      data.feedback.pontos_fracos.forEach(ponto => {
        this.doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#2d3748')
          .text(`• ${ponto}`, this.margin + 20, this.currentY)

        this.currentY += 12
      })

      this.currentY += 10
    }

    // Recomendações
    if (data.feedback.recomendacoes.length > 0) {
      this.doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#3182ce')
        .text('💡 RECOMENDAÇÕES', this.margin, this.currentY)

      this.currentY += 15

      data.feedback.recomendacoes.forEach(rec => {
        this.doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#2d3748')
          .text(`• ${rec}`, this.margin + 20, this.currentY)

        this.currentY += 12
      })

      this.currentY += 10
    }

    // Matérias prioritárias
    if (data.feedback.plano_estudo_sugerido.materias_prioritarias.length > 0) {
      this.doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#805ad5')
        .text('📚 MATÉRIAS PRIORITÁRIAS', this.margin, this.currentY)

      this.currentY += 15

      data.feedback.plano_estudo_sugerido.materias_prioritarias.forEach(materia => {
        this.doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#2d3748')
          .text(`• ${materia}`, this.margin + 20, this.currentY)

        this.currentY += 12
      })
    }
  }

  private async generateFooter(data: SimuladoReportData) {
    // Ir para a parte inferior da página
    this.currentY = this.pageHeight - this.margin - 50

    // Watermark para planos gratuitos
    if (data.usuario.plano === 'free') {
      this.doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#a0aec0')
        .text('Relatório gerado pelo plano gratuito do Concursify - Upgrade para relatórios completos', 
          this.margin, this.currentY, {
            width: this.contentWidth,
            align: 'center'
          })

      this.currentY += 15
    }

    // Rodapé
    this.doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#718096')
      .text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 
        this.margin, this.currentY, {
          width: this.contentWidth,
          align: 'center'
        })

    this.currentY += 10

    this.doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#718096')
      .text('Concursify - Sua plataforma de estudos para concursos públicos', 
        this.margin, this.currentY, {
          width: this.contentWidth,
          align: 'center'
        })
  }

  private addSectionTitle(title: string) {
    this.checkPageBreak(60)

    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1a365d')
      .text(title, this.margin, this.currentY)

    this.currentY += 25
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }
}

// Função utilitária para gerar relatório
export async function generateSimuladoReport(
  data: SimuladoReportData,
  outputDir: string = '/tmp'
): Promise<string> {
  const generator = new SimuladoReportGenerator()
  const fileName = `simulado-${data.simulado.id}-${Date.now()}.pdf`
  const outputPath = path.join(outputDir, fileName)
  
  await generator.generateReport(data, outputPath)
  return outputPath
}