import mongoose from "mongoose";
import ConversationLog from "../models/ConversationLog.js";
import User from "../models/User.js";

const STOP_WORDS = new Set([
  "the","a","an","is","it","in","on","at","to","for","with","and","or","but","not",
  "was","were","be","been","being","have","has","had","do","does","did","will","would",
  "shall","should","may","might","can","could","must","i","you","he","she","we","they",
  "me","him","her","us","them","my","your","his","its","our","their","this","that",
  "these","those","am","are","so","no","yes","just","like","very","much","more","most",
  "some","any","all","each","every","than","then","also","if","else","when","where",
  "how","what","who","which","there","here","up","down","out","over","under","again",
  "further","once","about","above","after","before","between","through","during",
  "without","within","along","following","own","same","because","until","while","off",
  "only","now","too","very","don","didn","doesn","won","wouldn","couldn","shouldn",
  "isn","aren","wasn","weren","haven","hasn","hadn","ma","re","ve","ll","d","s","t",
]);

async function resolveElderId(req) {
  if (req.user.role === "family") {
    const elderId = req.params.elderId;
    if (!elderId) {
      const err = new Error("elderId is required for family accounts.");
      err.status = 400;
      throw err;
    }
    if (!mongoose.isValidObjectId(elderId)) {
      const err = new Error("Invalid elderId.");
      err.status = 400;
      throw err;
    }
    const family = await User.findById(req.user.id).select("linkedElderIds");
    if (!family || !family.linkedElderIds.includes(new mongoose.Types.ObjectId(elderId))) {
      const err = new Error("You do not have access to this elder.");
      err.status = 403;
      throw err;
    }
    return elderId;
  }
  if (req.user.role !== "elder") {
    const err = new Error("Only elder or family role is allowed.");
    err.status = 403;
    throw err;
  }
  return req.user.id;
}

function getWeekBounds(referenceDate) {
  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const priorEnd = new Date(start);
  priorEnd.setMilliseconds(priorEnd.getMilliseconds() - 1);
  const priorStart = new Date(priorEnd);
  priorStart.setDate(priorStart.getDate() - 6);
  priorStart.setHours(0, 0, 0, 0);

  return { start, end, priorStart, priorEnd };
}

function extractWords(text) {
  return (text.toLowerCase().match(/[a-z']+/g) || []).filter((w) => !STOP_WORDS.has(w) && w.length > 2);
}

function buildWordFrequency(texts) {
  const freq = new Map();
  for (const text of texts) {
    for (const word of extractWords(text)) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));
}

function getLast7Days(referenceDate) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

function buildFlags({ currentSessions, priorSessions, daysWithNoConversation, dailySessions }) {
  const flags = [];

  if (currentSessions === 0) {
    flags.push({
      level: "attention",
      message: "No conversation logged this week — might be worth checking in.",
    });
    return flags;
  }

  const mostRecentSessionDate = dailySessions
    .slice()
    .reverse()
    .find((d) => d.count > 0);

  if (mostRecentSessionDate) {
    const lastDate = new Date(mostRecentSessionDate.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    if (daysSince > 2) {
      flags.push({
        level: "attention",
        message: `No conversation logged in ${daysSince} days — might be worth checking in.`,
      });
    }
  }

  if (priorSessions > 0 && currentSessions < priorSessions * 0.5) {
    flags.push({
      level: "notice",
      message: `Fewer conversations than usual this week (${currentSessions} vs ${priorSessions} last week).`,
    });
  }

  if (flags.length === 0) {
    flags.push({
      level: "good",
      message: "Talking regularly, nothing unusual to flag.",
    });
  }

  return flags;
}

export async function weeklyReport(req, res) {
  try {
    const elderId = await resolveElderId(req);
    const now = new Date();
    const { start, end, priorStart, priorEnd } = getWeekBounds(now);

    const currentWeekLogs = await ConversationLog.find({
      userId: elderId,
      createdAt: { $gte: start, $lte: end },
    }).lean();

    const priorWeekLogs = await ConversationLog.find({
      userId: elderId,
      createdAt: { $gte: priorStart, $lte: priorEnd },
    }).lean();

    const currentSessions = new Set(currentWeekLogs.map((l) => l.sessionId)).size;
    const priorSessions = new Set(priorWeekLogs.map((l) => l.sessionId)).size;

    const currentWordCounts = currentWeekLogs.map((l) => l.metrics?.wordCount || 0).filter((n) => n > 0);
    const avgWordCount = currentWordCounts.length
      ? Math.round(currentWordCounts.reduce((a, b) => a + b, 0) / currentWordCounts.length)
      : 0;

    const priorWordCounts = priorWeekLogs.map((l) => l.metrics?.wordCount || 0).filter((n) => n > 0);
    const priorAvgWordCount = priorWordCounts.length
      ? Math.round(priorWordCounts.reduce((a, b) => a + b, 0) / priorWordCounts.length)
      : 0;

    const currentComplexities = currentWeekLogs.map((l) => l.metrics?.avgWordsPerSentence || 0).filter((n) => n > 0);
    const avgComplexity = currentComplexities.length
      ? +(currentComplexities.reduce((a, b) => a + b, 0) / currentComplexities.length).toFixed(1)
      : 0;

    const priorComplexities = priorWeekLogs.map((l) => l.metrics?.avgWordsPerSentence || 0).filter((n) => n > 0);
    const priorAvgComplexity = priorComplexities.length
      ? +(priorComplexities.reduce((a, b) => a + b, 0) / priorComplexities.length).toFixed(1)
      : 0;

    let complexityTrend = "stable";
    if (currentComplexities.length > 0 && priorComplexities.length > 0) {
      const diff = avgComplexity - priorAvgComplexity;
      if (diff > 0.3) complexityTrend = "up";
      else if (diff < -0.3) complexityTrend = "down";
    }

    const allTranscripts = currentWeekLogs.map((l) => l.transcript).filter(Boolean);
    const repeatedWords = buildWordFrequency(allTranscripts);

    const last7Days = getLast7Days(now);
    const daysWithNoConversation = [];
    const dailySessions = [];
    const dailyWordCount = [];

    for (const day of last7Days) {
      const dayStart = new Date(day);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogs = currentWeekLogs.filter((l) => {
        const created = new Date(l.createdAt);
        return created >= dayStart && created <= dayEnd;
      });

      const daySessions = new Set(dayLogs.map((l) => l.sessionId)).size;
      dailySessions.push({ date: day.toISOString().slice(0, 10), count: daySessions });

      const dayWordCounts = dayLogs.map((l) => l.metrics?.wordCount || 0).filter((n) => n > 0);
      const dayAvg = dayWordCounts.length ? Math.round(dayWordCounts.reduce((a, b) => a + b, 0) / dayWordCounts.length) : 0;
      dailyWordCount.push({ date: day.toISOString().slice(0, 10), avgWordCount: dayAvg });

      if (daySessions === 0) {
        daysWithNoConversation.push(day.toISOString().slice(0, 10));
      }
    }

    const plainLanguageSummary = buildPlainLanguageSummary({
      currentSessions,
      priorSessions,
      avgWordCount,
      priorAvgWordCount,
      avgComplexity,
      priorAvgComplexity,
      complexityTrend,
      repeatedWords,
      daysWithNoConversation,
      dailySessions,
    });

    const flags = buildFlags({
      currentSessions,
      priorSessions,
      daysWithNoConversation,
      dailySessions,
    });

    res.json({
      elderId: elderId.toString(),
      period: { start: start.toISOString(), end: end.toISOString() },
      totalSessions: currentSessions,
      avgWordCount,
      avgSentenceComplexity: avgComplexity,
      priorWeekAvgSentenceComplexity: priorAvgComplexity,
      complexityTrend,
      repeatedWords,
      daysWithNoConversation,
      dailySessions,
      dailyWordCount,
      flags,
      plainLanguageSummary,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

function buildPlainLanguageSummary({
  currentSessions,
  priorSessions,
  avgWordCount,
  priorAvgWordCount,
  avgComplexity,
  priorAvgComplexity,
  complexityTrend,
  repeatedWords,
  daysWithNoConversation,
  dailySessions,
}) {
  const parts = [];

  if (currentSessions === 0) {
    return "No conversations were recorded this week. This may just mean they haven't used the voice feature — it doesn't say anything about their health.";
  }

  const sessionChange = currentSessions - priorSessions;
  if (sessionChange > 0) {
    parts.push(`They spoke a bit more this week than last week (${currentSessions} sessions vs ${priorSessions} last week).`);
  } else if (sessionChange < 0) {
    parts.push(`They spoke a bit less this week than last week (${currentSessions} sessions vs ${priorSessions} last week).`);
  } else {
    parts.push(`They had ${currentSessions} conversation sessions this week, same as last week.`);
  }

  if (avgWordCount > 0) {
    if (avgWordCount > priorAvgWordCount) {
      parts.push(`On average, each reply was a little longer than usual (about ${avgWordCount} words per session).`);
    } else if (avgWordCount < priorAvgWordCount) {
      parts.push(`On average, each reply was a little shorter than usual (about ${avgWordCount} words per session).`);
    } else {
      parts.push(`On average, each reply was about ${avgWordCount} words.`);
    }
  }

  if (complexityTrend === "up") {
    parts.push(`The sentences they used were slightly longer than the week before — this is just a pattern in how they chose to speak.`);
  } else if (complexityTrend === "down") {
    parts.push(`The sentences they used were slightly shorter than the week before — this is just a pattern in how they chose to speak.`);
  } else if (avgComplexity > 0) {
    parts.push(`Sentence length stayed about the same as last week (about ${avgComplexity} words per sentence on average).`);
  }

  if (repeatedWords.length > 0) {
    const top = repeatedWords.slice(0, 3).map((w) => w.word).join(", ");
    parts.push(`The most common topics that came up were: ${top}.`);
  }

  if (daysWithNoConversation.length > 0) {
    parts.push(`There were ${daysWithNoConversation.length} day(s) with no recorded conversation: ${daysWithNoConversation.join(", ")}.`);
  }

  parts.push("This is only a summary of communication patterns — it is not a health or medical assessment.");

  return parts.join(" ");
}
