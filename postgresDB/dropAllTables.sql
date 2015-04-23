-- Destruction --

DROP TABLE IF EXISTS expressions;
DROP TABLE IF EXISTS get_expression_tasks;

DROP TYPE IF EXISTS get_expression_tasks_status;
CREATE TYPE get_expression_tasks_status AS ENUM ('todo', 'getting expression');
