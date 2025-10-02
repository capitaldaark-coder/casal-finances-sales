-- Corrigir função com search_path correto
CREATE OR REPLACE FUNCTION atualizar_status_parcelas_vencidas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.parcelas_contas
  SET status = 'vencido'
  WHERE status = 'pendente'
    AND data_vencimento < CURRENT_DATE;
END;
$$;