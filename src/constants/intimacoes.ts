// src/constants/intimacoes.ts

export const STATUS_INTIMACAO = {
  pendente: {
    label: 'Pendente',
    color: 'text-yellow-600 bg-yellow-100',
  },
  entregue: {
    label: 'Entregue',
    color: 'text-blue-600 bg-blue-100',
  },
  nao_localizado: {
    label: 'Não Localizado',
    color: 'text-red-600 bg-red-100',
  },
  cumprida: {
    label: 'Cumprida',
    color: 'text-green-600 bg-green-100',
  },
  recusada: {
    label: 'Recusada',
    color: 'text-orange-600 bg-orange-100',
  },
} as const;

export const MOTIVO_INTIMACAO = {
  depoimento: 'Depoimento',
  audiencia: 'Audiência',
  reconhecimento: 'Reconhecimento',
  outros: 'Outros',
} as const;

// Tipagem para o TypeScript não reclamar ao acessar as chaves
export type StatusKey = keyof typeof STATUS_INTIMACAO;
export type MotivoKey = keyof typeof MOTIVO_INTIMACAO;