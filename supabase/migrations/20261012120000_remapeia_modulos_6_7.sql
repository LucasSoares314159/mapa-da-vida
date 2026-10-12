-- Fusão dos módulos 5 e 6 e renumeração da cauda da trilha (outubro/2026).
--
-- A trilha passou de 9 para 8 módulos:
--
--   modulo-5  Definindo Objetivos Coerentes          -> modulo-5 (inalterado)
--   modulo-6  Sistema de Objetivos                   -> modulo-6 (aula nova, fusão 5+6)
--   modulo-7  Sistema de Organização Pessoal         -> SAI da trilha
--   modulo-8  O Segredo da Consistência              -> modulo-7
--
-- `modulo_id` é texto justamente para o progresso não se corromper quando a
-- ordem muda. Mas aqui o *significado* dos ids mudou, não só a posição: quem
-- concluiu o antigo 'modulo-8' concluiu "O Segredo da Consistência", que agora
-- se chama 'modulo-7'. Sem este remapeamento essa pessoa apareceria como tendo
-- concluído "Sistema de Organização Pessoal" — um módulo que nem existe mais.
--
-- Cole este arquivo INTEIRO no Supabase SQL Editor e rode de uma vez.

BEGIN;

-- 1) O módulo que saiu da trilha. As linhas são removidas antes do rename para
--    liberar o id 'modulo-7', que o antigo 'modulo-8' vai ocupar.
--    `linhasParaIndices()` já descartaria essas linhas (findIndex devolve -1),
--    mas deixá-las no banco faria qualquer contagem por SQL divergir da UI.
DELETE FROM public.progresso_aulas WHERE modulo_id = 'modulo-7';

-- 2) A fusão: quem concluiu o antigo 'modulo-5' (Definindo Objetivos
--    Coerentes) mantém o 'modulo-5', que continua existindo com o mesmo título
--    e vídeo. Nada a fazer.
--
--    Quem concluiu o antigo 'modulo-6' (Sistema de Objetivos) mantém o
--    'modulo-6' — o id é o mesmo, mas a aula agora é a fusão, com vídeo novo.
--    Preservamos a conclusão: a pessoa já viu o conteúdo que originou a fusão,
--    e zerar o progresso de quem avançou puniria quem estava à frente.

-- 3) Renumeração: 'modulo-8' passa a ser 'modulo-7'. O ON CONFLICT não é
--    necessário porque o passo 1 já esvaziou 'modulo-7', mas a constraint de
--    unicidade (user_id, modulo_id) protege contra rodar isto duas vezes.
UPDATE public.progresso_aulas
   SET modulo_id = 'modulo-7'
 WHERE modulo_id = 'modulo-8';

-- 4) Mesmo tratamento no conteúdo escrito das aulas. O conteúdo do módulo que
--    saiu da trilha é preservado numa chave arquivada em vez de apagado: é
--    texto escrito à mão, e /admin/modulos só lista o que está em MODULOS,
--    então a linha fica inerte sem poluir a interface.
DELETE FROM public.modulos_conteudo WHERE modulo_id = 'modulo-7-arquivado';

UPDATE public.modulos_conteudo
   SET modulo_id = 'modulo-7-arquivado'
 WHERE modulo_id = 'modulo-7';

-- O conteúdo do antigo 'modulo-8' (O Segredo da Consistência) segue a aula
-- para o novo id.
UPDATE public.modulos_conteudo
   SET modulo_id = 'modulo-7'
 WHERE modulo_id = 'modulo-8';

-- 5) Quadros do Excalidraw no fim do conteúdo das duas aulas novas.
--    Anexa ao que já existe (o 'modulo-6' tem 67 blocos de texto migrados) em
--    vez de substituir, e o WHERE NOT ... @> impede duplicar o quadro se este
--    arquivo rodar duas vezes.
INSERT INTO public.modulos_conteudo (modulo_id, blocos)
VALUES ('modulo-7', '[]'::jsonb)
ON CONFLICT (modulo_id) DO NOTHING;

UPDATE public.modulos_conteudo
   SET blocos = blocos || jsonb_build_array(
         jsonb_build_object('tipo', 'divisor'),
         jsonb_build_object('tipo', 'titulo', 'nivel', 2, 'texto', 'Quadro da aula'),
         jsonb_build_object(
           'tipo', 'embed',
           'url', 'https://link.excalidraw.com/readonly/XIXRBGN7uvNs2YC5iFvR',
           'altura', 560,
           'legenda', 'Material da aula no Excalidraw — arraste para navegar.'
         )
       ),
       atualizado_em = now()
 WHERE modulo_id = 'modulo-6'
   AND NOT blocos @> '[{"tipo":"embed","url":"https://link.excalidraw.com/readonly/XIXRBGN7uvNs2YC5iFvR"}]'::jsonb;

UPDATE public.modulos_conteudo
   SET blocos = blocos || jsonb_build_array(
         jsonb_build_object('tipo', 'divisor'),
         jsonb_build_object('tipo', 'titulo', 'nivel', 2, 'texto', 'Quadro da aula'),
         jsonb_build_object(
           'tipo', 'embed',
           'url', 'https://link.excalidraw.com/readonly/V8IBfsX2AzzQYE2aVflc',
           'altura', 560,
           'legenda', 'Material da aula no Excalidraw — arraste para navegar.'
         )
       ),
       atualizado_em = now()
 WHERE modulo_id = 'modulo-7'
   AND NOT blocos @> '[{"tipo":"embed","url":"https://link.excalidraw.com/readonly/V8IBfsX2AzzQYE2aVflc"}]'::jsonb;

COMMIT;

-- Conferência: deve listar modulo-0..modulo-7 (sem modulo-8) em progresso_aulas,
-- e modulos_conteudo deve ter modulo-0..modulo-7 + modulo-7-arquivado.
-- SELECT modulo_id, count(*) FROM public.progresso_aulas GROUP BY 1 ORDER BY 1;
-- SELECT modulo_id FROM public.modulos_conteudo ORDER BY 1;
-- SELECT modulo_id, jsonb_array_length(blocos) FROM public.modulos_conteudo
--  WHERE modulo_id IN ('modulo-6','modulo-7') ORDER BY 1;
