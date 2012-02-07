#!/bin/bash

# purge the linux-image-virtual obsolete packages
version=$(ls /boot/ | grep vmlinuz | grep generic | cut -d"-" -f2 | sort -u)

# look for the generic packages under 32-bit
declare -a installed=($(ls /boot/ | grep vmlinuz | grep generic | cut -d"-" -f3 | sort -u))
count=${#installed[@]}

for ((i = 0; i < count - 1; i++))
do
	apt-get -y autoremove --purge linux-image-$version-${installed[$i]}-virtual
done

# look for the server packages under 64-bit
declare -a installed=($(ls /boot/ | grep vmlinuz | grep server | cut -d"-" -f3 | sort -u))
count=${#installed[@]}

for ((i = 0; i < count - 1; i++))
do
	apt-get -y autoremove --purge linux-image-$version-${installed[$i]}-virtual
done

# purge the linux-image-ec2 packages that are not in use
version=$(ls /boot/ | grep vmlinuz | grep ec2 | cut -d"-" -f2 | sort -u)
declare -a installed=($(ls /boot/ | grep vmlinuz | grep ec2 | cut -d"-" -f3 | sort -u))
count=${#installed[@]}

for ((i = 0; i < count; i++))
do
	if [ "$version-${installed[$i]}-ec2" != "$(uname -r)" ]
	then
		apt-get -y autoremove --purge linux-image-$version-${installed[$i]}-ec2
	fi
done
