import { getAdminDb } from "../lib/firebase-admin";
import { Subject } from "../types/curriculum";

const sampleCurriculum: Subject[] = [
  {
    id: "maths-ks3",
    title: "Mathematics (KS3)",
    level: "KS3",
    topics: [
      {
        id: "algebra-foundations",
        title: "Algebra Foundations",
        description: "Embark on the ancient quest of symbols and equations.",
        order: 1,
        quests: [
          {
            id: "simplifying-expressions",
            title: "Quest 1: Simplifying Expressions",
            description: "Learn to combine like terms and consolidate algebraic powers.",
            xpReward: 100,
            order: 1,
            questions: [
              {
                id: "q1",
                type: "multiple-choice",
                questionText: "Simplify the expression: 3a + 5b - a + 2b",
                options: ["2a + 7b", "4a + 7b", "2a + 3b", "4a + 3b"],
                correctAnswer: "2a + 7b",
                explanation: "Combine the 'a' terms (3a - a = 2a) and the 'b' terms (5b + 2b = 7b).",
                marks: 2,
              },
              {
                id: "q2",
                type: "boolean",
                questionText: "Is a + a + a equivalent to a³?",
                options: ["True", "False"],
                correctAnswer: "False",
                explanation: "a + a + a simplifies to 3a. a * a * a is equal to a³.",
                marks: 1,
              },
            ],
          },
          {
            id: "solving-equations",
            title: "Quest 2: Solving Simple Equations",
            description: "Find the hidden value of x to restore balance to the realm.",
            xpReward: 150,
            order: 2,
            questions: [
              {
                id: "q3",
                type: "multiple-choice",
                questionText: "Solve for x: 2x + 7 = 15",
                options: ["x = 4", "x = 8", "x = 11", "x = 3"],
                correctAnswer: "x = 4",
                explanation: "Subtract 7 from both sides to get 2x = 8. Divide by 2 to get x = 4.",
                marks: 2,
              },
            ],
          },
          {
            id: "algebra-boss",
            title: "Boss Battle: Algebra Overlord",
            description: "Defeat the Overlord by proving your mastery of basic algebra equations!",
            xpReward: 300,
            order: 3,
            isBossBattle: true,
            questions: [
              {
                id: "q4",
                type: "multiple-choice",
                questionText: "Solve for y: 5y - 3 = 2y + 9",
                options: ["y = 4", "y = 3", "y = 6", "y = 2"],
                correctAnswer: "y = 4",
                explanation: "Subtract 2y from both sides: 3y - 3 = 9. Add 3: 3y = 12. Divide by 3: y = 4.",
                marks: 3,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "science-ks4",
    title: "GCSE Science (KS4)",
    level: "KS4",
    topics: [
      {
        id: "energy-forces",
        title: "Energy & Forces",
        description: "Master the fundamental forces governing the physical universe.",
        order: 1,
        quests: [
          {
            id: "kinetic-energy",
            title: "Quest 1: Kinetic & Potential Energy",
            description: "Calculate energy conservation equations.",
            xpReward: 120,
            order: 1,
            questions: [
              {
                id: "q5",
                type: "multiple-choice",
                questionText: "What is the kinetic energy of a 2 kg object moving at 5 m/s?",
                options: ["25 J", "50 J", "10 J", "100 J"],
                correctAnswer: "25 J",
                explanation: "Kinetic Energy = 0.5 * mass * velocity² = 0.5 * 2 * (5²) = 25 Joules.",
                marks: 3,
              },
              {
                id: "q6",
                type: "boolean",
                questionText: "Does Gravitational Potential Energy depend on the speed of the object?",
                options: ["True", "False"],
                correctAnswer: "False",
                explanation: "GPE = m * g * h. It depends on mass, gravity, and height, not speed.",
                marks: 1,
              },
            ],
          },
          {
            id: "forces-boss",
            title: "Boss Battle: Gravitational Titan",
            description: "Defeat the Titan by solving energy conversion challenges!",
            xpReward: 400,
            order: 2,
            isBossBattle: true,
            questions: [
              {
                id: "q7",
                type: "multiple-choice",
                questionText: "An object falls from a height of 10m. What is its velocity just before hitting the ground? (Use g = 9.8 m/s²)",
                options: ["14 m/s", "9.8 m/s", "19.6 m/s", "20 m/s"],
                correctAnswer: "14 m/s",
                explanation: "Using energy conservation: mgh = 0.5 * m * v² => v = sqrt(2gh) = sqrt(2 * 9.8 * 10) = sqrt(196) = 14 m/s.",
                marks: 4,
              },
            ],
          },
        ],
      },
    ],
  },
];

export async function seed() {
  const adminDb = getAdminDb();
  const batch = adminDb.batch();
  for (const subject of sampleCurriculum) {
    const docRef = adminDb.collection("curriculum").doc(subject.id);
    batch.set(docRef, subject);
  }
  await batch.commit();
  console.log("Curriculum seeded successfully!");
}
