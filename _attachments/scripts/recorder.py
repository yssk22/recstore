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
import subprocess
import traceback

def usage():
    sys.stderr.write("""
python recorder.py -d uri 

   -d url  : IEPG document URI
""")

def get_document(url):
    return json.loads(urllib.urlopen(url).read())

def exec_record(doc):
    outdir  = doc["outdir"]
    command = doc["command"].encode("utf-8")
    # filename
    filename = os.path.join(outdir,
                            "%s.%s.%s-%s.ts" % (doc["year"], 
                                                doc["month"], 
                                                doc["date"],
                                                doc["program-title"])).encode("utf-8")
    logname  = os.path.join(outdir,
                            "%s.%s.%s-%s.log" % (doc["year"], 
                                                 doc["month"], 
                                                 doc["date"],
                                                 doc["program-title"])).encode("utf-8")
    channel = doc["channel"]
    with open(logname, "w") as f:
        def log(msg):
            n = datetime.datetime.now().strftime("%Y/%m/%d %T")
            f.write("%s : %s\n" % (n, msg))
        def rec(cmd):
            try:
                log("REC: %s" % cmd)
                f.flush()
                p = subprocess.Popen(cmd, shell=True,
                                     stdin=subprocess.PIPE,
                                     stdout=subprocess.PIPE,
                                     stderr=subprocess.PIPE)
                p.wait()
                if p.returncode != 0:
                    log("REC: Command Error - %s" % p.stderr.read())
                    return False
                else:
                    return True
            except Exception, err:
                log("REC: Error - %s\n", err)
                log(traceback.format_exc)
                return False


        # culculate recording secs
        start = datetime.datetime.strptime(doc["start_date"], "%Y-%m-%dT%H:%M:%SZ")
        start = start + datetime.timedelta(hours = 9)
        end = datetime.datetime.strptime(doc["end_date"], "%Y-%m-%dT%H:%M:%SZ")
        end = end + datetime.timedelta(hours = 9)
        now = datetime.datetime.now()
        
        log("*" * 80)
        log("filename : %s" % filename)   
        log(" channel : %s" % channel)
        log("   start : %s" % start);
        log("     end : %s" % end);
        log("*" * 80)
        log("")

        if now < start:
            wait = (start - now).seconds - 5
            log("waiting %s seconds\n" % wait)
            time.sleep(wait)
        else:
            log("Cannot record (overtime!)\n" % channel)
            exit(1)

        # now start to record
        retry_until = start + datetime.timedelta(minutes = 5)
        while True:
            now = datetime.datetime.now()
            if now > retry_until:
                log("Over retries")
                break
            else:
                now = datetime.datetime.now()
                if now > end:
                    break
                secs = (end - now).seconds
                cmd = "%s --b25 %s %s '%s'" % (command,
                                               channel,
                                               secs,
                                               filename)
                if rec(cmd):
                    log("Successfully Recorded!!")
                    break
                else:
                    log(" ... Retry ... ")
                    time.sleep(1)

        log("Exiting a recorder ...")

#-----------------------------
if __name__ == "__main__":
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hd:", 
                                   ["document"])
    except getopt.GetoptError:
        sys.exit(2)

    url = "http://localhost:5984/recstore/default"
    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit(1)
        if o in ("-d", "--document"):
            url = a

    doc = get_document(url)
    exec_record(doc);

