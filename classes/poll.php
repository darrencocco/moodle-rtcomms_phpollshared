<?php

namespace rtcomms_phppollshared;

class poll extends \rtcomms_phppoll\poll {
    /**
     * Delay between checks (or between short poll requests), ms
     *
     * @return int sleep time between checks, in milliseconds
     */
    public function get_delay_between_checks(): int {
        $period = get_config('rtcomms_phppollshared', 'checkinterval');
        return max($period, 200);
    }

    /**
     * Maximum duration for poll requests
     *
     * @return int time in seconds
     */
    public function get_request_timeout(): float {
        $duration = get_config('rtcomms_phppollshared', 'requesttimeout');
        return (isset($duration) && $duration !== false) ? (float)$duration : 30;
    }
}