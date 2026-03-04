export type SurveyQuestion =
    | { id: number; type: 'multiple-choice'; question: string; options: { up: string; down: string; left: string; right: string } }
    | { id: number; type: 'vanilla-multiple-choice'; question: string; options: { up: string; down: string; left: string; right: string } }
    | { id: number; type: 'likert'; question: string; options: string[] }
    | { id: number; type: 'nps'; question: string; scale: number }
    | { id: number; type: 'open-ended'; question: string }
    | { id: number; type: 'matrix'; question: string; rows: string[]; columns: string[] }
    | { id: number; type: 'spatial-triage'; question: string; options: { topLeft: string; topRight: string; bottomLeft: string; bottomRight: string } }
    | { id: number; type: 'node-connection'; question: string; options: string[] }
    | { id: number; type: 'confidence-allocator'; question: string; options: string[] }

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
    {
        id: 1,
        type: 'multiple-choice',
        question: "How do you feel about our new branding?",
        options: { up: "Love it!", down: "Hate it!", left: "Needs work", right: "It's okay" }
    },
    {
        id: 9,
        type: 'vanilla-multiple-choice',
        question: "Pick your preferred option:",
        options: { up: "Option A", down: "Option B", left: "Option C", right: "Option D" }
    },
    {
        id: 2,
        type: 'likert',
        question: "The software is easy to navigate.",
        options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
    },
    {
        id: 3,
        type: 'nps',
        question: "How likely are you to recommend us?",
        scale: 10
    },
    {
        id: 4,
        type: 'matrix',
        question: "Rate the following aspects:",
        rows: ["Performance", "Design", "Support"],
        columns: ["Poor", "Fair", "Good", "Excellent"]
    },
    {
        id: 5,
        type: 'open-ended',
        question: "What is your biggest daily challenge?"
    },
    {
        id: 6,
        type: 'spatial-triage',
        question: "How would you rate this feature?",
        options: {
            topLeft: "Love it",
            topRight: "It's okay",
            bottomLeft: "Needs work",
            bottomRight: "Hate it"
        }
    },
    {
        id: 7,
        type: 'node-connection',
        question: "What best describes your experience?",
        options: ["Excellent", "Good", "Average", "Needs improvement"]
    },
    {
        id: 8,
        type: 'confidence-allocator',
        question: "Distribute your confidence: Which best explains the result?",
        options: ["Hypothesis A", "Hypothesis B", "Hypothesis C"]
    }
]
