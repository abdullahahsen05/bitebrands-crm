alter table partner_facturatie_links
  add column if not exists country              text,
  add column if not exists tb_partner_id        text,
  add column if not exists virtual_concept      text,
  add column if not exists host_restaurant_name text;
