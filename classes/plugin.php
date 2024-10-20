<?php
namespace rtcomms_phppollshared;

use get_config;
use moodle_url;
use rtcomms_phppoll\token;

class plugin extends \rtcomms_phppoll\plugin {
    public function __construct() {
        self::$pluginname = 'phppollshared';
        $this->token = new token();
        $this->poll = new poll($this->token, self::TABLENAME);
    }
    protected function init_js(): void {
        global $PAGE, $USER;
        $earliestmessagecreationtime = $_SERVER['REQUEST_TIME'];
        $maxfailures = get_config('rtcomms_phppollshared', 'maxfailures');
        $polltype = get_config('rtcomms_phppollshared', 'polltype');
        $url = new moodle_url('/admin/tool/realtime/plugin/phppollshared/poll.php');
        $PAGE->requires->js_call_amd('rtcomms_phppollshared/client',  'init',
            [$USER->id, $this->token::get_token(), $url->out(false), $this->poll->get_delay_between_checks(),
                $maxfailures, $earliestmessagecreationtime, $polltype]);
    }
}