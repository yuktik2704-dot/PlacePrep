function createInterviewPrompt(resume){

return `

You are an experienced Software Engineering interviewer.

Generate exactly 10 interview questions.

Candidate Profile

Developer Type:
${resume.developerType}

Skills:
${resume.skills.join(", ")}

Projects:
${resume.existingProjects.join(", ")}

Experience:
${resume.experience}

Difficulty:
Medium

Rules:

- Exactly 10 questions
- 2 HR
- 2 Resume
- 2 Technical
- 2 DSA
- 1 Behavioural
- 1 Project Discussion

Return ONLY valid JSON.

Format:

{
  "questions":[
    {
      "id":1,
      "type":"HR",
      "question":"Tell me about yourself"
    },
    {
      "id":2,
      "type":"Technical",
      "question":"Explain the Node.js Event Loop."
    }
  ]
}

Do NOT write markdown.

Do NOT use \`\`\`json.

Do NOT explain anything.

Return ONLY JSON.

`;

}

module.exports = {

createInterviewPrompt

};