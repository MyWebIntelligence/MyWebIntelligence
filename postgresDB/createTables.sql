-- Construction --

CREATE TABLE IF NOT EXISTS expressions (
    id           SERIAL PRIMARY KEY,
    main_html    text,
    main_text    text,
    title        text,
    meta_description   text
);

CREATE TABLE IF NOT EXISTS resources (
    id             SERIAL PRIMARY KEY,
    url            text UNIQUE NOT NULL, -- http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
    alias_of       integer UNIQUE REFERENCES resources (id), -- nullable if it doesn't alias anything
    expression_id  integer UNIQUE REFERENCES expressions (id), -- NULL initially and when url is an alias
    http_status    smallint,
    content_type   varchar(50),
    other_error    text
);
-- Per http://www.postgresql.org/docs/9.4/static/indexes-unique.html Postgresql already create all the necessary indices via the UNIQUE constraints

-- "links" is chosen because it's not a SQL reserved keyword like "references"
CREATE TABLE IF NOT EXISTS links (
    "source"      integer REFERENCES resources (id) NOT NULL,
    target        integer REFERENCES resources (id) NOT NULL,
    PRIMARY KEY ("source", target)
);

-- to find graph edges quickly
CREATE INDEX links_source ON links ("source");



CREATE TYPE get_expression_tasks_status AS ENUM ('todo', 'getting expression');

CREATE TABLE IF NOT EXISTS get_expression_tasks (
    id          SERIAL PRIMARY KEY,
    resource_id integer UNIQUE REFERENCES resources (id) NOT NULL,
    status      get_expression_tasks_status,
    created_at  timestamp without time zone default (now() at time zone 'utc'),
    related_territoire_id  integer NOT NULL, -- eventually should be a foreign key for the territoires table
    depth       integer NOT NULL
);

CREATE INDEX get_expression_tasks_related_territoire ON get_expression_tasks (related_territoire_id);



CREATE TYPE social_signals_types AS ENUM ('facebook_like', 'facebook_share', 'twitter_share');

CREATE TABLE IF NOT EXISTS social_signals (
    id           SERIAL PRIMARY KEY,
    fetched_at   timestamp without time zone  NOT NULL, 
    type         social_signals_types NOT NULL,
    resource_id  integer REFERENCES resources (id)
);

CREATE INDEX social_signals_resource_id ON social_signals (resource_id);


CREATE TABLE IF NOT EXISTS alexa_rank_cache (
    site_domain      text NOT NULL,
    rank             integer NOT NULL,
    download_date    timestamp without time zone NOT NULL
);

CREATE INDEX alexa_rank_cache_site_domain ON alexa_rank_cache (site_domain);





