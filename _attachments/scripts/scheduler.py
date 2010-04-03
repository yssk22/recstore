#!/usr/bin/env python
# -*- coding: utf-8 -*-

import getopt
import os
import sys
import datetime
import urllib
import re
import subprocess
import tempfile

SCHED_REGEX = re.compile(r"\#\<recstore\>\n.+\#\</recstore\>\n",
                         re.MULTILINE and re.DOTALL)

def usage():
    sys.stderr.write("""
python scheduler.py -d uri 

   -d url  : CouchDB's database URI
""")

def get_new_schedule(url):
    today = datetime.datetime.today()
    start = today - datetime.timedelta(hours = 6);

    url = "%s?format=text&descending=true&endkey=[%s,%s,%s,%s,0]" % (
        url, start.year, start.month, start.day, start.hour)
    return (url, urllib.urlopen(url).read())

def get_current_schedule():
    p = subprocess.Popen("crontab -l", shell=True,
                         stdin=subprocess.PIPE,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE)
    p.wait()
    if p.returncode != 0:
        old_schedule = ""
    else:
        old_schedule = p.stdout.read()
    return old_schedule

def update_crontab(new, old):
    m = SCHED_REGEX.search(old)
    if m:
        old = old[0:m.start()] + old[m.end():]
    newtab = old + new
    t = tempfile.NamedTemporaryFile()
    try:
        t.write(newtab)
        t.flush()
        p = subprocess.Popen("crontab %s" % t.name, shell=True,
                             stdin=subprocess.PIPE,
                             stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE)
        p.wait()
    finally:
        t.close()


if __name__ == "__main__":
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hd:", 
                                   ["database"])
    except getopt.GetoptError:
        sys.exit(2)

    d = "http://localhost:5984/recstore"

    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit(1)
        if o in ("-d", "--database"):
            d = a

    url = "%s/_design/recstore/_list/schedule/records" % d
    url, new = get_new_schedule(url)
    current = get_current_schedule()
    update_crontab(new, current)
    print "Updated from %s" % url
    print "%s schedules are registered." % len(new.split("\n"))
