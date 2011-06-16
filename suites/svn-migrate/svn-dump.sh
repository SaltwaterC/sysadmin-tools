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
	mkdir -p $DUMP_PATH
fi

for REPOSITORY_PATH in $(dir -d $SVN_REPOSITORIES_PATH/*)
do
	REPOSITORY=$(basename $REPOSITORY_PATH)
	echo "INFO: Dumping the $REPOSITORY repository."
	svnadmin dump $REPOSITORY_PATH > $DUMP_PATH/$REPOSITORY.svn
	runtime_check $? "During repository dump." "erase"
done

cd $(dirname $DUMP_PATH)
echo "INFO: Creating the migration archive $DUMP_NAME.tar.gz."
tar -czvf $DUMP_NAME.tar.gz $DUMP_NAME
runtime_check $? "Could not create the dump archive." "erase"

