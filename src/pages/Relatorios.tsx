import { useEffect, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { api } from '../services/api'

interface Intimacao {
  id?: string
  _id?: string
  agenteId?: string
  agente_id?: string
  status: string
  motivo: string
  data_intimacao?: string
  createdAt?: string
  created_at?: string
  numero_intimacao?: string
  intimado_nome?: string
  intimado_cpf?: string
}

interface Agente {
  id?: string
  _id?: string
  nome: string
}

interface RelatorioData {
  totalIntimacoes: number
  pendentes: number
  entregues: number
  naoLocalizados: number
  cumpridas: number
  recusadas: number
  porAgente: Record<string, number>
  porMotivo: Record<string, number>
  porMes: Record<string, number>
}

const Relatorios = () => {
  const [data, setData] = useState<RelatorioData>({
    totalIntimacoes: 0,
    pendentes: 0,
    entregues: 0,
    naoLocalizados: 0,
    cumpridas: 0,
    recusadas: 0,
    porAgente: {},
    porMotivo: {},
    porMes: {}
  })

  const [intimacoesFiltradas, setIntimacoesFiltradas] = useState<Intimacao[]>([])
  const [loading, setLoading] = useState(true)

  const [dateRange, setDateRange] = useState({
    inicio: '2024-01-01',
    fim: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    fetchRelatorioData()
  }, [dateRange])

  function getAgenteId(agente: Agente) {
    return agente.id || agente._id || ''
  }

  function getAgenteField(intimacao: Intimacao) {
    return intimacao.agenteId || intimacao.agente_id || ''
  }

  function getDataBase(intimacao: Intimacao) {
    return intimacao.data_intimacao || intimacao.createdAt || intimacao.created_at || ''
  }

  function getMotivoText(m: string) {
    const map: Record<string, string> = {
      depoimento: 'Depoimento',
      audiencia: 'Audiência',
      reconhecimento: 'Reconhecimento',
      outros: 'Outros'
    }
    return map[m] || m
  }

  const fetchRelatorioData = async () => {
    setLoading(true)

    try {
      const [intimacoesRes, agentesRes] = await Promise.all([
        api.listarIntimacoes(),
        api.listarAgentes()
      ])

      const intimacoes: Intimacao[] = Array.isArray(intimacoesRes) ? intimacoesRes : []
      const agentesData: Agente[] = Array.isArray(agentesRes) ? agentesRes : []

      const inicio = new Date(`${dateRange.inicio}T00:00:00`)
      const fim = new Date(`${dateRange.fim}T23:59:59.999`)

      const filtradas: Intimacao[] = intimacoes.filter((i) => {
        const dataBase = getDataBase(i)
        if (!dataBase) return false

        const d = new Date(dataBase)
        if (Number.isNaN(d.getTime())) return false

        return d >= inicio && d <= fim
      })

      setIntimacoesFiltradas(filtradas)

      const rel: RelatorioData = {
        totalIntimacoes: filtradas.length,
        pendentes: filtradas.filter(i => i.status === 'pendente').length,
        entregues: filtradas.filter(i => i.status === 'entregue').length,
        naoLocalizados: filtradas.filter(i => i.status === 'nao_localizado').length,
        cumpridas: filtradas.filter(i => i.status === 'cumprida').length,
        recusadas: filtradas.filter(i => i.status === 'recusada').length,
        porAgente: {},
        porMotivo: {},
        porMes: {}
      }

      filtradas.forEach(i => {
        const agente = agentesData.find(a => getAgenteId(a) === getAgenteField(i))
        const nome = agente ? agente.nome : 'Desconhecido'

        rel.porAgente[nome] = (rel.porAgente[nome] || 0) + 1

        const motivo = getMotivoText(i.motivo)
        rel.porMotivo[motivo] = (rel.porMotivo[motivo] || 0) + 1

        const dataBase = getDataBase(i)
        if (dataBase) {
          const mes = format(new Date(dataBase), 'MM/yyyy', { locale: ptBR })
          rel.porMes[mes] = (rel.porMes[mes] || 0) + 1
        }
      })

      setData(rel)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar relatórios')
    } finally {
      setLoading(false)
    }
  }

  const exportar = () => {
    try {
      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text('Relatório de Intimações', 14, 18)

      doc.setFontSize(11)
      doc.text(`Período: ${dateRange.inicio} até ${dateRange.fim}`, 14, 26)

      autoTable(doc, {
        startY: 34,
        head: [['Resumo', 'Quantidade']],
        body: [
          ['Total', String(data.totalIntimacoes)],
          ['Pendentes', String(data.pendentes)],
          ['Entregues', String(data.entregues)],
          ['Cumpridas', String(data.cumpridas)],
          ['Não Localizados', String(data.naoLocalizados)],
          ['Recusadas', String(data.recusadas)],
        ],
      })

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Por Agente', 'Quantidade']],
        body:
          Object.keys(data.porAgente).length > 0
            ? Object.entries(data.porAgente).map(([nome, total]) => [nome, String(total)])
            : [['Sem dados', '0']],
      })

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Por Motivo', 'Quantidade']],
        body:
          Object.keys(data.porMotivo).length > 0
            ? Object.entries(data.porMotivo).map(([motivo, total]) => [motivo, String(total)])
            : [['Sem dados', '0']],
      })

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Por Mês', 'Quantidade']],
        body:
          Object.keys(data.porMes).length > 0
            ? Object.entries(data.porMes).map(([mes, total]) => [mes, String(total)])
            : [['Sem dados', '0']],
      })

      if (intimacoesFiltradas.length > 0) {
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 10,
          head: [['Número', 'Intimado', 'Motivo', 'Status', 'Data']],
          body: intimacoesFiltradas.map((i) => [
            i.numero_intimacao || '-',
            i.intimado_nome || '-',
            getMotivoText(i.motivo),
            i.status || '-',
            getDataBase(i)
              ? format(new Date(getDataBase(i)), 'dd/MM/yyyy', { locale: ptBR })
              : '-',
          ]),
        })
      }

      doc.save(`relatorio-${dateRange.inicio}-a-${dateRange.fim}.pdf`)
      toast.success('PDF exportado com sucesso')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar PDF')
    }
  }

  if (loading) {
    return <div className="text-center p-10">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Relatórios</h2>
          <p className="text-sm text-gray-500">Resumo e distribuição das intimações</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-2"
          >
            <Printer size={16} />
            Imprimir
          </button>

          <button
            onClick={exportar}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={16} />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Data inicial</label>
            <input
              type="date"
              value={dateRange.inicio}
              onChange={e => setDateRange(prev => ({ ...prev, inicio: e.target.value }))}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Data final</label>
            <input
              type="date"
              value={dateRange.fim}
              onChange={e => setDateRange(prev => ({ ...prev, fim: e.target.value }))}
              className="w-full border rounded p-2"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          ['Total', data.totalIntimacoes],
          ['Pendentes', data.pendentes],
          ['Entregues', data.entregues],
          ['Cumpridas', data.cumpridas],
          ['Não Localizados', data.naoLocalizados],
          ['Recusadas', data.recusadas],
        ].map(([label, val]) => (
          <div key={label as string} className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold">{val}</p>
          </div>
        ))}
      </div>

      <Section title="Por Agente" data={data.porAgente} />
      <Section title="Por Motivo" data={data.porMotivo} />
      <Section title="Por Mês" data={data.porMes} />

      <div className="bg-white p-5 rounded shadow">
        <h3 className="font-semibold mb-1">Intimações do período</h3>
        <p className="text-sm text-gray-500 mb-4">
          Período selecionado: {format(new Date(dateRange.inicio), 'dd/MM/yyyy')} até {format(new Date(dateRange.fim), 'dd/MM/yyyy')}
        </p>

        {intimacoesFiltradas.length === 0 ? (
          <p className="text-gray-400">Nenhuma intimação encontrada no período selecionado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Número</th>
                  <th className="p-3 text-left">Intimado</th>
                  <th className="p-3 text-left">Motivo</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {intimacoesFiltradas.map((i, idx) => (
                  <tr key={i.id || i._id || idx} className="border-t">
                    <td className="p-3">{i.numero_intimacao || '-'}</td>
                    <td className="p-3">{i.intimado_nome || '-'}</td>
                    <td className="p-3">{getMotivoText(i.motivo)}</td>
                    <td className="p-3">{i.status}</td>
                    <td className="p-3">
                      {getDataBase(i)
                        ? format(new Date(getDataBase(i)), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const Section = ({ title, data }: { title: string; data: Record<string, number> }) => {
  const max = Math.max(...Object.values(data), 1)

  return (
    <div className="bg-white p-5 rounded shadow">
      <h3 className="font-semibold mb-4">{title}</h3>

      {Object.keys(data).length === 0 ? (
        <p className="text-gray-400">Sem dados</p>
      ) : (
        Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => (
            <div key={k} className="mb-3">
              <div className="flex justify-between text-sm">
                <span>{k}</span>
                <span>{v}</span>
              </div>
              <div className="bg-gray-200 h-2 rounded">
                <div
                  className="bg-blue-600 h-2 rounded"
                  style={{ width: `${(v / max) * 100}%` }}
                />
              </div>
            </div>
          ))
      )}
    </div>
  )
}

export default Relatorios