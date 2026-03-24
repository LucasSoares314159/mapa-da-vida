type Props = {
  titulo: string
  nomeUsuario: string
}

export function Header({ titulo, nomeUsuario }: Props) {
  const inicial = nomeUsuario.trim().charAt(0).toUpperCase()

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between bg-white px-8"
      style={{ borderBottom: '0.5px solid #c8d8d2' }}
    >
      <h1 className="font-heading text-[15px] font-medium text-mt-black">{titulo}</h1>

      <div
        className="flex size-8 items-center justify-center rounded-full text-sm font-medium"
        style={{ background: '#d4e4dc', color: '#2A3F45' }}
      >
        {inicial}
      </div>
    </header>
  )
}
