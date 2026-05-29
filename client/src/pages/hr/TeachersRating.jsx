import React, { useState, useEffect } from 'react';
import { Star, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/errorHandler';

const TeachersRating = () => {
  const [ratings, setRatings] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ratingsRes, teachersRes] = await Promise.all([
        api.get('/hr/teacher-ratings'),
        api.get('/hr/staff?role=TEACHER&isDisabled=false')
      ]);
      setRatings(ratingsRes.data.data || []);
      setTeachers(teachersRes.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRatings = ratings.filter(r => {
    const teacherName = `${r.Staff?.firstName} ${r.Staff?.lastName}`.toLowerCase();
    const studentName = `${r.Student?.firstName} ${r.Student?.lastName}`.toLowerCase();
    return teacherName.includes(searchQuery.toLowerCase()) || studentName.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredRatings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRatings.slice(indexOfFirstItem, indexOfLastItem);

  const getAverageRating = (teacherId) => {
    const teacherRatings = ratings.filter(r => r.staffId === teacherId);
    if (teacherRatings.length === 0) return 0;
    const sum = teacherRatings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / teacherRatings.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'fill-yellow-500 text-yellow-500'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-black text-foreground tracking-tight">Teacher Ratings</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">View teacher performance ratings</p>
      </div>

      {/* Teacher Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.slice(0, 6).map((teacher) => {
          const avgRating = parseFloat(getAverageRating(teacher.id));
          const ratingCount = ratings.filter(r => r.staffId === teacher.id).length;

          return (
            <div key={teacher.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                {teacher.photo ? (
                  <img
                    src={teacher.photo}
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-foreground">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">{teacher.staffId}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(avgRating))}
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-foreground">{avgRating}</p>
                  <p className="text-[10px] text-muted-foreground">{ratingCount} ratings</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Search Ratings</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by teacher or student name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 bg-muted/30 border border-border rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Loading...</span>
            </div>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No ratings found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Teacher</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rating</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Comment</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentItems.map((rating) => (
                    <tr key={rating.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {rating.Staff?.firstName} {rating.Staff?.lastName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{rating.Staff?.staffId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">
                          {rating.Student?.firstName} {rating.Student?.lastName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {renderStars(rating.rating)}
                          </div>
                          <span className="text-xs font-bold text-foreground">{rating.rating}/5</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-muted-foreground max-w-xs line-clamp-2">
                          {rating.comment || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-border bg-muted/5 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRatings.length)} of {filteredRatings.length} ratings
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold text-foreground">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeachersRating;
