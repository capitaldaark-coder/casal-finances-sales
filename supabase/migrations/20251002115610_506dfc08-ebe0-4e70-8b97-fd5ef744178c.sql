-- Criação das tabelas do sistema Fluxo de Caixa

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  saldo_devedor NUMERIC DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo_barras TEXT UNIQUE,
  preco_custo NUMERIC DEFAULT 0,
  preco_venda NUMERIC NOT NULL,
  quantidade_estoque INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Contas a Pagar
CREATE TABLE IF NOT EXISTS public.contas_a_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor_total NUMERIC NOT NULL,
  numero_parcelas INTEGER DEFAULT 1,
  data_emissao DATE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Parcelas de Contas a Pagar
CREATE TABLE IF NOT EXISTS public.parcelas_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id UUID REFERENCES public.contas_a_pagar(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor_parcela NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  status TEXT DEFAULT 'pendente', -- pendente, pago, vencido
  data_pagamento TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  valor_total NUMERIC NOT NULL,
  lucro_total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'concluida', -- concluida, cancelada
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens de Venda
CREATE TABLE IF NOT EXISTS public.itens_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID REFERENCES public.vendas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC NOT NULL,
  preco_custo NUMERIC DEFAULT 0,
  subtotal NUMERIC NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pagamentos de Clientes
CREATE TABLE IF NOT EXISTS public.pagamentos_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  valor NUMERIC NOT NULL,
  data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacao TEXT
);

-- Tabela de Notas
CREATE TABLE IF NOT EXISTS public.notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT,
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_a_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelas_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Permitir todas as operações para usuários autenticados
CREATE POLICY "Permitir tudo para usuários autenticados" ON public.clientes
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir tudo para usuários autenticados" ON public.fornecedores
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir tudo para usuários autenticados" ON public.produtos
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir tudo para usuários autenticados" ON public.contas_a_pagar
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir tudo para usuários autenticados" ON public.parcelas_contas
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir tudo para usuários autenticados" ON public.vendas
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir tudo para usuários autenticados" ON public.itens_venda
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir tudo para usuários autenticados" ON public.pagamentos_clientes
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir tudo para usuários autenticados" ON public.notas
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Função para atualizar status de parcelas vencidas
CREATE OR REPLACE FUNCTION atualizar_status_parcelas_vencidas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.parcelas_contas
  SET status = 'vencido'
  WHERE status = 'pendente'
    AND data_vencimento < CURRENT_DATE;
END;
$$;