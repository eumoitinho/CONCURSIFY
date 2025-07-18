import { CronogramaData } from '@/lib/ai/gemini'

export class CalendarExport {
  static gerarEventosICS(
    cronograma: CronogramaData,
    concursoInfo: { titulo: string; orgao: string; data_prova?: string },
    dataInicio: Date = new Date()
  ): string {
    const events: string[] = []
    
    // Cabeçalho do arquivo ICS
    const header = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Concursify//Cronograma de Estudos//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ]

    // Gerar eventos para cada dia de estudo
    cronograma.semanas.forEach((semana, semanaIndex) => {
      semana.dias.forEach(dia => {
        // Calcular data do evento
        const dataEvento = new Date(dataInicio)
        dataEvento.setDate(dataInicio.getDate() + (semanaIndex * 7) + dia.dia)

        dia.materias.forEach((materia, materiaIndex) => {
          // Calcular horário (distribuir ao longo do dia)
          const horaInicio = 8 + (materiaIndex * 2) // Começar às 8h, 2h de intervalo
          const minutoInicio = 0
          const duracaoMinutos = materia.tempo_minutos

          const eventStart = new Date(dataEvento)
          eventStart.setHours(horaInicio, minutoInicio, 0, 0)

          const eventEnd = new Date(eventStart)
          eventEnd.setMinutes(eventEnd.getMinutes() + duracaoMinutos)

          // Gerar ID único para o evento
          const eventId = `${semanaIndex}-${dia.dia}-${materiaIndex}-${Date.now()}@concursify.com`

          // Criar evento ICS
          const event = [
            'BEGIN:VEVENT',
            `UID:${eventId}`,
            `DTSTART:${this.formatDateForICS(eventStart)}`,
            `DTEND:${this.formatDateForICS(eventEnd)}`,
            `SUMMARY:${materia.nome} - ${concursoInfo.titulo}`,
            `DESCRIPTION:${this.createEventDescription(materia, semana, concursoInfo)}`,
            `LOCATION:Local de Estudo`,
            `CATEGORIES:Estudo,Concurso,${materia.nome}`,
            `STATUS:CONFIRMED`,
            `TRANSP:OPAQUE`,
            `PRIORITY:5`,
            'END:VEVENT'
          ]

          events.push(event.join('\r\n'))
        })
      })
    })

    // Adicionar evento da prova se disponível
    if (concursoInfo.data_prova) {
      const dataProva = new Date(concursoInfo.data_prova)
      dataProva.setHours(9, 0, 0, 0) // Assumir 9h como horário padrão

      const provaEvent = [
        'BEGIN:VEVENT',
        `UID:prova-${Date.now()}@concursify.com`,
        `DTSTART:${this.formatDateForICS(dataProva)}`,
        `DTEND:${this.formatDateForICS(new Date(dataProva.getTime() + 4 * 60 * 60 * 1000))}`, // 4h de duração
        `SUMMARY:PROVA: ${concursoInfo.titulo}`,
        `DESCRIPTION:Prova do concurso ${concursoInfo.titulo} - ${concursoInfo.orgao}`,
        `LOCATION:Local da Prova`,
        `CATEGORIES:Prova,Concurso`,
        `STATUS:CONFIRMED`,
        `PRIORITY:9`,
        'END:VEVENT'
      ]

      events.push(provaEvent.join('\r\n'))
    }

    // Montar arquivo completo
    const footer = ['END:VCALENDAR']
    
    return [
      ...header,
      ...events,
      ...footer
    ].join('\r\n')
  }

  static gerarLinkGoogleCalendar(
    cronograma: CronogramaData,
    concursoInfo: { titulo: string; orgao: string; data_prova?: string }
  ): string[] {
    const links: string[] = []

    // Para cada semana, criar um link para adicionar todos os eventos da semana
    cronograma.semanas.forEach((semana, semanaIndex) => {
      const dataInicio = new Date()
      dataInicio.setDate(dataInicio.getDate() + (semanaIndex * 7))

      semana.dias.forEach(dia => {
        dia.materias.forEach((materia, materiaIndex) => {
          const dataEvento = new Date(dataInicio)
          dataEvento.setDate(dataInicio.getDate() + dia.dia)
          dataEvento.setHours(8 + (materiaIndex * 2), 0, 0, 0)

          const dataFim = new Date(dataEvento)
          dataFim.setMinutes(dataFim.getMinutes() + materia.tempo_minutos)

          const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: `${materia.nome} - ${concursoInfo.titulo}`,
            dates: `${this.formatDateForGoogle(dataEvento)}/${this.formatDateForGoogle(dataFim)}`,
            details: this.createEventDescription(materia, semana, concursoInfo),
            location: 'Local de Estudo',
            ctz: 'America/Sao_Paulo'
          })

          links.push(`https://calendar.google.com/calendar/render?${params.toString()}`)
        })
      })
    })

    return links
  }

  private static formatDateForICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  private static formatDateForGoogle(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  private static createEventDescription(
    materia: any,
    semana: any,
    concursoInfo: { titulo: string; orgao: string }
  ): string {
    const description = [
      `Cronograma de estudos para ${concursoInfo.titulo}`,
      `Órgão: ${concursoInfo.orgao}`,
      ``,
      `Semana ${semana.numero}: ${semana.tema}`,
      `Matéria: ${materia.nome}`,
      `Tipo: ${materia.tipo}`,
      `Dificuldade: ${materia.dificuldade}`,
      `Duração: ${materia.tempo_minutos} minutos`,
      ``,
      `Tópicos a estudar:`,
      ...materia.topicos.map((topico: string) => `- ${topico}`),
      ``,
      `Gerado pelo Concursify - www.concursify.com.br`
    ]

    return description.join('\\n')
  }

  static criarEventoUnico(
    titulo: string,
    descricao: string,
    dataInicio: Date,
    duracaoMinutos: number,
    local: string = 'Local de Estudo'
  ): { ics: string; googleLink: string } {
    const dataFim = new Date(dataInicio)
    dataFim.setMinutes(dataFim.getMinutes() + duracaoMinutos)

    // ICS
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Concursify//Evento de Estudo//PT',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@concursify.com`,
      `DTSTART:${this.formatDateForICS(dataInicio)}`,
      `DTEND:${this.formatDateForICS(dataFim)}`,
      `SUMMARY:${titulo}`,
      `DESCRIPTION:${descricao}`,
      `LOCATION:${local}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    // Google Calendar Link
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: titulo,
      dates: `${this.formatDateForGoogle(dataInicio)}/${this.formatDateForGoogle(dataFim)}`,
      details: descricao,
      location: local,
      ctz: 'America/Sao_Paulo'
    })

    const googleLink = `https://calendar.google.com/calendar/render?${params.toString()}`

    return { ics, googleLink }
  }
}