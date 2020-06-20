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
    LinkedList<Event> eventList2 = new LinkedList<Event>(events);

    // Collections.sort() -> O(nlogn)
    Collections.sort(eventList, Event.ORDER_EVENT_BY_START);
    Collections.sort(eventList2, Event.ORDER_EVENT_BY_START);

    // making sure the request is within bounds
    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
      return new ArrayList<TimeRange>();
    }

    if (request.getDuration() < 0) {
      return new ArrayList<TimeRange>();
    }

    Collection<TimeRange> result = traverseThroughSchedule(request, eventList);
    if (checkIfAvailability(result, eventList2)) {
        Collection<String> newAttendees = combineArr(request.getAttendees(), request.getOptionalAttendees());
        MeetingRequest withOptionals = new MeetingRequest(newAttendees, request.getDuration());
        return traverseThroughSchedule(withOptionals, eventList2);
    } else {
       return result;
    }
  }

//   private boolean checkIfAvailability(Collection<TimeRange> result, LinkedList<Event> eventList2) {
//       for (Event event : eventList2) {
//           for (TimeRange timerange: result) {
//               if (timerange.overlaps(event.getWhen())){
//                   continue;
//               } else {
//                   return true;
//               }
//           }
//       }
//     return false;
//   }

  /**
   * Traverses through the schedule and returns the list of available times
   *
   * @param request The requested meeting time duration.
   * @param eventList A sorted list of events ascending from the starting times.
   * @return Array of open TimeRange objects.
   */
  public Collection<TimeRange> traverseThroughSchedule(
      MeetingRequest request, LinkedList<Event> eventList) {

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

       if (request.getDuration() > (topOfList.getEndTime() - topOfList.getStartTime())) {
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

private Collection<String> combineArr(Collection<String> arr1, Collection<String> arr2) {
     Collection<String> res = new ArrayList<>();

      for (String string: arr1){
        res.add(string);
      }

      for (String string: arr2){
        res.add(string);
      }

      return res;
  }

}
