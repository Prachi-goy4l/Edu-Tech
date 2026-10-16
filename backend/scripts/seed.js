require('dotenv').config();

const mongoose = require('mongoose');
const connectToDatabase = require('../src/config/database');
const Problem = require('../src/models/problem');

const sampleProblems = [
  {
    slug: 'sum-two-numbers',
    title: 'Sum Two Numbers',
    description: 'Return the sum of two integers.',
    difficulty: 'easy',
    mode: 'function',
    functionName: 'sum',
    tags: ['math', 'functions'],
    constraints: ['The inputs are integers.'],
    starterCode: {
      javascript: 'class Solution {\n  sum(a, b) {\n    // Write your solution here\n  }\n}\n',
      python: 'class Solution:\n    def sum(self, a, b):\n        # Write your solution here\n        pass\n',
    },
    testCases: [
      { args: [2, 3], expected: 5, isHidden: false },
      { args: [-4, 10], expected: 6, isHidden: false },
      { args: [100, 250], expected: 350, isHidden: true },
    ],
  },
  {
    slug: 'two-sum',
    title: 'Two Sum',
    description: 'Return the indices of the two numbers that add up to target. Assume exactly one valid answer exists.',
    difficulty: 'easy',
    mode: 'function',
    functionName: 'twoSum',
    tags: ['arrays', 'hash-table'],
    constraints: ['Each input has exactly one solution.', 'You may not use the same element twice.'],
    starterCode: {
      python: 'class Solution:\n    def twoSum(self, nums, target):\n        # Write your solution here\n        pass\n',
      javascript: 'class Solution {\n  twoSum(nums, target) {\n    // Write your solution here\n  }\n}\n',
    },
    testCases: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1], isHidden: false },
      { args: [[3, 2, 4], 6], expected: [1, 2], isHidden: false },
      { args: [[3, 3], 6], expected: [0, 1], isHidden: true },
    ],
  },
];

async function seed() {
  await connectToDatabase();
  for (const data of sampleProblems) {
    await new Problem(data).validate();
    const existing = await Problem.findOne({ slug: data.slug }).select('_id mode');
    if (!existing) {
      await Problem.create(data);
      console.log(`Added sample problem: ${data.slug}`);
    } else if (data.slug === 'sum-two-numbers' && existing.mode !== 'function') {
      await Problem.updateOne({ _id: existing._id }, { $set: data }, { runValidators: true });
      console.log(`Converted sample problem to function style: ${data.slug}`);
    } else {
      console.log(`Kept existing sample problem: ${data.slug}`);
    }
  }
}

seed()
  .catch((error) => {
    console.error('Failed to seed sample problems:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
