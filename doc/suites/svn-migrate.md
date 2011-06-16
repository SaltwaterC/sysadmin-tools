## Usage mode

 * Edit the config.sh script with the appropriate repositories path. If it's the same path for both the source and the target machine, you may upload the same file onto both machines. Otherwise, you need an appropriate configuration file for both the source and the target servers.
 * Upload the files to the source and target machines.
 * Run svn-dump.sh onto the source machine. Wait for the process to finish.
 * Copy the resulted dump archive from the source machine to the target machine. By default this file is named svn-dump.tar.gz. The current mode of operation dumps all the repositories into a single, compressed, dump file.
 * Run the svn-load.sh onto the target machine. Wait for the process to finish. You may need to set the appropriate filesystem permissions for the resulted repositories onto the target machine.

## Dependencies

 * bash
 * coreutils
 * subversion
 * tar
 * gzip

