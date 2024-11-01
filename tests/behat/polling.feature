@local @local_rtcomms @rtcomms @rtcomms_phppollshared
Feature: Testing basic functionality of rtcomms_phppollshared
  In order to browse effectively
  As a user
  I need to be able to send and receive realtime communications

  @javascript
  Scenario: Basic test of polling for updates
    Given the following config values are set as admin:
      | enabled        | phppollshared | local_rtcomms         |
      | requesttimeout | 5             | rtcomms_phppollshared |
      | checkinterval  | 200           | rtcomms_phppollshared |
    When I log in as "admin"
    And I'm on the real time comms receive fixture page
    And I wait until "Realtime plugin - phppollshared" "text" exists
    Then A message is sent to "admin" in the channel "{user}/local_rtcomms/test/0" with the contents "{\"data\": \"2\"}"
    And I wait until "Received event for component local_rtcomms, area = test, itemid = 0, context id = 5, contextlevel = 30, context instanceid = 2, payload data = 2" "text" exists
    And I log out

  @javascript
  Scenario: Basic test of sending to server
    Given the following config values are set as admin:
      | enabled        | phppollshared | local_rtcomms         |
      | requesttimeout | 5             | rtcomms_phppollshared |
      | checkinterval  | 200           | rtcomms_phppollshared |
    When I log in as "admin"
    And I'm on the real time comms send fixture page
    And I wait until "Realtime plugin - phppollshared" "text" exists
    Then I follow "Test1"
    And I wait until "Received event for component local_rtcomms, area = test, itemid = 0, context id = 5, contextlevel = 30, context instanceid = 2, payload data = 1" "text" exists
    And I follow "Test2"
    And I wait until "Received event for component local_rtcomms, area = test, itemid = 0, context id = 5, contextlevel = 30, context instanceid = 2, payload data = 2" "text" exists
    And I log out