import shutil
import traceback
import json
import re
from datetime import datetime 
import os

def logStatus(msg):
    # open log file and append 
    with open(os.path.join(os.path.dirname(__file__), os.path.expanduser(data['log']['location'])), 'a') as log:
        time = datetime.now().strftime('%Y-%m-%d %H:%M:%S\t')
        log.write(time +  msg + "\r\n")

# parse config file
with open(os.path.dirname(__file__) + "/settings.json", 'r') as jsonfile:
    data = json.load(jsonfile)


target_dir = data['destination']

# set destination folder
dest_fd = target_dir + datetime.now().strftime('Backup_%Y-%m-%d_%H-%M-%S')


try:
    # copy files
    for dir in data['source']:
        if(os.path.isdir(dir)):
            shutil.copytree(dir, dest_fd + "/" + os.path.basename(dir))
            continue

        if(not os.path.exists(dest_fd + "/")):
            os.makedirs(dest_fd + "/")
        shutil.copy(dir, dest_fd + "/")

    # get all backup directories
    with os.scandir(target_dir) as it:
        targest = [file.name for file in it if file.is_dir() and "Backup" in file.name ]

    # delete older backups
    targest.sort(reverse=True)
    for dir in targest[data['log']['max-backups']: ]:
        shutil.rmtree(target_dir + dir)

    # log success
    logStatus("Operation succeeded")
except Exception as e:
    # log any thrown exceptions
    err = "".join(traceback.format_exception_only(e))   # use traceback to format exception message
    err = re.sub("\[Errno \d\]", "", err)
    msg = "Operation interrupted due to unexpected error.\n\t" + err
    logStatus(msg)
        

