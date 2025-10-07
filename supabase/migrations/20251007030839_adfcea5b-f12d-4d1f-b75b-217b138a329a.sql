-- Deletar todos os usuários existentes
DELETE FROM auth.users;

-- Criar o usuário master
-- Nota: A senha será definida através do painel de autenticação
-- Este script apenas prepara o banco para receber o novo usuário