# TeachPrep AI

An AI-powered platform for educators to create, manage, and enhance their teaching materials with intelligent assistance.


## Features

- **AI-Assisted Lesson Planning**: Generate customized lesson plans with objectives, activities, and assessments
- **Resource Library**: Organize and access educational materials for various subjects and grade levels
- **Interactive Dashboard**: Get at-a-glance insights into upcoming classes, assessments, and student progress
- **Collaborative Tools**: Share and collaborate on teaching materials with other educators
- **Responsive Design**: Access from any device - desktop, tablet, or mobile

## Technology Stack

- **Frontend**: React, Next.js, TypeScript
- **Styling**: Tailwind CSS, DaisyUI components
- **State Management**: React Hooks 
- **AI Integration**: OpenAI API for intelligent suggestions
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/teachprep-ai.git
   cd teachprep-ai
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

## Project Structure

```
├── public/              # Static files
├── src/                 # Source code
│   ├── components/      # React components
│   │   ├── AIAssistant.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Header.tsx
│   │   ├── LessonCard.tsx
│   │   ├── ResourceCard.tsx
│   │   └── Sidebar.tsx
│   ├── pages/           # Next.js pages
│   │   ├── _app.tsx
│   │   └── index.tsx
│   └── styles/          # CSS styles
│       └── globals.css
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Usage Scenarios

### For Teachers

- Create personalized lesson plans based on curriculum standards
- Access a library of educational resources organized by subject and grade level
- Track class progress and upcoming assessments
- Generate new assessment materials with AI assistance

### For Department Heads

- Monitor teaching activities across the department
- Share standardized curriculum resources with the team
- Analyze performance metrics and teaching effectiveness

## Future Enhancements

- **Student Portal**: Add student login and assignment submission functionality
- **Advanced Analytics**: Detailed insights into student performance and engagement
- **Curriculum Mapping**: Visual tools for planning entire courses and academic years
- **Integration**: Connect with popular LMS platforms like Google Classroom and Canvas



