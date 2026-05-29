const prisma = require('../config/prisma');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const { timeFilter = '6months' } = req.query;

  // Calculate date range based on filter
  const now = new Date();
  let startDate = new Date();
  let timeLabel = '';

  switch (timeFilter) {
    case '3months':
      startDate.setMonth(now.getMonth() - 3);
      timeLabel = 'Last 3 months';
      break;
    case '1year':
      startDate.setFullYear(now.getFullYear() - 1);
      timeLabel = 'Last year';
      break;
    case '6months':
    default:
      startDate.setMonth(now.getMonth() - 6);
      timeLabel = 'Last 6 months';
      break;
  }

  // Get counts
  const [
    totalStudents,
    activeStudents,
    totalClasses,
    totalSections,
    totalCategories,
    totalHouses,
    totalUsers
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { isDisabled: false } }),
    prisma.class.count(),
    prisma.section.count(),
    prisma.category.count(),
    prisma.house.count(),
    prisma.user.count({ where: { isActive: true } })
  ]);

  // Get recent students
  const recentStudents = await prisma.student.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    where: { isDisabled: false },
    include: {
      Class: { select: { id: true, name: true } },
      Section: { select: { id: true, name: true } },
      Category: { select: { id: true, name: true } },
      House: { select: { id: true, name: true } }
    }
  });

  // Calculate growth percentages (comparing to previous period)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const studentsLastMonth = await prisma.student.count({
    where: { createdAt: { gte: thirtyDaysAgo } }
  });

  const studentGrowth = totalStudents > 0
    ? ((studentsLastMonth / totalStudents) * 100).toFixed(1)
    : 0;

  // Get class-wise student distribution
  const classDistribution = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { Student: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Get gender distribution
  const genderStats = await prisma.student.groupBy({
    by: ['gender'],
    _count: { gender: true },
    where: { isDisabled: false }
  });

  // Get monthly admission data for chart
  const monthlyData = [];
  const months = timeFilter === '3months' ? 3 : timeFilter === '1year' ? 12 : 6;

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(now.getMonth() - i);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthStart.getMonth() + 1);

    const admissions = await prisma.student.count({
      where: {
        createdAt: {
          gte: monthStart,
          lt: monthEnd
        }
      }
    });

    const activeInMonth = await prisma.student.count({
      where: {
        createdAt: {
          lte: monthEnd
        },
        isDisabled: false
      }
    });

    monthlyData.push({
      name: monthStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      admissions,
      active: activeInMonth
    });
  }

  res.status(200).json(new ApiResponse(200, {
    stats: {
      totalStudents,
      activeStudents,
      disabledStudents: totalStudents - activeStudents,
      totalClasses,
      totalSections,
      totalCategories,
      totalHouses,
      totalUsers,
      studentGrowth: `+${studentGrowth}%`,
      totalTeachers: 0, // Will be implemented with staff module
      totalRevenue: 0, // Will be implemented with fees module
    },
    recentStudents,
    classDistribution: classDistribution.map(c => ({
      id: c.id,
      name: c.name,
      students: c._count.Student
    })),
    genderStats: genderStats.map(g => ({
      gender: g.gender,
      count: g._count.gender
    })),
    chartData: monthlyData,
    timeFilter,
    timeLabel
  }, "Dashboard stats fetched successfully"));
});

module.exports = {
  getDashboardStats
};
