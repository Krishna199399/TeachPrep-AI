import { useState, useEffect } from 'react';
import { FiSave, FiShare2, FiPlus, FiTrash2, FiCpu, FiClock, FiBook, FiUsers, FiDownload, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/router';
import axios from 'axios';

interface AIPromptConfig {
  subject: string;
  grade: string;
  topic: string;
  duration: string;
  learningStyle: string;
  specialConsiderations: string;
  collaborative: boolean;
  includeMaterials: boolean;
  includeAssessments: boolean;
}

interface WebSearchResult {
  snippets: string[];
  urls: string[];
  title: string;
}

export default function AILessonPlanner() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptConfig, setPromptConfig] = useState<AIPromptConfig>({
    subject: '',
    grade: '',
    topic: '',
    duration: '',
    learningStyle: 'balanced',
    specialConsiderations: '',
    collaborative: false,
    includeMaterials: true,
    includeAssessments: true
  });

  const [lessonPlan, setLessonPlan] = useState({
    id: Math.random().toString(36).substr(2, 9),
    title: '',
    subject: '',
    grade: '',
    duration: '',
    objectives: [''],
    materials: [''],
    activities: [
      {
        title: 'Introduction',
        duration: '10 minutes',
        description: '',
      },
      {
        title: 'Main Activity',
        duration: '30 minutes',
        description: '',
      },
      {
        title: 'Conclusion',
        duration: '10 minutes',
        description: '',
      },
    ],
    assessment: '',
    sources: [] as string[]
  });

  const { addLessonPlan, showNotification } = useAppContext();
  const router = useRouter();

  const [researchResults, setResearchResults] = useState<Array<{title: string, url: string, snippet: string}>>([]);

  const [timeSaved, setTimeSaved] = useState<number>(0);
  const [totalSaved, setTotalSaved] = useState<number>(() => {
    const saved = localStorage.getItem('teachPrepTimeSaved');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('teachPrepTimeSaved', totalSaved.toString());
  }, [totalSaved]);

  const calculateTimeSaved = () => {
    const saved = 115;
    setTimeSaved(saved);
    setTotalSaved(prev => prev + saved);
  };

  const fetchEducationalContent = async (topic: string, subject: string, grade: string): Promise<WebSearchResult> => {
    try {
      const searchQuery = `${topic} lesson plan ${subject} grade ${grade} education`;
      const response = await fetch(`/api/web-search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch educational content: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching educational content:', error);
      throw new Error('Failed to fetch educational content');
    }
  };

  const generateObjectives = (content: string, topic: string): string[] => {
    const defaultObjectives = [
      `Understand key concepts of ${topic}`,
      `Apply ${topic} principles to solve relevant problems`,
      `Demonstrate critical thinking about ${topic}`
    ];

    if (content && content.length > 50) {
      const objectiveKeywords = ['students will', 'able to', 'learn to', 'understand', 'demonstrate', 'analyze', 'create'];
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
      
      const extractedObjectives = sentences
        .filter(sentence => 
          objectiveKeywords.some(keyword => 
            sentence.toLowerCase().includes(keyword)
          ) && 
          sentence.toLowerCase().includes(topic.toLowerCase())
        )
        .map(sentence => sentence.trim())
        .slice(0, 3);

      return extractedObjectives.length >= 2 ? extractedObjectives : defaultObjectives;
    }
    
    return defaultObjectives;
  };

  const generateMaterials = (content: string, topic: string, subject: string): string[] => {
    const defaultMaterials = [
      'Interactive whiteboard or projector',
      `Student worksheets on ${topic}`,
      'Reference materials and handouts',
      'Assessment materials'
    ];

    if (content && content.length > 50) {
      const materialKeywords = ['materials', 'resources', 'supplies', 'equipment', 'tools', 'needed'];
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      const materialLines = sentences
        .filter(sentence => 
          materialKeywords.some(keyword => 
            sentence.toLowerCase().includes(keyword)
          )
        )
        .map(sentence => sentence.trim())
        .slice(0, 5);

      if (materialLines.length > 0) {
        const materials = materialLines
          .join(' ')
          .split(/[,;:]+/)
          .map(item => item.trim())
          .filter(item => item.length > 3 && !materialKeywords.includes(item.toLowerCase()));
        
        return materials.length >= 3 ? materials : defaultMaterials;
      }
    }
    
    return defaultMaterials;
  };

  const generateLessonPlan = async () => {
    if (!promptConfig.subject || !promptConfig.grade || !promptConfig.topic) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setIsGenerating(true);
    
    const startTime = new Date();

    try {
      const searchResults = await fetchEducationalContent(
        promptConfig.topic,
        promptConfig.subject,
        promptConfig.grade
      );
      
      setResearchResults(
        searchResults.snippets.map((snippet: string, index: number) => ({
          title: `Educational Resource ${index + 1}`,
          url: searchResults.urls[index] || '#',
          snippet: snippet
        }))
      );
      
      const topicContent = searchResults.snippets.join(' ');
      const sources = searchResults.urls.slice(0, 3);
      
      const objectives = generateObjectives(topicContent, promptConfig.topic);
      
      const materials = generateMaterials(topicContent, promptConfig.topic, promptConfig.subject);
      
      const activityKeywords = {
        intro: ['introduction', 'engage', 'hook', 'opening', 'begin'],
        main: ['main activity', 'direct instruction', 'guided practice', 'teach'],
        practice: ['practice', 'group work', 'collaborative', 'exercise'],
        assessment: ['assessment', 'evaluate', 'check', 'measure', 'test']
      };
      
      const activities = [
        {
          title: 'Engage and Connect',
          duration: '10 minutes',
          description: topicContent.includes(promptConfig.topic) 
            ? `Introduce ${promptConfig.topic} by connecting to students' prior knowledge and experiences. ${searchResults.snippets[0] || ''}`
            : `Begin with an engaging introduction to ${promptConfig.topic} that connects to students' experiences or interests.`
        },
        {
          title: 'Direct Instruction',
          duration: '15 minutes',
          description: `Present key concepts and information about ${promptConfig.topic}. ${searchResults.snippets[1] || ''}`
        },
        {
          title: 'Guided Practice',
          duration: '20 minutes',
          description: `Guide students through activities to build understanding of ${promptConfig.topic}. ${searchResults.snippets[2] || ''}`
        },
        {
          title: 'Independent Practice',
          duration: '15 minutes',
          description: `Students apply their understanding of ${promptConfig.topic} through independent work.`
        },
        {
          title: 'Reflection and Assessment',
          duration: '10 minutes',
          description: `Students demonstrate their learning about ${promptConfig.topic} and reflect on their progress.`
        }
      ];

      if (promptConfig.learningStyle !== 'balanced') {
        const styleActivities = {
          visual: 'Include visual aids, diagrams, and video demonstrations.',
          auditory: 'Incorporate discussions, audio materials, and verbal explanations.',
          kinesthetic: 'Add hands-on activities, physical movements, and practical exercises.',
          'reading-writing': 'Focus on written materials, note-taking, and text analysis.'
        };
        
        activities.forEach((activity, i) => {
          activities[i] = {
            ...activity,
            description: `${activity.description} ${styleActivities[promptConfig.learningStyle as keyof typeof styleActivities]}`
          };
        });
      }

      if (promptConfig.specialConsiderations) {
        activities.forEach((activity, i) => {
          activities[i] = {
            ...activity,
            description: `${activity.description} Special considerations: ${promptConfig.specialConsiderations}`
          };
        });
      }

      if (promptConfig.collaborative) {
        const collaborativeActivities = activities.map(activity => {
          if (activity.title === 'Guided Practice') {
            return {
              ...activity,
              description: `${activity.description} Consider using small group configurations or pair-share strategies to encourage collaborative learning.`,
              title: 'Collaborative Guided Practice'
            };
          } else if (activity.title === 'Independent Practice') {
            return {
              ...activity,
              description: `${activity.description} Include options for peer review and feedback during this phase.`,
              title: 'Independent & Peer Practice'
            };
          }
          return activity;
        });
        
        activities.splice(0, activities.length, ...collaborativeActivities);
      }

      const aiGeneratedPlan = {
        title: searchResults.title || `${promptConfig.topic} - ${promptConfig.grade} Grade ${promptConfig.subject}`,
        subject: promptConfig.subject,
        grade: promptConfig.grade,
        duration: promptConfig.duration || '45 minutes',
        objectives,
        materials,
        activities,
        assessment: `Use a combination of formative assessments to evaluate understanding of ${promptConfig.topic} including exit tickets, quick writes, and peer evaluations.`,
        sources
      };

      setLessonPlan(prev => ({
        ...prev,
        ...aiGeneratedPlan
      }));

      calculateTimeSaved();
      
      const endTime = new Date();
      const generationTime = (endTime.getTime() - startTime.getTime()) / 1000;
      console.log(`Lesson plan generated in ${generationTime} seconds, saving approximately ${timeSaved} minutes of teacher time`);

      showNotification('Lesson plan generated successfully', 'success');
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      showNotification('Failed to generate lesson plan. Please try again', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lessonPlan.title || !lessonPlan.subject || !lessonPlan.grade) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      const { id, ...lessonPlanWithoutId } = lessonPlan;
      addLessonPlan(lessonPlanWithoutId);
      showNotification('Lesson plan saved successfully!', 'success');
      router.push('/lesson-plans');
    } catch (error) {
      console.error('Error saving lesson plan:', error);
      showNotification('Failed to save lesson plan. Please try again.', 'error');
    }
  };

  const extractStandards = async (subject: string, grade: string, standardsType: string) => {
    try {
      const standardsQuery = `${standardsType} standards for ${subject} ${grade} grade`;
      const data = await fetchEducationalContent(standardsQuery, subject, grade);
      
      const standardsText = data.snippets.join(' ');
      
      const standardsPattern = /([A-Z]+\.?[0-9]+\.?[0-9]*\.[a-zA-Z0-9.]*|[A-Z]+-[A-Z]+-[0-9]+|Standard [0-9]+:[^.]*)/g;
      const matches = standardsText.match(standardsPattern) || [];
      
      const uniqueStandards = Array.from(new Set(matches)).slice(0, 5);
      return uniqueStandards;
    } catch (error) {
      console.error('Error extracting standards:', error);
      return [
        `${standardsType}.${subject.charAt(0).toUpperCase()}${subject.slice(1)}.${grade.replace(/[^0-9]/g, '')}.1`,
        `${standardsType}.${subject.charAt(0).toUpperCase()}${subject.slice(1)}.${grade.replace(/[^0-9]/g, '')}.2`,
      ];
    }
  };

  const generateResourceLinks = (subject: string, topic: string): {title: string, url: string, type: string}[] => {
    const resourcesBySubject: {[key: string]: {title: string, url: string, type: string}[]} = {
      'Mathematics': [
        { 
          title: 'Khan Academy', 
          url: `https://www.khanacademy.org/search?search_again=1&page_search_query=${encodeURIComponent(topic)}`, 
          type: 'Interactive' 
        },
        { 
          title: 'Desmos', 
          url: 'https://www.desmos.com/calculator', 
          type: 'Tool' 
        },
        { 
          title: 'NCTM Illuminations', 
          url: 'https://illuminations.nctm.org/', 
          type: 'Lesson Resource' 
        }
      ],
      'Science': [
        { 
          title: 'PhET Interactive Simulations', 
          url: `https://phet.colorado.edu/en/search?search=${encodeURIComponent(topic)}`, 
          type: 'Interactive' 
        },
        { 
          title: 'NASA Education', 
          url: `https://www.nasa.gov/education/materials/`, 
          type: 'Content' 
        },
        { 
          title: 'National Geographic Education', 
          url: 'https://education.nationalgeographic.org/resource-library/', 
          type: 'Multimedia' 
        }
      ],
      'Language Arts': [
        { 
          title: 'ReadWriteThink', 
          url: 'http://www.readwritethink.org/', 
          type: 'Lesson Resource' 
        },
        { 
          title: 'CommonLit', 
          url: `https://www.commonlit.org/en/search?query=${encodeURIComponent(topic)}`, 
          type: 'Content' 
        },
        { 
          title: 'Newsela', 
          url: 'https://newsela.com/', 
          type: 'Differentiated Content' 
        }
      ],
      'Social Studies': [
        { 
          title: 'Library of Congress', 
          url: `https://www.loc.gov/search/?q=${encodeURIComponent(topic)}`, 
          type: 'Primary Sources' 
        },
        { 
          title: 'iCivics', 
          url: 'https://www.icivics.org/', 
          type: 'Interactive' 
        },
        { 
          title: 'Smithsonian Learning Lab', 
          url: `https://learninglab.si.edu/search?st=${encodeURIComponent(topic)}`, 
          type: 'Multimedia' 
        }
      ]
    };
    
    return resourcesBySubject[subject] || [
      { 
        title: 'TeachersPayTeachers', 
        url: `https://www.teacherspayteachers.com/Browse/Search:${encodeURIComponent(topic)}`, 
        type: 'Materials' 
      },
      { 
        title: 'PBS Learning Media', 
        url: `https://www.pbslearningmedia.org/search/?q=${encodeURIComponent(topic)}`, 
        type: 'Multimedia' 
      },
      { 
        title: 'Edutopia', 
        url: `https://www.edutopia.org/search?query=${encodeURIComponent(topic)}`, 
        type: 'Teaching Strategies' 
      }
    ];
  };

  const generateAssessmentTools = (topic: string, grade: string): {name: string, description: string, digital: boolean}[] => {
    const digitalTools = [
      {
        name: 'Kahoot!',
        description: 'Create interactive quizzes to test knowledge of ' + topic,
        digital: true
      },
      {
        name: 'Google Forms',
        description: 'Create self-grading assessments for ' + topic,
        digital: true
      },
      {
        name: 'Nearpod',
        description: 'Interactive lessons with built-in formative assessments',
        digital: true
      },
      {
        name: 'Mentimeter',
        description: 'Poll students in real-time to gauge understanding',
        digital: true
      }
    ];
    
    const analogTools = [
      {
        name: 'Exit Tickets',
        description: 'Students summarize key learning points about ' + topic,
        digital: false
      },
      {
        name: 'Rubric Assessment',
        description: 'Evaluate student work on ' + topic + ' projects with clear criteria',
        digital: false
      },
      {
        name: 'Four Corners',
        description: 'Physical movement activity to demonstrate position on a topic',
        digital: false
      }
    ];
    
    return [...digitalTools.slice(0, 2), ...analogTools.slice(0, 1)];
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Lesson Planner</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none"
          >
            <FiSave className="mr-2 -ml-1 h-5 w-5" />
            Save
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <FiShare2 className="mr-2 -ml-1 h-5 w-5" />
            Share
          </button>
        </div>
      </div>

      {timeSaved > 0 && (
        <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-green-800 flex items-center">
                <FiClock className="mr-2 h-5 w-5" />
                Teacher Time Saved
              </h3>
              <p className="text-green-700 mt-1">
                You just saved approximately <span className="font-bold">{timeSaved} minutes</span> by using AI to generate this lesson plan.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">{Math.round(totalSaved / 60)}</div>
              <div className="text-xs text-green-600">Total Hours Saved</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">AI Assistant Configuration</h2>
          <p className="mt-1 text-sm text-gray-500">Configure the AI to generate a customized lesson plan with real educational content</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="subject"
                  name="subject"
                  value={promptConfig.subject}
                  onChange={(e) => setPromptConfig({ ...promptConfig, subject: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Language Arts">Language Arts</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Art">Art</option>
                  <option value="Music">Music</option>
                  <option value="Physical Education">Physical Education</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                Grade Level <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="grade"
                  name="grade"
                  value={promptConfig.grade}
                  onChange={(e) => setPromptConfig({ ...promptConfig, grade: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a grade</option>
                  <option value="K">Kindergarten</option>
                  <option value="1">1st Grade</option>
                  <option value="2">2nd Grade</option>
                  <option value="3">3rd Grade</option>
                  <option value="4">4th Grade</option>
                  <option value="5">5th Grade</option>
                  <option value="6">6th Grade</option>
                  <option value="7">7th Grade</option>
                  <option value="8">8th Grade</option>
                  <option value="9">9th Grade</option>
                  <option value="10">10th Grade</option>
                  <option value="11">11th Grade</option>
                  <option value="12">12th Grade</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                Lesson Topic <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={promptConfig.topic}
                  onChange={(e) => setPromptConfig({ ...promptConfig, topic: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Introduction to Fractions, Solar System, Creative Writing"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={promptConfig.duration}
                  onChange={(e) => setPromptConfig({ ...promptConfig, duration: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 45 minutes, 1 hour"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700">
                Learning Style Emphasis
              </label>
              <div className="mt-1">
                <select
                  id="learningStyle"
                  name="learningStyle"
                  value={promptConfig.learningStyle}
                  onChange={(e) => setPromptConfig({ ...promptConfig, learningStyle: e.target.value })}
                  className="input-field"
                >
                  <option value="balanced">Balanced (All Styles)</option>
                  <option value="visual">Visual Learning</option>
                  <option value="auditory">Auditory Learning</option>
                  <option value="kinesthetic">Kinesthetic Learning</option>
                  <option value="reading-writing">Reading/Writing</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="specialConsiderations" className="block text-sm font-medium text-gray-700">
                Special Considerations
              </label>
              <div className="mt-1">
                <textarea
                  id="specialConsiderations"
                  name="specialConsiderations"
                  rows={3}
                  value={promptConfig.specialConsiderations}
                  onChange={(e) => setPromptConfig({ ...promptConfig, specialConsiderations: e.target.value })}
                  className="input-field"
                  placeholder="Any special needs, accommodations, or specific focus areas..."
                />
              </div>
            </div>

            <div className="sm:col-span-6 pt-4 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-3">Enhanced Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="collaborative"
                      name="collaborative"
                      type="checkbox"
                      checked={promptConfig.collaborative}
                      onChange={(e) => setPromptConfig({ ...promptConfig, collaborative: e.target.checked })}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="collaborative" className="font-medium text-gray-700">Collaborative Planning</label>
                    <p className="text-gray-500">Include collaboration opportunities for team teaching</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="includeMaterials"
                      name="includeMaterials"
                      type="checkbox"
                      checked={promptConfig.includeMaterials}
                      onChange={(e) => setPromptConfig({ ...promptConfig, includeMaterials: e.target.checked })}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="includeMaterials" className="font-medium text-gray-700">Curated Resources</label>
                    <p className="text-gray-500">Include links to teaching materials and resources</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="includeAssessments"
                      name="includeAssessments"
                      type="checkbox"
                      checked={promptConfig.includeAssessments}
                      onChange={(e) => setPromptConfig({ ...promptConfig, includeAssessments: e.target.checked })}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="includeAssessments" className="font-medium text-gray-700">Assessment Tools</label>
                    <p className="text-gray-500">Suggest digital and traditional assessment methods</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={generateLessonPlan}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none w-full justify-center"
            >
              {isGenerating ? (
                <>
                  <FiClock className="mr-2 -ml-1 h-5 w-5 animate-spin" />
                  Generating Plan with Real Content...
                </>
              ) : (
                <>
                  <FiCpu className="mr-2 -ml-1 h-5 w-5" />
                  Generate Lesson Plan with Real Information
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {lessonPlan.title && (
        <div className="space-y-6">
          {promptConfig.collaborative && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FiUsers className="mr-2 h-5 w-5 text-indigo-500" />
                  Collaboration Opportunities
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <span className="mr-2">•</span>
                    Share this plan with grade-level teams for feedback and enhancement
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="mr-2">•</span>
                    Consider co-teaching opportunities for the main activities
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="mr-2">•</span>
                    Schedule common planning time to refine assessment strategies
                  </li>
                </ul>
                <div className="mt-4">
                  <button className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center">
                    <FiCalendar className="mr-1 h-4 w-4" />
                    Schedule collaborative session
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {promptConfig.includeMaterials && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FiBook className="mr-2 h-5 w-5 text-indigo-500" />
                  Curated Teaching Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generateResourceLinks(promptConfig.subject, promptConfig.topic).map((resource, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                      <div className="font-medium">{resource.title}</div>
                      <div className="text-sm text-gray-500 mb-2">{resource.type}</div>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 hover:text-indigo-500 text-sm flex items-center"
                      >
                        Visit resource <FiDownload className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {promptConfig.includeAssessments && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FiBarChart2 className="mr-2 h-5 w-5 text-indigo-500" />
                  Suggested Assessment Tools
                </h3>
                <div className="space-y-4">
                  {generateAssessmentTools(promptConfig.topic, promptConfig.grade).map((tool, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`flex items-center justify-center rounded-md p-2 ${tool.digital ? 'bg-purple-100' : 'bg-blue-100'}`}>
                        <span className={`text-xs font-medium ${tool.digital ? 'text-purple-800' : 'text-blue-800'}`}>
                          {tool.digital ? 'Digital' : 'Traditional'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-md font-medium">{tool.name}</h4>
                        <p className="text-sm text-gray-500">{tool.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                {lessonPlan.title}
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                {lessonPlan.subject} • Grade {lessonPlan.grade} • {lessonPlan.duration}
              </div>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Objectives</h3>
              <ul className="space-y-2">
                {lessonPlan.objectives.map((objective, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="mr-2">•</span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Materials Needed</h3>
              <ul className="space-y-2">
                {lessonPlan.materials.map((material, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="mr-2">•</span>
                    {material}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lesson Activities</h3>
              <div className="space-y-4">
                {lessonPlan.activities.map((activity, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <span className="text-sm text-gray-500">{activity.duration}</span>
                    </div>
                    <p className="text-gray-700">{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment</h3>
              <p className="text-gray-700">{lessonPlan.assessment}</p>
            </div>
          </div>

          {lessonPlan.sources && lessonPlan.sources.length > 0 && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Educational Sources</h3>
                <ul className="space-y-2">
                  {lessonPlan.sources.map((source, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="mr-2">•</span>
                      <a href={source} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-gray-500">
                  These sources were used to provide real educational information for this lesson plan.
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-md font-medium text-blue-800 mb-2 flex items-center">
              <FiBook className="mr-2 h-5 w-5" />
              Real Educational Content
            </h3>
            <p className="text-sm text-blue-700">
              This lesson plan uses real educational information gathered from trusted sources. The content has been processed and organized to create a comprehensive lesson on {promptConfig.topic} for {promptConfig.grade} grade {promptConfig.subject}.
            </p>
            {researchResults.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-blue-800">Educational Resources Used:</p>
                <ul className="text-xs text-blue-700 space-y-1 mt-1">
                  {researchResults.slice(0, 3).map((result: {snippet: string}, index: number) => (
                    <li key={index} className="flex items-start">
                      <FiBook className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>{result.snippet.substring(0, 100)}...</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  This lesson plan was generated in seconds using AI technology, saving approximately {timeSaved} minutes of manual preparation time.
                </p>
              </div>
              <div className="flex items-center">
                <FiDownload className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Export options</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 