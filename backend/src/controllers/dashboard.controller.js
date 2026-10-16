const Problem = require('../models/problem');
const Submission = require('../models/submission');
const asyncHandler = require('../utils/async-handler');

const getDashboard = asyncHandler(async (request, response) => {
  const studentId = request.student.id;
  const [problemCount, submissionCount, acceptedCount, recentSubmissions] = await Promise.all([
    Problem.countDocuments(),
    Submission.countDocuments({ student: studentId }),
    Submission.countDocuments({ student: studentId, verdict: 'accepted' }),
    Submission.find({ student: studentId })
      .populate('problem', 'slug title difficulty')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  response.json({
    stats: {
      availableProblems: problemCount,
      submissions: submissionCount,
      acceptedSubmissions: acceptedCount,
    },
    recentSubmissions: recentSubmissions.map((submission) => ({
      id: submission.id,
      problem: submission.problem,
      verdict: submission.verdict,
      score: submission.score,
      createdAt: submission.createdAt,
    })),
  });
});

module.exports = { getDashboard };
