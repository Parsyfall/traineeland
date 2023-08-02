#!/bin/bash
nonSTD=''
minutes=*
hour=*
day_of_month=*
month=*
day_of_week=*
path=''

while [ $# -gt 0 ]; do
    case $1 in
    '--non-std')
        shift
        if [ -z $1 ]; then
            echo "No value was specified"
            echo "--non-std mus be followed by a non standart 'nickname'"
        fi
        nonSTD=$1
        break
        ;;
    '--path')
        if [ -z $1 ]; then
            echo "No value was specified for path"
            echo "--path mus be followed by the absolute path to the script"
            exit -1
        fi
        path=$1
        shift
        ;;
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

if [[ $minutes = '*' && $hour = '*' && $day_of_month = '*' &&
    $month = '*' && $day_of_week = '*' && -z $nonSTD ]]; then
    echo "No arguments were specified. Script will run every minute"
fi

if [ -z $path ]; then
    echo "Mandatory argument '--path' wasn't specified, aborting..."
    exit -1
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
