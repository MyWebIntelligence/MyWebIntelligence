-- Construction --

CREATE TABLE IF NOT EXISTS expressions (
    id          SERIAL PRIMARY KEY,
    uri         varchar(2000) UNIQUE NOT NULL, -- http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
    main_html    text,
    main_text    text,
    title       varchar(2000),
    "references"  varchar(2000)[],
    "aliases"  varchar(2000)[],
    meta_description   text
);

CREATE INDEX expressions_uri ON expressions (uri);
-- CREATE INDEX expressions_aliases ON expressions ("aliases");
-- CREATE INDEX expressions_references ON expressions ("references");


CREATE TYPE get_expression_tasks_status AS ENUM ('todo', 'getting expression');

CREATE TABLE IF NOT EXISTS get_expression_tasks (
    id          SERIAL PRIMARY KEY,
    uri         varchar(2000) UNIQUE NOT NULL,
    status      get_expression_tasks_status,
    created_at    timestamp without time zone default (now() at time zone 'utc'),
    related_territoire_id  integer -- eventually should be a foreign key for the territoires table
);

CREATE INDEX get_expression_tasks_related_territoire ON get_expression_tasks (related_territoire_id);
-- CREATE INDEX get_expression_tasks_status ON get_expression_tasks (status);