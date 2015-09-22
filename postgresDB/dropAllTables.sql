-- Destruction --

DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS get_expression_tasks;
DROP TABLE IF EXISTS social_signals;
DROP TABLE IF EXISTS alexa_rank_cache;
DROP TABLE IF EXISTS annotation_tasks;
DROP TABLE IF EXISTS expression_domains;
DROP TABLE IF EXISTS annotations;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS expressions;


DROP INDEX IF EXISTS get_expression_tasks_uri_key;

DROP TYPE IF EXISTS get_expression_tasks_status;
DROP TYPE IF EXISTS annotation_tasks_status;
DROP TYPE IF EXISTS social_signals_types;
