const POINTS_BY_DIFFICULTY = {
  easy: 10,
  medium: 20,
  hard: 30,
};

function buildLeaderboard(students, acceptedProblems) {
  const scores = new Map(students.map((student) => [
    String(student._id),
    {
      name: student.name,
      points: 0,
      problemsSolved: 0,
      solvedProblemIds: new Set(),
    },
  ]));

  acceptedProblems.forEach(({ studentId, problemId, difficulty }) => {
    const score = scores.get(String(studentId));
    const key = String(problemId);
    if (!score || score.solvedProblemIds.has(key)) return;

    score.solvedProblemIds.add(key);
    score.problemsSolved += 1;
    score.points += POINTS_BY_DIFFICULTY[difficulty] || 0;
  });

  const ranked = [...scores.values()]
    .map(({ solvedProblemIds, ...student }) => student)
    .sort((left, right) => right.points - left.points
      || right.problemsSolved - left.problemsSolved
      || left.name.localeCompare(right.name));

  let previous;
  let previousRank = 0;
  return ranked.map((student, index) => {
    const rank = previous
      && previous.points === student.points
      && previous.problemsSolved === student.problemsSolved
      ? previousRank
      : index + 1;
    previous = student;
    previousRank = rank;
    return { rank, ...student };
  });
}

module.exports = { buildLeaderboard };
