'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
              ? 'border-mt-green bg-mt-off-white'
              : 'border-mt-border hover:border-mt-green bg-white'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
              value === opt ? 'border-mt-green bg-mt-green' : 'border-mt-border'
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
          <span className="text-sm text-mt-black">{opt}</span>
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
  const searchParams = useSearchParams()
  const { trackEvent } = useMetaPixel()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const utm_source = searchParams.get('utm_source') ?? 'direto'
  const utm_medium = searchParams.get('utm_medium') ?? 'direto'
  const utm_campaign = searchParams.get('utm_campaign') ?? 'direto'

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
    },
  })

  const profissao = watch('profissao')

  async function onSubmit(data: ListaEsperaFormData) {
    setSubmitting(true)
    setServerError('')
    try {
      const res = await fetch('/api/lista-espera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, utm_source, utm_medium, utm_campaign }),
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
        <Label htmlFor="whatsapp">WhatsApp *</Label>
        <Input
          id="whatsapp"
          type="tel"
          placeholder="(00) 00000-0000"
          value={watch('whatsapp') ?? ''}
          onChange={(e) => setValue('whatsapp', formatWhatsApp(e.target.value), { shouldValidate: true })}
          className={errors.whatsapp ? 'border-red-400' : ''}
        />
        {errors.whatsapp && <p className="text-red-500 text-xs">{errors.whatsapp.message}</p>}
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

      {serverError && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-mt-green hover:bg-mt-green-dark text-white py-3 text-base font-semibold rounded-xl"
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
