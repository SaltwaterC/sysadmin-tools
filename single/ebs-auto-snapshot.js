var settings = {
	accessKeyId: '',
	secretAccessKey: '',
	/**
	 * Number of snapshots per volume to keep
	 */
	rotate: 30
};

var ec2 = require('aws-lib').createEC2Client(
	settings.accessKeyId, settings.secretAccessKey
);
ec2.version = '2011-05-15';

var ebs = {
	
	fetch: function () {
		ec2.call('DescribeVolumes', {}, function (result) {
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
		});
	},
	
	process: function (volumeId) {
		var query = {
			'Filter.1.Name': 'volume-id',
			'Filter.1.Value.1': volumeId,
			'Filter.2.Name': 'status',
			'Filter.2.Value.1': 'completed'
		};
		ec2.call('DescribeSnapshots', query, function (result) {
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
			ebs.take_snap(volumeId);
		});
	},
	
	delete_snap: function (snapshotId) {
		console.log('Delete snapshot: ' + snapshotId);
		ec2.call('DeleteSnapshot', {'SnapshotId': snapshotId}, function (result) {
			if (result['return'] && result['return'] != 'true') {
				console.error('ERROR: failed to delete snapshot ' + snapshotId);
			}
		});
	},
	
	take_snap: function (volumeId) {
		console.log('Take snapshot for volume-id: ' + volumeId);
		var query = {
			VolumeId: volumeId,
			Description: 'ebs-auto-snapshot.js for ' + volumeId
		};
		ec2.call('CreateSnapshot', query, function (result) {
			if ( ! result.snapshotId) {
				console.error('ERROR: unable to create a snapshot for ' + volumeId);
			}
		});
	}
};

ebs.fetch();

