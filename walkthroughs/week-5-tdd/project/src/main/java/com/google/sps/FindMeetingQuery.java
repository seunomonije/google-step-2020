// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedList;

public final class FindMeetingQuery {

  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {

    // Using linked list as removing the first element will take O(1) time
    LinkedList<Event> eventList = new LinkedList<Event>(events);
    Collections.sort(eventList, Event.ORDER_EVENT_BY_START); // Collections.sort() -> O(nlogn)

    ArrayList<TimeRange> s = new ArrayList<TimeRange>();

    long currentTime = (long) TimeRange.START_OF_DAY;

    // making sure the request is within bounds
    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
      return s;
    }

    if (request.getDuration() < 0) {
      return s;
    }

    while (currentTime < (long) TimeRange.END_OF_DAY) {

      if (eventList.isEmpty()) {
        TimeRange range = TimeRange.fromStartEnd((int) currentTime, TimeRange.END_OF_DAY, true);
        s.add(range);
        break;
      }

      // if there are no common people between the request and the event
      if (Collections.disjoint(eventList.getFirst().getAttendees(), request.getAttendees())) {
        eventList.removeFirst();
        continue;
      }
      if ((currentTime + request.getDuration()) <= eventList.getFirst().getStartTime()) {
        TimeRange range =
            TimeRange.fromStartEnd(
                (int) currentTime, (int) eventList.getFirst().getStartTime(), false);
        s.add(range);
        currentTime = eventList.getFirst().getStartTime();
        continue;
      } else {
        if (Collections.disjoint(eventList.getFirst().getAttendees(), request.getAttendees())) {
          if ((currentTime + request.getDuration()) <= eventList.getFirst().getEndTime()) {
            TimeRange range =
                TimeRange.fromStartEnd(
                    (int) currentTime, (int) eventList.getFirst().getEndTime(), false);
            s.add(range);
            currentTime = eventList.getFirst().getEndTime();
            continue;
          } else {
            eventList.removeFirst();
            continue;
          }
        } else {
          long removedTime = eventList.removeFirst().getEndTime();
          currentTime = currentTime < removedTime ? removedTime : currentTime;
        }
      }
    }

    return s;
  }
}
