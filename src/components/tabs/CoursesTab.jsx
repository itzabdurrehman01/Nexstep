import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Clock, 
  Star, 
  Search, 
  Play,
  ExternalLink,
  Download
} from 'lucide-react';
import { COURSES_DATA } from '../../data/mockFullAppData.js';

const toCourse = (course, index) => ({
  ...course,
  id: course?.id ?? `course-${index}`,
  title: course?.title || 'Learning pathway',
  provider: course?.provider || 'NexStep learning partner',
  category: course?.category || course?.format || 'Career Skills',
  price: course?.price || (course?.pricePkr ? `PKR ${Number(course.pricePkr).toLocaleString()}` : 'FREE'),
  duration: course?.duration || 'Self-paced',
  rating: Number(course?.rating) || 4.7,
  officialUrl: course?.officialUrl || course?.enrollUrl || course?.applicationUrl,
  skills: Array.isArray(course?.skills)
    ? course.skills
    : Array.isArray(course?.skillsCovered)
      ? course.skillsCovered
      : [],
  description: course?.description || 'Explore the official course listing for learning outcomes and enrollment details.',
});

export function CoursesTab({ lang = 'en' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [courses, setCourses] = useState(COURSES_DATA);
  const [enrolledIds, setEnrolledIds] = useState([]);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData?.data) && resData.data.length > 0) {
          setCourses(resData.data.map(toCourse));
        }
      })
      .catch(e => console.log(e));

    fetch('/api/applications')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData?.data)) {
          setEnrolledIds(resData.data.map(a => a.targetId || a.id));
        }
      })
      .catch(e => console.log(e));
  }, []);

  const filteredCourses = courses.map(toCourse).filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const toggleEnroll = (course) => {
    if (enrolledIds.includes(course.id)) {
      setEnrolledIds(prev => prev.filter(i => i !== course.id));
    } else {
      setEnrolledIds(prev => [...prev, course.id]);
      fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: course.id,
          title: course.title,
          targetName: course.provider,
          type: 'Course Enrollment',
          officialUrl: course.officialUrl
        })
      }).catch(e => console.error(e));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Certified Courses & Digital Skill Pathways</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Free DigiSkills, Google, NAVTTC & HEC Certified Courses</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, skills, tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar text-xs font-semibold">
        {['All', 'Computer Science & IT', 'Medical & Health', 'Software Engineering', 'Business & Finance'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((c) => {
          const isEnrolled = enrolledIds.includes(c.id);
          return (
            <div key={c.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider block">{c.provider}</span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">{c.title}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs shrink-0">
                    {c.price}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{c.description}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {c.duration}</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {c.rating}</span>
                  <span>{c.studentsCount ? c.studentsCount.toLocaleString() : '12,500'} Enrolled</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {c.skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                      {s}
                    </span>
                  ))}
                  {c.skills.length === 0 && <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-semibold">Skills listed on the official portal</span>}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {c.officialUrl ? (
                  <a
                    href={c.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Verified Certificate</span>
                )}

                <button
                  onClick={() => toggleEnroll(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isEnrolled
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isEnrolled ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Enrolled • Continue</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Enroll Now Free</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
