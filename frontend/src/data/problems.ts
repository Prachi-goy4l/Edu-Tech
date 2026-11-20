import { Problem } from '../types';

export const PROBLEMS: Problem[] = [
  {
    id: 'two-sum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    category: 'Array & Hash Table',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0, 1]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: {
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};
`,
      java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}
`
    },
    testCases: [
      { id: 1, input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]' },
      { id: 2, input: 'nums = [3,2,4], target = 6', expectedOutput: '[1, 2]' },
      { id: 3, input: 'nums = [3,3], target = 6', expectedOutput: '[0, 1]' }
    ]
  },
  {
    id: 'valid-palindrome',
    title: '125. Valid Palindrome',
    difficulty: 'Easy',
    category: 'Two Pointers & String',
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.'
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.'
      },
      {
        input: 's = " "',
        output: 'true',
        explanation: 's is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.'
      }
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.'
    ],
    starterCode: {
      python: `def isPalindrome(s: str) -> bool:
    # Write your solution here
    clean = [c.lower() for c in s if c.isalnum()]
    return clean == clean[::-1]
`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    // Write your solution here
    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean === clean.split('').reverse().join('');
}
`,
      cpp: `#include <string>
#include <cctype>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        // Write your solution here
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !isalnum(s[left])) left++;
            while (left < right && !isalnum(s[right])) right--;
            if (tolower(s[left]) != tolower(s[right])) return false;
            left++;
            right--;
        }
        return true;
    }
};
`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        // Write your solution here
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}
`
    },
    testCases: [
      { id: 1, input: 's = "A man, a plan, a canal: Panama"', expectedOutput: 'true' },
      { id: 2, input: 's = "race a car"', expectedOutput: 'false' },
      { id: 3, input: 's = " "', expectedOutput: 'true' }
    ]
  },
  {
    id: 'fizz-buzz',
    title: '412. Fizz Buzz',
    difficulty: 'Easy',
    category: 'Math & Simulation',
    description: `Given an integer \`n\`, return a string array \`answer\` (1-indexed) where:

- \`answer[i] == "FizzBuzz"\` if \`i\` is divisible by \`3\` and \`5\`.
- \`answer[i] == "Fizz"\` if \`i\` is divisible by \`3\`.
- \`answer[i] == "Buzz"\` if \`i\` is divisible by \`5\`.
- \`answer[i] == i\` (as a string) if none of the above conditions are true.`,
    examples: [
      {
        input: 'n = 3',
        output: '["1","2","Fizz"]'
      },
      {
        input: 'n = 5',
        output: '["1","2","Fizz","4","Buzz"]'
      },
      {
        input: 'n = 15',
        output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]'
      }
    ],
    constraints: [
      '1 <= n <= 10^4'
    ],
    starterCode: {
      python: `def fizzBuzz(n: int) -> list[str]:
    # Write your solution here
    res = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            res.append("FizzBuzz")
        elif i % 3 == 0:
            res.append("Fizz")
        elif i % 5 == 0:
            res.append("Buzz")
        else:
            res.append(str(i))
    return res
`,
      javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
function fizzBuzz(n) {
    // Write your solution here
    const res = [];
    for (let i = 1; i <= n; i++) {
        if (i % 15 === 0) res.push("FizzBuzz");
        else if (i % 3 === 0) res.push("Fizz");
        else if (i % 5 === 0) res.push("Buzz");
        else res.push(String(i));
    }
    return res;
}
`,
      cpp: `#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    vector<string> fizzBuzz(int n) {
        // Write your solution here
        vector<string> res;
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) res.push_back("FizzBuzz");
            else if (i % 3 == 0) res.push_back("Fizz");
            else if (i % 5 == 0) res.push_back("Buzz");
            else res.push_back(to_string(i));
        }
        return res;
    }
};
`,
      java: `import java.util.*;

class Solution {
    public List<String> fizzBuzz(int n) {
        // Write your solution here
        List<String> res = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) res.add("FizzBuzz");
            else if (i % 3 == 0) res.add("Fizz");
            else if (i % 5 == 0) res.add("Buzz");
            else res.add(String.valueOf(i));
        }
        return res;
    }
}
`
    },
    testCases: [
      { id: 1, input: 'n = 3', expectedOutput: '["1", "2", "Fizz"]' },
      { id: 2, input: 'n = 5', expectedOutput: '["1", "2", "Fizz", "4", "Buzz"]' },
      { id: 3, input: 'n = 15', expectedOutput: '["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]' }
    ]
  }
];
