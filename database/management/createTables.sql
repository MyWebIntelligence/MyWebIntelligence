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


/*
    WEB GRAPH
*/

CREATE TABLE IF NOT EXISTS expressions (
    id                  SERIAL PRIMARY KEY,
    main_html           text,
    main_text           text,
    
    -- extracting specific and structured elements
    title               text,
    
    meta_description    text,
    meta_keywords       text[],
    
    html_lang           text,
    
    h1                  text[],
    h2                  text[],
    h3                  text[],
    h4                  text[],
    h5                  text[],
    h6                  text[],
    
    strong              text[],
    em                  text[],
    b                   text[],
    i                   text[]
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_expressions BEFORE UPDATE ON expressions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


CREATE TABLE IF NOT EXISTS resources (
    id             SERIAL PRIMARY KEY,
    url            text UNIQUE NOT NULL, -- http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
    alias_of       integer UNIQUE REFERENCES resources (id), -- nullable if it doesn't alias anything
    expression_id  integer UNIQUE REFERENCES expressions (id), -- NULL initially and when url is an alias
    http_status    smallint,
    content_type   text,
    other_error    text
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_resources BEFORE UPDATE ON resources FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Per http://www.postgresql.org/docs/9.4/static/indexes-unique.html Postgresql already create all the necessary indices via the UNIQUE constraints


CREATE TABLE IF NOT EXISTS expression_domains (
    id           SERIAL PRIMARY KEY,
    name         text UNIQUE NOT NULL,
    main_url     text,
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



/*
    ANNOTATIONS
*/

CREATE TABLE IF NOT EXISTS resource_annotations (
    resource_id             integer REFERENCES resources (id) NOT NULL,
    territoire_id           integer NOT NULL, -- eventually should be a foreign key for the territoires table
    
    -- Eventually should be a foreign key for the users table. 
    -- NULL means an algorithm made the annotation, not a human being
    user_id                 integer, 
    expression_domain_id    integer REFERENCES expression_domains (id),
    
    approved                boolean DEFAULT NULL, -- NULL means "don't know yet"
    
    -- automated annotations
    facebook_like           integer,
    facebook_share          integer,
    twitter_share           integer,
    google_pagerank         integer,
    linkedin_share          integer,
    
    -- manual annotations
    sentiment               text,
    favorite                boolean,
    tags                    text[],
    
    PRIMARY KEY(territoire_id, resource_id) -- for now
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_resource_annotations BEFORE UPDATE ON resource_annotations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX ON resource_annotations (territoire_id, approved);
CREATE INDEX ON resource_annotations (resource_id);


CREATE TABLE IF NOT EXISTS expression_domain_annotations (
    territoire_id                   integer NOT NULL, -- eventually should be a foreign key for the territoires table
    expression_domain_id            integer REFERENCES expression_domains (id) NOT NULL,
    user_id                         integer, -- eventually should be a foreign key for the users table. NULL means an algorithm made the annotation
    media_type                      text,
    emitter_type                    text,
    estimated_potential_audience    integer DEFAULT NULL,
    keywords                        text[],
    -- communities                     integer REFERENCES communities (id) -- eventually 
    
    PRIMARY KEY(territoire_id, expression_domain_id) -- for now
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_expression_domain_annotations BEFORE UPDATE ON expression_domain_annotations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX ON expression_domain_annotations (territoire_id);
CREATE INDEX ON expression_domain_annotations (expression_domain_id);


CREATE TABLE IF NOT EXISTS alexa_rank_cache (
    site_domain      text NOT NULL,
    rank             integer NOT NULL,
    download_date    timestamp without time zone NOT NULL
);
CREATE INDEX ON alexa_rank_cache (site_domain);



/*
    TASKS
*/

CREATE TYPE tasks_status AS ENUM ('todo', 'in progress');
CREATE TABLE IF NOT EXISTS tasks (
    id              SERIAL PRIMARY KEY,
    type            text NOT NULL,
    resource_id     integer REFERENCES resources (id) NOT NULL,
    territoire_id   integer NOT NULL,
    depth           integer NOT NULL,
    status          tasks_status
) INHERITS(lifecycle);
CREATE TRIGGER updated_at_tasks BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

