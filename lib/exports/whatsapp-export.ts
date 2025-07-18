import { CronogramaData } from '@/lib/ai/gemini'

export class WhatsAppExport {
  static gerarMensagemCronograma(
    cronograma: CronogramaData,
    concursoInfo: { titulo: string; orgao: string; data_prova?: string }
  ): string {
    const emojis = {
      teoria: '📖',
      exercicios: '✏️',
      revisao: '🔄',
      facil: '🟢',
      medio: '🟡',
      dificil: '🔴'
    }

    let mensagem = `🎯 *CRONOGRAMA DE ESTUDOS* 🎯\n\n`
    mensagem += `📋 *Concurso:* ${concursoInfo.titulo}\n`
    mensagem += `🏛️ *Órgão:* ${concursoInfo.orgao}\n`
    
    if (concursoInfo.data_prova) {
      const dataFormatada = new Date(concursoInfo.data_prova).toLocaleDateString('pt-BR')
      mensagem += `📅 *Data da Prova:* ${dataFormatada}\n`
    }

    mensagem += `⏱️ *Duração:* ${cronograma.duracao_semanas} semanas\n\n`

    // Resumo semanal
    mensagem += `📅 *RESUMO SEMANAL:*\n\n`

    cronograma.semanas.forEach((semana, index) => {
      mensagem += `*Semana ${semana.numero}:* ${semana.tema}\n`

      // Calcular total de horas da semana
      const totalMinutos = semana.dias.reduce((total, dia) => {
        return total + dia.materias.reduce((totalMateria, materia) => {
          return totalMateria + materia.tempo_minutos
        }, 0)
      }, 0)

      mensagem += `⏰ Total: ${Math.round(totalMinutos / 60)}h\n\n`
    })

    // Dicas principais
    if (cronograma.dicas.length > 0) {
      mensagem += `💡 *DICAS IMPORTANTES:*\n\n`
      cronograma.dicas.slice(0, 5).forEach((dica, index) => {
        mensagem += `${index + 1}. ${dica}\n`
      })
      mensagem += `\n`
    }

    // Materias prioritárias
    const materiasCount = this.contarMaterias(cronograma)
    const top3Materias = Object.entries(materiasCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)

    if (top3Materias.length > 0) {
      mensagem += `🎯 *MATÉRIAS PRIORITÁRIAS:*\n\n`
      top3Materias.forEach(([materia, horas], index) => {
        mensagem += `${index + 1}. ${materia} (${Math.round(horas as number / 60)}h)\n`
      })
      mensagem += `\n`
    }

    mensagem += `🚀 *Gerado pelo Concursify*\n`
    mensagem += `📱 www.concursify.com.br`

    return mensagem
  }

  static gerarMensagemSemanal(
    semana: any,
    numerosemana: number,
    concursoInfo: { titulo: string }
  ): string {
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const emojis = {
      teoria: '📖',
      exercicios: '✏️', 
      revisao: '🔄',
      facil: '🟢',
      medio: '🟡',
      dificil: '🔴'
    }

    let mensagem = `📅 *SEMANA ${numerosemana} - ${semana.tema.toUpperCase()}*\n\n`
    mensagem += `🎯 *Concurso:* ${concursoInfo.titulo}\n\n`

    semana.dias.forEach((dia: any) => {
      if (dia.materias.length > 0) {
        mensagem += `*${diasSemana[dia.dia]}:*\n`

        dia.materias.forEach((materia: any) => {
          const emoji = emojis[materia.tipo as keyof typeof emojis] || '📚'
          const dificuldadeEmoji = emojis[materia.dificuldade as keyof typeof emojis] || '⚪'
          
          mensagem += `${emoji} ${materia.nome} (${materia.tempo_minutos}min) ${dificuldadeEmoji}\n`
          
          if (materia.topicos.length > 0) {
            mensagem += `   📌 ${materia.topicos.slice(0, 2).join(', ')}\n`
          }
        })
        mensagem += `\n`
      }
    })

    // Calcular total da semana
    const totalMinutos = semana.dias.reduce((total: number, dia: any) => {
      return total + dia.materias.reduce((totalMateria: number, materia: any) => {
        return totalMateria + materia.tempo_minutos
      }, 0)
    }, 0)

    mensagem += `⏱️ *Total da semana:* ${Math.round(totalMinutos / 60)} horas\n\n`
    mensagem += `🚀 *Concursify* - Seus estudos organizados`

    return mensagem
  }

  static gerarMensagemDiaria(
    materias: any[],
    dia: string,
    concursoInfo: { titulo: string }
  ): string {
    const emojis = {
      teoria: '📖',
      exercicios: '✏️',
      revisao: '🔄',
      facil: '🟢',
      medio: '🟡',
      dificil: '🔴'
    }

    let mensagem = `📚 *ESTUDOS DE ${dia.toUpperCase()}*\n\n`
    mensagem += `🎯 ${concursoInfo.titulo}\n\n`

    let totalMinutos = 0

    materias.forEach((materia, index) => {
      const emoji = emojis[materia.tipo as keyof typeof emojis] || '📚'
      const dificuldadeEmoji = emojis[materia.dificuldade as keyof typeof emojis] || '⚪'
      
      mensagem += `${index + 1}. ${emoji} *${materia.nome}* ${dificuldadeEmoji}\n`
      mensagem += `   ⏰ ${materia.tempo_minutos} minutos\n`
      
      if (materia.topicos.length > 0) {
        mensagem += `   📋 Tópicos:\n`
        materia.topicos.forEach((topico: string) => {
          mensagem += `   • ${topico}\n`
        })
      }
      
      mensagem += `\n`
      totalMinutos += materia.tempo_minutos
    })

    mensagem += `⏱️ *Total do dia:* ${Math.round(totalMinutos / 60)} horas\n\n`
    mensagem += `💪 Bons estudos!\n`
    mensagem += `🚀 *Concursify*`

    return mensagem
  }

  static gerarLinkWhatsApp(mensagem: string, numero?: string): string {
    const mensagemEncoded = encodeURIComponent(mensagem)
    
    if (numero) {
      // Enviar para número específico
      return `https://wa.me/${numero}?text=${mensagemEncoded}`
    } else {
      // Abrir WhatsApp para escolher contato
      return `https://wa.me/?text=${mensagemEncoded}`
    }
  }

  static gerarMensagemLembrete(
    materia: string,
    tempoMinutos: number,
    topicos: string[] = []
  ): string {
    let mensagem = `⏰ *LEMBRETE DE ESTUDO* ⏰\n\n`
    mensagem += `📚 *Matéria:* ${materia}\n`
    mensagem += `⏱️ *Tempo:* ${tempoMinutos} minutos\n\n`

    if (topicos.length > 0) {
      mensagem += `📋 *Tópicos para estudar:*\n`
      topicos.forEach(topico => {
        mensagem += `• ${topico}\n`
      })
      mensagem += `\n`
    }

    mensagem += `💪 Foco e disciplina!\n`
    mensagem += `🚀 *Concursify*`

    return mensagem
  }

  static gerarMensagemMotivacional(
    progresso: number,
    metaAtual: string,
    diasRestantes?: number
  ): string {
    const motivacionais = [
      "Cada página estudada é um passo a mais rumo à aprovação! 📚",
      "A persistência é o caminho do êxito! 💪",
      "Seu futuro está sendo construído hoje! 🎯",
      "Disciplina é a ponte entre metas e conquistas! 🌟",
      "O sucesso é a soma de pequenos esforços repetidos! ⭐"
    ]

    const mensagemMotivacional = motivacionais[Math.floor(Math.random() * motivacionais.length)]

    let mensagem = `🎯 *RELATÓRIO DE PROGRESSO* 🎯\n\n`
    mensagem += `📊 *Progresso atual:* ${progresso.toFixed(1)}%\n`
    mensagem += `🏆 *Meta atual:* ${metaAtual}\n`

    if (diasRestantes !== undefined) {
      mensagem += `📅 *Dias restantes:* ${diasRestantes}\n`
    }

    mensagem += `\n💭 *Mensagem motivacional:*\n`
    mensagem += `${mensagemMotivacional}\n\n`

    // Barra de progresso visual
    const barraProgresso = this.criarBarraProgresso(progresso)
    mensagem += `${barraProgresso}\n\n`

    mensagem += `🚀 Continue firme na jornada!\n`
    mensagem += `📱 *Concursify*`

    return mensagem
  }

  private static contarMaterias(cronograma: CronogramaData): Record<string, number> {
    const materias: Record<string, number> = {}

    cronograma.semanas.forEach(semana => {
      semana.dias.forEach(dia => {
        dia.materias.forEach(materia => {
          materias[materia.nome] = (materias[materia.nome] || 0) + materia.tempo_minutos
        })
      })
    })

    return materias
  }

  private static criarBarraProgresso(progresso: number): string {
    const totalBarras = 10
    const barrasPreenchidas = Math.round((progresso / 100) * totalBarras)
    const barrasVazias = totalBarras - barrasPreenchidas

    return '█'.repeat(barrasPreenchidas) + '░'.repeat(barrasVazias) + ` ${progresso.toFixed(1)}%`
  }

  static gerarMensagemCompartilhamento(
    cronograma: CronogramaData,
    concursoInfo: { titulo: string; orgao: string }
  ): string {
    let mensagem = `🎓 *COMPARTILHANDO MEU CRONOGRAMA DE ESTUDOS* 🎓\n\n`
    mensagem += `🎯 *Concurso:* ${concursoInfo.titulo}\n`
    mensagem += `🏛️ *Órgão:* ${concursoInfo.orgao}\n`
    mensagem += `📅 *Duração:* ${cronograma.duracao_semanas} semanas\n\n`

    // Calcular estatísticas interessantes
    const totalMinutos = cronograma.semanas.reduce((total, semana) => {
      return total + semana.dias.reduce((totalDia, dia) => {
        return totalDia + dia.materias.reduce((totalMateria, materia) => {
          return totalMateria + materia.tempo_minutos
        }, 0)
      }, 0)
    }, 0)

    const totalHoras = Math.round(totalMinutos / 60)
    const horasPorSemana = Math.round(totalHoras / cronograma.duracao_semanas)

    mensagem += `⏰ *Total de estudos:* ${totalHoras} horas\n`
    mensagem += `📊 *Média semanal:* ${horasPorSemana} horas\n\n`

    mensagem += `🚀 Organizando meus estudos com o *Concursify*!\n`
    mensagem += `📱 Baixe também: www.concursify.com.br\n\n`
    mensagem += `#concurso #estudos #concursify #aprovacao`

    return mensagem
  }
}