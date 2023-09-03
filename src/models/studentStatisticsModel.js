import mongoose from "mongoose";

const StudentStatisticsSchema = new mongoose.Schema({
  totalRegisteredStudents: {
    type: Number,
    required: true,
  },
  totalRewardsEarned: {
    type: Number,
    required: true,
  },
  weeklyTasksSubmitted: {
    type: Number,
    required: true,
  },
  studentNames: {
    type: [String],
    required: true,
  },
  learningTracks: {
    type: [String],
    required: true,
  },
  gradesInPercentage: {
    type: [Number],
    required: true,
  },
  totalCompletedTasks: {
    type: Number,
    required: true,
  },
  ranks: {
    type: [Number],
    required: true,
  },
});

export const studentStatisticsModel = mongoose.model('StudentStatistics', StudentStatisticsSchema);
