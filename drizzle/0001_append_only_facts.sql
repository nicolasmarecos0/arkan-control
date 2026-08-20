-- Libro de Hechos: append-only enforcement.
--
-- D9 (a fact is recorded once) and D10 (full traceability) are not conventions
-- the application is trusted to keep: the database refuses to rewrite or erase a
-- fact. A correction is a new fact, never an edit of the old one.

CREATE OR REPLACE FUNCTION arkan_facts_are_append_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'facts are append-only: % is not allowed on %', TG_OP, TG_TABLE_NAME
    USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER facts_append_only
  BEFORE UPDATE OR DELETE ON facts
  FOR EACH ROW EXECUTE FUNCTION arkan_facts_are_append_only();
--> statement-breakpoint
CREATE TRIGGER fact_links_append_only
  BEFORE UPDATE OR DELETE ON fact_links
  FOR EACH ROW EXECUTE FUNCTION arkan_facts_are_append_only();
--> statement-breakpoint
-- An entity reference is never blank: a link that cannot be resolved is not a
-- context, it is a hole in the history.
ALTER TABLE fact_links
  ADD CONSTRAINT fact_links_entity_id_not_blank CHECK (length(btrim(entity_id)) > 0);
