# CNP proxy services

C64 OS networking, introduced in v1.07, relies on several proxy servers running "in the cloud" and you can run these yourself as well.

This document will provide a basic rundown of how to set some of it up.  Starting with the CNP server which provides the tunneling services.

## CNP tunnel / proxy server

The `cnp.server.js` script provides the backend for CNP tunnels from C64 OS.  It depends on MySQL or MariaDB for authentication.  There are a few steps involved in getting it going.

### Requirements

You will need a recent node.js (exact requirements will be determined) and v18.19.0 at least is known to work.  You will also need Mysql or MariaDB.  MariaDB v10.11.11 is known to work.
Pretty much any version should be fine as long as nodejs can talk to it.  There is nothing complicated with the database queries.


### Setup

Several node.js modules are needed, so install those first.
```
npm install jsdom
npm install node-file-cache
npm install console-stamp
npm install readline-sync
npm install crypto-js
```

Then you need to setup the database.  You need to create a database called `cnp64` and then a `users` table within that database.  You'll need to grant access to the databse to a userid and configure a password.  I'll use `cnp64` as the userid also here.

First create the `cnp64` database and configure a userid to access it:
```
sudo mysql
create database cnp64;
create user 'cnp64'@'localhost' identified by 'thepasswordhere';
grant all privileges on cnp64.* to 'cnp64'@'localhost';
```

You can use whatever userid you want, you just need to put the userid & password in `config/default.json` so the scripts can use it.

The `config/default.json` file contains:
```
{
    "cnp_server_mysql": {
        "host": "127.0.0.1",
        "user": "cnp64",
        "password": "thepasswordhere",
        "database": "cnp64"
    }
}
```

You can of course run it on a separate host, or use different database or user names.  This is just to get you started.

Now that you have a database and a userid that can access it, you just need to create the users table and insert a user to authenticate.

Define the database:
```
sudo mysql cnp64
MariaDB [cnp64]> create table users (name varchar(64) not null, cnpusername varchar(32) not null, cnppwordsalt varchar(32) not null, cnppwordhash varchar(32) not null );
```

This schema might be changed later to be more accurate, but it is sufficient to use for now.

Now you need to create a user and set the password salt and hash.  I suggest using the same username & password as you use for `services.c64os.com` so you can just change one field.

First get the password info for the fields.  Below I use the password `test` to generate salt/hash.

```
nodejs utilities/pwsalt.js
Enter your password: ****
cnppwordsalt: ebba390af79592c9d240fb3dcdec7f40
cnppwordhash: 0f1a73fb6759cb53120b65913fa6187b
```

Then back in `mysql`:

```
insert into users values ('First and last name', 'username', 'ebba390af79592c9d240fb3dcdec7f40', '0f1a73fb6759cb53120b65913fa6187b');
```

This creates a user called `username` with a password of `test` for this example.
You can change just the password later if you needed to, but need to hash with the same salt.
That is too involved for this README.

To just change the password hash use `update users set cnppwordhash = '0f1a73fb6759cb53120b65913fa6187b' where cnpusername = 'username'; ` and you can update any field the same way.

And this point you should be able to run the cnp server and have it connect to the database and even authenticate `username`.

If you plan on using your own servers full-time you should probably setup some systemd style startup scripts.  I tend to use mine for testing so I start it up manually in a screen session.
I use a script like this:
```
#!/bin/sh
#
while true
do
    nodejs --expose-gc cnp.server.js
    sleep 3
done
```

This lets me see the output from the server for diagnostics and I can add some print style debugging messages if needed.

## Wikipedia proxy server

This is similar to the above and will be added soon.

