` # \
# PowerShell Param statement : every line must end in #\ except the last line must with <#\
# And, you can't use backticks in this section        #\
param (  #\
    # Path to script  #\
    [Parameter(Mandatory)]  #\
    [string] $path,  #\
      #\
    # Daily  #\
    [Parameter()]  #\
    [switch] $daily,  #\
      #\
    # Minutes  #\
    [Parameter()]  #\
    [int] $m = 0,  #\
      #\
    # Hour  #\
    [Parameter()]  #\
    [int] $h = 0,  #\
  #\
    # At which day interval to run, default 1 (every day)  #\
    [Parameter()]  #\
    [int] $dayInterval = 1,  #\
  #\
    # Weelky  #\
    [Parameter()]  #\
    [switch] $weekly,  #\
      #\
    # In which days to run, by default on Mondays  #\
    [Parameter()]  #\
    [string[]] $daysOfWeek = @("Monday"),  #\
  #\
    # At which week interval to run, default 1 (each week)  #\
    [Parameter()]  #\
    [int] $weekInterval = 1  #\
)<#\

#^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ `
#vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
# Bash Start ------------------------------------------------------------


nonSTD=''
minutes=*
hour=*
day_of_month=*
month=*
day_of_week=*
path=''

while [ $# -gt 0 ]; do
    if [ $1 == "--path" ]; then
        if [ -z $1 ]; then
            echo "No value was specified for path"
            echo "--path mus be followed by the absolute path to the script"
            exit -1
        fi
        path=$2
        shift
        shift
        continue
    fi
    if [ $1 == '--non-std' ]; then
        shift
        if [ -z $1 ]; then
            echo "No value was specified"
            echo "--non-std mus be followed by a non standart 'nickname'"
        fi
        nonSTD=$1
        break
    fi
    case $1 in
    '-dw')
        shift
        if [ -z $1 ]; then
            echo "No value was specified"
            echo "-mo flag must be followed by a number between 0 and 7 or short representing the day of a week (0 or 7 is Sunday), or use names (mon, wed, fri...) "
        fi
        month=$1
        shift
        if [[ $day_of_month = '*' ]]; then # in case hour and minutes were not set
            hour=0
            minutes=0
        fi
        ;;
    '-M')
        shift
        if [ -z $1 ]; then
            echo "No value was specified"
            echo "-M flag must be followed by a number between 1 and 12 representing the day of a month, or their short form (jan, feb...)"
        fi
        month=$1
        shift
        if [[ $day_of_month = '*' ]]; then # in case only month was specified set the day for the 1st of that month at midnight
            day_of_month=1
            hour=0
            minutes=0
        fi
        ;;
    '-dm')
        shift
        if [ -z $1 ]; then
            echo "No value was specified"
            echo "-dm flag must be followed by a number between 1 and 31 representing the day of a month"
        fi
        day_of_month=$1
        shift
        if [[ $hour = '*' ]]; then # in case hour or minutes wasn't set
            hour=0
        elif [[ $minutes = '*' ]]; then
            minutes=0
        fi
        ;;
    '-h')
        shift
        if [ -z $1 ]; then
            echo "No value was specified"
            echo "-h flag must be followed by a number between 0 and 23 representing a hour"
        fi
        hour=$1
        if [[ $minutes == '*' ]]; then # in case $minutes weren't set, make them 0
            minutes=0
        fi
        shift
        ;;
    '-m')
        shift
        if [ -z $1 ]; then
            echo "No value was specified"
            echo "-m flag must be followed by a number between 0 and 59 representing minutes"
        fi
        minutes=$1
        shift
        ;;
    *)
        echo "Option not regonized"
        exit -1
        ;;
    esac
done

if [ -z $path ]; then
    echo "Mandatory argument '--path' wasn't specified, aborting..."
    exit -1
fi

if [[ $minutes = '*' && $hour = '*' && $day_of_month = '*' &&
    $month = '*' && $day_of_week = '*' && -z $nonSTD ]]; then
    echo "No arguments were specified. Script will run every minute"
fi

if [ ! -z $nonSTD ]; then
    (
        crontab -l
        echo "$nonSTD /usr/bin/python3 $path"
    ) | crontab -
else
    (
        crontab -l
        echo "$minutes $hour $day_of_month $month $day_of_week /usr/bin/python3 $path"
    ) | crontab -

fi
exit 0 


# Bash End --------------------------------------------------------------
# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
echo > /dev/null <<"out-null" ###
'@ | out-null
#vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
# Powershell Start ----------------------------------------------------#>

if ($weekly -and $daily) {
    Write-Error "-weekly and -daily arguments are incompatible, use only one of them"
    exit -1
}

$time = Get-Date -UFormat %R -Minute $m -Hour $h    # Display time in 24h format
$daysOfWeek = $daysOfWeek -split ','    # Split string to array

if ($daily) {
    $trigger = New-ScheduledTaskTrigger -Daily -DaysInterval $dayInterval -At $time
}
elseif ($weekly) {
    $trigger = New-ScheduledTaskTrigger -Weekly -WeeksInterval $weekInterval -DaysOfWeek $daysOfWeek -At $time
}

$action = New-ScheduledTaskAction -Execute python3 -Argument $path

Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "Backup Script" -Description "Periodicaly back up files"

# Powershell End -------------------------------------------------------
