DROP TABLE IF EXISTS expressions;
CREATE TABLE expressions (
    id          serial primary key,
    uri         varchar(2000) NOT NULL, -- http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
    main_html    text,
    main_text    text,
    title       varchar(2000),
    "references"  varchar(2000)[],
    "aliases"  varchar(2000)[],
    meta_description   text
);