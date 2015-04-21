DROP TABLE IF EXISTS expressions;
CREATE TABLE expressions (
    id          SERIAL PRIMARY KEY,
    uri         text UNIQUE NOT NULL, -- http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
    main_html    text,
    main_text    text,
    title       varchar(2000),
    "references"  varchar(2000)[],
    "aliases"  varchar(2000)[],
    meta_description   text
);


CREATE TYPE IF NOT EXISTS get_expression_tasks_status AS ENUM ('todo', 'getting expression');

DROP TABLE IF EXISTS get_expression_tasks;
CREATE TABLE get_expression_tasks (
    id          SERIAL PRIMARY KEY,
    uri         text UNIQUE NOT NULL,
    status      get_expression_tasks_status
    created_at    timestamp without time zone default (now() at time zone 'utc')
);