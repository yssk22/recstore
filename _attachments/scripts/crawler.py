#!/usr/bin/env python
# -*- coding: utf-8 -*-

import getopt
import os
import sys
import datetime
import time
import json
import urllib
import re
import traceback

from hashlib import md5
from restkit import Resource
from restkit.errors import ResourceNotFound

BASE_URL="http://tv.infoseek.co.jp"
RE_EPG_LINK=r'href="\/tvpi.epg\?[^"]+'

def usage():
    sys.stderr.write("""
python crawler.py -d uri [-s date] [-n days]

   -d url  : CouchDB's database URI to store iEPG data.
             (default: http://localhost:5984/tv)
   -s date : the start date(YYYY-mm-dd) to crawl on infoseek TV guide.
             (default: datetime.date.today())
   -n days : the number of days to crawl on infoseek TV guide. 
             (default: 1)
""")

def insert_or_update(db, doc):
    path = "/" + doc["_id"]
    try:
        old = json.loads(db.get(path = path).body)
        for key in doc.keys():
            old[key] = doc[key]
        doc = old
    except ResourceNotFound:
        pass
    db.put(path = path, payload = json.dumps(doc))

def url_list(start = datetime.date.today(), days = 8):
    BASE_PATH = "/VHF/tv_vhf.html"
    lst = []
    for i in range(days):
        date = start.replace(day=start.day + i)
        lst.append(BASE_URL + BASE_PATH + "?" + 
                   urllib.urlencode({
                    "pg" : "tv_vhf.html",
                    "area" : "008",
                    "sdate" : date.strftime("%Y%m%d"),
                    "shour" : 0,
                    "lhour" : 24
                    }))
    return lst

def fetch_content(url):
    return urllib.urlopen(url).read()

def extract_epg_link(html):
    return [BASE_URL + e[6:] for e in re.findall(RE_EPG_LINK, html)]

def parse_iepg(txt):
    # http://350ml.net/labo/iepg.html
    epg = txt.decode("shift-jis")
    header, memo = tuple(epg.split("\r\n\r\n", 1))
    
    doc = {}
    for line in header.split("\r\n"):
        key, value = tuple(line.split(":", 1))
        doc[key] = value.strip()

    doc["memo"] = memo

    return doc

if __name__ == "__main__":
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hd:s:n:", 
                                   ["database", "start", "days"])
    except getopt.GetoptError:
        sys.exit(2)

    n = 1
    s = datetime.date.today()
    d = "http://localhost:5984/recstore"

    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit(1)
        if o in ("-d", "--database"):
            d = a
        if o in ("-s", "--start"):
            s = datetime.datetime.strptime(a, "%Y-%m-%d").date()
        if o in ("-n", "--days"):
            n = int(a)

    print "Database: %s" % d
    print "   Start: %s" % s
    print "    Days: %s" % n

    t1 = time.time()
    founds = 0

    db = Resource(d)
    try:
        db.get()
    except ResourceNotFound:
        db.put() # create a database

    for url in url_list(days = n):
        print "Fetching epg list menu from %s ..." % url
        content = fetch_content(url)
        links =  extract_epg_link(content)
        print "%s iEPGs found." % len(links)
        founds += len(links)
        for link in links:
            try:
                print "Converting iEPG to couch document"
                print "url = %s" % link
                _id = md5(link).hexdigest()
                epg = fetch_content(link)
                doc = parse_iepg(epg)
                doc["_id"] = _id
                doc["type"] = "iepg"
                doc["url"] = link
                print "   id = %s" % doc["_id"]
                print "title = %s" % doc["program-title"]
                insert_or_update(db, doc)
            except Exception, e:
                traceback.print_exec()
    t2 = time.time()
    print "%s iEPGs imported in %.2fs sec." % (founds, (t2 - t1))
