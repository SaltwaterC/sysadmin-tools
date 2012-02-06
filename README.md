## About ![still maintained](http://stillmaintained.com/SaltwaterC/sysadmin-tools.png)

My every day sysadmin tools. Besides playing with cool technologies, the sysadmin work has a fair share of repetitive work. The rule of thumb is: if you have to make it twice, write a script. Therefore, I got a pretty large collection that I'm going to release after some cleaning up, documenting the essential parts, etc.

## The structure

 * /single - contains scripts that contain all the provided functionality into a single file.
 * /suites - contains multiple scripts that are targeted to specific tasks or technologies.

## The contents

### Single file scripts:

 * [swapfile.sh](https://github.com/SaltwaterC/sysadmin-tools/wiki/swapfile.sh) - creates a swap partition inside a flat file

### Suites:

 * [svn-migrate](https://github.com/SaltwaterC/sysadmin-tools/wiki/svn-migrate) - does the heavy lifting for migrating a bunch of SVN repositories from an old server to a new server.
 * aws-tools - various tools for using with Amazon Web Services.
  * [ubuntu-ec2-jeos.sh](https://github.com/SaltwaterC/sysadmin-tools/wiki/ubuntu-ec2-jeos.sh) - the Ubuntu EC2 images drag some fat with them. This scripts strips down all the useless services in order to obtain a true JeOS (Just enough OS) as the basic building block.
  * [ubuntu-ec2-kernel-purge.sh](https://github.com/SaltwaterC/sysadmin-tools/wiki/ubuntu-ec2-kernel-purge.sh) - script for purging the old versions of unused kernels. For Ubuntu on EC2.
  * [ebs-auto-snapshot.js](https://github.com/SaltwaterC/sysadmin-tools/wiki/ebs-auto-snapshot.js) - takes care of the automatic snapshot of all the 'in-use' EC2 EBS volumes from a specified region. Multiple regions can be specified. Rotates the snapshots at a predefined value, so the number of snapshots per volume never goes over that limit.
  * [rds-auto-snapshot.js](https://github.com/SaltwaterC/sysadmin-tools/wiki/rds-auto-snapshot.js) - takes care of the automatic snapshot of the RDS instances. The same way as ebs-auto-snapshot.js does for the EBS volumes.

