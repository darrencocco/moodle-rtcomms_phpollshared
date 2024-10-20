<?php
namespace rtcomms_phppollshared\task;
class cleanup_task extends \rtcomms_phppoll\task\cleanup_task {
    public function get_name() {
        return \get_string('taskcleanup', 'rtcomms_phppollshared');
    }
}