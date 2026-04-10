// apps/frontend/config/patterns.ts

export const PATTERN_SORT_ORDER = [
  // 1-3: Two Pointer fundamentals
  "Two Pointers",
  "Two Pointer",
  "Fast & Slow Pointers",
  "Fast & Slow pointers",
  "Fast & Slow Pointer",  // ✅ ADD: Singular version to match CSV
  "Fast & slow pointer",  // ✅ ADD: Lowercase variant
  
  // 4: Sliding Window
  "Sliding Window",
  
  // 5-6: Subarray patterns
  "Kadane's Algorithm",
  "Kadane's Algorithm,Dynamic Programming,Array",
  "Prefix Sum",
  "Prefix Sum,Hash Map,Array",
  
  // 7: Intervals
  "Merge Intervals",
  
  // 8: Linked List
  "In-place Reversal of a LinkedList",
  "Linked List",
  
  // 9: Stack
  "Stack",
  
  // 10: Hash Maps
  "Hash Maps",
  "Hash Map",
  "Hash Set",
  
  // 11: Binary Search
  "Binary Search",
  
  // 12: Heap
  "Heap",
  "Heap/Priority Queue",
  
  // 13: Recursion/Backtracking
  "Recursion",
  "Backtracking",
  "Recursion and Backtracking",
  
  // 14-15: Tree patterns (at the end, as requested)
  "Binary Tree",
  "Binary Search Tree",
  "Tree",
  "N-ary Tree",
  
  // 16: Graphs (very end)
  "Graph",
  "Graphs",
  "Graph Traversal",
];

// ✅ Helper: Get sort index for a pattern (lower = earlier in UI)
export const getPatternSortIndex = (pattern: string): number => {
  // ✅ Step 1: Try exact match first
  const exactMatch = PATTERN_SORT_ORDER.indexOf(pattern);
  if (exactMatch !== -1) {
    return exactMatch;
  }
  
  // ✅ Step 2: Extract the FIRST pattern from comma-separated list
  // CSV patterns are like: "Fast & Slow Pointer,Linked List,Cycle Detection"
  const primaryPattern = pattern.split(',')[0].trim();
  
  // ✅ Step 3: Try exact match on primary pattern
  const primaryMatch = PATTERN_SORT_ORDER.indexOf(primaryPattern);
  if (primaryMatch !== -1) {
    return primaryMatch;
  }
  
  // ✅ Step 4: Fallback - check if any config entry MATCHES the primary pattern (case-insensitive)
  for (let i = 0; i < PATTERN_SORT_ORDER.length; i++) {
    const configPattern = PATTERN_SORT_ORDER[i].toLowerCase();
    const csvPrimary = primaryPattern.toLowerCase();
    
    // ✅ Check both directions to handle partial matches
    if (configPattern === csvPrimary || configPattern.includes(csvPrimary) || csvPrimary.includes(configPattern)) {
      return i;
    }
  }
  
  // ✅ Not in custom order: appear at end, sorted alphabetically
  return 9999 + pattern.localeCompare("");
};

// ✅ Optional: Get display name for pattern (clean up long names)
export const getPatternDisplayName = (pattern: string): string => {
  // ✅ Extract primary pattern for display
  const primaryPattern = pattern.split(',')[0].trim();
  
  const displayNames: Record<string, string> = {
    "Two Pointers": "Two Pointers",
    "Two Pointer": "Two Pointers",
    "Fast & Slow Pointers": "Fast & Slow",
    "Fast & Slow pointers": "Fast & Slow",
    "Fast & Slow Pointer": "Fast & Slow",  // ✅ ADD: Singular version
    "Fast & slow pointer": "Fast & Slow",  // ✅ ADD: Lowercase variant
    "Sliding Window": "Sliding Window",
    "Kadane's Algorithm": "Kadane's",
    "Prefix Sum": "Prefix Sum",
    "Merge Intervals": "Merge Intervals",
    "In-place Reversal of a LinkedList": "LL Reversal",
    "Linked List": "Linked List",
    "Stack": "Stack",
    "Hash Maps": "Hash Maps",
    "Hash Map": "Hash Maps",
    "Binary Search": "Binary Search",
    "Heap": "Heap",
    "Recursion": "Recursion",
    "Backtracking": "Backtracking",
    "Binary Tree": "Binary Tree",
    "Binary Search Tree": "BST",
    "Tree": "Tree",
    "Graph": "Graphs",
    "Graphs": "Graphs",
  };
  
  return displayNames[primaryPattern] || displayNames[pattern] || primaryPattern;
};