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

    ArrayList<TimeRange> openRanges = new ArrayList<TimeRange>();

    // making sure the request is within bounds
    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
      return openRanges;
    }

    if (request.getDuration() < 0) {
      return openRanges;
    }
    return traverseThroughSchedule(events, request, eventList, openRanges);
  }

  public Collection<TimeRange> traverseThroughSchedule(
      Collection<Event> events,
      MeetingRequest request,
      LinkedList<Event> eventList,
      ArrayList<TimeRange> openRanges) {

    long currentTime = (long) TimeRange.START_OF_DAY;

    while (currentTime < (long) TimeRange.END_OF_DAY) {

      // if the last open time slot is between the last meeting and the end of the day
      if (eventList.isEmpty()) {
        if ((long) TimeRange.END_OF_DAY - currentTime < request.getDuration()) {
          break;
        }
        addFreeSpace(currentTime, TimeRange.END_OF_DAY, openRanges, true);
        break;
      }

      // Get the first element
      Event topOfList = eventList.getFirst();

      // if there are no common people between the request and the event
      if (Collections.disjoint(topOfList.getAttendees(), request.getAttendees())) {
        eventList.removeFirst();
        continue;
      }

      if ((currentTime + request.getDuration()) <= topOfList.getStartTime()) {
        addFreeSpace(currentTime, (int) topOfList.getStartTime(), openRanges, false);
        currentTime = topOfList.getStartTime();
        continue;
      } else {
        if (Collections.disjoint(topOfList.getAttendees(), request.getAttendees())) {
          checkIfSpaceInMeeting(topOfList, currentTime, request, openRanges, eventList);
          continue;
        } else {
          long removedTime = eventList.removeFirst().getEndTime();
          currentTime = currentTime < removedTime ? removedTime : currentTime;
        }
      }
    }

    return openRanges;
  }

  private void addFreeSpace(
      long currentTime, int timerange, ArrayList<TimeRange> openRanges, boolean inclusive) {
    TimeRange range = TimeRange.fromStartEnd((int) currentTime, timerange, inclusive);
    openRanges.add(range);
  }

  private void checkIfSpaceInMeeting(
      Event topOfList,
      long currentTime,
      MeetingRequest request,
      ArrayList<TimeRange> openRanges,
      LinkedList<Event> eventList) {
    if ((currentTime + request.getDuration()) <= topOfList.getEndTime()) {
      addFreeSpace((int) currentTime, (int) topOfList.getEndTime(), openRanges, false);
      currentTime = topOfList.getEndTime();
    } else {
      eventList.removeFirst();
    }
  }
}
