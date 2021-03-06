'use strict';
const Homey = require('homey');

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

// Documentation: https://Products.Z-WaveAlliance.org/ProductManual/File?folder=&filename=Manuals/2309/110050438 BDAL L 810 LED IHF SMARTHOME D-GB-F-I-NL.pdf

class SteinelL810LED extends ZwaveDevice {
	onMeshInit() {

		// enable debugging
		this.enableDebug();

		// print the node's info to the console
		this.printNode();

		this.registerCapability('onoff', 'SWITCH_BINARY');
		this.registerCapability('dim', 'SWITCH_MULTILEVEL');
		this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
		this.registerCapability('alarm_motion', 'NOTIFICATION');

		// Register triggers for flows
		this.triggerAlarmMotionOn = new Homey.FlowCardTriggerDevice('sensor_alarm_motion_on')
		this.triggerAlarmMotionOn
			.register();

		this.triggerAlarmMotionOff = new Homey.FlowCardTriggerDevice('sensor_alarm_motion_off')
		this.triggerAlarmMotionOff
			.register();

		this.triggerMeasureLuminance = new Homey.FlowCardTriggerDevice('sensor_measure_luminance')
		this.triggerMeasureLuminance
			.register();

		// Register conditions for flows
		this.conditionAlarmMotionIsOn = new Homey.FlowCardCondition("sensor_alarm_motion_is_on")
		this.conditionAlarmMotionIsOn
			.register()
			.registerRunListener((args, state) => {
				return Promise.resolve(this.getCapabilityValue('alarm_motion'));
			})

		// this.registerCapabilityListener('alarm_motion', this._onCapabilityAlarmMotion.bind(this))

		// register a report listener
		this.registerReportListener('NOTIFICATION', 'NOTIFICATION_REPORT', this._onCapabilityAlarmMotion.bind(this));

		// this.registerCapabilityListener('measure_luminance', this._onCapabilityMeasureLuminance.bind(this))

		// register a report listener
		this.registerReportListener('SENSOR_MULTILEVEL', 'SENSOR_MULTILEVEL_REPORT', this._onCapabilityMeasureLuminance.bind(this));

	}

	_onCapabilityAlarmMotion(rawReport, parsedReport) {
		if (parsedReport != undefined) {
			this.log('_onCapabilityAlarmMotion', parsedReport, `triggerAlarmMotion${parsedReport ? 'On' : 'Off'}`);
			this[`triggerAlarmMotion${parsedReport ? 'On' : 'Off'}`].trigger(this, null, null)
		}
		return true;
	}

	_onCapabilityMeasureLuminance(rawReport, parsedReport) {
		this.log('_onCapabilityMeasureLuminance', parsedReport);
		this.triggerMeasureLuminance.trigger(this, {
			luminance: parsedReport,
		}, null)
		return true;
	}
}
module.exports = SteinelL810LED;
