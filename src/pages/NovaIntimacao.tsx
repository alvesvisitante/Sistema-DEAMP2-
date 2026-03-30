import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Save, Upload, X, FileText } from "lucide-react"
import toast from "react-hot-toast"
import { api } from "../services/api"

interface Agente {
  id: string
  _id?: string
  nome: string
  matricula: string
  cargo?: string
}

interface NovaIntimacaoResponse {
  id?: string
  _id?: string
}

interface FormDataType {
  numero_intimacao: string
  agente_id: string
  intimado_nome: string
  intimado_cpf: string
  intimado_endereco: string
  intimado_telefone: string
  motivo: string
  descricao_motivo: string
  data_intimacao: string
  data_comparecimento: string
  local_comparecimento: string
  observacoes: string
  status: string
}

const NovaIntimacao: React.FC = () => {
  const navigate = useNavigate()

  const [agentes, setAgentes] = useState<Agente[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingDocs, setUploadingDocs] = useState(false)
  const [documentos, setDocumentos] = useState<string[]>([])

  const [formData, setFormData] = useState<FormDataType>({
    numero_intimacao: "",
    agente_id: "",
    intimado_nome: "",
    intimado_cpf: "",
    intimado_endereco: "",
    intimado_telefone: "",
    motivo: "",
    descricao_motivo: "",
    data_intimacao: "",
    data_comparecimento: "",
    local_comparecimento: "DEAM Pedro II",
    observacoes: "",
    status: "pendente",
  })

  useEffect(() => {
    fetchAgentes()
    generateNumeroIntimacao()
  }, [])

  const fetchAgentes = async () => {
    try {
      const data = await api.listarAgentes()
      setAgentes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erro ao carregar agentes:", error)
      toast.error("Erro ao carregar agentes")
    }
  }

  const generateNumeroIntimacao = () => {
    const now = new Date()
    const numero = `INT-${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(
      now.getTime()
    ).slice(-4)}`

    setFormData((prev) => ({
      ...prev,
      numero_intimacao: numero,
    }))
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const formatCPF = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 11)
  }

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 11)
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingDocs(true)

    try {
      const promises = Array.from(files).map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error("Erro ao ler arquivo"))
          reader.readAsDataURL(file)
        })
      })

      const results = await Promise.all(promises)
      setDocumentos((prev) => [...prev, ...results])
      toast.success("Arquivos anexados com sucesso")
    } catch (error) {
      console.error("Erro ao anexar arquivos:", error)
      toast.error("Erro ao anexar arquivos")
    } finally {
      setUploadingDocs(false)
    }
  }

  const removeDocument = (docUrl: string) => {
    setDocumentos((prev) => prev.filter((url) => url !== docUrl))
  }

  const validateForm = () => {
    if (!formData.numero_intimacao.trim()) {
      toast.error("Número da intimação é obrigatório")
      return false
    }

    if (!formData.agente_id) {
      toast.error("Selecione um agente")
      return false
    }

    if (!formData.intimado_nome.trim()) {
      toast.error("Nome do intimado é obrigatório")
      return false
    }

    if (formData.intimado_cpf && formData.intimado_cpf.length !== 11) {
      toast.error("CPF inválido")
      return false
    }

    if (!formData.motivo) {
      toast.error("Motivo é obrigatório")
      return false
    }

    if (!formData.data_intimacao) {
      toast.error("Data da intimação é obrigatória")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    try {
      const payload = {
        ...formData,
        intimado_cpf: formatCPF(formData.intimado_cpf),
        intimado_telefone: formatPhone(formData.intimado_telefone),
        documentos,
      }

      const nova: NovaIntimacaoResponse = await api.criarIntimacao(payload)

      toast.success("Intimação criada com sucesso!")

      const intimacaoId = nova.id || nova._id

      if (intimacaoId) {
        navigate(`/intimacoes/${intimacaoId}`)
      } else {
        navigate("/intimacoes")
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      toast.error("Erro ao salvar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
        Nova Intimação
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-neutral-600 mb-1">
              Número da Intimação
            </label>
            <input
              name="numero_intimacao"
              value={formData.numero_intimacao}
              onChange={handleInputChange}
              readOnly
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm focus:outline-none"
              placeholder="Número"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-600 mb-1">
              Agente Responsável
            </label>
            <select
              name="agente_id"
              value={formData.agente_id}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecione um agente</option>
              {agentes.map((agente) => (
                <option
                  key={agente.id || agente._id}
                  value={agente.id || agente._id}
                >
                  {agente.nome} — {agente.matricula}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-600 mb-1">
            Nome do Intimado
          </label>
          <input
            name="intimado_nome"
            value={formData.intimado_nome}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Nome completo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-neutral-600 mb-1">
              CPF
            </label>
            <input
              name="intimado_cpf"
              value={formData.intimado_cpf}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  intimado_cpf: formatCPF(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Somente números"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-600 mb-1">
              Telefone
            </label>
            <input
              name="intimado_telefone"
              value={formData.intimado_telefone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  intimado_telefone: formatPhone(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Somente números"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-600 mb-1">
            Endereço
          </label>
          <input
            name="intimado_endereco"
            value={formData.intimado_endereco}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Endereço completo"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-600 mb-1">
            Motivo
          </label>
          <select
            name="motivo"
            value={formData.motivo}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Selecione o motivo</option>
            <option value="depoimento">Depoimento</option>
            <option value="audiencia">Audiência</option>
            <option value="reconhecimento">Reconhecimento</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-neutral-600 mb-1">
            Descrição do Motivo
          </label>
          <textarea
            name="descricao_motivo"
            value={formData.descricao_motivo}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Detalhes do motivo da intimação..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-neutral-600 mb-1">
              Data da Intimação
            </label>
            <input
              type="datetime-local"
              name="data_intimacao"
              value={formData.data_intimacao}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-600 mb-1">
              Data do Comparecimento
            </label>
            <input
              type="datetime-local"
              name="data_comparecimento"
              value={formData.data_comparecimento}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-600 mb-1">
            Local do Comparecimento
          </label>
          <input
            name="local_comparecimento"
            value={formData.local_comparecimento}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex: DEAM Pedro II"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-600 mb-1">
            Observações
          </label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Observações adicionais..."
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-600 mb-2">
            Documentos Anexos
          </label>

          <label className="flex items-center gap-2 w-fit px-4 py-3 rounded-xl border border-neutral-200 bg-white cursor-pointer hover:bg-neutral-50">
            <Upload size={16} />
            <span className="text-sm">Selecionar arquivos</span>
            <input type="file" multiple hidden onChange={handleFileUpload} />
          </label>

          {uploadingDocs && (
            <p className="text-sm text-neutral-500 mt-2">Enviando arquivos...</p>
          )}

          <div className="mt-3 space-y-2">
            {documentos.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2"
              >
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <FileText size={16} />
                  <span>Documento {index + 1}</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeDocument(doc)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-600 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="pendente">Pendente</option>
            <option value="entregue">Entregue</option>
            <option value="cumprida">Cumprida</option>
            <option value="nao_localizado">Não localizado</option>
            <option value="recusada">Recusada</option>
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate("/intimacoes")}
            className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm hover:bg-neutral-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-700 text-white text-sm shadow-sm hover:bg-primary-800 disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NovaIntimacao