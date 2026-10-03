import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Download,
  AlertTriangle,
  GraduationCap
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
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    setFetchError(null);
    fetch('/api/courses')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData?.data) && resData.data.length > 0) {
          setCourses(resData.data.map(toCourse));
        }
      })
      .catch(e => {
        setFetchError('Live course catalog unavailable. Showing DigiSkills, Coursera & NAVTTC listings.');
        console.log(e);
      });

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

  const categories = ['All', 'Computer Science & IT', 'Medical & Health', 'Software Engineering', 'Business & Finance'];

  return (
    <div className="ns-page-wrapper space-y-6 min-w-0">
      <div className="relative overflow-hidden ns-card p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl ns-accent-glow-right" aria-hidden="true" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" aria-hidden="true" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 min-w-0">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-teal-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
              <BookOpen className="w-7 h-7" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-[11px] font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>{courses.length} Certified Courses</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                Certified Courses &amp; Digital Skill Pathways
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Free DigiSkills, Google Career Certificates, NAVTTC Diplomas &amp; HEC-Recognized Micro-Credentials
              </p>
            </div>
          </div>

          <div className="relative w-full xl:w-80 shrink-0">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              role="searchbox"
              aria-label="Search courses by title or skill keyword"
              placeholder="Search courses, skills, tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ns-input pl-11"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1" role="tablist" aria-label="Course category filter">
        {categories.map((cat, cIdx) => (
          <button
            key={cat}
            role="tab"
            aria-selected={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
              selectedCategory === cat
                ? 'ns-btn ns-btn-primary ns-btn-sm'
                : 'ns-btn ns-btn-secondary ns-btn-sm'
            }`}
            style={selectedCategory !== cat ? { paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8 } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {fetchError && (
          <motion.div
            key="course-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="ns-alert ns-alert-info"
            role="status"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm">{fetchError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {filteredCourses.length === 0 ? (
          <motion.div
            key="course-empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32 }}
          >
            <div className="ns-empty">
              <div className="ns-empty-icon">
                <GraduationCap className="w-9 h-9" strokeWidth={1.8} />
              </div>
              <h3 className="ns-empty-title">No matching courses found</h3>
              <p className="ns-empty-desc">
                Try searching a different skill or switch to "All" to browse every DigiSkills, Coursera &amp; NAVTTC pathway.
              </p>
              <div className="ns-empty-actions">
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                  className="ns-btn ns-btn-secondary ns-btn-sm"
                >
                  Reset Search
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="course-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0"
          >
            {filteredCourses.map((c, idx) => {
              const isEnrolled = enrolledIds.includes(c.id);
              const isFree = c.price === 'FREE' || c.price === 'Free' || String(c.price).toUpperCase().includes('FREE');
              return (
                <motion.article
                  key={c.id}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: 'easeOut', delay: idx * 0.04 } }
                  }}
                  className="ns-card ns-card-hover p-6 space-y-4 flex flex-col justify-between min-w-0"
                >
                  <div className="space-y-3 min-w-0">
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block truncate">
                          {c.provider}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight truncate">
                          {c.title}
                        </h3>
                      </div>
                      <span className={`ns-badge shrink-0 ${isFree ? 'ns-badge-success' : 'ns-badge-match'}`}>
                        {c.price}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
                        <Clock className="w-4 h-4 shrink-0 text-slate-400" />
                        <span className="truncate">{c.duration}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
                        <Star className="w-4 h-4 shrink-0 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.rating}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0 truncate">
                        <Sparkles className="w-4 h-4 shrink-0 text-teal-500" />
                        <span className="truncate">{c.studentsCount ? c.studentsCount.toLocaleString() : '12,500'} Enrolled</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Skills You'll Learn</span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.skills.slice(0, 4).map((s, sIdx) => (
                          <span key={sIdx} className="ns-badge ns-badge-subtle truncate">
                            {s}
                          </span>
                        ))}
                        {c.skills.length > 4 && (
                          <span className="ns-badge ns-badge-subtle">+{c.skills.length - 4}</span>
                        )}
                        {c.skills.length === 0 && (
                          <span className="ns-badge ns-badge-subtle">Skills listed on the official portal</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                    {c.officialUrl ? (
                      <a
                        href={c.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit official portal for ${c.title}`}
                        className="ns-btn ns-btn-ghost ns-btn-sm inline-flex items-center gap-1.5"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold inline-flex items-center gap-1.5 shrink-0">
                        <Download className="w-3.5 h-3.5" />
                        Verified Certificate
                      </span>
                    )}

                    <button
                      onClick={() => toggleEnroll(c)}
                      aria-pressed={isEnrolled}
                      aria-label={isEnrolled ? `Continue enrolled course: ${c.title}` : `Enroll now in ${c.title}`}
                      className={`ns-btn ns-btn-sm inline-flex items-center gap-1.5 ${
                        isEnrolled ? 'ns-btn-secondary' : 'ns-btn-primary'
                      }`}
                    >
                      {isEnrolled ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
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
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
