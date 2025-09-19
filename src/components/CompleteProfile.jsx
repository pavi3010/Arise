import React, { useState, useEffect } from 'react';
import { School, User, MapPin, GraduationCap, Users, Building, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

// Mock function to replace getSchools
const getSchools = async () => {
  return [
    { id: '1', name: 'Government High School, Bhubaneswar' },
    { id: '2', name: 'Saraswati Vidyalaya, Cuttack' },
    { id: '3', name: 'Model School, Puri' },
    { id: '4', name: 'Kendriya Vidyalaya, Rourkela' },
    { id: '5', name: 'DAV Public School, Berhampur' }
  ];
};

export default function CompleteProfile({ userType = '', onComplete }) {
  const [form, setForm] = useState({
    name: '',
    userType: userType || '',
    schoolId: '',
    schoolAddress: '',
    class: '',
    subject: ''
  });
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.userType === 'staff' || form.userType === 'student') {
      getSchools().then(setSchools);
    }
  }, [form.userType]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error on input change
  }

  function handleUserTypeChange(e) {
    setForm({ ...form, userType: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    if (!form.name || !form.userType) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }
    
    if (form.userType === 'school') {
      if (!form.name || !form.schoolAddress) {
        setError('Please fill all school details.');
        setLoading(false);
        return;
      }
    }
    
    if (form.userType === 'staff') {
      if (!form.schoolId || !form.subject) {
        setError('Please select a school and subject.');
        setLoading(false);
        return;
      }
    }

    if (form.userType === 'student') {
      if (!form.schoolId || !form.class) {
        setError('Please select a school and class.');
        setLoading(false);
        return;
      }
    }
    
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      onComplete(form);
      setLoading(false);
    }, 1000);
  }

  const getRoleConfig = () => {
    switch (form.userType) {
      case 'school':
        return {
          icon: School,
          title: 'School Registration',
          subtitle: 'Set up your school profile',
          gradient: 'from-orange-500 to-red-500',
          bgGradient: 'from-orange-50 to-red-50'
        };
      case 'staff':
        return {
          icon: Users,
          title: 'Teacher Registration',
          subtitle: 'Join your school as an educator',
          gradient: 'from-emerald-500 to-green-600',
          bgGradient: 'from-emerald-50 to-green-50'
        };
      case 'student':
        return {
          icon: GraduationCap,
          title: 'Student Registration',
          subtitle: 'Start your learning journey',
          gradient: 'from-blue-500 to-indigo-600',
          bgGradient: 'from-blue-50 to-indigo-50'
        };
      default:
        return {
          icon: User,
          title: 'Complete Profile',
          subtitle: 'Finish setting up your account',
          gradient: 'from-purple-500 to-pink-600',
          bgGradient: 'from-purple-50 to-pink-50'
        };
    }
  };

  const roleConfig = getRoleConfig();
  const IconComponent = roleConfig.icon;

  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];

  // School Registration Form
  if (form.userType === 'school') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg transform rotate-12">
          <Building className="w-5 h-5 text-white" />
        </div>
        
        <div className="relative z-10 w-full max-w-lg">
          {/* Header Card */}
          <div className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-6 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${roleConfig.bgGradient} opacity-30`}></div>
            <div className="relative z-10 text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${roleConfig.gradient} rounded-2xl mb-4 shadow-lg`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{roleConfig.title}</h2>
              <p className="text-gray-600">{roleConfig.subtitle}</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <School className="w-4 h-4 mr-2" />
                  School Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your school name"
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  School Address
                </label>
                <textarea
                  name="schoolAddress"
                  value={form.schoolAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter complete school address"
                  rows="3"
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${roleConfig.gradient} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Setting up school...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Complete School Registration</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Staff Registration Form
  if (form.userType === 'staff') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        </div>
        
        <div className="absolute top-20 left-20 p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg transform -rotate-12">
          <Users className="w-5 h-5 text-white" />
        </div>
        
        <div className="relative z-10 w-full max-w-lg">
          {/* Header Card */}
          <div className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-6 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${roleConfig.bgGradient} opacity-30`}></div>
            <div className="relative z-10 text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${roleConfig.gradient} rounded-2xl mb-4 shadow-lg`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{roleConfig.title}</h2>
              <p className="text-gray-600">{roleConfig.subtitle}</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <User className="w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <School className="w-4 h-4 mr-2" />
                  Select School
                </label>
                <select
                  name="schoolId"
                  value={form.schoolId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Choose your school</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Teaching Subject
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Select your subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="flex items-center p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${roleConfig.gradient} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Join as Teacher</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student Registration Form
  if (form.userType === 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[size:20px_20px]"></div>
        </div>
        
        <div className="absolute top-32 right-16 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg transform rotate-6">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        
        <div className="relative z-10 w-full max-w-lg">
          {/* Header Card */}
          <div className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-6 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${roleConfig.bgGradient} opacity-30`}></div>
            <div className="relative z-10 text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${roleConfig.gradient} rounded-2xl mb-4 shadow-lg`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{roleConfig.title}</h2>
              <p className="text-gray-600">{roleConfig.subtitle}</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <User className="w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <School className="w-4 h-4 mr-2" />
                  Select School
                </label>
                <select
                  name="schoolId"
                  value={form.schoolId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Choose your school</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Class
                </label>
                <select
                  name="class"
                  value={form.class}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Select your class</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="flex items-center p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${roleConfig.gradient} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Starting journey...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Start Learning Journey</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}