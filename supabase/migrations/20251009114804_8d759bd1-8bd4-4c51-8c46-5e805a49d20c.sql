-- Adicionar campos de forma de pagamento e parcelamento na tabela vendas
ALTER TABLE vendas 
ADD COLUMN forma_pagamento TEXT DEFAULT 'dinheiro' CHECK (forma_pagamento IN ('dinheiro', 'debito', 'credito', 'pix')),
ADD COLUMN numero_parcelas INTEGER DEFAULT 1,
ADD COLUMN valor_recebido NUMERIC,
ADD COLUMN troco NUMERIC;