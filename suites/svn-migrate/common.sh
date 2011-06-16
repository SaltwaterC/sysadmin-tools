#!/bin/bash

function show_help
{
	echo "Usage mode:"
	echo -e "\tEdit the configuration file as appropriate. Upload the files."
	echo -e "\tUse svn-dump.sh onto the old server."
	echo -e "\tUse svn-load.sh onto the new server."
	exit 0
}

function superuser_check
{
	if [ $(id -u) -ne 0 ]
	then
		echo "ERROR: Must be used by superuser."
		exit 1
	fi
}

function config_check
{
	if [ ! $1 ]
	then
		echo "ERROR: The SVN repositories path is undefined."
		exit 2
	fi
}

function runtime_check
{
	if [ $1 != 0 ]
	then
		echo "ERROR: $2 Check your setup."
		if [ "$3" == "erase" ]
		then
			rm -rf $DUMP_PATH
			rm -rf $DUMP_NAME.tar.gz
		fi
		exit $1
	else
		echo "INFO: Done."
	fi
}

