#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time
import subprocess

a = {
    "cmd": u'echo "ほげほげ"'
}
p = subprocess.Popen(cmd, shell=True,
                     stdin=subprocess.PIPE,
                     stdout=subprocess.PIPE,
                     stderr=subprocess.PIPE)
p.wait()
print p.stdout.read()
