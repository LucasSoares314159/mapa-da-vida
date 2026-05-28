'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMetaPixel } from '@/hooks/useMetaPixel'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { listaEsperaSchema, ListaEsperaFormData } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const PROFISSOES = [
  'Tecnologia (Produto, Design, TI)',
  'Marketing (creator, analista, growth, social media)',
  'Executivos (founder, CMO, CPO, COO)',
  'Autônomos (empreendedor, artista, artesão)',
  'Saúde (medicina, fisioterapia, psicologia, enfermagem)',
  'Outro',
] as const

const CANAIS = ['LinkedIn', 'Newsletter', 'Instagram', 'Outro'] as const
const DISPONIBILIDADE = ['Sim', 'Não', 'Talvez'] as const

function RadioGroup({
  name,
  options,
  value,
  onChange,
  error,
}: {
  name: string
  options: readonly string[]
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            value === opt
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
              value === opt ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
            }`}
          >
            {value === opt && (
              <div className="w-full h-full rounded-full bg-white scale-[0.4]" />
            )}
          </div>
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="sr-only"
          />
          <span className="text-sm text-gray-700">{opt}</span>
        </label>
      ))}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function ListaEsperaForm() {
  const router = useRouter()
  const { trackEvent } = useMetaPixel()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ListaEsperaFormData>({
    resolver: zodResolver(listaEsperaSchema),
    defaultValues: {
      nome: '',
      email: '',
      whatsapp: '',
      profissao: undefined,
      canal: undefined,
      disponibilidade_horas: undefined,
      disponibilidade_encontros: undefined,
    },
  })

  const profissao = watch('profissao')
  const canal = watch('canal')
  const disponibilidade_horas = watch('disponibilidade_horas')
  const disponibilidade_encontros = watch('disponibilidade_encontros')

  async function onSubmit(data: ListaEsperaFormData) {
    setSubmitting(true)
    setServerError('')
    try {
      const res = await fetch('/api/lista-espera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        setServerError(json.error ?? 'Ocorreu um erro. Tente novamente.')
        return
      }
      await trackEvent('Lead')
      router.push('/obrigado')
    } catch {
      setServerError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          placeholder="Seu nome completo"
          {...register('nome')}
          className={errors.nome ? 'border-red-400' : ''}
        />
        {errors.nome && <p className="text-red-500 text-xs">{errors.nome.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register('email')}
          className={errors.email ? 'border-red-400' : ''}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
      </div>

      {/* WhatsApp */}
      <div className="space-y-1.5">
        <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
        <Input
          id="whatsapp"
          type="tel"
          placeholder="(00) 00000-0000"
          value={watch('whatsapp') ?? ''}
          onChange={(e) => setValue('whatsapp', formatWhatsApp(e.target.value))}
        />
      </div>

      {/* Profissão */}
      <div className="space-y-2">
        <Label>Qual a sua profissão? *</Label>
        <RadioGroup
          name="profissao"
          options={PROFISSOES}
          value={profissao ?? ''}
          onChange={(v) => setValue('profissao', v as ListaEsperaFormData['profissao'], { shouldValidate: true })}
          error={errors.profissao?.message}
        />
      </div>

      {/* Canal */}
      <div className="space-y-2">
        <Label>Por onde conheceu a MindTrail? *</Label>
        <RadioGroup
          name="canal"
          options={CANAIS}
          value={canal ?? ''}
          onChange={(v) => setValue('canal', v as ListaEsperaFormData['canal'], { shouldValidate: true })}
          error={errors.canal?.message}
        />
      </div>

      {/* Disponibilidade horas */}
      <div className="space-y-2">
        <Label>
          Você teria disponibilidade de 2 horas semanais por 4 semanas para concluir o produto?{' '}
          <span className="text-gray-400 font-normal">(8 horas totais em média)</span> *
        </Label>
        <RadioGroup
          name="disponibilidade_horas"
          options={DISPONIBILIDADE}
          value={disponibilidade_horas ?? ''}
          onChange={(v) => setValue('disponibilidade_horas', v as ListaEsperaFormData['disponibilidade_horas'], { shouldValidate: true })}
          error={errors.disponibilidade_horas?.message}
        />
      </div>

      {/* Disponibilidade encontros */}
      <div className="space-y-2">
        <Label>Você teria disponibilidade para 3 encontros online em grupo de 1 hora durante o programa? *</Label>
        <RadioGroup
          name="disponibilidade_encontros"
          options={DISPONIBILIDADE}
          value={disponibilidade_encontros ?? ''}
          onChange={(v) => setValue('disponibilidade_encontros', v as ListaEsperaFormData['disponibilidade_encontros'], { shouldValidate: true })}
          error={errors.disponibilidade_encontros?.message}
        />
      </div>

      {serverError && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-base font-semibold rounded-xl"
      >
        {submitting ? 'Enviando...' : 'Entrar na lista de espera'}
      </Button>

      <p className="text-xs text-center text-gray-400">
        Ao se cadastrar, você concorda em receber comunicações sobre a Trilha da Produtividade.
        Sem spam. Cancele quando quiser.
      </p>
    </form>
  )
}
