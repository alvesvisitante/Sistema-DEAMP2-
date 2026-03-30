import React, { useEffect, useState } from 'react'
import { Search, Edit, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { api } from '../services/api'

interface Agente {
  _id?: string
  id?: string
  matricula: string
  nome: string
  cargo: string
  cpf: string
  telefone: string
  email: string
  status: string
  data_admissao: string
  created_at?: string
}

const Agentes: React.FC = () => {
  const [agentes, setAgentes] = useState<Agente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAgente, setEditingAgente] = useState<Agente | null>(null)

  const [formData, setFormData] = useState({
    matricula: '',
    nome: '',
    cargo: '',
    cpf: '',
    telefone: '',
    email: '',
    status: 'ativo',
    data_admissao: ''
  })

  useEffect(() => {
    fetchAgentes()
  }, [])

  const getAgenteId = (agente: Agente) => agente._id || agente.id || ''

  const normalizeDateForInput = (value?: string) => {
    if (!value) return ''

    if (value.includes('T')) {
      return value.split('T')[0]
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value
    }

    return ''
  }

  const fetchAgentes = async () => {
    try {
      setLoading(true)
      const data = await api.listarAgentes()
      setAgentes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erro ao carregar agentes:', err)
      toast.error('Erro ao carregar agentes')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      matricula: '',
      nome: '',
      cargo: '',
      cpf: '',
      telefone: '',
      email: '',
      status: 'ativo',
      data_admissao: ''
    })
    setEditingAgente(null)
    setShowForm(false)
  }

  const handleEdit = (agente: Agente) => {
    setFormData({
      matricula: agente.matricula || '',
      nome: agente.nome || '',
      cargo: agente.cargo || '',
      cpf: agente.cpf || '',
      telefone: agente.telefone || '',
      email: agente.email || '',
      status: agente.status || 'ativo',
      data_admissao: normalizeDateForInput(agente.data_admissao)
    })

    setEditingAgente(agente)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.matricula || !formData.cargo) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    const payload = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, '')
    }

    try {
      if (editingAgente) {
        const agenteId = getAgenteId(editingAgente)

        if (!agenteId) {
          toast.error('ID do agente não encontrado')
          return
        }

        await api.atualizarAgente(agenteId, payload)
        toast.success('Atualizado com sucesso')
      } else {
        await api.criarAgente(payload)
        toast.success('Criado com sucesso')
      }

      await fetchAgentes()
      resetForm()
    } catch (err) {
      console.error('Erro detalhado ao salvar agente:', err)
      toast.error('Erro ao salvar')
    }
  }

  const deleteAgente = async (id: string) => {
    if (!confirm('Excluir agente?')) return

    try {
      await api.deletarAgente(id)
      toast.success('Agente excluído com sucesso')
      await fetchAgentes()
    } catch (err) {
      console.error('Erro ao excluir agente:', err)
      toast.error('Erro ao excluir agente')
    }
  }

  const filtered = agentes.filter((a) =>
    (a.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.matricula || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.cargo || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-20">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Agentes</h2>
          <p className="text-sm text-gray-500">Gerenciar agentes</p>
        </div>

        <button
          onClick={() => {
            setEditingAgente(null)
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} />
          Novo
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 pl-10 rounded w-full"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border rounded p-6 text-center text-gray-500 bg-white shadow">
          Nenhum agente encontrado
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => {
            const agenteId = getAgenteId(a)

                return (
      <div key={agenteId} className="border rounded p-4 shadow bg-white">
        <h3 className="font-bold text-lg mb-3">{a.nome}</h3>

        <div className="space-y-1 text-sm text-gray-700">
          <p>
            <strong>Matrícula:</strong> {a.matricula || '-'}
          </p>
          <p>
            <strong>Cargo:</strong> {a.cargo || '-'}
          </p>
          <p>
            <strong>CPF:</strong> {a.cpf || '-'}
          </p>
          <p>
            <strong>Telefone:</strong> {a.telefone || '-'}
          </p>
          <p>
            <strong>Email:</strong> {a.email || '-'}
          </p>
          <p>
            <strong>Status:</strong> {a.status || '-'}
          </p>
          <p>
            <strong>Data de admissão:</strong>{' '}
            {a.data_admissao
              ? format(new Date(a.data_admissao), 'dd/MM/yyyy', {
                  locale: ptBR
                })
              : '-'}
          </p>
        </div>

                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(a)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Edit size={16} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteAgente(agenteId)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg space-y-3 w-full max-w-md shadow-lg"
          >
            <h3 className="text-lg font-bold">
              {editingAgente ? 'Editar agente' : 'Novo agente'}
            </h3>

            <input
              className="w-full border rounded p-2"
              placeholder="Nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
            />

            <input
              className="w-full border rounded p-2"
              placeholder="Matrícula"
              value={formData.matricula}
              onChange={(e) =>
                setFormData({ ...formData, matricula: e.target.value })
              }
            />

            <input
              className="w-full border rounded p-2"
              placeholder="Cargo"
              value={formData.cargo}
              onChange={(e) =>
                setFormData({ ...formData, cargo: e.target.value })
              }
            />

            <input
              className="w-full border rounded p-2"
              placeholder="CPF"
              value={formData.cpf}
              onChange={(e) =>
                setFormData({ ...formData, cpf: e.target.value })
              }
            />

            <input
              className="w-full border rounded p-2"
              placeholder="Telefone"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({ ...formData, telefone: e.target.value })
              }
            />

            <input
              className="w-full border rounded p-2"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <select
              className="w-full border rounded p-2"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>

            <input
              type="date"
              className="w-full border rounded p-2"
              value={formData.data_admissao}
              onChange={(e) =>
                setFormData({ ...formData, data_admissao: e.target.value })
              }
            />

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded w-full"
              >
                Salvar
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="border p-2 rounded w-full"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Agentes