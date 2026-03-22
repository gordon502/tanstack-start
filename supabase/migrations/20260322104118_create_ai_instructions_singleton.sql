create table if not exists public.ai_instructions (
  id smallint primary key default 1 check (id = 1),
  storage_options text[] not null default '{}'::text[],
  watch_screen_sizes text[] not null default '{}'::text[],
  carriers text[] not null default '{}'::text[],
  all_models jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_ai_instructions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ai_instructions_set_updated_at on public.ai_instructions;
create trigger ai_instructions_set_updated_at
before update on public.ai_instructions
for each row
execute function public.set_ai_instructions_updated_at();

alter table public.ai_instructions enable row level security;

create policy "Authenticated users can read ai instructions"
on public.ai_instructions
for select
to authenticated
using (true);

create policy "Authenticated users can update ai instructions"
on public.ai_instructions
for update
to authenticated
using (true)
with check (true);

insert into public.ai_instructions (
  id,
  storage_options,
  watch_screen_sizes,
  carriers,
  all_models
)
values (
  1,
  array[
    '2TB',
    '1TB',
    '512GB',
    '256GB',
    '128GB',
    '64GB',
    '32GB',
    '16GB',
    '8GB',
    '4GB',
    '2GB',
    '1GB',
    '512MB',
    '256MB'
  ]::text[],
  array[
    '38MM',
    '40MM',
    '41MM',
    '42MM',
    '43MM',
    '44MM',
    '45MM',
    '46MM',
    '47MM',
    '49MM'
  ]::text[],
  array[
    'Verizon',
    'AT&T',
    'Boost',
    'MetroPCS',
    'T-Mobile',
    'Xfinity',
    'US Cellular',
    'Spectrum',
    'Cricket',
    'Altice',
    'Argon',
    'Bell',
    'C Spire',
    'Carolina West',
    'Chile',
    'Claro',
    'Comcel',
    'Docomo',
    'EMEA',
    'Fido',
    'GCI',
    'Globe Telecom',
    'KDDI',
    'Kt',
    'kr',
    'Kyivstar',
    'Latin America Region',
    'Mint Mobile',
    'Movistar',
    'Nextel',
    'Orange',
    'Panhandle',
    'Redpocket',
    'Rogers',
    'Smart',
    'Softbank',
    'Straight Talk',
    'Telcel',
    'Telefonica',
    'Telstra',
    'Telus',
    'Tigo',
    'TIM',
    'Tracfone',
    'Ultra Mobile',
    'Union Wireless',
    'US Consumer Cellular',
    'US Reseller Flex',
    'USA Region',
    'Viaero',
    'Virgin',
    'Vodafone',
    'WIFI',
    'Puerto Rico Liberty',
    'Visible',
    'Sprint',
    'A1 Telekom',
    'Open Mobile',
    'Flow',
    'Assurance Wireless',
    'Cox',
    'APAC',
    'United Wireless',
    'SK telecom',
    'Central Wireless',
    'Liberty Latin America',
    'Three Ireland'
  ]::text[],
  '[
    {
      "manufacturer": "Apple",
      "model": "iPhone 14 Pro Max",
      "model_numbers": ["A2893", "A2651", "A2894"],
      "colors": ["Silver", "Deep Purple", "Space Black", "Gold"]
    },
    {
      "manufacturer": "Apple",
      "model": "iPhone 14 Pro",
      "model_numbers": ["A2890", "A2650", "A2889"],
      "colors": ["Silver", "Deep Purple", "Space Black", "Gold"]
    },
    {
      "manufacturer": "Apple",
      "model": "iPhone 14 Plus",
      "model_numbers": ["A2886", "A2632", "A2885"],
      "colors": ["Blue", "Purple", "Midnight", "Starlight", "Red"]
    },
    {
      "manufacturer": "Apple",
      "model": "iPhone 14",
      "model_numbers": ["A2882", "A2649", "A2881"],
      "colors": ["Blue", "Purple", "Midnight", "Starlight", "Red"]
    }
  ]'::jsonb
)
on conflict (id) do nothing;
