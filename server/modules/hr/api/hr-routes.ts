import { Router } from "express";
import { db } from "../../../db";
import { 
  departments,
  jobPositions,
  employees,
  performanceReviews,
  leaveRequests,
  attendanceRecords,
  payrollRecords,
  trainingPrograms,
  trainingEnrollments,
  insertDepartmentSchema,
  insertJobPositionSchema,
  insertEmployeeSchema,
  insertPerformanceReviewSchema,
  insertLeaveRequestSchema,
  insertAttendanceRecordSchema,
  insertPayrollRecordSchema,
  insertTrainingProgramSchema,
  insertTrainingEnrollmentSchema
} from "../../../../shared/schema";
import { eq, desc, and, sum, count, sql, avg } from "drizzle-orm";
import { z } from "zod";

const hrRouter = Router();

// Middleware for tenant ID (using mock for development)
function getTenantId(req: any) {
  return parseInt(req.headers['x-tenant-id'] || '1');
}

// Health check
hrRouter.get("/health", (req, res) => {
  res.json({
    module: "HR",
    status: "healthy",
    timestamp: new Date().toISOString(),
    features: ["employees", "departments", "leave-management", "payroll", "performance", "training"]
  });
});

// HR dashboard stats
hrRouter.get("/stats", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    // Get employee stats
    const [employeeStats] = await db
      .select({
        totalEmployees: count(employees.id),
        activeEmployees: count(sql`CASE WHEN ${employees.status} = 'active' THEN 1 END`)
      })
      .from(employees)
      .where(eq(employees.tenantId, tenantId));

    // Get leave requests stats
    const [leaveStats] = await db
      .select({
        pendingLeaves: count(sql`CASE WHEN ${leaveRequests.status} = 'pending' THEN 1 END`),
        approvedLeaves: count(sql`CASE WHEN ${leaveRequests.status} = 'approved' THEN 1 END`)
      })
      .from(leaveRequests)
      .where(eq(leaveRequests.tenantId, tenantId));

    // Get average salary
    const [salaryStats] = await db
      .select({
        averageSalary: avg(employees.salary)
      })
      .from(employees)
      .where(and(
        eq(employees.tenantId, tenantId),
        eq(employees.status, 'active')
      ));

    const stats = {
      totalEmployees: employeeStats?.totalEmployees || 0,
      activeEmployees: employeeStats?.activeEmployees || 0,
      pendingLeaves: leaveStats?.pendingLeaves || 0,
      averageSalary: Number(salaryStats?.averageSalary || 0),
      turnoverRate: 5.2, // Calculate based on terminations
      satisfactionScore: 4.3 // From performance reviews
    };
    
    res.json(stats);
  } catch (error) {
    console.error('HR stats error:', error);
    res.status(500).json({ error: "Failed to fetch HR stats" });
  }
});

// DEPARTMENTS API
hrRouter.get("/departments", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const departmentList = await db
      .select({
        id: departments.id,
        name: departments.name,
        description: departments.description,
        budget: departments.budget,
        isActive: departments.isActive,
        manager: {
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName
        },
        employeeCount: count(employees.id)
      })
      .from(departments)
      .leftJoin(employees, eq(departments.managerId, employees.id))
      .where(eq(departments.tenantId, tenantId))
      .groupBy(departments.id, employees.id, employees.firstName, employees.lastName)
      .orderBy(departments.name);
    
    res.json(departmentList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

hrRouter.post("/departments", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertDepartmentSchema.parse({
      ...req.body,
      tenantId
    });
    
    const [newDepartment] = await db
      .insert(departments)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(400).json({ error: "Failed to create department" });
  }
});

// EMPLOYEES API
hrRouter.get("/employees", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const employeeList = await db
      .select({
        id: employees.id,
        employeeNumber: employees.employeeNumber,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        phone: employees.phone,
        hireDate: employees.hireDate,
        salary: employees.salary,
        currency: employees.currency,
        employmentType: employees.employmentType,
        status: employees.status,
        department: {
          id: departments.id,
          name: departments.name
        },
        position: {
          id: jobPositions.id,
          title: jobPositions.title
        },
        manager: {
          id: sql`manager.id`,
          firstName: sql`manager.first_name`,
          lastName: sql`manager.last_name`
        }
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .leftJoin(jobPositions, eq(employees.positionId, jobPositions.id))
      .leftJoin(sql`employees manager`, sql`employees.manager_id = manager.id`)
      .where(eq(employees.tenantId, tenantId))
      .orderBy(desc(employees.createdAt));
    
    res.json(employeeList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

hrRouter.post("/employees", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertEmployeeSchema.parse({
      ...req.body,
      tenantId,
      employeeNumber: `EMP-${Date.now()}`
    });
    
    const [newEmployee] = await db
      .insert(employees)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(400).json({ error: "Failed to create employee" });
  }
});

// JOB POSITIONS API
hrRouter.get("/positions", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const positionList = await db
      .select({
        id: jobPositions.id,
        title: jobPositions.title,
        description: jobPositions.description,
        requirements: jobPositions.requirements,
        salaryMin: jobPositions.salaryMin,
        salaryMax: jobPositions.salaryMax,
        isActive: jobPositions.isActive,
        department: {
          id: departments.id,
          name: departments.name
        }
      })
      .from(jobPositions)
      .leftJoin(departments, eq(jobPositions.departmentId, departments.id))
      .where(eq(jobPositions.tenantId, tenantId))
      .orderBy(jobPositions.title);
    
    res.json(positionList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job positions" });
  }
});

hrRouter.post("/positions", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertJobPositionSchema.parse({
      ...req.body,
      tenantId
    });
    
    const [newPosition] = await db
      .insert(jobPositions)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newPosition);
  } catch (error) {
    res.status(400).json({ error: "Failed to create job position" });
  }
});

// LEAVE REQUESTS API
hrRouter.get("/leave-requests", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const leaveList = await db
      .select({
        id: leaveRequests.id,
        leaveType: leaveRequests.leaveType,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        totalDays: leaveRequests.totalDays,
        reason: leaveRequests.reason,
        status: leaveRequests.status,
        approvedAt: leaveRequests.approvedAt,
        employee: {
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          employeeNumber: employees.employeeNumber
        },
        approver: {
          id: sql`approver.id`,
          firstName: sql`approver.first_name`,
          lastName: sql`approver.last_name`
        }
      })
      .from(leaveRequests)
      .leftJoin(employees, eq(leaveRequests.employeeId, employees.id))
      .leftJoin(sql`employees approver`, sql`leave_requests.approved_by = approver.id`)
      .where(eq(leaveRequests.tenantId, tenantId))
      .orderBy(desc(leaveRequests.createdAt));
    
    res.json(leaveList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

hrRouter.post("/leave-requests", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertLeaveRequestSchema.parse({
      ...req.body,
      tenantId
    });
    
    const [newLeaveRequest] = await db
      .insert(leaveRequests)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newLeaveRequest);
  } catch (error) {
    res.status(400).json({ error: "Failed to create leave request" });
  }
});

// PERFORMANCE REVIEWS API
hrRouter.get("/performance-reviews", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const reviewList = await db
      .select({
        id: performanceReviews.id,
        reviewPeriodStart: performanceReviews.reviewPeriodStart,
        reviewPeriodEnd: performanceReviews.reviewPeriodEnd,
        overallRating: performanceReviews.overallRating,
        status: performanceReviews.status,
        employee: {
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          employeeNumber: employees.employeeNumber
        },
        reviewer: {
          id: sql`reviewer.id`,
          firstName: sql`reviewer.first_name`,
          lastName: sql`reviewer.last_name`
        }
      })
      .from(performanceReviews)
      .leftJoin(employees, eq(performanceReviews.employeeId, employees.id))
      .leftJoin(sql`employees reviewer`, sql`performance_reviews.reviewer_id = reviewer.id`)
      .where(eq(performanceReviews.tenantId, tenantId))
      .orderBy(desc(performanceReviews.createdAt));
    
    res.json(reviewList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch performance reviews" });
  }
});

hrRouter.post("/performance-reviews", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertPerformanceReviewSchema.parse({
      ...req.body,
      tenantId
    });
    
    const [newReview] = await db
      .insert(performanceReviews)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ error: "Failed to create performance review" });
  }
});

// PAYROLL API
hrRouter.get("/payroll", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const payrollList = await db
      .select({
        id: payrollRecords.id,
        payPeriodStart: payrollRecords.payPeriodStart,
        payPeriodEnd: payrollRecords.payPeriodEnd,
        baseSalary: payrollRecords.baseSalary,
        grossPay: payrollRecords.grossPay,
        netPay: payrollRecords.netPay,
        currency: payrollRecords.currency,
        status: payrollRecords.status,
        employee: {
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          employeeNumber: employees.employeeNumber
        }
      })
      .from(payrollRecords)
      .leftJoin(employees, eq(payrollRecords.employeeId, employees.id))
      .where(eq(payrollRecords.tenantId, tenantId))
      .orderBy(desc(payrollRecords.createdAt));
    
    res.json(payrollList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payroll records" });
  }
});

hrRouter.post("/payroll", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertPayrollRecordSchema.parse({
      ...req.body,
      tenantId
    });
    
    const [newPayroll] = await db
      .insert(payrollRecords)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newPayroll);
  } catch (error) {
    res.status(400).json({ error: "Failed to create payroll record" });
  }
});

// TRAINING PROGRAMS API
hrRouter.get("/training", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const trainingList = await db
      .select({
        id: trainingPrograms.id,
        title: trainingPrograms.title,
        description: trainingPrograms.description,
        instructorName: trainingPrograms.instructorName,
        duration: trainingPrograms.duration,
        cost: trainingPrograms.cost,
        maxParticipants: trainingPrograms.maxParticipants,
        startDate: trainingPrograms.startDate,
        endDate: trainingPrograms.endDate,
        isActive: trainingPrograms.isActive,
        enrolledCount: count(trainingEnrollments.id)
      })
      .from(trainingPrograms)
      .leftJoin(trainingEnrollments, eq(trainingPrograms.id, trainingEnrollments.trainingId))
      .where(eq(trainingPrograms.tenantId, tenantId))
      .groupBy(trainingPrograms.id)
      .orderBy(desc(trainingPrograms.createdAt));
    
    res.json(trainingList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch training programs" });
  }
});

hrRouter.post("/training", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertTrainingProgramSchema.parse({
      ...req.body,
      tenantId
    });
    
    const [newTraining] = await db
      .insert(trainingPrograms)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newTraining);
  } catch (error) {
    res.status(400).json({ error: "Failed to create training program" });
  }
});

// ATTENDANCE API
hrRouter.get("/attendance", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const attendanceList = await db
      .select({
        id: attendanceRecords.id,
        date: attendanceRecords.date,
        checkIn: attendanceRecords.checkIn,
        checkOut: attendanceRecords.checkOut,
        hoursWorked: attendanceRecords.hoursWorked,
        status: attendanceRecords.status,
        employee: {
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          employeeNumber: employees.employeeNumber
        }
      })
      .from(attendanceRecords)
      .leftJoin(employees, eq(attendanceRecords.employeeId, employees.id))
      .where(eq(attendanceRecords.tenantId, tenantId))
      .orderBy(desc(attendanceRecords.date));
    
    res.json(attendanceList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});

hrRouter.post("/attendance", async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const validatedData = insertAttendanceRecordSchema.parse({
      ...req.body,
      tenantId
    });
    
    const [newAttendance] = await db
      .insert(attendanceRecords)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newAttendance);
  } catch (error) {
    res.status(400).json({ error: "Failed to create attendance record" });
  }
});

export default hrRouter;