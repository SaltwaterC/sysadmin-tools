#!/bin/bash

. $(dirname $0)/config.sh
. $(dirname $0)/common.sh

if [ "$1" = "-h" -o "$1" = "--help" ]
then
	show_help
fi

superuser_check
config_check $SVN_REPOSITORIES_PATH

if [ ! -d $DUMP_PATH ]
then
	echo "INFO: Unpacking the dump files."
	tar -xzvf $DUMP_NAME.tar.gz
	runtime_check $? "Can't extract the dump archive."
fi

for DUMP_FILE in $(dir -d $DUMP_PATH/*)
do
	REPOSITORY=$(basename $DUMP_FILE .svn)
	if [ ! -d $SVN_REPOSITORIES_PATH/$REPOSITORY ]
	then
		echo "INFO: Creating the $REPOSITORY repository."
		svnadmin create $SVN_REPOSITORIES_PATH/$REPOSITORY
		runtime_check $? "Can't create the $REPOSITORY repository."
	fi
	echo "INFO: Importing the existing revisions for $REPOSITORY ..."
	svnadmin load $SVN_REPOSITORIES_PATH/$REPOSITORY < $DUMP_FILE
	runtime_check $? "Can't load $DUMP_FILE into the $REPOSITORY."
done

