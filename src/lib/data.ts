// Inline data from the data-pipeline engines — avoids ESM/CJS mismatch

export interface Job {
  code: string;
  title: string;
  title_zh: string;
  title_de?: string;
  country: 'CN' | 'DE';
  opportunity_score: number;
  breakdown: {
    salary: number;
    competition: number;
    growth: number;
    barrier: number;
    ai_resilience: number;
    demand_growth: number;
    remote: number;
  };
  salary_display: string;
  salary_raw: number;
  currency: string;
  source: string;
  skills?: string[];
  technology_skills?: string[];
  industry?: string;
}

export interface MacroEvent {
  name: string;
  name_de: string;
  intensity: number;
}

export interface SignalJob {
  job_zh: string;
  job_en: string;
  job_de: string;
  direction: 'up' | 'down';
  total_impact: number;
  signals: { event: string; event_de: string; impact: number; reason: string; reason_de: string }[];
}

// ---- SKILL TAXONOMY (for user input) ----
export interface SkillCategory {
  id: string;
  name: string;
  name_zh: string;
  name_de: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  // Manufacturing Core
  { id: 'mfg', name: 'Manufacturing / Process', name_zh: '制造/工艺', name_de: 'Fertigung / Verfahren', skills: ['Lean Manufacturing', 'Six Sigma', 'CNC Programming', 'GD&T', 'SPC/SQC', 'FMEA', 'APQP/PPAP', 'Injection Molding', 'Welding (MIG/TIG)', 'Casting/Forging', 'Surface Treatment', 'Tooling Design', 'DFM/DFA', 'Value Stream Mapping'] },
  { id: 'quality', name: 'Quality / Reliability', name_zh: '质量/可靠性', name_de: 'Qualität / Zuverlässigkeit', skills: ['ISO 9001', 'IATF 16949', 'Root Cause Analysis (8D)', 'Audit (VDA 6.3)', 'Metrology/CMM', 'HALT/HASS', 'Reliability Testing', 'Failure Analysis', 'DOE', 'Control Plan'] },
  // Automotive
  { id: 'auto', name: 'Automotive / Embedded', name_zh: '汽车/嵌入式', name_de: 'Automobil / Embedded', skills: ['AUTOSAR', 'CAN/LIN', 'MATLAB/Simulink', 'Embedded C/C++', 'RTOS', 'STM32', 'Functional Safety (ISO 26262)', 'DOORS', 'ADAS/Autonomous Driving', 'Battery/BMS', 'V2X Communication', 'EV Powertrain', 'Homologation'] },
  // Engineering Design
  { id: 'cad', name: 'CAD / CAE / Simulation', name_zh: 'CAD/CAE/仿真', name_de: 'CAD / CAE / Simulation', skills: ['SolidWorks', 'CATIA', 'NX/UG', 'AutoCAD', 'ANSYS', 'Abaqus', 'CFD', 'FEA', 'Creo', 'Inventor', 'COMSOL', 'Adams'] },
  // Electronics / Semiconductor
  { id: 'ee', name: 'Electrical / Electronics', name_zh: '电气/电子/半导体', name_de: 'Elektro/Elektronik/Halbleiter', skills: ['Circuit Design', 'PCB Design', 'EMC', 'Power Electronics', 'Altium Designer', 'PLC/SPS', 'Verilog/VHDL', 'IC Design', 'FPGA', 'RF Design', 'Semiconductor Process', 'EDA Tools', 'Sensor Technology', 'SMT Process'] },
  // Robotics / Automation
  { id: 'robot', name: 'Robotics / Automation', name_zh: '机器人/自动化', name_de: 'Robotik / Automatisierung', skills: ['ROS2', 'PLC Programming', 'Motion Control', 'SLAM/Navigation', 'Industrial Automation', 'TIA Portal/Codesys', 'HMI Design', 'SCADA/DCS', 'MES', 'Industrial Vision'] },
  // Programming / Software
  { id: 'prog', name: 'Programming', name_zh: '编程', name_de: 'Programmierung', skills: ['Python', 'JavaScript', 'Java', 'C/C++', 'C#', 'Go', 'Rust', 'TypeScript', 'R', 'SQL', 'MATLAB'] },
  { id: 'ai', name: 'AI / Machine Learning', name_zh: 'AI/机器学习', name_de: 'KI / ML', skills: ['Machine Learning', 'Deep Learning', 'TensorFlow/PyTorch', 'NLP', 'Computer Vision', 'LLM/Prompt Engineering', 'RAG Architecture', 'Data Analysis', 'Feature Engineering'] },
  { id: 'devops', name: 'Cloud / DevOps', name_zh: '云/运维', name_de: 'Cloud / DevOps', skills: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'CI/CD', 'Linux', 'Terraform', 'Git'] },
  { id: 'data', name: 'Data Engineering', name_zh: '数据工程', name_de: 'Data Engineering', skills: ['Spark', 'ETL/Data Pipeline', 'Apache Airflow', 'Power BI', 'MongoDB', 'PostgreSQL', 'Kafka', 'Grafana', 'Digital Twin', 'PLM/Teamcenter'] },
  // Digital Manufacturing / Industry 4.0
  { id: 'i40', name: 'Industry 4.0 / Smart Factory', name_zh: '工业4.0/智能工厂', name_de: 'Industrie 4.0 / Smart Factory', skills: ['IIoT', 'OPC UA', 'Edge Computing', 'Predictive Maintenance', 'Digital Twin', 'MES/MOM', 'SAP PP/PM', 'OT Cybersecurity', 'MQTT', 'Time-Series DB'] },
  // Supply Chain
  { id: 'scm', name: 'Supply Chain / Logistics', name_zh: '供应链/物流', name_de: 'Lieferkette / Logistik', skills: ['S&OP', 'Demand Forecasting', 'SAP MM', 'Procurement/Sourcing', 'Warehouse Management', 'Import/Export/Customs', 'Supplier Development', 'Inventory Optimization', 'Cost Reduction'] },
  // Energy / Sustainability
  { id: 'energy', name: 'Energy / Sustainability', name_zh: '能源/可持续', name_de: 'Energie / Nachhaltigkeit', skills: ['Wind/Solar Engineering', 'Grid Integration', 'Energy Storage', 'Battery Systems', 'Hydrogen/Fuel Cell', 'Carbon Accounting', 'ESG Reporting', 'LCA', 'ISO 14001', 'ISO 50001'] },
  // Business / Consulting
  { id: 'biz', name: 'Business / Consulting', name_zh: '商业/咨询', name_de: 'Business / Beratung', skills: ['Team Leadership', 'Agile/Scrum', 'Project Management', 'Strategy', 'Financial Modeling', 'ERP (SAP)', 'Change Management', 'Stakeholder Management', 'Business Development', 'M&A Due Diligence', 'Patent/IP'] },
  // Languages
  { id: 'lang', name: 'Languages / Soft Skills', name_zh: '语言/软技能', name_de: 'Sprachen / Soft Skills', skills: ['German B1+', 'English C1+', 'Presentation', 'Cross-cultural Communication', 'German Job Application Standards', 'Technical Writing', 'Negotiation'] },
];

// ---- CAREER EVENTS (projects that boost job probability) ----
export interface CareerEvent {
  id: string;
  title: string;
  title_zh: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  time_hours: number;
  cost: string;
  output_type: string;
  skills_gained: { skill: string; delta: number }[];
  target_jobs: string[];
  github_repos: { name: string; url: string; stars: string }[];
  deliverables: string[];
  deliverables_zh: string[];
}

export const careerEvents: CareerEvent[] = [
  {
    id: 'evt-opencv-detector', title: 'Build an OpenCV Object Detection System', title_zh: '制作OpenCV物体检测系统',
    difficulty: 'intermediate', time_hours: 40, cost: '¥0-500', output_type: 'project',
    skills_gained: [{ skill: 'Python', delta: 0.3 }, { skill: 'OpenCV', delta: 0.6 }, { skill: 'Computer Vision', delta: 0.4 }, { skill: 'YOLO/Object Detection', delta: 0.5 }],
    target_jobs: ['CV Engineer', 'AI Engineer', 'Robotics Engineer', 'Data Scientist / AI Engineer'],
    github_repos: [{ name: 'YOLOv8 (Ultralytics)', url: 'https://github.com/ultralytics/ultralytics', stars: '35K+' }, { name: 'OpenCV', url: 'https://github.com/opencv/opencv', stars: '80K+' }],
    deliverables: ['Working detection demo with video input', 'GitHub repo with README & demo video', 'Performance benchmarks (FPS, mAP)'],
    deliverables_zh: ['可工作的视频检测演示', 'GitHub仓库含README和演示视频', '性能基准(FPS, mAP)'],
  },
  {
    id: 'evt-llm-chatbot', title: 'Build a Domain-Specific LLM Chatbot', title_zh: '制作垂直领域LLM聊天机器人',
    difficulty: 'intermediate', time_hours: 30, cost: '¥0-100', output_type: 'project',
    skills_gained: [{ skill: 'Python', delta: 0.3 }, { skill: 'LLM/Prompt Engineering', delta: 0.6 }, { skill: 'RAG Architecture', delta: 0.5 }, { skill: 'LangChain', delta: 0.5 }],
    target_jobs: ['AI Engineer', 'ML Engineer', 'Backend Developer', 'Data Scientist / AI Engineer'],
    github_repos: [{ name: 'LangChain', url: 'https://github.com/langchain-ai/langchain', stars: '100K+' }, { name: 'LlamaIndex', url: 'https://github.com/run-llama/llama_index', stars: '38K+' }],
    deliverables: ['Deployed chatbot with custom knowledge base', 'RAG pipeline with vector DB', 'API endpoint documentation'],
    deliverables_zh: ['部署的自定义知识库聊天机器人', 'RAG管道+向量数据库', 'API端点文档'],
  },
  {
    id: 'evt-plc-automation', title: 'Build a PLC-Controlled Automation Demo', title_zh: '制作PLC控制自动化演示',
    difficulty: 'intermediate', time_hours: 60, cost: '¥500-2000', output_type: 'project',
    skills_gained: [{ skill: 'PLC Programming', delta: 0.6 }, { skill: 'Industrial Automation', delta: 0.5 }, { skill: 'HMI Design', delta: 0.4 }, { skill: 'TIA Portal/Codesys', delta: 0.5 }],
    target_jobs: ['Automation Engineer', 'Controls Engineer', 'Industrial Engineer', 'Robotics Engineer'],
    github_repos: [{ name: 'TcOpen', url: 'https://github.com/TcOpenGroup/TcOpen', stars: '500+' }],
    deliverables: ['Working PLC program with HMI', 'Documentation of I/O mapping', 'Video demonstration'],
    deliverables_zh: ['可运行的PLC程序+HMI', 'I/O映射文档', '视频演示'],
  },
  {
    id: 'evt-sixsigma', title: 'Complete a Six Sigma Green Belt Project', title_zh: '完成六西格玛绿带项目',
    difficulty: 'intermediate', time_hours: 80, cost: '¥2000-5000', output_type: 'certification',
    skills_gained: [{ skill: 'Six Sigma', delta: 0.7 }, { skill: 'Data Analysis', delta: 0.4 }, { skill: 'Project Management', delta: 0.3 }],
    target_jobs: ['Quality Engineer', 'Process Engineer', 'Industrial Engineer', 'Manufacturing Manager', 'Management Consultant'],
    github_repos: [{ name: 'SciPy', url: 'https://github.com/scipy/scipy', stars: '13K+' }],
    deliverables: ['DMAIC project report', 'Green Belt certificate', 'Statistical analysis with Minitab/Python'],
    deliverables_zh: ['DMAIC项目报告', '绿带证书', '用Minitab/Python的统计分析'],
  },
  {
    id: 'evt-ros-robot', title: 'Build a ROS2 Autonomous Navigation Robot', title_zh: '制作ROS2自主导航机器人',
    difficulty: 'advanced', time_hours: 80, cost: '¥0-3000', output_type: 'project',
    skills_gained: [{ skill: 'ROS2', delta: 0.6 }, { skill: 'SLAM/Navigation', delta: 0.5 }, { skill: 'C/C++', delta: 0.3 }, { skill: 'Linux', delta: 0.3 }],
    target_jobs: ['Robotics Engineer', 'ADAS Engineer', 'Automation Engineer', 'Controls Engineer'],
    github_repos: [{ name: 'Nav2', url: 'https://github.com/ros-planning/navigation2', stars: '2.5K+' }, { name: 'TurtleBot3', url: 'https://github.com/ROBOTIS-GIT/turtlebot3', stars: '1.5K+' }],
    deliverables: ['Robot navigating autonomously in simulation/real', 'SLAM map generation', 'GitHub repo with launch files'],
    deliverables_zh: ['仿真/实体中自主导航的机器人', 'SLAM地图生成', 'GitHub仓库含launch文件'],
  },
  {
    id: 'evt-data-pipeline', title: 'Build an End-to-End Data Pipeline', title_zh: '构建端到端数据管道',
    difficulty: 'intermediate', time_hours: 50, cost: '¥0', output_type: 'project',
    skills_gained: [{ skill: 'Python', delta: 0.3 }, { skill: 'SQL', delta: 0.4 }, { skill: 'ETL/Data Pipeline', delta: 0.6 }, { skill: 'Docker', delta: 0.3 }, { skill: 'Apache Airflow', delta: 0.5 }],
    target_jobs: ['Data Engineer', 'Data Scientist / AI Engineer', 'Backend Developer', 'DevOps Engineer'],
    github_repos: [{ name: 'Apache Airflow', url: 'https://github.com/apache/airflow', stars: '38K+' }],
    deliverables: ['Working ETL pipeline with scheduling', 'Dashboard visualization', 'Docker-compose deployment'],
    deliverables_zh: ['可运行的定时ETL管道', '仪表盘可视化', 'Docker-compose部署'],
  },
  {
    id: 'evt-kaggle', title: 'Complete a Kaggle Competition (Top 20%)', title_zh: '完成Kaggle竞赛(前20%)',
    difficulty: 'intermediate', time_hours: 40, cost: '¥0', output_type: 'competition',
    skills_gained: [{ skill: 'Machine Learning', delta: 0.5 }, { skill: 'Feature Engineering', delta: 0.5 }, { skill: 'Data Analysis', delta: 0.4 }, { skill: 'Python', delta: 0.3 }],
    target_jobs: ['Data Scientist / AI Engineer', 'ML Engineer', 'AI Engineer', 'Financial Analyst'],
    github_repos: [{ name: 'Kaggle Solutions', url: 'https://github.com/faridrashidi/kaggle-solutions', stars: '4K+' }],
    deliverables: ['Kaggle notebook with full pipeline', 'Top 20% ranking badge', 'Blog post analyzing approach'],
    deliverables_zh: ['Kaggle笔记本含完整管道', '前20%排名徽章', '分析方法的博客文章'],
  },
  {
    id: 'evt-german-b1', title: 'Pass German B1 Exam', title_zh: '通过德语B1考试',
    difficulty: 'intermediate', time_hours: 300, cost: '¥3000-8000', output_type: 'certification',
    skills_gained: [{ skill: 'German B1+', delta: 0.8 }, { skill: 'Cross-cultural Communication', delta: 0.3 }],
    target_jobs: ['ANY_DE'],
    github_repos: [],
    deliverables: ['Goethe-Zertifikat B1', 'EU Blue Card eligibility boost'],
    deliverables_zh: ['歌德学院B1证书', 'EU蓝卡资格提升'],
  },
  {
    id: 'evt-german-resume', title: 'Create German-Standard Bewerbung', title_zh: '制作德国标准求职材料',
    difficulty: 'beginner', time_hours: 15, cost: '¥0', output_type: 'project',
    skills_gained: [{ skill: 'German Job Application Standards', delta: 0.7 }],
    target_jobs: ['ANY_DE'],
    github_repos: [],
    deliverables: ['Tabellarischer Lebenslauf', 'Anschreiben template', 'Zeugnisse translation guide'],
    deliverables_zh: ['德式表格简历', '求职信模板', '工作证明翻译指南'],
  },
  {
    id: 'evt-docker-deploy', title: 'Containerize Your Project with Docker', title_zh: '用Docker容器化你的项目',
    difficulty: 'beginner', time_hours: 10, cost: '¥0', output_type: 'project',
    skills_gained: [{ skill: 'Docker', delta: 0.5 }, { skill: 'CI/CD', delta: 0.3 }, { skill: 'Linux', delta: 0.2 }],
    target_jobs: ['Software Developer', 'Backend Developer', 'DevOps Engineer', 'Data Engineer'],
    github_repos: [{ name: 'Awesome Compose', url: 'https://github.com/docker/awesome-compose', stars: '37K+' }],
    deliverables: ['Dockerfile + docker-compose.yml', 'CI/CD pipeline config', 'Deployment documentation'],
    deliverables_zh: ['Dockerfile + docker-compose.yml', 'CI/CD管道配置', '部署文档'],
  },
];

// ---- SKILL EVIDENCE (GitHub proof chains) ----
export interface SkillEvidence {
  skill: string;
  skill_zh: string;
  category: string;
  demand: string;
  jd_keywords: string[];
  repos: { name: string; url: string; stars: string; what_to_learn: string }[];
  build_project: string;
  build_project_zh: string;
  build_hours: number;
  learning_hours: number;
}

export const skillEvidenceMap: SkillEvidence[] = [
  {
    skill: 'OpenCV', skill_zh: 'OpenCV视觉', category: 'computer-vision', demand: 'high',
    jd_keywords: ['OpenCV', 'image processing', 'computer vision', '图像处理', '视觉检测'],
    repos: [
      { name: 'YOLOv8', url: 'https://github.com/ultralytics/ultralytics', stars: '35K+', what_to_learn: 'Object detection pipeline, model training & export' },
      { name: 'OpenCV', url: 'https://github.com/opencv/opencv', stars: '80K+', what_to_learn: 'Image processing fundamentals' },
      { name: 'Supervision', url: 'https://github.com/roboflow/supervision', stars: '25K+', what_to_learn: 'Detection annotation & tracking' },
    ],
    build_project: 'Industrial Defect Detection System', build_project_zh: '工业缺陷检测系统',
    build_hours: 40, learning_hours: 55,
  },
  {
    skill: 'Python', skill_zh: 'Python编程', category: 'programming', demand: 'very_high',
    jd_keywords: ['Python', 'python3', 'Python开发'],
    repos: [
      { name: 'FastAPI', url: 'https://github.com/tiangolo/fastapi', stars: '80K+', what_to_learn: 'Modern async API design' },
      { name: 'Algorithms/Python', url: 'https://github.com/TheAlgorithms/Python', stars: '195K+', what_to_learn: 'Algorithm implementation patterns' },
    ],
    build_project: 'Personal API with FastAPI', build_project_zh: '用FastAPI制作个人API',
    build_hours: 30, learning_hours: 55,
  },
  {
    skill: 'PLC Programming', skill_zh: 'PLC编程', category: 'automation', demand: 'high',
    jd_keywords: ['PLC', 'SPS-Programmierung', 'Siemens S7', 'TIA Portal', 'Codesys'],
    repos: [
      { name: 'TcOpen', url: 'https://github.com/TcOpenGroup/TcOpen', stars: '500+', what_to_learn: 'Industrial PLC framework patterns' },
    ],
    build_project: 'PLC Auto-Sorting Demo', build_project_zh: 'PLC自动分拣演示',
    build_hours: 50, learning_hours: 50,
  },
  {
    skill: 'Machine Learning', skill_zh: '机器学习', category: 'ai', demand: 'very_high',
    jd_keywords: ['Machine Learning', 'ML', '机器学习', 'sklearn', 'model training'],
    repos: [
      { name: 'scikit-learn', url: 'https://github.com/scikit-learn/scikit-learn', stars: '60K+', what_to_learn: 'Classic ML algorithms & pipelines' },
      { name: 'HuggingFace Transformers', url: 'https://github.com/huggingface/transformers', stars: '140K+', what_to_learn: 'Transformer models & fine-tuning' },
      { name: 'MLflow', url: 'https://github.com/mlflow/mlflow', stars: '19K+', what_to_learn: 'ML experiment tracking & deployment' },
    ],
    build_project: 'Kaggle Competition + MLflow Management', build_project_zh: 'Kaggle竞赛+MLflow管理',
    build_hours: 40, learning_hours: 100,
  },
  {
    skill: 'Six Sigma', skill_zh: '六西格玛', category: 'quality', demand: 'high',
    jd_keywords: ['Six Sigma', 'Green Belt', 'Black Belt', 'DMAIC', '六西格玛'],
    repos: [
      { name: 'SciPy', url: 'https://github.com/scipy/scipy', stars: '13K+', what_to_learn: 'Statistical testing & analysis' },
      { name: 'Plotly', url: 'https://github.com/plotly/plotly.py', stars: '17K+', what_to_learn: 'Process visualization & control charts' },
    ],
    build_project: 'Data-Driven Quality Improvement Report', build_project_zh: '数据驱动质量改进报告',
    build_hours: 30, learning_hours: 65,
  },
  {
    skill: 'Docker', skill_zh: 'Docker容器化', category: 'devops', demand: 'high',
    jd_keywords: ['Docker', 'Container', 'Kubernetes', '容器化', 'DevOps'],
    repos: [
      { name: 'Awesome Compose', url: 'https://github.com/docker/awesome-compose', stars: '37K+', what_to_learn: 'Docker Compose patterns for real apps' },
      { name: 'Awesome Docker', url: 'https://github.com/veggiemonk/awesome-docker', stars: '30K+', what_to_learn: 'Docker ecosystem best practices' },
    ],
    build_project: 'Containerize Your Project', build_project_zh: '容器化你的项目',
    build_hours: 10, learning_hours: 15,
  },
  {
    skill: 'LLM/Prompt Engineering', skill_zh: 'LLM/提示工程', category: 'ai', demand: 'very_high',
    jd_keywords: ['LLM', 'Large Language Model', 'Prompt Engineering', 'RAG', 'LangChain', 'AI应用开发'],
    repos: [
      { name: 'LangChain', url: 'https://github.com/langchain-ai/langchain', stars: '100K+', what_to_learn: 'LLM application framework' },
      { name: 'LlamaIndex', url: 'https://github.com/run-llama/llama_index', stars: '38K+', what_to_learn: 'RAG pipeline architecture' },
      { name: 'Prompt Engineering Guide', url: 'https://github.com/dair-ai/Prompt-Engineering-Guide', stars: '52K+', what_to_learn: 'Prompt design techniques' },
    ],
    build_project: 'Vertical Domain RAG Chatbot', build_project_zh: '垂直领域RAG聊天机器人',
    build_hours: 30, learning_hours: 50,
  },
  {
    skill: 'ROS2', skill_zh: 'ROS2机器人', category: 'robotics', demand: 'high',
    jd_keywords: ['ROS', 'ROS2', 'Robot Operating System', '机器人操作系统'],
    repos: [
      { name: 'Navigation2', url: 'https://github.com/ros-planning/navigation2', stars: '2.5K+', what_to_learn: 'Autonomous navigation stack' },
      { name: 'TurtleBot3', url: 'https://github.com/ROBOTIS-GIT/turtlebot3', stars: '1.5K+', what_to_learn: 'Entry-level robot platform' },
    ],
    build_project: 'ROS2 Autonomous Navigation Robot', build_project_zh: 'ROS2自主导航机器人',
    build_hours: 80, learning_hours: 60,
  },
];

// ---- MATCH CALCULATION ----
export function calculateMatch(userSkills: string[], jobSkills: string[]): number {
  if (!jobSkills || jobSkills.length === 0) return 0;
  const matched = jobSkills.filter(s =>
    userSkills.some(us => s.toLowerCase().includes(us.toLowerCase()) || us.toLowerCase().includes(s.toLowerCase()))
  );
  return Math.round((matched.length / jobSkills.length) * 100);
}

export function getSkillGap(userSkills: string[], jobSkills: string[]): { have: string[]; missing: string[] } {
  if (!jobSkills) return { have: [], missing: [] };
  const have = jobSkills.filter(s =>
    userSkills.some(us => s.toLowerCase().includes(us.toLowerCase()) || us.toLowerCase().includes(s.toLowerCase()))
  );
  const missing = jobSkills.filter(s => !have.includes(s));
  return { have, missing };
}

export function getRelevantEvents(jobTitle: string, jobSkills: string[], country: 'CN' | 'DE'): CareerEvent[] {
  return careerEvents.filter(evt => {
    if (evt.target_jobs.includes('ANY_DE') && country === 'DE') return true;
    return evt.target_jobs.some(t =>
      jobTitle.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(jobTitle.split('/')[0].trim().toLowerCase())
    ) || evt.skills_gained.some(sg => jobSkills?.some(js => js.toLowerCase().includes(sg.skill.toLowerCase())));
  }).slice(0, 5);
}

export function getRelevantEvidence(missingSkills: string[]): SkillEvidence[] {
  return skillEvidenceMap.filter(se =>
    missingSkills.some(ms => ms.toLowerCase().includes(se.skill.toLowerCase()) || se.jd_keywords.some(kw => ms.toLowerCase().includes(kw.toLowerCase())))
  );
}

export function calculateTransition(missingSkills: string[]): { months: number; hours: number; cost_low: number; cost_high: number } {
  const evidence = getRelevantEvidence(missingSkills);
  const totalHours = evidence.reduce((sum, e) => sum + e.learning_hours, 0) || missingSkills.length * 40;
  const months = Math.ceil(totalHours / 80); // ~20hrs/week
  return { months, hours: totalHours, cost_low: 0, cost_high: evidence.length * 2000 };
}

export function calculateEventBoost(event: CareerEvent, jobSkills: string[], userSkills: string[]): number {
  if (!jobSkills || jobSkills.length === 0) return 0;
  const newSkills = event.skills_gained.filter(sg =>
    !userSkills.some(us => us.toLowerCase().includes(sg.skill.toLowerCase())) &&
    jobSkills.some(js => js.toLowerCase().includes(sg.skill.toLowerCase()))
  );
  const coverageDelta = newSkills.length / jobSkills.length;
  const avgDelta = newSkills.length > 0 ? newSkills.reduce((s, g) => s + g.delta, 0) / newSkills.length : 0;
  return Math.round(coverageDelta * avgDelta * 100);
}

// ---- MARKET DATA (imported from expanded modules) ----
export { chinaJobs } from './jobs-cn';
export { germanyJobs } from './jobs-de';

// ---- MACRO SIGNAL DATA ----
export const macroEvents: MacroEvent[] = [
  { name: 'US-China Tech Decoupling', name_de: 'US-China Tech-Entkopplung', intensity: 0.7 },
  { name: 'AI / LLM Revolution', name_de: 'KI / LLM Revolution', intensity: 0.9 },
  { name: 'EU Green Deal / CBAM', name_de: 'EU Green Deal / CBAM', intensity: 0.6 },
  { name: 'Middle East Conflict', name_de: 'Nahostkonflikt', intensity: 0.4 },
  { name: 'India Manufacturing Rise', name_de: 'Aufstieg der indischen Industrie', intensity: 0.5 },
];

export const signalWinners: SignalJob[] = [
  { job_zh: 'AI工程师', job_en: 'AI Engineer', job_de: 'KI-Ingenieur', direction: 'up', total_impact: 63, signals: [{ event: 'AI Revolution', event_de: 'KI-Revolution', impact: 63, reason: 'AI talent demand explosion, highest salary growth sector', reason_de: 'KI-Talentbedarf explodiert, höchstes Gehaltswachstum' }] },
  { job_zh: '数据科学家', job_en: 'Data Scientist', job_de: 'Datenwissenschaftler', direction: 'up', total_impact: 63, signals: [{ event: 'AI Revolution', event_de: 'KI-Revolution', impact: 63, reason: 'Core role in AI development pipeline', reason_de: 'Kernrolle in der KI-Entwicklung' }] },
  { job_zh: 'IC设计工程师', job_en: 'IC Design Engineer', job_de: 'IC-Design-Ingenieur', direction: 'up', total_impact: 42, signals: [{ event: 'US-China Tech War', event_de: 'US-China Tech-Krieg', impact: 42, reason: 'China building domestic chips, US reshoring — both hiring aggressively', reason_de: 'China baut eigene Chips, USA verlagert zurück — beide stellen aggressiv ein' }] },
  { job_zh: '网络安全工程师', job_en: 'Cybersecurity Engineer', job_de: 'Cybersecurity-Ingenieur', direction: 'up', total_impact: 46, signals: [{ event: 'US-China Tech War', event_de: 'US-China Tech-Krieg', impact: 25, reason: 'Data security concerns rising', reason_de: 'Datensicherheitsbedenken steigen' }, { event: 'Middle East Conflict', event_de: 'Nahostkonflikt', impact: 21, reason: 'State-level cyber attack risks increasing', reason_de: 'Risiko staatlicher Cyberangriffe steigt' }] },
  { job_zh: '新能源工程师', job_en: 'Renewable Energy Engineer', job_de: 'Ingenieur Erneuerbare Energien', direction: 'up', total_impact: 48, signals: [{ event: 'EU Green Deal', event_de: 'EU Green Deal', impact: 30, reason: 'Policy-driven investment in wind and solar', reason_de: 'Politisch getriebene Investitionen in Wind und Solar' }, { event: 'Middle East Conflict', event_de: 'Nahostkonflikt', impact: 18, reason: 'Oil volatility accelerates energy transition', reason_de: 'Ölpreisvolatilität beschleunigt Energiewende' }] },
  { job_zh: '碳核算师/ESG分析师', job_en: 'Carbon Accountant / ESG Analyst', job_de: 'CO2-Bilanzierungsexperte / ESG-Analyst', direction: 'up', total_impact: 36, signals: [{ event: 'EU Green Deal', event_de: 'EU Green Deal', impact: 36, reason: 'CBAM creates massive demand for carbon accounting expertise', reason_de: 'CBAM schafft massive Nachfrage nach CO2-Bilanzierungsexpertise' }] },
];

export const signalLosers: SignalJob[] = [
  { job_zh: '客服专员', job_en: 'Customer Service Rep', job_de: 'Kundendienstmitarbeiter', direction: 'down', total_impact: -36, signals: [{ event: 'AI Revolution', event_de: 'KI-Revolution', impact: -36, reason: 'AI chatbots replacing basic customer service roles', reason_de: 'KI-Chatbots ersetzen grundlegende Kundendienstaufgaben' }] },
  { job_zh: '发动机工程师', job_en: 'Combustion Engine Engineer', job_de: 'Verbrennungsmotor-Ingenieur', direction: 'down', total_impact: -24, signals: [{ event: 'EU Green Deal', event_de: 'EU Green Deal', impact: -24, reason: '2035 combustion car ban shrinks entire drivetrain supply chain', reason_de: '2035 Verbrenner-Verbot lässt gesamte Antriebsstrang-Lieferkette schrumpfen' }] },
  { job_zh: '数据录入员', job_en: 'Data Entry Clerk', job_de: 'Datenerfasser', direction: 'down', total_impact: -36, signals: [{ event: 'AI Revolution', event_de: 'KI-Revolution', impact: -36, reason: 'Routine cognitive tasks automated by AI', reason_de: 'Routinemäßige kognitive Aufgaben durch KI automatisiert' }] },
  { job_zh: '化工工程师', job_en: 'Chemical Engineer', job_de: 'Chemieingenieur', direction: 'down', total_impact: -12, signals: [{ event: 'Middle East Conflict', event_de: 'Nahostkonflikt', impact: -12, reason: 'Feedstock costs soar, squeezing downstream margins', reason_de: 'Rohstoffkosten steigen, drücken nachgelagerte Margen' }] },
];
