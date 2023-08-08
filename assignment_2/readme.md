
  

# "Automate" backup task

  

_A basic python script designed to periodically backup some files for you._

  

## Getting started
Script was originally designed for Ubuntu only, but now It should work fine on Windows too, and probably on other Debian Linux distros.

#### Requirements

- Python 3.10.12
- Bash/Powershell
#### Installation

Clone locally on your machine and run installation script.

```

git clone https://github.com/Parsyfall/traineeland.git

```

Navigate to assignment_2 folder and run the bash script with desired arguments (see [documentation](running-as-a-system-task))

```

cd ./assignment_2

```

```

bash runBackup.sh arg1 arg2 ...

```

## Documentation

### Settings

The script has two vital elements that must be kept in the same folder:

- Script itself ~~obviously isn't it?~~ (script.py)

- Settings file (settings.json)

These files are closely related, python file does the necessary operation based on settings and paths written in JSON file, which should look something like this: 
```

{

"source": [

"/home/<username>/Documents/",

"/home/<username>/Music/"

],

"destination": "/home/<username>/backup/",

  

"log": {

  

"location": "./backup.log",

  

"max-backups": 3

}

}

```
<p align="center"><i>Take in consideration that the above paths are just examples, please change them before use</i></p>

Now let's dive in what I meant with these fields.

`source` is a multi value parameter (a.k.a vector), here are specified files/folders to be backed up (absolute paths[^1]). Dummy example: `/home/<username>/Documents/`

  

`destination` is a single values parameter, write the absolute path[^2] to where the backup files will be stored. Dummy example: `/home/<username>/backup/`

  

This script creates some logs whether backup was successful or not which are stored in .log file.

Parameter `location` is responsible for the log file location (by default logs will be stored in the same folder with the python script). If you'd like to store them in other place feel free to change this argument value.

  

Due to my mentor request and also to not dump your memory with backups, there is a limit of how many backups can be in a folder, by default it's set to 3 but you can change it to whatever number you like, just change the value of `max-backups` to your desired number (**please don't introduce zero or negative numbers, idk what will happen**).

## Running as a system task
You can always do the running manually by calling python interpreter followed by the path to the script.
```
python3 path-to-the-script
```
Also because my mentor requested to make this script to be executed by task manager and because it might be suited for a backup to run periodically, I came up with the `runBackup.ps1` powershell script that will set the task for you.
### Linux (Ubuntu)
Script can be executed by either giving execute permission to the powershell script and executing:
```
chmod +x runBackup.ps1
./runBackup.ps1 arguments...
```
or by calling bash interpreter with the absolute/relative path to the script, then script arguments:
```
bash ./runBackup.ps1 arguments...
```
In order to program your backups you have to run the script specifying some of the following arguments:
- `--path` (**mandatory argument**) followed by the absolute path to the python script.
- `-m` followed by a number between 0 and 59 that represent minute.
- `-h` followed by number between 1 and 23 that represent hour.
- `-dm` followed by number between 1 and 31 that represent a day of the month.
- `-M` followed by number between 1 and 12 that represent a month.
- `-dw` followed by a number between 0 and 7 that represent a day of the week (0 or 7 is Sunday), weekday abbreviations are also supported (mon, wed, fri...)
- `--non-std` followed by a specific nickname like @yearly, @annually, @monthly, @weekly, @daily, @hourly, @reboot to run it on that interval. ([see more about that](https://man7.org/linux/man-pages/man5/crontab.5.html#EXTENSIONS))
You can even use ranges or intervals for majority of these parameters, for more info read the documentation of [crontab](https://man7.org/linux/man-pages/man5/crontab.5.html#DESCRIPTION) or use this [site](https://crontab.guru/) if you don't want to read the documentation.

### Windows
In order to run the script open powershell and type (suppose shell in open in the same folder as our script):
```
powershell -ExecutionPolicy Bypass -File .\runBackup.ps1  arguments...
```
Arguments that script can process are (order is irrelevant):
- `-path` (**mandatory argument**) followed by the absolute path to the python script.
- `-m` followed by a number between 0 and 59 that represent minute, if not specified will be set to 0.
- `-h` followed by number between 1 and 23 that represent hour, if not specified will be set to 0.
- `daily` don't require a value. Tell the script that task should run on a daily basis.
    - `dayInterval` specifies the interval between the days in the schedule. An interval of 1 produces a daily schedule. An interval of 2 produces an every-other day schedule. Throw an error unless `daily` argument is specified.
- `weekly` don't require a value. Tell the script that task should run on a weekly basis.
    - `weekInterval` specifies the interval between the weeks in the schedule. An interval of 1 produces a weekly schedule. An interval of 2 produces an every-other week schedule. Throw an error unless `weekly` argument is specified.
    - `daysOfWeek` specifies an array of the days of the week on which Task Scheduler runs the task. Accepted values (comma separated, without spaces): `Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday`. If not specified will be set to `Monday`. Throw an error unless `weekly` argument is specified.

**Important:** `daily` and `weekly` arguments are mandatory and mutually exclusive, which means that script won't work if neither or both of them are specified. For the script to work correctly you must specify one, and only one, of these two.

In comparison to Linux version, script can't explicitly run the task monthly, so if you want to run it monthly you will have to figure out somehow, or wait for me to make that  ¯\\\_(ツ)_/¯

[^1]: Double quoted and comma separated values

[^2]: Double quoted value, keep the comma at the end
