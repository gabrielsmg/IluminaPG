create extension if not exists pgcrypto;

create table if not exists public.chamados (
  id uuid primary key default gen_random_uuid(),
  protocolo text unique not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  nome text not null,
  telefone text not null,
  email text not null,
  bairro text not null,
  logradouro text not null,
  numero_referencia text not null,
  cep text,
  tipo_ocorrencia text not null check (
    tipo_ocorrencia in (
      'Luminária apagada',
      'Luminária acesa durante o dia',
      'Luminária piscando',
      'Poste sem luminária'
    )
  ),
  descricao text,
  status text not null default 'aberto' check (
    status in ('aberto','em_analise','encaminhado','concluido')
  ),
  equipe_responsavel text,
  retorno_prefeitura text,
  concluido_em timestamptz
);

alter table public.chamados enable row level security;

drop policy if exists "admin_select_chamados" on public.chamados;
create policy "admin_select_chamados"
on public.chamados for select
to authenticated
using (true);

drop policy if exists "admin_update_chamados" on public.chamados;
create policy "admin_update_chamados"
on public.chamados for update
to authenticated
using (true)
with check (true);

create sequence if not exists public.seq_protocolo start 1;

create or replace function public.abrir_chamado(
  p_nome text,
  p_telefone text,
  p_email text,
  p_bairro text,
  p_logradouro text,
  p_numero_referencia text,
  p_cep text,
  p_tipo_ocorrencia text,
  p_descricao text
)
returns table(protocolo text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_protocolo text;
begin
  v_protocolo := 'PG' || to_char(current_date,'YYYY') || '-' ||
                 lpad(nextval('public.seq_protocolo')::text,6,'0');

  insert into public.chamados(
    protocolo,nome,telefone,email,bairro,logradouro,numero_referencia,cep,tipo_ocorrencia,descricao
  ) values (
    v_protocolo,p_nome,p_telefone,p_email,p_bairro,p_logradouro,p_numero_referencia,p_cep,p_tipo_ocorrencia,p_descricao
  );

  return query select v_protocolo;
end;
$$;

grant execute on function public.abrir_chamado(text,text,text,text,text,text,text,text,text) to anon, authenticated;

create or replace function public.consultar_chamado(p_protocolo text)
returns table(
  protocolo text,
  criado_em timestamptz,
  bairro text,
  logradouro text,
  numero_referencia text,
  tipo_ocorrencia text,
  status text,
  retorno_prefeitura text,
  concluido_em timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    c.protocolo,c.criado_em,c.bairro,c.logradouro,c.numero_referencia,
    c.tipo_ocorrencia,c.status,c.retorno_prefeitura,c.concluido_em
  from public.chamados c
  where upper(c.protocolo)=upper(p_protocolo)
  limit 1;
$$;

grant execute on function public.consultar_chamado(text) to anon, authenticated;
