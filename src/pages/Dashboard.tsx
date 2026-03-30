import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../services/api"

type Intimacao = {
  id?: string
  _id?: string
  titulo?: string
  descricao?: string
  numero_intimacao?: string
  intimado_nome?: string
  motivo?: string
  status: string
  createdAt?: string
  data_intimacao?: string
}

type Agente = {
  id?: string
  _id?: string
  nome: string
  matricula?: string | null
  createdAt?: string
}

function startOfDayISO(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

function getIntimacaoDate(i: Intimacao) {
  return i.createdAt || i.data_intimacao || new Date().toISOString()
}

function getIntimacaoTitulo(i: Intimacao) {
  return i.numero_intimacao || i.titulo || "Intimação sem número"
}

function getIntimacaoDescricao(i: Intimacao) {
  return i.intimado_nome || i.descricao || i.motivo || "Sem descrição"
}

export default function Dashboard() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intimacoes, setIntimacoes] = useState<Intimacao[]>([])
  const [agentes, setAgentes] = useState<Agente[]>([])

  const load = async () => {
    try {
      setLoading(true)
      setError(null)

      const [ints, ags] = await Promise.all([
        api.listarIntimacoes(),
        api.listarAgentes(),
      ])

      setIntimacoes(Array.isArray(ints) ? ints : [])
      setAgentes(Array.isArray(ags) ? ags : [])
    } catch (e: any) {
      console.error(e)
      setError(e?.message ?? "Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const total = intimacoes.length
    const pendentes = intimacoes.filter((i) => i.status === "pendente").length
    const entregues = intimacoes.filter((i) => i.status === "entregue").length
    const cumpridas = intimacoes.filter((i) => i.status === "cumprida").length

    const hojeStart = startOfDayISO(new Date())
    const amanhaStart = hojeStart + 24 * 60 * 60 * 1000

    const hoje = intimacoes.filter((i) => {
      const t = new Date(getIntimacaoDate(i)).getTime()
      return t >= hojeStart && t < amanhaStart
    }).length

    const eficiencia = total > 0 ? ((entregues + cumpridas) / total) * 100 : 0

    return {
      total,
      pendentes,
      entregues,
      cumpridas,
      agentes: agentes.length,
      hoje,
      eficiencia: Number(eficiencia.toFixed(1)),
    }
  }, [intimacoes, agentes])

  const recentes = useMemo(() => {
    return [...intimacoes]
      .sort(
        (a, b) =>
          new Date(getIntimacaoDate(b)).getTime() -
          new Date(getIntimacaoDate(a)).getTime()
      )
      .slice(0, 5)
  }, [intimacoes])

  const ultimos7dias = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      date.setHours(0, 0, 0, 0)

      const next = new Date(date)
      next.setDate(next.getDate() + 1)

      const totalDia = intimacoes.filter((it) => {
        const t = new Date(getIntimacaoDate(it)).getTime()
        return t >= date.getTime() && t < next.getTime()
      }).length

      return {
        label: date.toLocaleDateString("pt-BR", { weekday: "short" }),
        total: totalDia,
      }
    })

    const max = Math.max(0, ...days.map((d) => d.total))
    return { days, max }
  }, [intimacoes])

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-neutral-600">Carregando dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-danger-700">
          Erro: <span className="font-medium">{error}</span>
        </p>
        <button
          onClick={load}
          className="mt-3 rounded-xl px-4 py-2 text-sm bg-primary-700 text-white shadow-sm hover:bg-primary-800"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-600">
            Visão geral do sistema de intimações
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-xl px-4 py-2 text-sm border border-neutral-200 bg-white/90 backdrop-blur-xs shadow-sm hover:bg-neutral-50"
        >
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card
          title="Total"
          value={stats.total}
          onClick={() => navigate("/intimacoes")}
        />
        <Card
          title="Pendentes"
          value={stats.pendentes}
          onClick={() => navigate("/intimacoes?status=pendente")}
        />
        <Card
          title="Entregues"
          value={stats.entregues}
          onClick={() => navigate("/intimacoes?status=entregue")}
        />
        <Card
          title="Cumpridas"
          value={stats.cumpridas}
          onClick={() => navigate("/intimacoes?status=cumprida")}
        />
        <Card
          title="Agentes"
          value={stats.agentes}
          onClick={() => navigate("/agentes")}
        />
        <Card
          title="Hoje"
          value={stats.hoje}
          onClick={() => navigate("/intimacoes?periodo=hoje")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-neutral-200 bg-white/90 backdrop-blur-xs p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Recentes</h2>
            <span className="text-xs text-neutral-500">
              Eficiência: {stats.eficiencia}%
            </span>
          </div>

          <div className="mt-3 divide-y divide-neutral-100">
            {recentes.length === 0 ? (
              <p className="text-sm text-neutral-500 py-6">
                Nenhuma intimação cadastrada ainda.
              </p>
            ) : (
              recentes.map((i) => (
                <div
                  key={i.id || i._id}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-neutral-900">
                      {getIntimacaoTitulo(i)}
                    </p>
                    <p className="text-xs text-neutral-600 truncate">
                      {getIntimacaoDescricao(i)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(getIntimacaoDate(i)).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <StatusPill status={i.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white/90 backdrop-blur-xs p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">
              Últimos 7 dias
            </h2>
            <span className="text-xs text-neutral-500">
              Pico: {ultimos7dias.max}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {ultimos7dias.days.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <div className="w-12 text-xs text-neutral-600">{d.label}</div>

                <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-2 bg-primary-600 transition-all duration-300"
                    style={{
                      width:
                        ultimos7dias.max === 0
                          ? "0%"
                          : `${Math.round((d.total / ultimos7dias.max) * 100)}%`,
                    }}
                  />
                </div>

                <div className="w-8 text-right text-xs text-neutral-700">
                  {d.total}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-neutral-500">
            * Distribuição por dia usando a data de criação.
          </p>
        </div>
      </div>
    </div>
  )
}

function Card({
  title,
  value,
  onClick,
}: {
  title: string
  value: number
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-neutral-200 bg-white/90 backdrop-blur-xs p-4 shadow-sm text-left hover:shadow-md hover:border-primary-200 transition cursor-pointer w-full"
    >
      <p className="text-xs text-neutral-500">{title}</p>
      <p className="text-2xl font-semibold mt-1 text-neutral-900">{value}</p>
    </button>
  )
}

function StatusPill({ status }: { status: string }) {
  const label = status ?? "—"
  const base =
    "text-xs px-2.5 py-1 rounded-full border whitespace-nowrap font-medium"

  const cls =
    status === "pendente"
      ? "bg-warning-50 border-warning-200 text-warning-800"
      : status === "entregue"
      ? "bg-secondary-50 border-secondary-200 text-secondary-800"
      : status === "cumprida"
      ? "bg-success-50 border-success-200 text-success-800"
      : "bg-neutral-50 border-neutral-200 text-neutral-700"

  return <span className={`${base} ${cls}`}>{label}</span>
}