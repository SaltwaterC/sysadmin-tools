#!/bin/bash

if [ "$1" = "-h" -o "$1" = "--help" ]
then
	echo "Usage mode:"
	echo -e "\t$0 - the script does not have any runtime flags"
	echo -e "\t-h | --help - shows this help"
	exit 0
fi

if [ $(id -u) -ne 0 ]
then
	echo "ERROR: Must be used by superuser."
	exit 1
fi

# A bunch of functions
function map
{
	if [ $# -le 1 ]
	then
		return
	else
		local f=$1
		local x=$2
		shift 2
		local xs=$@
		$f $x
		map "$f" $xs
	fi
}

function disable_service
{
	if [ -f /etc/init/$1.conf ]
	then
		echo "Disabling $1"
		stop $1
		mv /etc/init/$1.conf /etc/init/$1.conf.noexec
	else
		echo "$1 is already disabled"
	fi
}

# Useless on a server machine
apt-get -y remove --purge consolekit dbus
rm -rf /var/log/ConsoleKit
apt-get -y autoremove --purge

map disable_service atd tty2 tty3 tty4 tty5 tty6

