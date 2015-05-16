-- Construction --

CREATE TABLE IF NOT EXISTS expressions (
    id           SERIAL PRIMARY KEY,
    main_html    text,
    main_text    text,
    title        varchar(2000),
    meta_description   text
);

CREATE TABLE IF NOT EXISTS resources (
    id             SERIAL PRIMARY KEY,
    url            varchar(2000) UNIQUE NOT NULL, -- http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
    alias_of       integer UNIQUE REFERENCES resources (id), -- nullable if it doesn't alias anything
    expression_id  integer UNIQUE REFERENCES expressions (id) -- NULL initially and when uri is an alias
);
-- Per http://www.postgresql.org/docs/9.4/static/indexes-unique.html Postgresql already create all the necessary indices via the UNIQUE constraints




CREATE TYPE get_expression_tasks_status AS ENUM ('todo', 'getting expression');

CREATE TABLE IF NOT EXISTS get_expression_tasks (
    id          SERIAL PRIMARY KEY,
    uri         varchar(2000) NOT NULL,
    status      get_expression_tasks_status,
    created_at  timestamp without time zone default (now() at time zone 'utc'),
    related_territoire_id  integer NOT NULL, -- eventually should be a foreign key for the territoires table
    depth       integer NOT NULL
);

CREATE INDEX get_expression_tasks_related_territoire ON get_expression_tasks (related_territoire_id);
-- CREATE INDEX get_expression_tasks_status ON get_expression_tasks (status);