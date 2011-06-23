var settings = {
	/**
	 * Your AWS credentials
	 */
	accessKeyId: '',
	secretAccessKey: '',
	/**
	 * Place here the EC2 regions where to operate
	 */
	regions: ['us-east-1'],
	/**
	 * Number of snapshots per volume to keep
	 */
	rotate: 30
};

var ec2 = require('aws-js').ec2;

ec2.setCredentials(settings.accessKeyId, settings.secretAccessKey);

var ebs = {
	
	fetch: function (region) {
		console.log('Taking snapshots for region: ' + region);
		ec2.setRegion(region);
		
		ec2.call('DescribeVolumes', {}, function (error, result) {
			if ( ! error) {
				if (result.volumeSet) {
					for (var i in result.volumeSet.item) {
						var volume = result.volumeSet.item[i];
						if (volume.status === 'in-use') {
							console.log('Sending to process: ' + volume.volumeId);
							ebs.process(volume.volumeId);
						}
					}
				} else {
					console.error('ERROR: no volumes returned.');
				}
			} else {
				console.error(error.message);
			}
		});
	},
	
	process: function (volumeId) {
		var query = {
			'Filter.1.Name': 'volume-id',
			'Filter.1.Value.1': volumeId,
			'Filter.2.Name': 'status',
			'Filter.2.Value.1': 'completed'
		};
		ec2.call('DescribeSnapshots', query, function (error, result) {
			if ( ! error) {
				if (result.snapshotSet) {
					if (result.snapshotSet.item) {
						if (result.snapshotSet.item.length >= settings.rotate) {
							var counter = result.snapshotSet.item.length - settings.rotate + 1;
							for (var i in result.snapshotSet.item) {
								ebs.delete_snap(result.snapshotSet.item[i].snapshotId);
								counter--;
								if (counter == 0) {
									break;
								}
							}
						}
					}
				} else {
					console.error('ERROR: no snapshots returned.');
				}
			} else {
				console.error(error.message);
			}
			
			ebs.take_snap(volumeId);
		});
	},
	
	delete_snap: function (snapshotId) {
		console.log('Delete snapshot: ' + snapshotId);
		ec2.call('DeleteSnapshot', {'SnapshotId': snapshotId}, function (error, result) {
			if ( ! error) {
				if (result['return'] && result['return'] != 'true') {
					console.error('ERROR: failed to delete snapshot ' + snapshotId);
				}
			} else {
				console.error(error.message);
			}
		});
	},
	
	take_snap: function (volumeId) {
		console.log('Take snapshot for volume-id: ' + volumeId);
		var query = {
			VolumeId: volumeId,
			Description: 'ebs-auto-snapshot.js for ' + volumeId
		};
		ec2.call('CreateSnapshot', query, function (error, result) {
			if ( ! error) {
				if ( ! result.snapshotId) {
					console.error('ERROR: unable to create a snapshot for ' + volumeId);
				}
			} else {
				console.error(error.message);
			}
		});
	}
	
};

for (var i in settings.regions) {
	ebs.fetch(settings.regions[i]);
}
