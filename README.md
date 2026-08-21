# IluminaPG v2

Sistema web com dois módulos:

- Cidadão: abrir ocorrência, gerar protocolo e consultar andamento.
- Prefeitura: login, visualizar demandas, encaminhar para equipe, atualizar status e concluir atendimento.

## Tecnologias
HTML5, CSS3, JavaScript, Supabase e PostgreSQL.

## Configuração
1. Crie um projeto gratuito no Supabase.
2. No SQL Editor, execute `database.sql`.
3. Em `supabase-config.js`, informe a Project URL e a anon key.
4. Em Authentication > Users, crie um usuário administrativo.
5. Rode o projeto com um servidor local, como Live Server do VS Code.

## Fluxo
Aberto -> Em análise -> Encaminhado para equipe -> Concluído.
