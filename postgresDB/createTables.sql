-- Useful things --

CREATE TABLE IF NOT EXISTS lifecycle(
    created_at  timestamp without time zone DEFAULT current_timestamp,
    updated_at  timestamp without time zone DEFAULT current_timestamp
);

-- http://www.revsys.com/blog/2006/aug/04/automatically-updating-a-timestamp-column-in-postgresql/
CREATE OR REPLACE FUNCTION update_updated_at_column()	
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;	
END;
$$ language 'plpgsql';


-- Business --

CREATE TABLE IF NOT EXISTS expressions (
    id           SERIAL PRIMARY KEY,
    main_html    text,
    main_text    text,
    title        text,
    meta_description   text
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_expressions BEFORE UPDATE ON expressions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


CREATE TABLE IF NOT EXISTS resources (
    id             SERIAL PRIMARY KEY,
    url            text UNIQUE NOT NULL, -- http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
    alias_of       integer UNIQUE REFERENCES resources (id), -- nullable if it doesn't alias anything
    expression_id  integer UNIQUE REFERENCES expressions (id), -- NULL initially and when url is an alias
    http_status    smallint,
    content_type   varchar(50),
    other_error    text
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_resources BEFORE UPDATE ON resources FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Per http://www.postgresql.org/docs/9.4/static/indexes-unique.html Postgresql already create all the necessary indices via the UNIQUE constraints


CREATE TABLE IF NOT EXISTS expression_domains (
    id           SERIAL PRIMARY KEY,
    main_url     text NOT NULL,
    title        text,
    description  text,
    keywords     text
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_expression_domains BEFORE UPDATE ON expression_domains FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- "links" is chosen because it's not a SQL reserved keyword like "references"
CREATE TABLE IF NOT EXISTS links (
    "source"      integer REFERENCES resources (id) NOT NULL,
    target        integer REFERENCES resources (id) NOT NULL,
    PRIMARY KEY ("source", target)
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_links BEFORE UPDATE ON links FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- to find graph edges quickly
CREATE INDEX ON links ("source");



CREATE TYPE get_expression_tasks_status AS ENUM ('todo', 'getting expression');
CREATE TABLE IF NOT EXISTS get_expression_tasks (
    id          SERIAL PRIMARY KEY,
    resource_id integer UNIQUE REFERENCES resources (id) NOT NULL,
    status      get_expression_tasks_status,
    territoire_id  integer NOT NULL, -- eventually should be a foreign key for the territoires table
    depth       integer NOT NULL
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_get_expression_tasks BEFORE UPDATE ON get_expression_tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX ON get_expression_tasks (territoire_id);


CREATE TABLE IF NOT EXISTS resource_annotations (
    approved                boolean DEFAULT NULL, -- NULL means "don't know yet"
    values                  text, -- JSON blob. This prevents annotation-based queries at the SQL level. Stats will have to be made in JS or maybe in a synthesized document served by ElasticSearch
    expression_domain_id    integer REFERENCES expression_domains (id) NOT NULL,
    resource_id             integer REFERENCES resources (id) NOT NULL,
    territoire_id           integer NOT NULL, -- eventually should be a foreign key for the territoires table
    user_id                 integer, -- eventually should be a foreign key for the users table. NULL means an algorithm made the annotation
    PRIMARY KEY(territoire_id, resource_id) -- for now
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_resource_annotations BEFORE UPDATE ON resource_annotations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX ON resource_annotations (territoire_id, approved);
CREATE INDEX ON resource_annotations (resource_id);


CREATE TYPE annotation_tasks_status AS ENUM ('todo', 'in progress');
CREATE TABLE IF NOT EXISTS annotation_tasks (
    id              SERIAL PRIMARY KEY,
    type            text NOT NULL,
    resource_id     integer REFERENCES resources (id) NOT NULL,
    territoire_id   integer NOT NULL,
    status          annotation_tasks_status
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_annotation_tasks BEFORE UPDATE ON annotation_tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


CREATE TABLE IF NOT EXISTS alexa_rank_cache (
    site_domain      text NOT NULL,
    rank             integer NOT NULL,
    download_date    timestamp without time zone NOT NULL
);
CREATE INDEX ON alexa_rank_cache (site_domain);





