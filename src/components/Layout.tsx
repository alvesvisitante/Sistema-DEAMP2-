import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, FileText, Users, BarChart3, Menu, X, Shield, Plus, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'

interface LayoutProps {
  children: React.ReactNode
}

interface IntimacaoNotificacao {
  id?: string
  _id?: string
  numero_intimacao?: string
  intimado_nome?: string
  status?: string
  createdAt?: string
  created_at?: string
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificacoes, setNotificacoes] = useState<IntimacaoNotificacao[]>([])
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(false)

  const location = useLocation()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const primeiraCargaRef = useRef(true)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, description: 'Visão geral do sistema' },
    { name: 'Intimações', href: '/intimacoes', icon: FileText, description: 'Gerenciar intimações' },
    { name: 'Nova Intimação', href: '/intimacoes/nova', icon: Plus, description: 'Criar nova intimação' },
    { name: 'Agentes', href: '/agentes', icon: Users, description: 'Gerenciar agentes' },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3, description: 'Relatórios e estatísticas' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === href
    return location.pathname.startsWith(href)
  }

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => isActive(nav.href))
    return currentNav?.name || 'Sistema DEAM'
  }

  const getIntimacaoId = (item: IntimacaoNotificacao) => item.id || item._id || ''
  const getCreatedDate = (item: IntimacaoNotificacao) => item.createdAt || item.created_at || ''

  const chaveNotificacoesLidas = 'intimacoes_lidas_ids'
  const chaveNotificacoesConhecidas = 'intimacoes_conhecidas_ids'

  const getIdsStorage = (key: string): string[] => {
    try {
      const valor = localStorage.getItem(key)
      return valor ? JSON.parse(valor) as string[] : []
    } catch {
      return []
    }
  }

  const setIdsStorage = (key: string, ids: string[]) => {
    localStorage.setItem(key, JSON.stringify(ids))
  }

  const idsLidos = useMemo(() => getIdsStorage(chaveNotificacoesLidas), [notificationsOpen, notificacoes])
  const notificacoesNaoLidas = notificacoes.filter((item) => {
    const id = getIntimacaoId(item)
    return id && !idsLidos.includes(id)
  })

  async function carregarNotificacoes() {
    try {
      setLoadingNotificacoes(true)
      const lista = await api.listarIntimacoes()

      const ordenadas = (Array.isArray(lista) ? lista : [])
        .sort((a: IntimacaoNotificacao, b: IntimacaoNotificacao) => {
          return new Date(getCreatedDate(b) || 0).getTime() - new Date(getCreatedDate(a) || 0).getTime()
        })
        .slice(0, 15)

      const idsNovos = ordenadas
        .map((item) => getIntimacaoId(item))
        .filter(Boolean)

      const idsConhecidos = getIdsStorage(chaveNotificacoesConhecidas)

      if (primeiraCargaRef.current) {
        setIdsStorage(chaveNotificacoesConhecidas, idsNovos)
        primeiraCargaRef.current = false
      } else {
        const novasIntimacoes = ordenadas.filter((item) => {
          const id = getIntimacaoId(item)
          return id && !idsConhecidos.includes(id)
        })

        if (novasIntimacoes.length > 0) {
          novasIntimacoes.forEach((item) => {
            toast.success(`Nova intimação: ${item.numero_intimacao || 'Sem número'}`)
          })

          if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch(() => {})
          }

          setIdsStorage(chaveNotificacoesConhecidas, idsNovos)
        }
      }

      setNotificacoes(ordenadas)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoadingNotificacoes(false)
    }
  }

  function marcarComoLidas() {
    const idsAtuais = notificacoes
      .map((item) => getIntimacaoId(item))
      .filter(Boolean)

    setIdsStorage(chaveNotificacoesLidas, idsAtuais)
  }

  function handleAbrirNotificacoes() {
    const proximo = !notificationsOpen
    setNotificationsOpen(proximo)

    if (!notificationsOpen) {
      marcarComoLidas()
    }
  }

  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3')
    carregarNotificacoes()

    const interval = setInterval(() => {
      carregarNotificacoes()
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #d946ef 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #0ea5e9 0%, transparent 50%)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 flex w-80 max-w-xs flex-col glass-dark"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-400 rounded-full border-2 border-white/20"></div>
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-white/80" />
                      <span className="text-lg font-bold text-white">DEAM</span>
                    </div>
                    <p className="text-xs text-neutral-300">Pedro II</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-neutral-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-2 px-4 py-6">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                          : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                          isActive(item.href)
                            ? 'text-primary-300'
                            : 'text-neutral-400 group-hover:text-primary-300'
                        }`}
                      />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-neutral-400">{item.description}</div>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col z-40">
        <div className="flex min-h-0 flex-1 flex-col glass border-r border-white/20 shadow-2xl">
          <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-white/10">
            <div className="flex items-center">
              <div className="relative">
                <img src="/policia.png" alt="Logo" className="w-17 h-12 object-contain" /> {/* Logo da polícia */}
                <div className="p-0 rounded-xl bg-gradient-to-br from-primary-0 to-primary-0 shadow-glow"></div>
              </div>
              <div className="ml-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary-600" />
                  <span className="text-lg font-bold gradient-text">DEAM Pedro II</span>
                </div>
                <p className="text-xs text-neutral-500">Sistema de Intimações</p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-2 px-4 py-6">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 shadow-lg border border-primary-200'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-600'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                        isActive(item.href)
                          ? 'text-primary-600'
                          : 'text-neutral-400 group-hover:text-primary-500'
                      }`}
                    />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-neutral-400">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className="lg:pl-80">
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 glass border-b border-white/20 px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="p-2.5 text-neutral-700 hover:text-primary-600 transition-colors lg:hidden rounded-lg hover:bg-neutral-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <motion.h1
                key={location.pathname}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold gradient-text"
              >
                {getPageTitle()}
              </motion.h1>
            </div>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="relative">
                <button
                  type="button"
                  className="p-2 text-neutral-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-neutral-100/50 relative"
                  onClick={handleAbrirNotificacoes}
                >
                  <Bell className="h-5 w-5" />

                  {notificacoesNaoLidas.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-danger-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      {notificacoesNaoLidas.length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <h3 className="font-semibold text-neutral-800">Notificações</h3>
                        <p className="text-xs text-neutral-500">Novas intimações cadastradas</p>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {loadingNotificacoes ? (
                          <div className="p-4 text-sm text-neutral-500">Carregando...</div>
                        ) : notificacoes.length === 0 ? (
                          <div className="p-4 text-sm text-neutral-500">Nenhuma notificação.</div>
                        ) : (
                          notificacoes.map((item) => {
                            const itemId = getIntimacaoId(item)
                            const naoLida = !idsLidos.includes(itemId)

                            return (
                              <Link
                                key={itemId}
                                to={itemId ? `/intimacoes/${itemId}` : '/intimacoes'}
                                onClick={() => setNotificationsOpen(false)}
                                className={`block px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition ${
                                  naoLida ? 'bg-primary-50/50' : 'bg-white'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-neutral-800 truncate">
                                      {item.numero_intimacao || 'Nova intimação'}
                                    </p>
                                    <p className="text-sm text-neutral-600 truncate">
                                      {item.intimado_nome || 'Sem nome do intimado'}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1">
                                      {getCreatedDate(item)
                                        ? new Date(getCreatedDate(item)).toLocaleString('pt-BR')
                                        : ''}
                                    </p>
                                  </div>

                                  {naoLida && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500 mt-2 flex-shrink-0"></span>
                                  )}
                                </div>
                              </Link>
                            )
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center text-sm text-neutral-600 font-medium">
                <div className="text-right mr-3 hidden sm:block">
                  <div className="font-medium text-neutral-700">Admin DEAM</div>
                  <div className="text-xs text-neutral-500">Delegacia Pedro II</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="py-8 relative z-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout