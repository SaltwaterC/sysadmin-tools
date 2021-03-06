#!/usr/bin/env node

var settings = require('./ebs-settings.js');

var ec2 = require('aws2js').load('ec2', settings.accessKeyId, settings.secretAccessKey);
ec2.setApiVersion('2012-12-01');

var ebs = {
	fetch: function (region) {
		console.log('Taking snapshots for region: ' + region);
		console.log('Populating the blacklist with snapshots in use by AMIs');
		ec2.setRegion(region);
		ec2.request('DescribeImages', {'Owner.1': 'self'}, function (error, result) {
			if ( ! error) {
				try {
					var blacklist = {};
					
					if (result && result.imagesSet && result.imagesSet.item) {
						var images = result.imagesSet.item;
						
						if ( ! (images instanceof Array)) {
							images = [images];
						}
						
						for (var i in images) {
							var image = images[i];
							var devices = image.blockDeviceMapping.item;
							
							if ( ! (devices instanceof Array)) {
								devices = [devices];
							}
							
							for (var j in devices) {
								var device = devices[j];
								if (device.ebs && device.ebs.snapshotId) {
									blacklist[device.ebs.snapshotId] = null;
									console.log("Blacklisting %s as is registered to %s", device.ebs.snapshotId, image.imageId);
								}
							}
						}
					}
					
					ec2.setRegion(region);
					ec2.request('DescribeVolumes', function (error, result) {
						if ( ! error) {
							if (result.volumeSet) {
								if (result.volumeSet.item[0]) { // multiple volumes
									for (var i in result.volumeSet.item) {
										var volume = result.volumeSet.item[i];
										if (volume.status === 'in-use') {
											console.log('Sending to process: ' + volume.volumeId);
											ebs.process(region, volume.volumeId, blacklist);
										}
									}
								} else { // single volume
									var volume = result.volumeSet.item;
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
		ec2.request('DescribeSnapshots', query, function (error, result) {
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
		ec2.request('DeleteSnapshot', {'SnapshotId': snapshotId}, function (error, result) {
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
		ec2.request('CreateSnapshot', query, function (error, result) {
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
