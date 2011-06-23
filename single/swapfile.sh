#!/bin/bash

if [ "$1" = "-h" -o "$1" = "--help" ]
then
	echo "Usage mode:"
	echo -e "\t$0 swapsize - where swapsize is the amount in MiB"
	echo -e "\t-h | --help - shows this help"
	exit 0
fi

if [ $(id -u) -ne 0 ]
then
	echo "ERROR: Must be used by superuser."
	exit 1
fi

declare -i size=$1

if [ $size -gt 255 ]
then
	size=$(($size * 1024))
else
	echo "ERROR: The swap size must be at least 256 MiB."
	exit 2
fi

if [ ! -f /swap ]
then
	echo "Creating the swap file, $1 MiB."
	dd if=/dev/zero of=/swap bs=1024 count=$size
	mkswap /swap
	swapon /swap
else
	echo "INFO: The swap file /swap already exists."
fi

grep swap /etc/fstab
exit=$?

if [ $exit -eq 0 ]
then
	echo "INFO: the swap line is in /etc/fstab."
else
	echo "INFO: adding the swap line to /etc/fstab."
	echo "/swap none swap sw 0 0" >> /etc/fstab
fi

