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

    // Collections.sort() -> O(nlogn)
    Collections.sort(eventList, Event.ORDER_EVENT_BY_START);

    // making sure the request is within bounds
    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
      return new ArrayList<TimeRange>();
    }

    if (request.getDuration() < 0) {
      return new ArrayList<TimeRange>();
    }

    // Merge the two arrays
    ArrayList<String> attendees = new ArrayList<String>(request.getAttendees());
    attendees.addAll(request.getOptionalAttendees());

    MeetingRequest withOptionals = new MeetingRequest(attendees, request.getDuration());
    Collection<TimeRange> result = traverseThroughSchedule(withOptionals, eventList);

    /* If the first traversal with required+optional returns no matches,
        run through it again with only required ppl.
        Time: O(n) + O(n) */
    if (result.isEmpty()) {
        if (request.getAttendees().isEmpty()) {
            return new ArrayList<TimeRange>();
        }
      return traverseThroughSchedule(request, eventList);
    }
    return result;
  }

  /**
   * Traverses through the schedule and returns the list of available times
   *
   * @param request The requested meeting time duration.
   * @param eventList A sorted list of events ascending from the starting times.
   * @return Array of open TimeRange objects.
   */
  public Collection<TimeRange> traverseThroughSchedule(
    MeetingRequest request, LinkedList<Event> sortedList) {

    // copying to save the state after we're done
    LinkedList<Event> eventList = new LinkedList<Event>(sortedList);

    ArrayList<TimeRange> openRanges = new ArrayList<TimeRange>();

    long currentTime = (long) TimeRange.START_OF_DAY;

    while (currentTime < (long) TimeRange.END_OF_DAY) {

      // if the last open time slot is between the last meeting and the end of the day
      if (eventList.isEmpty()) {
        if ((long) TimeRange.END_OF_DAY - currentTime < request.getDuration()) {
          break;
        }
        TimeRange range = TimeRange.fromStartEnd((int) currentTime, TimeRange.END_OF_DAY, true);
        openRanges.add(range);
        break;
      }

      // Get the first element
      Event topOfList = eventList.getFirst();
      boolean noCommonAttendees =
          Collections.disjoint(topOfList.getAttendees(), request.getAttendees());

      // No one in our event request is in this event
      if (noCommonAttendees) {
        eventList.removeFirst();
        continue;
      }

      if ((currentTime + request.getDuration()) <= topOfList.getStartTime()) {
        TimeRange range =
            TimeRange.fromStartEnd((int) currentTime, (int) topOfList.getStartTime(), false);
        openRanges.add(range);
        currentTime = topOfList.getStartTime();
        continue;
      }

      long removedTime = eventList.removeFirst().getEndTime();
      // if we are still in the middle of the event, jump to the end
      if (currentTime < removedTime) {
        currentTime = removedTime;
      }
    }
    return openRanges;
  }
}
