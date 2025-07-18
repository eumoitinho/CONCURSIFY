import PDFDocument from 'pdfkit'
import { CronogramaData } from '@/lib/ai/gemini'

export class PDFGenerator {
  static async gerarCronogramaPDF(
    cronograma: CronogramaData,
    concursoInfo: { titulo: string; orgao: string; data_prova?: string },
    isFreePlan: boolean = false
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        })

        const buffers: Buffer[] = []
        doc.on('data', buffers.push.bind(buffers))
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)

        // Adicionar marca d'água se for plano gratuito
        if (isFreePlan) {
          this.addWatermark(doc)
        }

        // Cabeçalho
        this.addHeader(doc, cronograma, concursoInfo)

        // Informações do concurso
        this.addConcursoInfo(doc, concursoInfo)

        // Resumo do cronograma
        this.addCronogramaResumo(doc, cronograma)

        // Cronograma detalhado
        this.addCronogramaDetalhado(doc, cronograma)

        // Dicas e recursos
        this.addDicasRecursos(doc, cronograma)

        // Metas
        this.addMetas(doc, cronograma)

        // Rodapé
        this.addFooter(doc, isFreePlan)

        doc.end()

      } catch (error) {
        reject(error)
      }
    })
  }

  private static addWatermark(doc: PDFKit.PDFDocument) {
    const width = doc.page.width
    const height = doc.page.height

    doc.save()
    doc.rotate(45, { origin: [width / 2, height / 2] })
    doc.fontSize(48)
      .fillColor('gray', 0.1)
      .text('CONCURSIFY - PLANO GRATUITO', width / 4, height / 2, {
        align: 'center',
        width: width / 2
      })
    doc.restore()
  }

  private static addHeader(
    doc: PDFKit.PDFDocument, 
    cronograma: CronogramaData,
    concursoInfo: { titulo: string; orgao: string }
  ) {
    // Logo/título
    doc.fontSize(24)
      .fillColor('#1e40af')
      .text('CONCURSIFY', 50, 50, { align: 'left' })

    // Título do cronograma
    doc.fontSize(18)
      .fillColor('black')
      .text(cronograma.titulo, 50, 90, { width: 500 })

    // Linha separadora
    doc.moveTo(50, 130)
      .lineTo(550, 130)
      .strokeColor('#e5e7eb')
      .stroke()
  }

  private static addConcursoInfo(
    doc: PDFKit.PDFDocument,
    concursoInfo: { titulo: string; orgao: string; data_prova?: string }
  ) {
    let y = 150

    doc.fontSize(14)
      .fillColor('#374151')
      .text('INFORMAÇÕES DO CONCURSO', 50, y, { underline: true })

    y += 25

    doc.fontSize(12)
      .fillColor('black')
      .text(`Concurso: ${concursoInfo.titulo}`, 50, y)

    y += 20
    doc.text(`Órgão: ${concursoInfo.orgao}`, 50, y)

    if (concursoInfo.data_prova) {
      y += 20
      const dataFormatada = new Date(concursoInfo.data_prova).toLocaleDateString('pt-BR')
      doc.text(`Data da Prova: ${dataFormatada}`, 50, y)
    }

    return y + 30
  }

  private static addCronogramaResumo(doc: PDFKit.PDFDocument, cronograma: CronogramaData) {
    let y = 250

    doc.fontSize(14)
      .fillColor('#374151')
      .text('RESUMO DO CRONOGRAMA', 50, y, { underline: true })

    y += 25

    doc.fontSize(12)
      .fillColor('black')
      .text(`Duração: ${cronograma.duracao_semanas} semanas`, 50, y)

    y += 20
    doc.text(`Total de semanas planejadas: ${cronograma.semanas.length}`, 50, y)

    // Calcular total de horas
    const totalMinutos = cronograma.semanas.reduce((total, semana) => {
      return total + semana.dias.reduce((totalDia, dia) => {
        return totalDia + dia.materias.reduce((totalMateria, materia) => {
          return totalMateria + materia.tempo_minutos
        }, 0)
      }, 0)
    }, 0)

    y += 20
    doc.text(`Carga horária total: ${Math.round(totalMinutos / 60)} horas`, 50, y)

    return y + 30
  }

  private static addCronogramaDetalhado(doc: PDFKit.PDFDocument, cronograma: CronogramaData) {
    let y = 350

    doc.fontSize(14)
      .fillColor('#374151')
      .text('CRONOGRAMA DETALHADO', 50, y, { underline: true })

    y += 30

    cronograma.semanas.forEach((semana, index) => {
      // Verificar se precisa de nova página
      if (y > 700) {
        doc.addPage()
        y = 50
      }

      // Título da semana
      doc.fontSize(12)
        .fillColor('#1e40af')
        .text(`Semana ${semana.numero}: ${semana.tema}`, 50, y, { underline: true })

      y += 25

      // Dias da semana
      semana.dias.forEach(dia => {
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
        
        doc.fontSize(11)
          .fillColor('#6b7280')
          .text(`${diasSemana[dia.dia]}:`, 70, y)

        let xMateria = 110
        dia.materias.forEach((materia, materiaIndex) => {
          if (materiaIndex > 0) {
            doc.text(' | ', xMateria, y)
            xMateria += 15
          }

          doc.fillColor('black')
            .text(`${materia.nome} (${materia.tempo_minutos}min)`, xMateria, y)
          
          xMateria += 150
        })

        y += 18
      })

      y += 15
    })

    return y
  }

  private static addDicasRecursos(doc: PDFKit.PDFDocument, cronograma: CronogramaData) {
    let y = doc.y + 30

    // Verificar se precisa de nova página
    if (y > 650) {
      doc.addPage()
      y = 50
    }

    // Dicas
    doc.fontSize(14)
      .fillColor('#374151')
      .text('DICAS DE ESTUDO', 50, y, { underline: true })

    y += 25

    cronograma.dicas.forEach((dica, index) => {
      doc.fontSize(11)
        .fillColor('black')
        .text(`${index + 1}. ${dica}`, 50, y, { width: 500 })
      y += doc.heightOfString(dica, { width: 500 }) + 8
    })

    y += 20

    // Recursos
    if (cronograma.recursos.length > 0) {
      doc.fontSize(14)
        .fillColor('#374151')
        .text('RECURSOS RECOMENDADOS', 50, y, { underline: true })

      y += 25

      cronograma.recursos.forEach(recurso => {
        doc.fontSize(11)
          .fillColor('black')
          .text(`• ${recurso.nome} (${recurso.tipo})`, 50, y)
        
        y += 15
        
        if (recurso.descricao) {
          doc.fontSize(10)
            .fillColor('#6b7280')
            .text(`  ${recurso.descricao}`, 50, y, { width: 500 })
          y += doc.heightOfString(recurso.descricao, { width: 500 }) + 5
        }

        y += 5
      })
    }

    return y
  }

  private static addMetas(doc: PDFKit.PDFDocument, cronograma: CronogramaData) {
    if (cronograma.metas.length === 0) return

    let y = doc.y + 30

    // Verificar se precisa de nova página
    if (y > 650) {
      doc.addPage()
      y = 50
    }

    doc.fontSize(14)
      .fillColor('#374151')
      .text('METAS E INDICADORES', 50, y, { underline: true })

    y += 25

    cronograma.metas.forEach(meta => {
      doc.fontSize(11)
        .fillColor('black')
        .text(`Semana ${meta.semana}: ${meta.descricao}`, 50, y, { width: 500 })
      
      y += 15

      doc.fontSize(10)
        .fillColor('#6b7280')
        .text(`Indicador: ${meta.indicador}`, 70, y)
      
      y += 20
    })
  }

  private static addFooter(doc: PDFKit.PDFDocument, isFreePlan: boolean) {
    const pageCount = doc.bufferedPageRange().count
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i)
      
      const bottom = doc.page.height - 30
      
      // Número da página
      doc.fontSize(10)
        .fillColor('#6b7280')
        .text(`Página ${i + 1} de ${pageCount}`, 50, bottom, { align: 'center', width: 500 })

      // Marca do Concursify
      if (isFreePlan) {
        doc.fontSize(8)
          .fillColor('#9ca3af')
          .text('Gerado pelo Concursify - www.concursify.com.br', 50, bottom - 15, { 
            align: 'center', 
            width: 500 
          })
      }
    }
  }

  static async gerarRelatorioPDF(
    dados: {
      usuario: string
      periodo: string
      estatisticas: any
      cronogramas: any[]
    },
    isFreePlan: boolean = false
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4' })

        const buffers: Buffer[] = []
        doc.on('data', buffers.push.bind(buffers))
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)

        if (isFreePlan) {
          this.addWatermark(doc)
        }

        // Título do relatório
        doc.fontSize(20)
          .text('Relatório de Estudos - Concursify', 50, 50)

        // Dados do usuário e período
        doc.fontSize(12)
          .text(`Usuário: ${dados.usuario}`, 50, 100)
          .text(`Período: ${dados.periodo}`, 50, 120)

        // Estatísticas gerais
        let y = 160
        doc.fontSize(16).text('Estatísticas Gerais', 50, y)
        y += 30

        if (dados.estatisticas) {
          Object.entries(dados.estatisticas).forEach(([key, value]) => {
            doc.fontSize(12).text(`${key}: ${value}`, 50, y)
            y += 20
          })
        }

        // Lista de cronogramas
        y += 20
        doc.fontSize(16).text('Cronogramas Criados', 50, y)
        y += 30

        dados.cronogramas.forEach((cronograma, index) => {
          doc.fontSize(12)
            .text(`${index + 1}. ${cronograma.titulo}`, 50, y)
          y += 20
        })

        doc.end()

      } catch (error) {
        reject(error)
      }
    })
  }
}