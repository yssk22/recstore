# Recstore

CouchDBで実装されたオンラインTV録画システムです。

# 前提ソフトウェア

- Apache CouchDB 0.11.0
- Python 2.6 
- Python restkit
- recfriio

# インストール
## CouchDBへのデプロイ

    $ git clone git://github.com/yssk22/recstore.git
    $ cd recstore
    $ couchapp push http://admin:password@host:port/recstore

## crontab の設定

録画サーバー(recfriioが導入されたサーバー)でiEPG情報のクローリング・録画スケジューリングのためのcron設定を行います。

    COUCH_URL=http://admin:password@host:port/recstore
    LOG_DIR=/var/log/recstore
    
    # --- crawler
    30 5 * * 0 /usr/bin/curl -X GET ${COUCH_URL}/recstore/_design/recstore/scripts/crawler.py | /usr/bin/python2.6 - -d ${COUCH_URL}/recstore -n 8 2>&1 > ${LOG_DIR}/recstore_weekly.log
    30 5 * * 1-6 /usr/bin/curl -X GET ${COUCH_URL}/recstore/_design/recstore/scripts/crawler.py | /usr/bin/python2.6 - -d ${COUCH_URL}/recstore -n 1 2>&1 > ${LOG_DIR}/recstore_daily.log
    # --- scheduler
    */2 * * * * /usr/bin/curl -X GET ${COUCH_URL}/recstore/_design/recstore/scripts/scheduler.py | /usr/bin/python2.6 - -d ${COUCH_URL}/recstore 2>&1 > ${LOG_DIR}/recstore_scheduler.log

尚、上記の方法だと、プロセスの実行中に COUCH_URLが展開されるため、ps コマンドで CouchDBのパスワードを見ることができてしまうため、注意して設定してください。

# License

LICENSE ファイルを参照してください。