const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  expectedOutput: { type: String, default: '' },
  args: { type: mongoose.Schema.Types.Mixed },
  expected: { type: mongoose.Schema.Types.Mixed },
  isHidden: { type: Boolean, default: false },
}, { _id: false });

const problemSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  mode: { type: String, enum: ['stdin', 'function'], default: 'stdin' },
  functionName: {
    type: String,
    default: 'solve',
    match: /^[A-Za-z_$][\w$]*$/,
  },
  tags: [{ type: String, trim: true }],
  constraints: [{ type: String, trim: true }],
  starterCode: { type: Map, of: String, default: {} },
  testCases: {
    type: [testCaseSchema],
    validate: {
      validator: (cases) => cases.length > 0
        && cases.length <= 50
        && cases.some((testCase) => !testCase.isHidden),
      message: 'A problem must have 1-50 test cases and at least one public test case',
    },
  },
}, { timestamps: true });

problemSchema.pre('validate', function validateTestCases(next) {
  this.testCases.forEach((testCase, index) => {
    if (this.mode === 'function') {
      if (!Array.isArray(testCase.args)) {
        this.invalidate(`testCases.${index}.args`, 'Function test cases must provide an args array');
      }
      if (testCase.expected === undefined) {
        this.invalidate(`testCases.${index}.expected`, 'Function test cases must provide an expected value');
      }
    } else if (typeof testCase.input !== 'string' || typeof testCase.expectedOutput !== 'string') {
      this.invalidate(`testCases.${index}.input`, 'Standard-input test cases must provide input and expectedOutput strings');
    }
  });
  next();
});

problemSchema.index({ difficulty: 1, createdAt: -1 });

module.exports = mongoose.model('Problem', problemSchema);
