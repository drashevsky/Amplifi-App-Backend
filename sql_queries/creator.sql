drop table cards;
drop table users;

create table cards(
	id 	    BIGINT NOT NULL IDENTITY(1, 1),
	owner	VARCHAR(255) NOT NULL,
	text	nTEXT,
	link	TEXT NOT NULL,
	likes	BIGINT,
	PRIMARY KEY ( id )
);

create table users(
	username		VARCHAR(255) NOT NULL,
    pass            TEXT NOT NULL,          /* hash */
	usersFollowing	TEXT,                   /* string values seperated by commas */
    likedCards      TEXT,                   /* string values seperated by commas */
	PRIMARY KEY ( username )
);

INSERT INTO users VALUES ('daniel', '$2a$10$.Bh8Zxe73fVbbG/5bD.1P.Z46kKbAWw.w4LQ7AjJecV77/ElqTNeG', 'a', 'a');