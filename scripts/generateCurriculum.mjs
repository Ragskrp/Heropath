import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_SUBJECTS = [
  "Mathematics KS3",
  "English KS3",
  "Science KS3",
  "GCSE Mathematics KS4",
  "GCSE English Language KS4",
  "GCSE Combined Science KS4",
];

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
const outputPath = process.env.CURRICULUM_OUTPUT || "data/curriculum.generated.json";
const subjects = (process.env.CURRICULUM_SUBJECTS || DEFAULT_SUBJECTS.join("|"))
  .split("|")
  .map((subject) => subject.trim())
  .filter(Boolean);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }

  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (match?.[1]) {
    return match[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw new Error("Gemini did not return JSON.");
}

function normalizeQuestion(question, questionIndex) {
  const id = slugify(question.id || `question-${questionIndex + 1}`);
  const type = ["multiple-choice", "boolean", "text"].includes(question.type)
    ? question.type
    : Array.isArray(question.options)
      ? "multiple-choice"
      : "text";

  const normalized = {
    id,
    type,
    questionText: String(question.questionText || "").trim(),
    correctAnswer: String(question.correctAnswer || "").trim(),
    explanation: String(question.explanation || "").trim(),
    marks: Number.isFinite(Number(question.marks)) ? Number(question.marks) : 1,
  };

  if (!normalized.questionText || !normalized.correctAnswer || !normalized.explanation) {
    throw new Error(`Question ${id} is missing required text fields.`);
  }

  if (type === "multiple-choice") {
    const options = Array.isArray(question.options)
      ? question.options.map((option) => String(option).trim()).filter(Boolean)
      : [];

    if (options.length !== 4) {
      throw new Error(`Multiple-choice question ${id} must have exactly 4 options.`);
    }

    normalized.options = options;
  }

  if (type === "boolean") {
    normalized.options = ["True", "False"];
  }

  return normalized;
}

function normalizeSubject(rawSubject, fallbackTitle) {
  const title = String(rawSubject.title || fallbackTitle).trim();
  const level = title.toUpperCase().includes("KS4") || rawSubject.level === "KS4" ? "KS4" : "KS3";
  const subject = {
    id: slugify(rawSubject.id || title),
    title,
    level,
    topics: [],
  };

  const topics = Array.isArray(rawSubject.topics) ? rawSubject.topics : [];
  if (topics.length < 3) {
    throw new Error(`${title} must include at least 3 topics.`);
  }

  subject.topics = topics.map((topic, topicIndex) => {
    const topicTitle = String(topic.title || `Topic ${topicIndex + 1}`).trim();
    const quests = Array.isArray(topic.quests) ? topic.quests : [];
    if (quests.length < 3) {
      throw new Error(`${title} / ${topicTitle} must include at least 3 quests.`);
    }

    return {
      id: slugify(topic.id || topicTitle),
      title: topicTitle,
      description: String(topic.description || "").trim(),
      order: Number.isFinite(Number(topic.order)) ? Number(topic.order) : topicIndex + 1,
      quests: quests.map((quest, questIndex) => {
        const questTitle = String(quest.title || `Quest ${questIndex + 1}`).trim();
        const questions = Array.isArray(quest.questions) ? quest.questions : [];
        if (questions.length < 3) {
          throw new Error(`${title} / ${topicTitle} / ${questTitle} must include at least 3 questions.`);
        }

        return {
          id: slugify(quest.id || questTitle),
          title: questTitle,
          description: String(quest.description || "").trim(),
          xpReward: Number.isFinite(Number(quest.xpReward)) ? Number(quest.xpReward) : 100 + questIndex * 50,
          order: Number.isFinite(Number(quest.order)) ? Number(quest.order) : questIndex + 1,
          ...(quest.isBossBattle ? { isBossBattle: true } : {}),
          questions: questions.map(normalizeQuestion),
        };
      }),
    };
  });

  return subject;
}

function buildPrompt(subject) {
  return `
You are generating curriculum data for HeroPath, a UK edtech quest app.

Return only valid JSON, with no Markdown.

Create one Subject object for: ${subject}

The JSON shape must be:
{
  "id": "lowercase-slug",
  "title": "Subject title including KS3 or KS4",
  "level": "KS3" or "KS4",
  "topics": [
    {
      "id": "lowercase-slug",
      "title": "Topic title",
      "description": "Short student-friendly quest-map description",
      "order": 1,
      "quests": [
        {
          "id": "lowercase-slug",
          "title": "Quest title",
          "description": "Short learning objective",
          "xpReward": 100,
          "order": 1,
          "isBossBattle": false,
          "questions": [
            {
              "id": "lowercase-slug",
              "type": "multiple-choice",
              "questionText": "Question text",
              "options": ["A", "B", "C", "D"],
              "correctAnswer": "A",
              "explanation": "Why the answer is correct",
              "marks": 1
            }
          ]
        }
      ]
    }
  ]
}

Requirements:
- Use UK curriculum language.
- Include 3 to 5 topics.
- Each topic must include 3 quests.
- The final quest in each topic should be a boss battle with "isBossBattle": true.
- Each quest must include 3 to 5 questions.
- Use a mix of "multiple-choice", "boolean", and "text".
- Multiple-choice questions must have exactly 4 options.
- Avoid undefined, null, comments, trailing commas, or extra keys.
`.trim();
}

async function generateSubject(subject) {
  console.log(`Generating ${subject} with ${model}...`);

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const response = await fetch(`${geminiEndpoint}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(subject) }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
        topP: 0.9,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini returned ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error(`Gemini returned an empty response: ${JSON.stringify(data)}`);
  }

  const parsed = JSON.parse(extractJson(text));
  return normalizeSubject(parsed, subject);
}

async function main() {
  const generated = [];

  for (const subject of subjects) {
    generated.push(await generateSubject(subject));
  }

  const absoluteOutputPath = path.resolve(outputPath);
  await mkdir(path.dirname(absoluteOutputPath), { recursive: true });
  await writeFile(absoluteOutputPath, `${JSON.stringify(generated, null, 2)}\n`);

  console.log(`Generated ${generated.length} subjects at ${absoluteOutputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
