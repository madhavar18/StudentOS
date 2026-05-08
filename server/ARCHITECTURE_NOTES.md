## Data Structure Decisions

### Task Storage
- REST: MongoDB stores tasks (persistent)
- Runtime: tasks fetched into JS array on frontend
- WHY not LinkedList on frontend: JS arrays are dynamic, 
  insertion patterns don't require O(1) front-insert in this use case

### Where LinkedList thinking applies to StudentOS
- Notification queue: urgent notifications inserted at front — O(1) addFirst
- Undo history: recent actions stored as a stack (LinkedList used as stack)
- Activity feed: prepend new events — O(1) with LinkedList
  
### Day 36 (Heaps): 
Task prioritization will use a Min-Heap — O(log n) insert, O(1) peek minimum priority.
Current sorting (sortByUrgency) is O(n log n) — heap will improve repeated insertions.