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
 * Main entry class for server side behaviour.
 *
 * @package     rtcomms_phppollshared
 * @copyright   2024 Darren Cocco
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace rtcomms_phppollshared;

use get_config;
use moodle_url;
use rtcomms_phppoll\token;

/**
 * Plugin class
 */
class plugin extends \rtcomms_phppoll\plugin {
    /**
     * Simple constructor, doesn't invoke parent.
     */
    public function __construct() {
        self::$pluginname = 'phppollshared';
        $this->token = new token();
        $this->poll = new poll($this->token, self::TABLENAME);
    }

    /**
     * Injects phppoll shared specific JS.
     *
     * @return void
     * @throws \dml_exception
     */
    protected function init_js(): void {
        global $PAGE, $USER;
        $earliestmessagecreationtime = $_SERVER['REQUEST_TIME'];
        $maxfailures = get_config('rtcomms_phppollshared', 'maxfailures');
        $polltype = get_config('rtcomms_phppollshared', 'polltype');
        $url = new moodle_url('/local/rtcomms/plugin/phppollshared/poll.php');
        $PAGE->requires->js_call_amd('rtcomms_phppollshared/client',  'init',
            [$USER->id, $this->token::get_token(), $url->out(false), $this->poll->get_delay_between_checks(),
                $maxfailures, $earliestmessagecreationtime, $polltype]);
    }
}
