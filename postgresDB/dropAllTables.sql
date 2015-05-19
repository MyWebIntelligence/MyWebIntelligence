-- Destruction --

DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS expressions;
DROP TABLE IF EXISTS get_expression_tasks;

DROP INDEX IF EXISTS get_expression_tasks_uri_key;

DROP TYPE IF EXISTS get_expression_tasks_status;
