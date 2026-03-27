const getAnswerText = (q) => {
  const answer = q.answer?.toLowerCase().trim();

  // If answer is "a", "b", "c", "d" — map to option index
  const answerIndex = optionLabels.indexOf(answer);
  if (answerIndex >= 0 && q.options?.[answerIndex]) {
    const opt = q.options[answerIndex];
    return (opt.text || opt).trim();
  }

  // If answer is already the full option text
  if (q.options) {
    const match = q.options.find((opt) => {
      const optText = (opt.text || opt).toLowerCase().trim();
      return optText === answer;
    });
    if (match) return (match.text || match).trim();
  }

  return q.answer?.trim() || "";
};