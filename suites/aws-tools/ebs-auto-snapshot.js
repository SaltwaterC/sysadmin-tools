var ec2 = require('aws2js').load('ec2');
var settings = require('./ebs-settings.js');

ec2.setCredentials(settings.accessKeyId, settings.secretAccessKey);

var ebs = {
	
	fetch: function (region) {
		console.log('Taking snapshots for region: ' + region);
		console.log('Populating the blacklist with snapshots in use by AMIs');
		ec2.setRegion(region);
		ec2.call('DescribeImages', {'Owner.1': 'self'}, function (error, result) {
			if ( ! error) {
				try {
					var blacklist = {};
					for (var i in result.imagesSet.item) {
						blacklist[result.imagesSet.item[i].blockDeviceMapping.item.ebs.snapshotId] = null;
					}
					
					ec2.setRegion(region);
					ec2.call('DescribeVolumes', {}, function (error, result) {
						if ( ! error) {
							if (result.volumeSet) {
								for (var i in result.volumeSet.item) {
									var volume = result.volumeSet.item[i];
									if (volume.status === 'in-use') {
										console.log('Sending to process: ' + volume.volumeId);
										ebs.process(region, volume.volumeId, blacklist);
									}
								}
							} else {
								console.error('ERROR: no volumes returned.');
							}
						} else {
							console.error(error.message);
							console.error(JSON.stringify(error.document));
						}
					});
				} catch (e) {
					console.error(e.message);
					console.error(JSON.stringify(error.document));
				}
			} else {
				console.error(error.message);
				console.error(JSON.stringify(error.document));
			}
		});
	},
	
	process: function (region, volumeId, blacklist) {
		var query = {
			'Filter.1.Name': 'volume-id',
			'Filter.1.Value.1': volumeId,
			'Filter.2.Name': 'status',
			'Filter.2.Value.1': 'completed'
		};
		ec2.setRegion(region);
		ec2.call('DescribeSnapshots', query, function (error, result) {
			if ( ! error) {
				if (result.snapshotSet) {
					if (result.snapshotSet.item) {
						if (result.snapshotSet.item.length >= settings.rotate) {
							var counter = result.snapshotSet.item.length - settings.rotate + 1;
							for (var i in result.snapshotSet.item) {
								var snapshotId = result.snapshotSet.item[i].snapshotId;
								if (snapshotId in blacklist) {
									console.log('Skipping ' + snapshotId + ' as it is in use by AMI');
									counter = counter - 2;
								} else {
									ebs.delete_snap(region, snapshotId);
									counter--;
								}
								if (counter <= 0) {
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
				console.error(JSON.stringify(error.document));
			}
			
			ebs.take_snap(region, volumeId);
		});
	},
	
	delete_snap: function (region, snapshotId) {
		console.log('Delete snapshot: ' + snapshotId);
		ec2.setRegion(region);
		ec2.call('DeleteSnapshot', {'SnapshotId': snapshotId}, function (error, result) {
			if ( ! error) {
				if (result['return'] && result['return'] != 'true') {
					console.error('ERROR: failed to delete snapshot ' + snapshotId);
				}
			} else {
				console.error(error.message);
				console.error(JSON.stringify(error.document));
			}
		});
	},
	
	take_snap: function (region, volumeId) {
		console.log('Take snapshot for volume-id: ' + volumeId);
		var query = {
			VolumeId: volumeId,
			Description: 'ebs-auto-snapshot.js for ' + volumeId
		};
		ec2.setRegion(region);
		ec2.call('CreateSnapshot', query, function (error, result) {
			if ( ! error) {
				if ( ! result.snapshotId) {
					console.error('ERROR: unable to create a snapshot for ' + volumeId);
				}
			} else {
				console.error(error.message);
				console.error(JSON.stringify(error.document));
			}
		});
	}
	
};

for (var i in settings.regions) {
	ebs.fetch(settings.regions[i]);
}
