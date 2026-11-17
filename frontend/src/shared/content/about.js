// About page content. Edit text here; AboutMe.jsx only lays it out.
// Contact details and public URLs live in shared/config/profile.js.

// The skill groups in the order they are shown on the About page.
export const skillGroups = [
    { key: 'programming', label: 'Languages' },
    { key: 'web', label: 'Web' },
    { key: 'data', label: 'Data' },
    { key: 'testing', label: 'Testing' },
    { key: 'tools', label: 'Tools' },
    { key: 'ai', label: 'AI' },
    { key: 'hardware', label: 'Hardware' },
];

export const about = {
    name: 'Ekin Efe Gungor',
    role: 'CS Student | Junior Full-Stack Developer',
    intro: 'Web apps, internal tools and a bit of hardware. I like finding out why things break.',
    // First person on purpose: a personal brand, not a studio.
    nameStory: 'GNR comes from my surname, Gungor, and “digital” is what I make with it. This is my personal portfolio and workshop, not a studio or a company.',
    summary: 'Final-year Computer Science student (AI and Data Science, graduating June 2027) and web developer intern in the IT team at Endigitals. I work through tickets on 10+ Laravel, Vue/Nuxt and TypeScript projects, built a bakery’s ordering website from scratch, and trace bugs to the real cause. Outside work I build and host my own apps on Linux and Cloudflare, and I design and build small electronics: a Morse code keyer from circuit to firmware and desktop app. I use Claude Code every day and test every change myself.',
    // CEFR levels as on my CV.
    languages: { Turkish: 'native', English: 'B2 to C1', Polish: 'A1, learning' },
    skills: {
        programming: ['PHP', 'JavaScript', 'TypeScript', 'Python', 'SQL', 'Bash', 'C/C++'],
        web: ['Laravel', 'Filament', 'Vue', 'Nuxt', 'React', 'Tailwind CSS', 'REST APIs'],
        data: ['MySQL', 'SQLite', 'Cloudflare D1', 'Excel'],
        testing: ['PHPUnit', 'Vitest', 'pytest'],
        tools: ['Git', 'GitHub Actions', 'Bitbucket', 'Jira', 'Docker', 'Cloudflare Workers', 'Linux (Fedora, Ubuntu)', 'nginx', 'systemd', 'Tailscale', 'SSH', 'Windows', 'Google Workspace admin'],
        ai: ['Claude Code', 'OpenAI API', 'Ollama'],
        hardware: ['Arduino', 'KiCad', 'soldering', 'I2C', 'UART/serial', 'interrupts', 'PC hardware'],
    },
    // Each group renders as a `git log`. Newest first. `current: true` gets the highlighted node.
    log: [
        {
            key: 'education',
            title: 'EDUCATION',
            entries: [
                {
                    when: '2023 – June 2027 (expected)',
                    title: 'BSc Computer Science (AI and Data Science)',
                    org: 'Uniwersytet VIZJA, Warsaw',
                    current: true,
                },
            ],
        },
        {
            key: 'professional',
            title: 'PROFESSIONAL_EXPERIENCE',
            entries: [
                {
                    when: 'August 2026 – Present',
                    title: 'Web Developer Intern',
                    org: 'Endigitals, IT team, remote',
                    current: true,
                    points: [
                        'Delivered 65+ Jira tickets and 85+ pull requests across 10+ projects (Laravel, Filament, Nuxt/Vue) in a 6-person IT team: new features, changes and fixes in existing codebases. Scoped each ticket, guided the build with Claude Code, tested in the browser, and ran the test suite before team-lead review.',
                        'Built a London bakery’s website and click-and-collect ordering system from scratch (Laravel 12, Filament 5, Tailwind, GSAP; 105 commits, 200+ automated tests): online menu, passwordless login by email or SMS code, loyalty stamp card, staff order panel and table QR codes.',
                        'On the company’s employee account tool (Google Workspace, Jira, Bitbucket, Slack), traced failed provisioning to 3 separate faults and stopped test runs from creating paid Google accounts.',
                        'Upgraded the company site from Laravel 8 to 13 one version at a time, then matched production (Laravel 12).',
                        'Cut layout shift (CLS) on a listing page from 0.313 to 0.006 and a blog’s image payload from 2.6 MB to 92 KB. Fixed an email header injection and unsafe session handling.',
                    ],
                },
                {
                    when: 'December 2025 – Present',
                    title: 'IT and Data Management',
                    org: 'DYRK1A PROT Initiative',
                    current: true,
                    points: [
                        'Built the student research team’s bilingual (EN/PL) React and TypeScript website (11 pages), including event pages for a February 2026 forum at the University of Warsaw.',
                    ],
                },
            ],
        },
        {
            key: 'other',
            title: 'OTHER_EXPERIENCE',
            entries: [
                {
                    when: 'July 2024 – Present',
                    title: 'Part-time Bike Technician',
                    org: 'Benefit Bike',
                    current: true,
                    points: [
                        'Diagnose mechanical issues and complete same-day repairs; perform drivetrain/brake tuning, component replacements, and safety checks.',
                        'Communicate repair options, costs, and timelines; document work and maintain service logs.',
                        'Own the workflow end-to-end–from intake to pickup–ensuring on-time completion and QC.',
                    ],
                },
                {
                    when: 'June 2019 – Present',
                    title: 'Freelance Photographer & Technical Consultant',
                    current: true,
                    points: [
                        'Managed portrait, event, and commercial shoots end-to-end (brief, shoot, edit, delivery).',
                        'Built a terminal utility to launch common editing workflows, improving daily throughput.',
                        'Scoped requirements and advised clients on asset management and color workflows.',
                    ],
                },
                {
                    when: 'June – July 2024',
                    title: 'Trainee Instructor',
                    org: 'Nobel Learning PBC',
                    points: ['Taught a beginner internet-basics course after a 90-hour training program.'],
                },
                {
                    when: 'January 2016 – December 2020',
                    title: 'Leader’s Assistant & PR/Social Media Manager',
                    org: 'Turkish Aeronautical Association',
                    points: [
                        'Led a 5-member youth team to plan national events (100+ attendees); coordinated schedules, budgets, and on-site operations.',
                        'Produced/published cross-channel social content; coordinated promo campaigns.',
                        'Liaised with local media (newspapers, radio, TV) to increase visibility and attendance.',
                    ],
                },
            ],
        },
    ],
    // Measured results shown on Home. Each one is also in a point of the internship entry above.
    results: [
        { before: '0.313', after: '0.006', what: 'layout shift (CLS) on a listing page' },
        { before: '2.6 MB', after: '92 KB', what: 'image payload of a blog listing' },
        { before: '', after: '85+ pull requests', what: '65+ Jira tickets across 10+ projects' },
    ],
    certificates: [
        { name: 'ChatGPT Prompt Engineering for Developers', issuer: 'DeepLearning.AI', when: 'August 2025' },
        { name: 'Fundamentals Program (90 hours)', issuer: 'Nobel Learning PBC', when: '2024' },
        { name: 'Academic Skills', issuer: 'NAVOICA', when: 'January 2024' },
        { name: 'Website Development', issuer: 'NAVOICA', when: 'January 2024' },
        { name: 'Daily and Business English', issuer: 'Wyższa Szkoła Ekologii i Zarządzania w Warszawie', when: '2020 – 2021' },
    ],
};
