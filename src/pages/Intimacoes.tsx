import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Plus, Eye, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { api } from '../services/api'

import {
  STATUS_INTIMACAO,
  MOTIVO_INTIMACAO,
  StatusKey,
  MotivoKey
} from '../constants/intimacoes'

interface Intimacao {
  id?: string
  _id?: string
  numero_intimacao: string
  intimado_nome: string
  intimado_cpf: string
  motivo: string
  status: string
  data_intimacao: string
  data_comparecimento?: string
  agenteId?: string
  agente_id?: string
}

interface Agente {
  id?: string
  _id?: string
  nome: string
  matricula: string
}

const Intimacoes: React.FC = () => {
  const [intimacoes, setIntimacoes] = useState<Intimacao[]>([])
  const [agentes, setAgentes] = useState<Agente[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [motivoFilter, setMotivoFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setLoading(true)

      const [listaIntimacoes, listaAgentes] = await Promise.all([
        api.listarIntimacoes(),
        api.listarAgentes()
      ])

      setIntimacoes(Array.isArray(listaIntimacoes) ? listaIntimacoes : [])
      setAgentes(Array.isArray(listaAgentes) ? listaAgentes : [])
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  function getIntimacaoId(i: Intimacao) {
    return i.id || i._id || ''
  }

  function getAgenteField(i: Intimacao) {
    return i.agenteId || i.agente_id || ''
  }

  function getAgenteName(id: string) {
    const ag = agentes.find(a => (a.id || a._id) === id)
    return ag?.nome || 'Não encontrado'
  }

  async function deleteIntimacao(id: string) {
    if (!confirm('Deseja excluir esta intimação?')) return

    try {
      await api.deletarIntimacao(id)
      setIntimacoes(prev => prev.filter(i => getIntimacaoId(i) !== id))
      toast.success('Excluída com sucesso')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao excluir')
    }
  }

  const filtered = intimacoes.filter(i => {
    const matchSearch =
      (i.numero_intimacao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.intimado_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.intimado_cpf || '').includes(searchTerm)

    const matchStatus = !statusFilter || i.status === statusFilter
    const matchMotivo = !motivoFilter || i.motivo === motivoFilter

    return matchSearch && matchStatus && matchMotivo
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Intimações</h2>
          <p className="text-sm text-gray-500">Gerenciar intimações</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 border rounded-md flex items-center text-sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>

          <Link
            to="/intimacoes/nova"
            className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova
          </Link>
        </div>
      </div>

      <input
        placeholder="Buscar..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full border rounded-md p-2"
      />

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg grid md:grid-cols-3 gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="">Todos status</option>
            {Object.entries(STATUS_INTIMACAO).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          <select
            value={motivoFilter}
            onChange={e => setMotivoFilter(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="">Todos motivos</option>
            {Object.entries(MOTIVO_INTIMACAO).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setStatusFilter('')
              setMotivoFilter('')
              setSearchTerm('')
            }}
            className="bg-gray-200 rounded-md"
          >
            Limpar
          </button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Número</th>
              <th className="p-3 text-left">Intimado</th>
              <th className="p-3 text-left">Motivo</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Agente</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-10 text-gray-500">
                  Nenhuma encontrada
                </td>
              </tr>
            ) : (
              filtered.map(i => {
                const statusInfo =
                  STATUS_INTIMACAO[i.status as StatusKey] || {
                    label: i.status,
                    color: 'bg-gray-100 text-gray-600'
                  }

                const intimacaoId = getIntimacaoId(i)

                return (
                  <tr key={intimacaoId} className="border-t">
                    <td className="p-3 font-medium">{i.numero_intimacao}</td>

                    <td className="p-3">
                      {i.intimado_nome}
                      <div className="text-gray-500 text-xs">
                        {i.intimado_cpf}
                      </div>
                    </td>

                    <td className="p-3">
                      {MOTIVO_INTIMACAO[i.motivo as MotivoKey] || i.motivo}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>

                    <td className="p-3">
                      {format(new Date(i.data_intimacao), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>

                    <td className="p-3">
                      {getAgenteName(getAgenteField(i))}
                    </td>

                    <td className="p-3 text-right flex justify-end gap-2">
                      <Link to={`/intimacoes/${intimacaoId}`} className="text-blue-600">
                        <Eye size={18} />
                      </Link>

                      <button
                        onClick={() => deleteIntimacao(intimacaoId)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Intimacoes