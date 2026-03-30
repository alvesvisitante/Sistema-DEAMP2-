import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Save,
  User,
  MapPin,
  Phone
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { api } from '../services/api'

interface Intimacao {
  id?: string
  _id?: string
  numero_intimacao: string
  agenteId?: string
  agente_id?: string
  intimado_nome: string
  intimado_cpf: string
  intimado_endereco: string
  intimado_telefone: string
  motivo: string
  descricao_motivo: string
  data_intimacao: string
  data_comparecimento?: string
  local_comparecimento: string
  status: string
  observacoes: string
  documentos?: string[]
  data_entrega?: string
  responsavel_recebimento?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

interface Agente {
  id?: string
  _id?: string
  nome: string
  matricula: string
  cargo?: string
}

const DetalhesIntimacao: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [intimacao, setIntimacao] = useState<Intimacao | null>(null)
  const [agente, setAgente] = useState<Agente | null>(null)
  const [loading, setLoading] = useState(true)

  const [editingStatus, setEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusObservation, setStatusObservation] = useState('')
  const [responsavelRecebimento, setResponsavelRecebimento] = useState('')

  function getIntimacaoId(item: Intimacao) {
    return item.id || item._id || ''
  }

  function getAgenteId(item: Agente) {
    return item.id || item._id || ''
  }

  function getAgenteField(item: Intimacao) {
    return item.agenteId || item.agente_id || ''
  }

  function getCreatedDate(item: Intimacao) {
    return item.createdAt || item.created_at || ''
  }

  useEffect(() => {
    if (id) carregarDados(id)
  }, [id])

  async function carregarDados(intimacaoId: string) {
    try {
      setLoading(true)

      const data = await api.buscarIntimacao(intimacaoId)
      setIntimacao(data)
      setNewStatus(data.status || 'pendente')

      const agenteRef = data.agenteId || data.agente_id

      if (agenteRef) {
        const agentes = await api.listarAgentes()
        const encontrado = agentes.find((a: Agente) => getAgenteId(a) === agenteRef)
        setAgente(encontrado || null)
      } else {
        setAgente(null)
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar intimação')
      navigate('/intimacoes')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus() {
    if (!intimacao) return

    try {
      const payload: Record<string, any> = {
        status: newStatus
      }

      if (newStatus === 'entregue') {
        payload.data_entrega = new Date().toISOString()

        if (responsavelRecebimento.trim()) {
          payload.responsavel_recebimento = responsavelRecebimento
        }
      }

      if (statusObservation.trim()) {
        payload.observacoes = intimacao.observacoes
          ? `${intimacao.observacoes}\n\n[${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}] ${statusObservation}`
          : `[${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}] ${statusObservation}`
      }

      const atualizado = await api.atualizarIntimacao(getIntimacaoId(intimacao), payload)

      setIntimacao(atualizado)
      setEditingStatus(false)
      setStatusObservation('')
      setResponsavelRecebimento('')

      toast.success('Status atualizado')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao atualizar status')
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pendente':
        return 'text-yellow-600 bg-yellow-100'
      case 'entregue':
        return 'text-blue-600 bg-blue-100'
      case 'nao_localizado':
        return 'text-red-600 bg-red-100'
      case 'cumprida':
        return 'text-green-600 bg-green-100'
      case 'recusada':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  function getStatusText(status: string) {
    return {
      pendente: 'Pendente',
      entregue: 'Entregue',
      nao_localizado: 'Não Localizado',
      cumprida: 'Cumprida',
      recusada: 'Recusada'
    }[status] || status
  }

  function getMotivoText(motivo: string) {
    return {
      depoimento: 'Depoimento',
      audiencia: 'Audiência',
      reconhecimento: 'Reconhecimento',
      outros: 'Outros'
    }[motivo] || motivo
  }

  function formatCPF(cpf: string) {
    return cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || '-'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
      </div>
    )
  }

  if (!intimacao) {
    return <p className="text-center text-gray-500">Intimação não encontrada</p>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/intimacoes')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-3"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Voltar
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              Intimação {intimacao.numero_intimacao}
            </h2>

            {getCreatedDate(intimacao) && (
              <p className="text-sm text-gray-500">
                Criada em{' '}
                {format(new Date(getCreatedDate(intimacao)), 'dd/MM/yyyy HH:mm', {
                  locale: ptBR
                })}
              </p>
            )}
          </div>

          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(intimacao.status)}`}>
            {getStatusText(intimacao.status)}
          </span>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Dados do Intimado</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-500 text-sm">Nome</label>
            <p>{intimacao.intimado_nome}</p>
          </div>

          <div>
            <label className="text-gray-500 text-sm">CPF</label>
            <p>{formatCPF(intimacao.intimado_cpf)}</p>
          </div>

          {intimacao.intimado_telefone && (
            <div>
              <label className="text-gray-500 text-sm">Telefone</label>
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {intimacao.intimado_telefone}
              </p>
            </div>
          )}

          {intimacao.intimado_endereco && (
            <div className="md:col-span-2">
              <label className="text-gray-500 text-sm">Endereço</label>
              <p className="flex">
                <MapPin className="h-4 w-4 mr-1" />
                {intimacao.intimado_endereco}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Informações da Intimação</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-500 text-sm">Motivo</label>
            <p>{getMotivoText(intimacao.motivo)}</p>
          </div>

          {intimacao.data_intimacao && (
            <div>
              <label className="text-gray-500 text-sm">Data da Intimação</label>
              <p>
                {format(new Date(intimacao.data_intimacao), 'dd/MM/yyyy HH:mm', {
                  locale: ptBR
                })}
              </p>
            </div>
          )}

          {intimacao.data_comparecimento && (
            <div>
              <label className="text-gray-500 text-sm">Data do Comparecimento</label>
              <p>
                {format(new Date(intimacao.data_comparecimento), 'dd/MM/yyyy HH:mm', {
                  locale: ptBR
                })}
              </p>
            </div>
          )}

          {intimacao.local_comparecimento && (
            <div>
              <label className="text-gray-500 text-sm">Local do Comparecimento</label>
              <p>{intimacao.local_comparecimento}</p>
            </div>
          )}

          {intimacao.descricao_motivo && (
            <div className="md:col-span-2">
              <label className="text-gray-500 text-sm">Descrição do Motivo</label>
              <p>{intimacao.descricao_motivo}</p>
            </div>
          )}

          {intimacao.observacoes && (
            <div className="md:col-span-2">
              <label className="text-gray-500 text-sm">Observações</label>
              <p className="whitespace-pre-line">{intimacao.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Status</h3>

        {!editingStatus ? (
          <>
            <p className={`inline-block px-3 py-1 rounded-full ${getStatusColor(intimacao.status)}`}>
              {getStatusText(intimacao.status)}
            </p>

            <div className="mt-4">
              <button
                onClick={() => setEditingStatus(true)}
                className="flex items-center px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Alterar Status
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="border rounded-md p-2 w-full"
            >
              <option value="pendente">Pendente</option>
              <option value="entregue">Entregue</option>
              <option value="nao_localizado">Não localizado</option>
              <option value="cumprida">Cumprida</option>
              <option value="recusada">Recusada</option>
            </select>

            {newStatus === 'entregue' && (
              <input
                placeholder="Quem recebeu?"
                value={responsavelRecebimento}
                onChange={e => setResponsavelRecebimento(e.target.value)}
                className="border rounded-md p-2 w-full"
              />
            )}

            <textarea
              placeholder="Observação..."
              value={statusObservation}
              onChange={e => setStatusObservation(e.target.value)}
              className="border rounded-md p-2 w-full"
            />

            <div className="flex gap-2">
              <button
                onClick={updateStatus}
                className="bg-blue-600 text-white px-3 py-2 rounded-md flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </button>

              <button
                onClick={() => setEditingStatus(false)}
                className="border px-3 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {agente && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-semibold mb-3">Agente Responsável</h3>

          <p className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            {agente.nome} {agente.cargo ? `— ${agente.cargo}` : ''}
          </p>

          <p className="text-sm text-gray-500">
            Matrícula: {agente.matricula}
          </p>
        </div>
      )}
    </div>
  )
}

export default DetalhesIntimacao