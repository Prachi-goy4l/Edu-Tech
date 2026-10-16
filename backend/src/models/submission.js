const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  passed: { type: Boolean, required: true },
  status: { type: String, required: true },
  isHidden: { type: Boolean, required: true },
  stdout: { type: String, default: null },
  stderr: { type: String, default: null },
  compileOutput: { type: String, default: null },
  message: { type: String, default: null },
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  languageId: { type: Number, required: true },
  sourceCode: { type: String, required: true, maxlength: 100000 },
  verdict: {
    type: String,
    enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'compilation_error', 'runtime_error', 'internal_error'],
    required: true,
  },
  score: { type: Number, required: true, min: 0, max: 100 },
  runtime: { type: Number, default: null },
  memory: { type: Number, default: null },
  testResults: { type: [testResultSchema], default: [] },
}, { timestamps: true });

submissionSchema.index({ student: 1, createdAt: -1 });
submissionSchema.index({ student: 1, problem: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
