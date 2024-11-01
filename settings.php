<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Plugin administration pages are defined here.
 *
 * @package     rtcomms_phppollshared
 * @copyright   2024 Darren Cocco
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings->add(new admin_setting_configduration('rtcomms_phppollshared/requesttimeout',
            new lang_string('requesttimeout', 'rtcomms_phppollshared'),
            new lang_string('requesttimeoutdesc', 'rtcomms_phppollshared'), 30)
    );

    $settings->add(new admin_setting_configtext('rtcomms_phppollshared/checkinterval',
            new lang_string('checkinterval', 'rtcomms_phppollshared'),
            new lang_string('checkintervaldesc', 'rtcomms_phppollshared', 200), 1000, PARAM_INT)
    );

    $settings->add(new admin_setting_configtext('rtcomms_phppollshared/maxfailures',
            new lang_string('maxfailures', 'rtcomms_phppollshared'),
            new lang_string('maxfailuresdesc', 'rtcomms_phppollshared'), 5, PARAM_INT)
    );

    $settings->add(new admin_setting_configselect('rtcomms_phppollshared/polltype',
        new lang_string('polltype', 'rtcomms_phppollshared'),
        new lang_string('polltypedesc', 'rtcomms_phppollshared'),
        'short',
        [
            'short' => new lang_string('shortpoll', 'rtcomms_phppollshared'),
            'long' => new lang_string('longpoll', 'rtcomms_phppollshared'),
        ]));
}
