# Recstore

TV recording system on top of Apache CouchDB. This package can be used only in Japan.

# Requirements

- Apache CouchDB 0.11.0
- Python 2.6 
- Python restkit
- recfriio

# Installation
## Deploy on CouchDB

    $ git clone ....
    $ cd recstore
    $ couchapp push http://admin:password@host:port/recstore

## Configureing crontab

You need to confgiure crontab on your recording server (where recfriio is available) enable to collect iEPG information from infoseek(http://tv.infoseek.co.jp/).

    COUCH_URL=http://admin:password@host:port/recstore
    LOG_DIR=/var/log/recstore
    
    # --- crawler
    30 5 * * 0 /usr/bin/curl -X GET ${COUCH_URL}/recstore/_design/recstore/scripts/crawler.py | /usr/bin/python2.6 - -d ${COUCH_URL}/recstore -n 8 2>&1 > ${LOG_DIR}/recstore_weekly.log
    30 5 * * 1-6 /usr/bin/curl -X GET ${COUCH_URL}/recstore/_design/recstore/scripts/crawler.py | /usr/bin/python2.6 - -d ${COUCH_URL}/recstore -n 1 2>&1 > ${LOG_DIR}/recstore_daily.log
    # --- scheduler
    */2 * * * * /usr/bin/curl -X GET ${COUCH_URL}/recstore/_design/recstore/scripts/scheduler.py | /usr/bin/python2.6 - -d ${COUCH_URL}/recstore 2>&1 > ${LOG_DIR}/recstore_scheduler.log


# License

See LICENSE file (in Japanese)