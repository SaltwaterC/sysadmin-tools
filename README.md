## About

My every day sysadmin tools. Besides playing with cool technologies, the
sysadmin work has a fair share of repetitive work. The rule of thumb is: if you
have to make it twice, write a script. Therefore, I got a pretty large
collection that I'm going to release after some cleaning up, documenting the
essential parts, etc.

## The structure

 * /single - contains scripts that contain all the provided functionality into a
single file.
 * /doc/single - every script has a coresponding documentation file. Usually the
longer version since every script has a built in help system which is invoked by
passing the -h or --help flag.

## The contents

### Single file scripts:

 * swapfile - creates a swap partition inside a flat file. Useful for
 machines that don't have dedicated swap partitions. Useful for t1.micro EC2
 instances, but not limited to.
 * ubuntu-ec2-jeos - the Ubuntu EC2 images drag some fat with them. This scripts
 strips down all the useless services in order to obtain a true JeOS (Just
 enough OS) as the basic building block.

