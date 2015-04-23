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


CREATE TABLE IF NOT EXISTS get_expression_tasks (
    id          SERIAL PRIMARY KEY,
    uri         varchar(2000) UNIQUE NOT NULL,
    status      get_expression_tasks_status,
    created_at    timestamp without time zone default (now() at time zone 'utc')
);