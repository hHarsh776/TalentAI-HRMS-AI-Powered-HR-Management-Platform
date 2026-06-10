export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// In-memory mock database state for offline mode
const MOCK_OFFER_TEXT = `Dear Candidate,

TalentAI Systems Inc. ('the Company') is thrilled to offer you this position. We were incredibly impressed by your background.

Position Details
- Department: Engineering
- Annual Base Salary: $120,000.00 USD
- Standard Working Hours: 5 days a week, 9 AM to 5 PM

Company Information
TalentAI Systems is a leading AI-driven Human Resources technology provider. Our mission is to revolutionize hiring and workforce management. As an employee, you will be joining a fast-paced, innovative environment dedicated to building the future of work.

Company Norms & Culture
- 5-Day Work Week: We operate on a standard Monday-Friday schedule.
- Flexible Hours: We support flexible start and end times.
- Inclusive Environment: We prioritize a culture of respect, diversity, and continuous learning.

Terms and Conditions of Employment
1. At-Will Employment: Your employment with the Company is 'at-will'.
2. Benefits: You will be eligible to participate in the Company’s comprehensive benefits plan.
3. Confidentiality: As a condition of employment, you will be required to sign our standard NDA.

Please review this offer carefully. If you agree with the terms outlined above, please accept below.

Sincerely,
HR Operations Team
TalentAI Systems Inc.`;

let mockJobs = [
  { _id: 'job_python', title: 'Senior Python Developer', department: 'Engineering', location: 'San Francisco, CA', type: 'Full-time', description: 'We are looking for a Senior Python Developer to join our backend systems team. You will lead development of FastAPI web applications and integrations with core database services.', requirements: ['Python', 'FastAPI', 'MongoDB', 'SQL', 'Docker', 'RESTful APIs'], status: 'Published', created_at: new Date().toISOString() },
  { _id: 'job_analyst', title: 'Lead Data Analyst', department: 'Data Science', location: 'Remote', type: 'Full-time', description: 'Our product analytics division requires a Lead Data Analyst.', requirements: ['SQL', 'Python', 'Data Analysis', 'Tableau', 'Pandas', 'Statistics'], status: 'Published', created_at: new Date().toISOString() },
  { _id: 'job_pm', title: 'Technical Product Manager', department: 'Product Management', location: 'New York, NY', type: 'Full-time', description: 'Seeking an experienced Product Manager with high technical proficiency.', requirements: ['Product Roadmapping', 'Agile/Scrum', 'Machine Learning concepts', 'UX Design principles'], status: 'Published', created_at: new Date().toISOString() },
  { _id: 'job_frontend', title: 'Senior React Developer', department: 'Engineering', location: 'Remote', type: 'Full-time', description: 'Seeking an expert frontend engineer with React experience to build modern HR tools.', requirements: ['React', 'JavaScript', 'TypeScript', 'Tailwind', 'Redux'], status: 'Published', created_at: new Date().toISOString() },
  { _id: 'job_ml', title: 'Machine Learning Engineer', department: 'AI & Data', location: 'Seattle, WA', type: 'Full-time', description: 'Help us train our next generation of candidate ranking models.', requirements: ['Python', 'PyTorch', 'NLP', 'TensorFlow', 'LLMs'], status: 'Published', created_at: new Date().toISOString() },
  { _id: 'job_devops', title: 'DevOps Engineer', department: 'Engineering', location: 'Austin, TX', type: 'Full-time', description: 'Manage our AWS infrastructure and CI/CD pipelines.', requirements: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'], status: 'Published', created_at: new Date().toISOString() },
  { _id: 'job_hr', title: 'HR Generalist', department: 'Human Resources', location: 'Chicago, IL', type: 'Full-time', description: 'Support our fast-growing team across onboarding, compliance, and culture.', requirements: ['HRIS', 'Onboarding', 'Compliance', 'Communication'], status: 'Draft', created_at: new Date().toISOString() }
];

let mockCandidates = [
  { _id: 'cand_alice', name: 'Alice Smith', email: 'candidate@talentai.com', phone: '+1-555-123-4567', skills: ['Python', 'FastAPI', 'SQL', 'Docker', 'Git', 'React'], experience_years: 5.5, education: 'M.S. Computer Science - Stanford', resume_url: 'alice_resume.pdf' },
  { _id: 'cand_bob', name: 'Bob Johnson', email: 'bob.johnson@example.com', phone: '+1-555-987-6543', skills: ['SQL', 'Python', 'Data Analysis', 'Pandas', 'Excel'], experience_years: 4.0, education: 'B.S. Statistics - UC Berkeley', resume_url: 'bob_resume.pdf' },
  { _id: 'cand_charlie', name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1-555-456-7890', skills: ['UX Design principles', 'Marketing'], experience_years: 1.0, education: 'B.A. Communications', resume_url: 'charlie_resume.pdf' },
  { _id: 'cand_diana', name: 'Diana Prince', email: 'diana@example.com', phone: '+1-555-111-2222', skills: ['React', 'TypeScript', 'Tailwind', 'Redux', 'Node.js'], experience_years: 6.0, education: 'B.S. Software Engineering', resume_url: 'diana_resume.pdf' },
  { _id: 'cand_ethan', name: 'Ethan Hunt', email: 'ethan@example.com', phone: '+1-555-333-4444', skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Linux'], experience_years: 8.0, education: 'M.S. Information Systems', resume_url: 'ethan_resume.pdf' },
  { _id: 'cand_fiona', name: 'Fiona Gallagher', email: 'fiona@example.com', phone: '+1-555-555-6666', skills: ['Python', 'PyTorch', 'NLP', 'Data Science', 'Machine Learning'], experience_years: 3.5, education: 'Ph.D. Computer Science', resume_url: 'fiona_resume.pdf' },
  { _id: 'cand_george', name: 'George Miller', email: 'george@example.com', phone: '+1-555-777-8888', skills: ['Product Roadmapping', 'Agile/Scrum', 'Jira', 'SQL'], experience_years: 5.0, education: 'MBA', resume_url: 'george_resume.pdf' },
  { _id: 'cand_hannah', name: 'Hannah Abbott', email: 'hannah@example.com', phone: '+1-555-999-0000', skills: ['Python', 'Django', 'PostgreSQL', 'AWS'], experience_years: 2.5, education: 'B.S. Computer Science', resume_url: 'hannah_resume.pdf' },
  { _id: 'cand_ian', name: 'Ian Malcolm', email: 'ian@example.com', phone: '+1-555-121-2323', skills: ['Data Analysis', 'Tableau', 'SQL', 'R'], experience_years: 4.5, education: 'B.S. Mathematics', resume_url: 'ian_resume.pdf' },
  { _id: 'cand_jane', name: 'Jane Doe', email: 'jane@example.com', phone: '+1-555-454-5656', skills: ['HRIS', 'Onboarding', 'Compliance', 'Recruitment'], experience_years: 7.0, education: 'B.A. Human Resources', resume_url: 'jane_resume.pdf' }
];

let mockApplications = [
  { _id: 'app_alice', candidate_id: 'cand_alice', job_id: 'job_python', status: 'Offered', ats_score: 88, skill_gap: ['MongoDB'], experience_analysis: 'Alice has 5.5 years of strong Python experience, meeting the required backend stack perfectly.', fit_recommendation: 'Shortlist', applied_date: new Date(Date.now() - 86400000 * 10).toISOString(), candidate: mockCandidates[0], job: mockJobs[0] },
  { _id: 'app_bob', candidate_id: 'cand_bob', job_id: 'job_analyst', status: 'Interviewing', ats_score: 92, skill_gap: ['Tableau'], experience_analysis: 'Bob shows excellent analytical competence with 4 years of statistics work.', fit_recommendation: 'Shortlist', applied_date: new Date(Date.now() - 86400000 * 8).toISOString(), candidate: mockCandidates[1], job: mockJobs[1] },
  { _id: 'app_charlie', candidate_id: 'cand_charlie', job_id: 'job_pm', status: 'Rejected', ats_score: 45, skill_gap: ['Product Roadmapping', 'Agile/Scrum'], experience_analysis: 'Charlie is too junior and lacks essential roadmapping and backlog management skills.', fit_recommendation: 'Reject', applied_date: new Date(Date.now() - 86400000 * 5).toISOString(), candidate: mockCandidates[2], job: mockJobs[2] },
  { _id: 'app_diana', candidate_id: 'cand_diana', job_id: 'job_frontend', status: 'Screening', ats_score: 95, skill_gap: [], experience_analysis: 'Diana is a highly experienced React developer with a perfect stack match.', fit_recommendation: 'Shortlist', applied_date: new Date(Date.now() - 86400000 * 2).toISOString(), candidate: mockCandidates[3], job: mockJobs[3] },
  { _id: 'app_ethan', candidate_id: 'cand_ethan', job_id: 'job_devops', status: 'Interviewing', ats_score: 89, skill_gap: ['CI/CD'], experience_analysis: 'Ethan has robust AWS and Kubernetes background. Strong operational candidate.', fit_recommendation: 'Shortlist', applied_date: new Date(Date.now() - 86400000 * 6).toISOString(), candidate: mockCandidates[4], job: mockJobs[5] },
  { _id: 'app_fiona', candidate_id: 'cand_fiona', job_id: 'job_ml', status: 'Offered', ats_score: 98, skill_gap: [], experience_analysis: 'Fiona brings PhD level expertise in PyTorch and NLP, an exceptional fit for the AI team.', fit_recommendation: 'Shortlist', applied_date: new Date(Date.now() - 86400000 * 12).toISOString(), candidate: mockCandidates[5], job: mockJobs[4] },
  { _id: 'app_george', candidate_id: 'cand_george', job_id: 'job_pm', status: 'Applied', ats_score: 75, skill_gap: ['UX Design principles'], experience_analysis: 'George has good Agile experience but lacks UX depth.', fit_recommendation: 'Review', applied_date: new Date(Date.now() - 86400000 * 1).toISOString(), candidate: mockCandidates[6], job: mockJobs[2] },
  { _id: 'app_hannah', candidate_id: 'cand_hannah', job_id: 'job_python', status: 'Screening', ats_score: 65, skill_gap: ['FastAPI', 'Docker'], experience_analysis: 'Hannah works with Django rather than FastAPI, requires some ramp up.', fit_recommendation: 'Review', applied_date: new Date(Date.now() - 86400000 * 3).toISOString(), candidate: mockCandidates[7], job: mockJobs[0] },
  { _id: 'app_ian', candidate_id: 'cand_ian', job_id: 'job_analyst', status: 'Interviewing', ats_score: 84, skill_gap: ['Python'], experience_analysis: 'Ian relies heavily on R and SQL, might need training on Python data stacks.', fit_recommendation: 'Shortlist', applied_date: new Date(Date.now() - 86400000 * 7).toISOString(), candidate: mockCandidates[8], job: mockJobs[1] },
  { _id: 'app_jane', candidate_id: 'cand_jane', job_id: 'job_hr', status: 'Screening', ats_score: 90, skill_gap: ['Communication'], experience_analysis: 'Jane has 7 years HR experience and matches most generalist requirements.', fit_recommendation: 'Shortlist', applied_date: new Date(Date.now() - 86400000 * 4).toISOString(), candidate: mockCandidates[9], job: mockJobs[6] }
];

let mockInterviews = [
  { _id: 'int_bob', application_id: 'app_bob', questions: [{ q: "How do you handle missing or corrupt data in a Python analytics pipeline?", type: "technical", suggested_answer: "Check dropna() and imputation." }, { q: "Describe a complex SQL query you optimized.", type: "technical", suggested_answer: "Look for CTEs, indexes." }, { q: "How do you explain analytical insights to non-technical stakeholders?", type: "hr", suggested_answer: "Simple terms, visualization." }], responses: [], communication_score: 0, confidence_score: 0, overall_sentiment: 'Pending', feedback_summary: 'Interview scheduled. Responses pending.', scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'Scheduled' },
  { _id: 'int_ethan', application_id: 'app_ethan', questions: [{ q: "How do you ensure zero downtime during a Kubernetes cluster upgrade?", type: "technical", suggested_answer: "Rolling updates and health checks." }], responses: [], communication_score: 0, confidence_score: 0, overall_sentiment: 'Pending', feedback_summary: 'Interview scheduled.', scheduled_at: new Date(Date.now() + 86400000 * 4).toISOString(), status: 'Scheduled' },
  { _id: 'int_ian', application_id: 'app_ian', questions: [{ q: "Explain the difference between a left join and an inner join.", type: "technical", suggested_answer: "Inner join returns matches only, left join returns all from left." }], responses: [], communication_score: 0, confidence_score: 0, overall_sentiment: 'Pending', feedback_summary: 'Interview scheduled.', scheduled_at: new Date(Date.now() + 86400000 * 1).toISOString(), status: 'Scheduled' }
];

let mockOnboardings = [
  {
    _id: 'onb_alice',
    application_id: 'app_alice',
    offer_letter_url: 'offer_letter_app_alice.pdf',
    checklist: [
      { task: "Sign Offer Letter", completed: true },
      { task: "Upload Identity Documents", completed: true },
      { task: "Complete Background Check", completed: false },
      { task: "Setup Direct Deposit", completed: false },
      { task: "Attend Orientation", completed: false }
    ],
    documents: [
      { name: "Academic Certificates", status: "Verified" },
      { name: "Signed NDA", status: "Pending" }
    ],
    status: "Initiated",
    offer_letter_text: MOCK_OFFER_TEXT
  }
];

export async function request(endpoint, options = {}) {
  try {
    const fetchOptions = {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers
      }
    };
    
    // If body is FormData, we MUST completely strip Content-Type so the browser 
    // can auto-generate the correct multipart boundary.
    if (options.body instanceof FormData) {
      delete fetchOptions.headers['Content-Type'];
    }

    const res = await fetch(`${API_BASE}${endpoint}`, fetchOptions);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(err.detail || 'Request failed');
    }
    return await res.json();
  } catch (e) {
    console.warn(`Fetch error for ${endpoint}: ${e.message}. Attempting offline mock handler.`);
    return handleOfflineRequest(endpoint, options);
  }
}

function handleOfflineRequest(endpoint, options) {
  const method = options.method || 'GET';
  
  // Jobs Route
  if (endpoint === '/jobs') {
    if (method === 'GET') return [...mockJobs];
    if (method === 'POST') {
      const body = JSON.parse(options.body);
      const newJob = { _id: `job_${Date.now()}`, ...body, status: 'Published', created_at: new Date().toISOString() };
      mockJobs.push(newJob);
      return newJob;
    }
  }
  
  if (endpoint.startsWith('/jobs/')) {
    const jobId = endpoint.split('/')[2];
    if (method === 'GET') {
      const job = mockJobs.find(j => j._id === jobId);
      if (!job) throw new Error('Job not found');
      return job;
    }
    if (method === 'DELETE') {
      const idx = mockJobs.findIndex(j => j._id === jobId);
      if (idx !== -1) mockJobs.splice(idx, 1);
      return { message: 'Job deleted' };
    }
  }

  // Jobs AI Description Generation
  if (endpoint.startsWith('/jobs/generate-description')) {
    const urlParams = new URLSearchParams(endpoint.split('?')[1]);
    const jobTitle = urlParams.get('job_title') || 'Role';
    return {
      description: `We are seeking a talented and motivated ${jobTitle} to join our high-performing operations team. In this position, you will write clean, production-ready code, collaborate on architectural designs, and participate in code reviews.`,
      requirements: [
        `Strong proficiency in core technologies related to ${jobTitle}`,
        "Experience building scalable modern applications and microservices",
        "Understanding of database design and SQL/NoSQL storage",
        "Excellent communication and collaborative problem solving skills"
      ]
    };
  }

  // Candidates & Applications
  if (endpoint === '/candidates/applications') {
    return mockApplications.map(app => ({
      ...app,
      candidate: mockCandidates.find(c => c._id === app.candidate_id),
      job: mockJobs.find(j => j._id === app.job_id)
    }));
  }

  if (endpoint === '/candidates') {
    return [...mockCandidates];
  }

  if (endpoint.startsWith('/candidates/applications/') && endpoint.endsWith('/status')) {
    const appId = endpoint.split('/')[3];
    const body = JSON.parse(options.body);
    const app = mockApplications.find(a => a._id === appId);
    if (app) {
      app.status = body.status;
      if (body.status.toLowerCase() === 'offered') {
        // Auto create onboarding
        if (!mockOnboardings.some(onb => onb.application_id === appId)) {
          mockOnboardings.push({
            _id: `onb_${Date.now()}`,
            application_id: appId,
            offer_letter_url: `offer_letter_${appId}.pdf`,
            checklist: [
              { task: "Sign Offer Letter", completed: false },
              { task: "Upload Identity Documents", completed: false },
              { task: "Complete Background Check", completed: false },
              { task: "Setup Direct Deposit", completed: false }
            ],
            documents: [
              { name: "Academic Certificates", status: "Pending" },
              { name: "Signed NDA", status: "Pending" }
            ],
            status: "Initiated",
            offer_letter_text: MOCK_OFFER_TEXT
          });
        }
      }
      return { message: 'Status updated', status: body.status };
    }
  }

  // Resume Upload
  if (endpoint === '/candidates/upload' || endpoint === '/candidates/upload-bulk') {
    // Form data upload simulation
    const formData = options.body;
    const jobId = formData.get('job_id');
    const files = endpoint === '/candidates/upload-bulk' ? formData.getAll('files') : [formData.get('file')];
    
    const results = [];
    
    for (const file of files) {
      if (!file) continue;
      const filename = file.name || 'resume.pdf';
      const name = filename.replace(/\.[^/.]+$/, "").split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || "David Miller";
      const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
      const candId = `cand_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const appId = `app_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const newCand = {
        _id: candId,
        name,
        email,
        phone: '+1-555-400-0199',
        skills: ['Python', 'SQL', 'FastAPI', 'React', 'Docker'],
        experience_years: 4.5,
        education: 'B.S. Software Engineering - UT Austin',
        resume_url: filename,
        raw_resume_text: `Resume of ${name}. Skills: Python, SQL, FastAPI, React, Docker.`
      };
      mockCandidates.push(newCand);
      
      const newApp = {
        _id: appId,
        candidate_id: candId,
        job_id: jobId,
        status: 'Screening',
        ats_score: 82,
        skill_gap: ['MongoDB'],
        experience_analysis: 'Candidate has 4.5 years of strong engineering experience fitting the FastAPI profile.',
        fit_recommendation: 'Shortlist',
        applied_date: new Date().toISOString(),
        candidate: newCand,
        job: mockJobs.find(j => j._id === jobId)
      };
      mockApplications.push(newApp);
      results.push({ candidate: newCand, application: newApp });
    }
    
    if (endpoint === '/candidates/upload') return results[0];
    return { results };
  }

  // Compare candidates
  if (endpoint.startsWith('/candidates/compare')) {
    const urlParams = new URLSearchParams(endpoint.split('?')[1]);
    const ids = (urlParams.get('ids') || '').split(',');
    return mockApplications
      .filter(a => ids.includes(a.candidate_id))
      .map(app => {
        const cand = mockCandidates.find(c => c._id === app.candidate_id);
        const job = mockJobs.find(j => j._id === app.job_id);
        return {
          candidate_id: app.candidate_id,
          name: cand ? cand.name : 'Unknown',
          email: cand ? cand.email : '',
          experience_years: cand ? cand.experience_years : 0,
          education: cand ? cand.education : '',
          skills: cand ? cand.skills : [],
          job_title: job ? job.title : 'N/A',
          ats_score: app.ats_score,
          fit_recommendation: app.fit_recommendation,
          skill_gap: app.skill_gap,
          status: app.status
        };
      });
  }

  // Interviews
  if (endpoint === '/interviews') {
    if (method === 'GET') return [...mockInterviews];
    if (method === 'POST') {
      const body = JSON.parse(options.body);
      const newInterview = {
        _id: `int_${Date.now()}`,
        application_id: body.application_id,
        questions: [
          { q: "What is your experience with software architecture design patterns?", type: "technical", suggested_answer: "Modular architecture, clean coding." },
          { q: "Describe a time you solved an ambiguous technical problem.", type: "technical", suggested_answer: "Systematic investigation, research." },
          { q: "How do you handle workplace stress or project deadlines?", type: "hr", suggested_answer: "Prioritization, open communication." }
        ],
        responses: [],
        communication_score: 0,
        confidence_score: 0,
        overall_sentiment: 'Pending',
        feedback_summary: 'Interview scheduled.',
        scheduled_at: body.scheduled_at,
        status: 'Scheduled'
      };
      mockInterviews.push(newInterview);
      const app = mockApplications.find(a => a._id === body.application_id);
      if (app) app.status = 'Interviewing';
      return newInterview;
    }
  }

  if (endpoint.startsWith('/interviews/') && endpoint.endsWith('/submit')) {
    const intId = endpoint.split('/')[2];
    const body = JSON.parse(options.body);
    const interview = mockInterviews.find(i => i._id === intId);
    if (interview) {
      interview.responses = body.responses;
      interview.communication_score = 85;
      interview.confidence_score = 90;
      interview.overall_sentiment = 'Positive';
      interview.feedback_summary = 'Candidate demonstrated exceptional core competence. Answers were highly structured and articulate.';
      interview.status = 'Completed';
      return interview;
    }
  }

  if (endpoint.startsWith('/interviews/')) {
    const intId = endpoint.split('/')[2];
    const interview = mockInterviews.find(i => i._id === intId);
    if (interview) return interview;
  }

  // Onboarding
  if (endpoint === '/onboarding') {
    return [...mockOnboardings];
  }

  if (endpoint.startsWith('/onboarding/') && endpoint.endsWith('/generate-offer')) {
    const onbId = endpoint.split('/')[2];
    const onb = mockOnboardings.find(o => o._id === onbId);
    if (onb) {
      const app = mockApplications.find(a => a._id === onb.application_id);
      const cand = mockCandidates.find(c => c._id === app.candidate_id);
      const job = mockJobs.find(j => j._id === app.job_id);
      onb.offer_letter_text = `Dear ${cand.name},\n\nWe are pleased to offer you the position of ${job.title} in the ${job.department} department.\n\nYour compensation will be $120,000 USD per year. We look forward to working with you!`;
      return { offer_letter_text: onb.offer_letter_text };
    }
  }

  if (endpoint.startsWith('/onboarding/')) {
    const onbId = endpoint.split('/')[2];
    if (method === 'PUT') {
      const body = JSON.parse(options.body);
      const onb = mockOnboardings.find(o => o._id === onbId);
      if (onb) {
        if (body.checklist !== undefined) onb.checklist = body.checklist;
        if (body.documents !== undefined) onb.documents = body.documents;
        if (body.status !== undefined) onb.status = body.status;
        return onb;
      }
    }
    const onb = mockOnboardings.find(o => o._id === onbId);
    if (onb) return onb;
  }

  // Analytics
  if (endpoint === '/analytics/dashboard') {
    const funnel = {
      Applied: mockApplications.filter(a => a.status === 'Applied').length,
      Screening: mockApplications.filter(a => a.status === 'Screening').length,
      Interviewing: mockApplications.filter(a => a.status === 'Interviewing').length,
      Offered: mockApplications.filter(a => a.status === 'Offered').length,
      Rejected: mockApplications.filter(a => a.status === 'Rejected').length
    };
    return {
      total_candidates: mockCandidates.length,
      total_jobs: mockJobs.length,
      total_applications: mockApplications.length,
      funnel,
      department_wise: [
        { name: 'Engineering', value: mockJobs.filter(j => j.department === 'Engineering').length * 2 + 1 },
        { name: 'Data Science', value: 2 },
        { name: 'Product Management', value: 1 }
      ],
      hiring_trends: [
        { month: 'Jan', applicants: 8, hired: 1 },
        { month: 'Feb', applicants: 12, hired: 2 },
        { month: 'Mar', applicants: 15, hired: 3 },
        { month: 'Apr', applicants: 18, hired: 4 },
        { month: 'May', applicants: 22, hired: 5 },
        { month: 'Jun', applicants: mockApplications.length, hired: funnel.Offered }
      ]
    };
  }

  if (endpoint.startsWith('/analytics/predict-success/')) {
    const appId = endpoint.split('/')[3];
    const app = mockApplications.find(a => a._id === appId);
    const cand = mockCandidates.find(c => c._id === app.candidate_id);
    const job = mockJobs.find(j => j._id === app.job_id);
    return {
      candidate_id: app.candidate_id,
      name: cand.name,
      job_title: job.title,
      ats_score: app.ats_score,
      predicted_success_score: app.ats_score - 3,
      success_tier: app.ats_score >= 80 ? "High Potential (Tier 1)" : "Qualified (Tier 2)",
      has_interview: true,
      ai_summary: `The candidate has ${cand.experience_years} years of experience and is strongly matched to requirements.`
    };
  }

  // Copilot Chat Queries
  if (endpoint === '/copilot') {
    const body = JSON.parse(options.body);
    const prompt = body.prompt.toLowerCase();
    
    if (prompt.includes('top 10') || prompt.includes('show candidates')) {
      return {
        query_type: 'candidate_search',
        response: `### Top Candidates\n\n| Rank | Candidate | Experience | Education | ATS Match Score | Recommendation |\n|---|---|---|---|---|---|\n| 1 | **Bob Johnson** | 4.0 yrs | B.S. Statistics | \`92%\` | Shortlist |\n| 2 | **Alice Smith** | 5.5 yrs | M.S. CS | \`88%\` | Shortlist |\n| 3 | **David Miller** | 4.5 yrs | B.S. SE | \`82%\` | Shortlist |`,
        data: [
          { rank: 1, name: 'Bob Johnson', experience_years: 4.0, education: 'B.S. Statistics', ats_score: 92, recommendation: 'Shortlist' },
          { rank: 2, name: 'Alice Smith', experience_years: 5.5, education: 'M.S. CS', ats_score: 88, recommendation: 'Shortlist' }
        ]
      };
    }
    
    if (prompt.includes('highest ats')) {
      return {
        query_type: 'highest_ats',
        response: `### Highest ATS Score Match\n\nThe candidate with the highest ATS Score is **Bob Johnson** with a score of \`92%\`.\n\n- **Role:** Lead Data Analyst\n- **Experience:** 4.0 Years\n- **Education:** B.S. Statistics - UC Berkeley\n- **Skills:** SQL, Python, Data Analysis, Pandas, Excel`,
        data: [{ name: 'Bob Johnson', ats_score: 92, job_title: 'Lead Data Analyst', skills: ['SQL', 'Python', 'Data Analysis'] }]
      };
    }
    
    if (prompt.includes('generate') || prompt.includes('questions')) {
      return {
        query_type: 'question_generation',
        response: `### AI-Generated Interview Questions\n\n1. **[TECHNICAL]** How do you construct and structure custom hooks in React for code reusability?\n2. **[TECHNICAL]** Can you explain how you would troubleshoot a performance leak in a web application?\n3. **[HR]** Describe a time you had a difference of opinion with a technical lead. How did you align?`,
        data: [
          { q: "How do you construct and structure custom hooks in React?", type: "technical" },
          { q: "Troubleshoot a performance leak in a web application", type: "technical" }
        ]
      };
    }
    
    if (prompt.includes('predict') || prompt.includes('succeed')) {
      return {
        query_type: 'success_prediction',
        response: `### AI Candidate Success Predictions\n\n| Rank | Candidate | Target Role | Success Prob. | Recommendation Category |\n|---|---|---|---|---|\n| 1 | **Bob Johnson** | Lead Data Analyst | \`89%\` | High Potential (Tier 1) |\n| 2 | **Alice Smith** | Senior Python Developer | \`87%\` | High Potential (Tier 1) |`,
        data: [
          { rank: 1, name: 'Bob Johnson', job_title: 'Lead Data Analyst', success_probability: 89, tier: 'High Potential (Tier 1)' },
          { rank: 2, name: 'Alice Smith', job_title: 'Senior Python Developer', success_probability: 87, tier: 'High Potential (Tier 1)' }
        ]
      };
    }

    return {
      query_type: 'general',
      response: `Hello! I am your TalentAI Recruitment Copilot.\n\nTry asking me one of these supported queries:\n- *"Show top 10 candidates for Lead Data Analyst"* \n- *"Who has the highest ATS score?"* \n- *"Generate interview questions for Python Developer"* \n- *"Predict which candidates are most likely to succeed"*`
    };
  }

  throw new Error(`Endpoint mock handler not found for ${endpoint}`);
}
