-- ============================================================
-- MockFlow — entrevistas grátis (amostra grátis de lançamento)
-- ============================================================

-- Flag por entrevistador: quando true, seus slots podem ser
-- agendados sem pagamento (campanha de aquisição).
alter table public.tutor_profiles
  add column offers_free_sessions boolean not null default false;

-- Garantia dura de "1 entrevista grátis por aluno".
-- Reservas grátis têm gross_amount = 0; ao cancelar saem do índice
-- e o aluno recupera a cortesia.
create unique index uniq_learner_free_booking
  on public.bookings (learner_id)
  where gross_amount = 0 and status <> 'cancelled';

-- ============================================================
-- Atualiza create_booking para suportar entrevistadores-grátis
-- ============================================================

create or replace function public.create_booking(
  p_learner_id  uuid,
  p_slot_id     uuid
)
returns uuid   -- returns new booking id
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot        public.availability_slots%rowtype;
  v_tutor       public.tutor_profiles%rowtype;
  v_gross       numeric(10,2);
  v_fee         numeric(10,2);
  v_booking_id  uuid;
begin
  -- Lock the slot row to prevent concurrent bookings
  select * into v_slot
  from public.availability_slots
  where id = p_slot_id and is_booked = false
  for update skip locked;

  if not found then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  select * into v_tutor from public.tutor_profiles where id = v_slot.tutor_id;

  if v_tutor.offers_free_sessions then
    -- Cortesia: só permitida se o aluno ainda não usou a dele.
    if exists (
      select 1 from public.bookings
      where learner_id = p_learner_id
        and gross_amount = 0
        and status <> 'cancelled'
    ) then
      raise exception 'free_already_used' using errcode = 'P0001';
    end if;

    v_gross := 0;
    v_fee   := 0;
  else
    v_gross := v_tutor.price_per_session;
    v_fee   := round(v_gross * 0.10, 2);
  end if;

  insert into public.bookings (
    learner_id, tutor_id, slot_id,
    gross_amount, platform_fee, tutor_amount
  ) values (
    p_learner_id, v_tutor.id, p_slot_id,
    v_gross, v_fee, v_gross - v_fee
  )
  returning id into v_booking_id;

  -- Lock the slot
  update public.availability_slots set is_booked = true where id = p_slot_id;

  return v_booking_id;
end;
$$;
