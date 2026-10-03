// Comprehensive Mock Data for NexStep AI Platform

export const LANDING_FEATURES = [
  {
    id: "ai-counselor",
    title: "Bilingual AI Counselor",
    description: "Gemini 3.6 Flash powered guidance in English & Urdu script for Pakistani BISE & HEC systems.",
    icon: "Bot",
  },
  {
    id: "hec-unis",
    title: "100 HEC Recognized Unis",
    description: "Real-time merit cutoffs, fee structures, hostel availability, and admission timelines.",
    icon: "Building2",
  },
  {
    id: "scholarships",
    title: "Scholarship Matcher",
    description: "Ehsaas, PEEF, HEC Need-Based & Provincial awards matched to household income.",
    icon: "GraduationCap",
  },
  {
    id: "mock-interview",
    title: "AI Mock Interviews",
    description: "Practice university admission & job interviews with real-time AI feedback on confidence & content.",
    icon: "Mic",
  },
  {
    id: "resume-builder",
    title: "ATS Resume Builder",
    description: "Build ATS-optimized resumes tailored for Pakistani & international university applications.",
    icon: "FileText",
  },
  {
    id: "skill-gap",
    title: "Skill Gap & Learning Paths",
    description: "Identify missing technical & soft skills with direct course recommendations.",
    icon: "TrendingUp",
  }
];

export const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: "Ayesha Malik",
    role: "Medical Student @ KEMU Lahore",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    quote: "NexStep AI helped me analyze my MDCAT target score and matched me with PEEF scholarship. Saved my family thousands in tuition!",
    city: "Lahore"
  },
  {
    id: 2,
    name: "Hamza Abbasi",
    role: "BS Computer Science @ NUST Islamabad",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    quote: "The RIASEC quiz identified my strong Investigative score and mapped me straight into ICS to NUST NET roadmap. Highly recommended!",
    city: "Islamabad"
  },
  {
    id: 3,
    name: "Zainab Fatima",
    role: "A-Level Student & Cambridge Scholar",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
    quote: "The IBCC Equivalency tool made converting my Cambridge grades so effortless. The AI counselor answered all my foreign degree equivalency queries.",
    city: "Karachi"
  }
];

export const COURSES_DATA = [
  {
    id: "c1",
    title: "Complete Python & Data Science Bootcamp",
    provider: "DigiSkills & Google",
    category: "Computer Science & IT",
    level: "Beginner to Intermediate",
    duration: "8 Weeks",
    studentsCount: 14200,
    rating: 4.9,
    price: "FREE",
    badge: "Most Popular",
    skills: ["Python", "Pandas", "Data Analysis", "SQL"],
    description: "Master foundational Python programming, data manipulation, and introductory Machine Learning."
  },
  {
    id: "c2",
    title: "MDCAT Biology & Chemistry Masterclass",
    provider: "KIPS & STEP Prep Online",
    category: "Medical & Health",
    level: "FSc / Inter",
    duration: "12 Weeks",
    studentsCount: 9800,
    rating: 4.8,
    price: "PKR 5,000",
    badge: "Exam Focused",
    skills: ["Human Physiology", "Organic Chemistry", "MDCAT Past Papers"],
    description: "In-depth video tutorials and 5,000+ solved practice MCQs tailored for UHS, DUHS, and KMU MDCAT."
  },
  {
    id: "c3",
    title: "Full-Stack Web Development with React & Node.js",
    provider: "NAVTTC Prime Minister Youth Skill",
    category: "Software Engineering",
    level: "Intermediate",
    duration: "12 Weeks",
    studentsCount: 11500,
    rating: 4.9,
    price: "FREE",
    badge: "Certified",
    skills: ["HTML/CSS", "JavaScript", "React", "Express", "Node.js"],
    description: "Hands-on project based web development certification recognized by Ministry of IT Pakistan."
  },
  {
    id: "c4",
    title: "Financial Accounting & Business Analytics",
    provider: "IBA Executive Education",
    category: "Business & Finance",
    level: "Intermediate",
    duration: "6 Weeks",
    studentsCount: 4200,
    rating: 4.7,
    price: "PKR 8,000",
    badge: "Industry Standard",
    skills: ["Excel Financial Modeling", "Balance Sheets", "Managerial Accounting"],
    description: "Learn financial principles essential for ICOM, BBA, and CA entry preparations."
  }
];

export const JOBS_INTERNSHIPS_DATA = [
  {
    id: "j1",
    title: "Junior Full-Stack Software Engineer",
    company: "Systems Limited",
    type: "Full-Time",
    category: "Software Engineering",
    location: "Lahore / Hybrid",
    stipendSalary: "PKR 90,000 - 130,000 / month",
    experience: "Fresh Graduate / 0-1 Yr",
    deadline: "2026-09-15",
    officialUrl: "https://systemsltd.com/careers",
    description: "We are seeking enthusiastic Computer Science graduates to build enterprise web applications.",
    requirements: ["BS CS / Software Engineering", "Proficiency in JavaScript / React / Node", "Strong Problem Solving"]
  },
  {
    id: "j2",
    title: "AI & Data Science Intern",
    company: "Afiniti Pakistan",
    type: "Internship",
    category: "Artificial Intelligence",
    location: "Islamabad",
    stipendSalary: "PKR 45,000 / month",
    experience: "Current University Student (Final Year)",
    deadline: "2026-08-30",
    officialUrl: "https://afiniti.com/careers",
    description: "Paid 3-month summer internship working with machine learning models and predictive analytics.",
    requirements: ["Python, PyTorch / TensorFlow basics", "Good Mathematics & Linear Algebra", "Data Wrangling"]
  },
  {
    id: "j3",
    title: "Associate Financial Analyst",
    company: "Engro Corporation",
    type: "Full-Time",
    category: "Finance & Accounting",
    location: "Karachi",
    stipendSalary: "PKR 110,000 / month",
    experience: "Fresh Graduate",
    deadline: "2026-09-01",
    officialUrl: "https://engro.com/careers",
    description: "Perform financial modeling, variance analysis, and quarterly reporting for energy projects.",
    requirements: ["BBA Finance / BS Accounting", "Advanced Excel", "Strong Presentation Skills"]
  },
  {
    id: "j4",
    title: "UI/UX Product Designer",
    company: "Arbisoft",
    type: "Full-Time",
    category: "Design & Media",
    location: "Lahore / Remote",
    stipendSalary: "PKR 80,000 - 120,000 / month",
    experience: "0-2 Years",
    deadline: "2026-09-20",
    officialUrl: "https://arbisoft.com/careers",
    description: "Design intuitive user flows and high-fidelity wireframes for global web apps.",
    requirements: ["Figma Portfolio", "User Research Skills", "Understanding of Modern UI Trends"]
  },
  {
    id: "j5",
    title: "Assistant Director IT & Software",
    company: "National Database and Registration Authority (NADRA)",
    type: "Full-Time",
    category: "Information Technology",
    location: "Islamabad, Pakistan",
    stipendSalary: "PKR 140,000 / month",
    experience: "1-3 Years",
    deadline: "2026-10-15",
    officialUrl: "https://careers.nadra.gov.pk",
    description: "Lead national database security audits, API integrations, and citizen identity portal maintenance.",
    requirements: ["BS Computer Science / Software Engineering", "PostgreSQL & Node.js", "Cybersecurity Basics"]
  },
  {
    id: "j6",
    title: "Junior Data Analyst",
    company: "Punjab Information Technology Board (PITB)",
    type: "Full-Time",
    category: "Data Science & Analytics",
    location: "Lahore, Punjab",
    stipendSalary: "PKR 95,000 / month",
    experience: "Fresh Graduate",
    deadline: "2026-11-05",
    officialUrl: "https://pitb.gov.pk/careers",
    description: "Analyze public sector healthcare, e-governance, and education metrics for provincial dashboard reporting.",
    requirements: ["BS Data Science / Statistics / CS", "SQL & Power BI", "Python Data Analytics"]
  },
  {
    id: "j7",
    title: "Sub-Engineer Electrical (BPS-14)",
    company: "Water and Power Development Authority (WAPDA)",
    type: "Full-Time",
    category: "Engineering & Technical",
    location: "Tarbela / Mangla Dam",
    stipendSalary: "PKR 65,000 / month",
    experience: "DAE Technical Diploma",
    deadline: "2026-10-30",
    officialUrl: "https://wapda.gov.pk/careers",
    description: "Supervise grid station switchgear operations, power transformer maintenance, and hydro-turbine logging.",
    requirements: ["3-Year DAE Electrical Diploma", "PBTE Board Certification", "Grid Station Operations"]
  },
  {
    id: "j8",
    title: "Cyber Security Specialist",
    company: "National Telecommunication Corporation (NTC)",
    type: "Full-Time",
    category: "Information Technology",
    location: "Islamabad, Pakistan",
    stipendSalary: "PKR 160,000 / month",
    experience: "2+ Years",
    deadline: "2026-11-20",
    officialUrl: "https://ntc.org.pk/careers",
    description: "Monitor SOC operations, conduct penetration testing, and secure government intranet data centers.",
    requirements: ["BS Cyber Security / CS", "CEH or CISSP certification preferred", "Network Intrusion Analysis"]
  },
  {
    id: "j9",
    title: "Management Trainee Officer (MTO)",
    company: "Pakistan Telecommunication Company Limited (PTCL)",
    type: "Full-Time",
    category: "Management & Business",
    location: "Multi-City (Islamabad/Lahore/Karachi)",
    stipendSalary: "PKR 85,000 / month",
    experience: "Fresh Graduate",
    deadline: "2026-09-30",
    officialUrl: "https://ptcl.com.pk/careers",
    description: "Rotational MTO program across commercial telecom operations, digital transformation, and customer experience.",
    requirements: ["BBA / BS CS / BE Telecom", "Minimum 3.0 CGPA", "Strong Leadership & Communication"]
  },
  {
    id: "j10",
    title: "Junior Scientist / Engineer",
    company: "Space & Upper Atmosphere Research Commission (SUPARCO)",
    type: "Full-Time",
    category: "Aerospace & Engineering",
    location: "Karachi / Islamabad",
    stipendSalary: "PKR 150,000 / month",
    experience: "Fresh Graduate / 1 Year",
    deadline: "2026-12-01",
    officialUrl: "https://suparco.gov.pk/careers",
    description: "Work on satellite telemetry signal processing, GIS remote sensing data analysis, and orbital tracking software.",
    requirements: ["BE Aerospace / Electrical / BS Computer Science", "HEC Recognized Degree", "Signal Processing"]
  }
];

export const MENTORS_DATA = [
  {
    id: "m1",
    name: "Dr. Shahzad Hassan",
    title: "Assistant Professor & AI Researcher",
    institution: "Air University Islamabad",
    expertise: ["AI & Machine Learning", "CS Admissions", "Research Guidance"],
    rating: 4.9,
    reviewsCount: 84,
    hourlyFee: "Free for Students",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    availableSlots: ["Mon 4:00 PM", "Wed 5:00 PM", "Sat 11:00 AM"]
  },
  {
    id: "m2",
    name: "Dr. Maria Khan, MBBS",
    title: "Senior Resident Physician",
    institution: "PIMS Hospital Islamabad / KEMU Alum",
    expertise: ["MDCAT Strategy", "Medical Specializations", "USMLE / PLAB Overseas"],
    rating: 5.0,
    reviewsCount: 112,
    hourlyFee: "Free for Needy Students",
    image: "https://images.unsplash.com/photo-1594824813566-78a933f2c38f?auto=format&fit=crop&q=80&w=150",
    availableSlots: ["Tue 6:00 PM", "Thu 6:00 PM", "Sun 2:00 PM"]
  },
  {
    id: "m3",
    name: "Usman Tariq",
    title: "Lead Software Architect",
    institution: "Ex-Systems Ltd / FAST Nu Alum",
    expertise: ["Tech Careers", "ECAT Prep", "Software Industry Mentorship"],
    rating: 4.8,
    reviewsCount: 65,
    hourlyFee: "Free Community Hours",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    availableSlots: ["Fri 7:00 PM", "Sat 3:00 PM"]
  }
];

export const COMMUNITY_POSTS = [
  {
    id: "p1",
    author: "Usama Farooq (FSc Pre-Eng)",
    avatar: "U",
    timeAgo: "2 hours ago",
    category: "ECAT & Entry Tests",
    title: "Is 82% in FSc enough for CS in COMSATS Islamabad campus?",
    content: "Assalam-o-Alaikum! I secured 82% in FSc Pre-Engineering and scored 78 in NTS-NAT. What are my chances in CS or SE at COMSATS Islamabad in the second merit list?",
    likes: 18,
    commentsCount: 7,
    solved: true,
    tags: ["COMSATS", "NTS-NAT", "FSc Pre-Engineering"]
  },
  {
    id: "p2",
    author: "Fatima Noor (Grade 10 FBISE)",
    avatar: "F",
    timeAgo: "5 hours ago",
    category: "Grade 8 & Matric",
    title: "Pre-Medical vs ICS: Which has better scope in Pakistan by 2030?",
    content: "I scored 94% in 9th Matric Biology. But everyone says IT and AI are booming while doctor jobs have tough housejob competition. Should I shift to ICS or stay Pre-Medical?",
    likes: 34,
    commentsCount: 19,
    solved: false,
    tags: ["Matric", "ICS vs Pre-Med", "Career Scope"]
  },
  {
    id: "p3",
    author: "Bilal Ahmed (A-Levels)",
    avatar: "B",
    timeAgo: "1 day ago",
    category: "Transnational / O-A Levels",
    title: "Guide: Step-by-Step IBCC Equivalency Process for Cambridge 2026",
    content: "Hello everyone! I just completed my IBCC equivalency online. Here is the list of documents required, attestation steps, and fee voucher details to save you hassle.",
    likes: 52,
    commentsCount: 12,
    solved: true,
    tags: ["IBCC", "A-Levels", "Guide"]
  }
];
