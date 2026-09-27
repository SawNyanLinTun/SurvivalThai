import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const courses = [
    {
      id: 1,
      title: i18n.language === 'my' ? 'အစ သင်ခန်းစာ' : 'Beginner Course',
      level: t('courses.beginner'),
      progress: 45,
      lessons: 12,
    },
    {
      id: 2,
      title: i18n.language === 'my' ? 'အလယ်အလတ် သင်ခန်းစာ' : 'Intermediate Course',
      level: t('courses.intermediate'),
      progress: 20,
      lessons: 15,
    },
    {
      id: 3,
      title: i18n.language === 'my' ? 'အဆင့်မြင့် သင်ခန်းစာ' : 'Advanced Course',
      level: t('courses.advanced'),
      progress: 0,
      lessons: 20,
    },
  ];

  const assignments = [
    {
      id: 1,
      title: i18n.language === 'my' ? 'အသုံးအနှုန်း အပတ်စဉ်' : 'Weekly Pronunciation',
      dueDate: '2026-10-05',
      status: 'pending',
    },
    {
      id: 2,
      title: i18n.language === 'my' ? 'စာသားရေးခြင်း လက်ငင်း' : 'Writing Practice',
      dueDate: '2026-10-08',
      status: 'completed',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold text-thai-blue mb-2 ${i18n.language === 'my' ? 'font-myanmar' : ''}`}>
            {t('dashboard.welcome')}, {user.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600">{t('dashboard.selectCourse')}</p>
        </div>

        {/* Courses Section */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold text-dark-text mb-6 ${i18n.language === 'my' ? 'font-myanmar' : ''}`}>
            {t('dashboard.myCourses')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} hoverable>
                <div className="mb-4">
                  <h3 className={`text-xl font-bold text-thai-blue mb-1 ${i18n.language === 'my' ? 'font-myanmar' : ''}`}>
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{course.level}</p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600">{t('dashboard.myCourseProgress')}</span>
                    <span className="font-semibold text-thai-blue">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-thai-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {course.lessons} {t('courses.lessons')}
                </p>

                <Button variant={course.progress > 0 ? 'primary' : 'primary'} className="w-full">
                  {course.progress > 0 ? t('courses.continueCourse') : t('courses.startCourse')}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Assignments Section */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold text-dark-text mb-6 ${i18n.language === 'my' ? 'font-myanmar' : ''}`}>
            {t('dashboard.assignments')}
          </h2>
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`text-lg font-bold text-dark-text ${i18n.language === 'my' ? 'font-myanmar' : ''}`}>
                      {assignment.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      📅 Due: {assignment.dueDate}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    assignment.status === 'completed'
                      ? 'bg-thai-green bg-opacity-20 text-thai-green'
                      : 'bg-thai-red bg-opacity-20 text-thai-red'
                  }`}>
                    {assignment.status === 'completed' ? '✓ Completed' : 'Pending'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="flex justify-center">
          <Button variant="danger" onClick={handleLogout}>
            {t('dashboard.logout')}
          </Button>
        </div>
      </div>
    </div>
  );
}
