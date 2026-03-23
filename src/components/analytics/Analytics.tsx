"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Video,
  Briefcase,
  ChevronDown,
  CalendarDays,
  Download,
  Search,
  Globe,
  Upload,
  Link2,
  CheckCircle2,
  Hourglass,
  ClipboardCheck,
  CalendarClock,
  LayoutDashboard,
} from "lucide-react";
import { clsx } from "clsx";

type CandidateSource =
  | "Career Page"
  | "Bulk Upload"
  | "Direct Link"
  | "ATS"
  | "Scheduled";

type JobStatus = "Active" | "Draft" | "Archived";

type CandidateStage = {
  resumeAnalysed: boolean;
  resumeShortlisted: boolean;
  resumeWaitlisted: boolean;
  recruiterAttempted: boolean;
  recruiterScheduled: boolean;
  recruiterShortlisted: boolean;
  recruiterWaitlisted: boolean;
  functionalAttempted: boolean;
  functionalScheduled: boolean;
  functionalShortlisted: boolean;
  functionalWaitlisted: boolean;
};

type Applicant = {
  id: string;
  source: CandidateSource;
  createdAt: string;
  stage: CandidateStage;
};

type JobRecord = {
  id: string;
  jobName: string;
  createdBy: string;
  businessUnit: string;
  status: JobStatus;
  applicants: Applicant[];
};

const jobsSeed: JobRecord[] = [
  {
    id: "job-1",
    jobName: "Full Stack Developer Hiring - Demo",
    createdBy: "Akross",
    businessUnit: "-",
    status: "Active",
    applicants: [
      {
        id: "a1",
        source: "Direct Link",
        createdAt: "2026-03-20",
        stage: {
          resumeAnalysed: false,
          resumeShortlisted: false,
          resumeWaitlisted: false,
          recruiterAttempted: false,
          recruiterScheduled: false,
          recruiterShortlisted: false,
          recruiterWaitlisted: false,
          functionalAttempted: false,
          functionalScheduled: true,
          functionalShortlisted: false,
          functionalWaitlisted: false,
        },
      },
    ],
  },
  {
    id: "job-2",
    jobName: "Government Tender & Proposal Executive Hiring",
    createdBy: "Akross",
    businessUnit: "-",
    status: "Active",
    applicants: [
      {
        id: "a2",
        source: "Career Page",
        createdAt: "2026-03-18",
        stage: {
          resumeAnalysed: false,
          resumeShortlisted: false,
          resumeWaitlisted: false,
          recruiterAttempted: true,
          recruiterScheduled: false,
          recruiterShortlisted: false,
          recruiterWaitlisted: false,
          functionalAttempted: false,
          functionalScheduled: false,
          functionalShortlisted: false,
          functionalWaitlisted: false,
        },
      },
      {
        id: "a3",
        source: "Direct Link",
        createdAt: "2026-03-19",
        stage: {
          resumeAnalysed: false,
          resumeShortlisted: false,
          resumeWaitlisted: false,
          recruiterAttempted: true,
          recruiterScheduled: true,
          recruiterShortlisted: false,
          recruiterWaitlisted: false,
          functionalAttempted: true,
          functionalScheduled: false,
          functionalShortlisted: false,
          functionalWaitlisted: false,
        },
      },
      {
        id: "a4",
        source: "Scheduled",
        createdAt: "2026-03-21",
        stage: {
          resumeAnalysed: false,
          resumeShortlisted: false,
          resumeWaitlisted: false,
          recruiterAttempted: false,
          recruiterScheduled: false,
          recruiterShortlisted: false,
          recruiterWaitlisted: false,
          functionalAttempted: false,
          functionalScheduled: false,
          functionalShortlisted: false,
          functionalWaitlisted: false,
        },
      },
    ],
  },
];

const dateRanges = [
  { label: "Last 7 Days", value: "7" },
  { label: "Last 30 Days", value: "30" },
  { label: "Last 90 Days", value: "90" },
  { label: "All Time", value: "all" },
];

function isWithinRange(dateStr: string, range: string) {
  if (range === "all") return true;

  const now = new Date("2026-03-23T00:00:00");
  const date = new Date(dateStr);
  const days = Number(range);

  const diff = now.getTime() - date.getTime();
  const diffDays = diff / (1000 * 60 * 60 * 24);

  return diffDays <= days;
}

function exportToCSV(rows: ReturnType<typeof buildTableRows>) {
  const headers = [
    "Job Name",
    "Created By",
    "Business Unit",
    "Total Applicants",
    "Career Page",
    "Bulk Upload",
    "Scheduled",
    "Direct Link",
    "Resume Analysed",
    "Resume Shortlisted",
    "Resume Waitlisted",
    "Recruiter Total",
    "Recruiter Attempted",
    "Recruiter Scheduled",
    "Recruiter Shortlisted",
    "Recruiter Waitlisted",
    "Functional Total",
    "Functional Attempted",
    "Functional Scheduled",
    "Functional Shortlisted",
    "Functional Waitlisted",
  ];

  const csvRows = rows.map((row) => [
    row.jobName,
    row.createdBy,
    row.businessUnit,
    row.totalApplicants,
    row.careerPage,
    row.bulkUpload,
    row.scheduled,
    row.directLink,
    row.resumeAnalysed,
    row.resumeShortlisted,
    row.resumeWaitlisted,
    row.recruiterTotal,
    row.recruiterAttempted,
    row.recruiterScheduled,
    row.recruiterShortlisted,
    row.recruiterWaitlisted,
    row.functionalTotal,
    row.functionalAttempted,
    row.functionalScheduled,
    row.functionalShortlisted,
    row.functionalWaitlisted,
  ]);

  const csvContent = [headers, ...csvRows]
    .map((row) => row.map((cell) => `"${String(cell ?? "")}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "usage-overview.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function buildTableRows(filteredJobs: JobRecord[]) {
  return filteredJobs.map((job) => {
    const applicants = job.applicants;

    const totalApplicants = applicants.length;
    const careerPage = applicants.filter((a) => a.source === "Career Page").length;
    const bulkUpload = applicants.filter((a) => a.source === "Bulk Upload").length;
    const scheduled = applicants.filter((a) => a.source === "Scheduled").length;
    const directLink = applicants.filter((a) => a.source === "Direct Link").length;

    const resumeAnalysed = applicants.filter((a) => a.stage.resumeAnalysed).length;
    const resumeShortlisted = applicants.filter((a) => a.stage.resumeShortlisted).length;
    const resumeWaitlisted = applicants.filter((a) => a.stage.resumeWaitlisted).length;

    const recruiterAttempted = applicants.filter((a) => a.stage.recruiterAttempted).length;
    const recruiterScheduled = applicants.filter((a) => a.stage.recruiterScheduled).length;
    const recruiterShortlisted = applicants.filter((a) => a.stage.recruiterShortlisted).length;
    const recruiterWaitlisted = applicants.filter((a) => a.stage.recruiterWaitlisted).length;
    const recruiterTotal = applicants.filter(
      (a) => a.stage.recruiterAttempted || a.stage.recruiterScheduled
    ).length;

    const functionalAttempted = applicants.filter((a) => a.stage.functionalAttempted).length;
    const functionalScheduled = applicants.filter((a) => a.stage.functionalScheduled).length;
    const functionalShortlisted = applicants.filter((a) => a.stage.functionalShortlisted).length;
    const functionalWaitlisted = applicants.filter((a) => a.stage.functionalWaitlisted).length;
    const functionalTotal = applicants.filter(
      (a) => a.stage.functionalAttempted || a.stage.functionalScheduled
    ).length;

    return {
      id: job.id,
      jobName: job.jobName,
      createdBy: job.createdBy,
      businessUnit: job.businessUnit,
      totalApplicants,
      careerPage,
      bulkUpload,
      scheduled,
      directLink,
      resumeAnalysed,
      resumeShortlisted,
      resumeWaitlisted,
      recruiterTotal,
      recruiterAttempted,
      recruiterScheduled,
      recruiterShortlisted,
      recruiterWaitlisted,
      functionalTotal,
      functionalAttempted,
      functionalScheduled,
      functionalShortlisted,
      functionalWaitlisted,
    };
  });
}

export default function Analytics() {
  const [jobs] = useState<JobRecord[]>(jobsSeed);
  const [selectedJob, setSelectedJob] = useState("all");
  const [selectedRange, setSelectedRange] = useState("30");
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const filteredJobs = useMemo(() => {
    return jobs
      .map((job) => ({
        ...job,
        applicants: job.applicants.filter((a) =>
          isWithinRange(a.createdAt, selectedRange)
        ),
      }))
      .filter((job) => {
        const matchesJob = selectedJob === "all" || job.id === selectedJob;
        const matchesSearch = job.jobName
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesJob && matchesSearch;
      });
  }, [jobs, selectedJob, selectedRange, search]);

  const summary = useMemo(() => {
    const allApplicants = filteredJobs.flatMap((job) => job.applicants);

    return {
      totalApplicants: allApplicants.length,
      careerPage: allApplicants.filter((a) => a.source === "Career Page").length,
      bulkUpload: allApplicants.filter((a) => a.source === "Bulk Upload").length,
      directLink: allApplicants.filter((a) => a.source === "Direct Link").length,
      scheduled: allApplicants.filter((a) => a.source === "Scheduled").length,

      resumeAnalysed: allApplicants.filter((a) => a.stage.resumeAnalysed).length,
      resumeShortlisted: allApplicants.filter((a) => a.stage.resumeShortlisted).length,
      resumeWaitlisted: allApplicants.filter((a) => a.stage.resumeWaitlisted).length,

      recruiterTotal: allApplicants.filter(
        (a) => a.stage.recruiterAttempted || a.stage.recruiterScheduled
      ).length,
      recruiterAttempted: allApplicants.filter((a) => a.stage.recruiterAttempted).length,
      recruiterScheduled: allApplicants.filter((a) => a.stage.recruiterScheduled).length,
      recruiterShortlisted: allApplicants.filter((a) => a.stage.recruiterShortlisted).length,
      recruiterWaitlisted: allApplicants.filter((a) => a.stage.recruiterWaitlisted).length,

      functionalTotal: allApplicants.filter(
        (a) => a.stage.functionalAttempted || a.stage.functionalScheduled
      ).length,
      functionalAttempted: allApplicants.filter((a) => a.stage.functionalAttempted).length,
      functionalScheduled: allApplicants.filter((a) => a.stage.functionalScheduled).length,
      functionalShortlisted: allApplicants.filter((a) => a.stage.functionalShortlisted).length,
      functionalWaitlisted: allApplicants.filter((a) => a.stage.functionalWaitlisted).length,
    };
  }, [filteredJobs]);

  const tableRows = useMemo(() => buildTableRows(filteredJobs), [filteredJobs]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return tableRows.slice(start, start + rowsPerPage);
  }, [tableRows, page, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / rowsPerPage));

  useEffect(() => {
    setPage(1);
  }, [selectedJob, selectedRange, search, rowsPerPage]);

  return (
    <div className="min-h-full bg-background px-4 py-5 md:px-6 md:py-6">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e6ebe7] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <LayoutDashboard size={18} className="text-[#6b7280]" />
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#20262d]">
                Usage Overview
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[260px]">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa3af]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job..."
                className="h-11 w-full rounded-xl border border-[#e6ebe7] bg-white pl-10 pr-4 text-sm text-[#334155] outline-none placeholder:text-[#9aa3af] focus:border-[#d9e2dc]"
              />
            </div>

            <div className="relative min-w-[240px]">
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-[#e6ebe7] bg-white pl-4 pr-10 text-sm text-[#334155] outline-none focus:border-[#d9e2dc]"
              >
                <option value="all">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.jobName}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa3af]"
              />
            </div>

            <div className="relative min-w-[170px]">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa3af]"
              />
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-[#e6ebe7] bg-white pl-10 pr-10 text-sm text-[#334155] outline-none focus:border-[#d9e2dc]"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa3af]"
              />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Applicants"
            value={summary.totalApplicants}
            accent="purple"
            icon={<Users size={17} />}
            chips={[
              {
                label: "Career Page",
                value: summary.careerPage,
                icon: <Globe size={13} />,
              },
              {
                label: "Bulk Upload",
                value: summary.bulkUpload,
                icon: <Upload size={13} />,
              },
              {
                label: "Scheduled",
                value: summary.scheduled,
                icon: <CalendarClock size={13} />,
              },
              {
                label: "Direct Link",
                value: summary.directLink,
                icon: <Link2 size={13} />,
              },
            ]}
          />

          <StatCard
            title="Resume Analysis"
            value={summary.resumeAnalysed}
            accent="amber"
            icon={<FileText size={17} />}
            chips={[
              {
                label: "Analysed",
                value: summary.resumeAnalysed,
                icon: <ClipboardCheck size={13} />,
              },
              {
                label: "Shortlisted",
                value: summary.resumeShortlisted,
                icon: <CheckCircle2 size={13} />,
              },
              {
                label: "Waitlisted",
                value: summary.resumeWaitlisted,
                icon: <Hourglass size={13} />,
              },
            ]}
          />

          <StatCard
            title="Recruiter Screening"
            value={summary.recruiterTotal}
            accent="blue"
            icon={<Video size={17} />}
            chips={[
              {
                label: "Attempted",
                value: summary.recruiterAttempted,
                icon: <Video size={13} />,
              },
              {
                label: "Scheduled",
                value: summary.recruiterScheduled,
                icon: <CalendarClock size={13} />,
              },
              {
                label: "Shortlisted",
                value: summary.recruiterShortlisted,
                icon: <CheckCircle2 size={13} />,
              },
              {
                label: "Waitlisted",
                value: summary.recruiterWaitlisted,
                icon: <Hourglass size={13} />,
              },
            ]}
          />

          <StatCard
            title="Functional Interview"
            value={summary.functionalTotal}
            accent="green"
            icon={<Briefcase size={17} />}
            chips={[
              {
                label: "Attempted",
                value: summary.functionalAttempted,
                icon: <Video size={13} />,
              },
              {
                label: "Scheduled",
                value: summary.functionalScheduled,
                icon: <CalendarClock size={13} />,
              },
              {
                label: "Shortlisted",
                value: summary.functionalShortlisted,
                icon: <CheckCircle2 size={13} />,
              },
              {
                label: "Waitlisted",
                value: summary.functionalWaitlisted,
                icon: <Hourglass size={13} />,
              },
            ]}
          />
        </div>

        {/* Table Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden rounded-2xl bg-card shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[#eef2ef] px-4 py-4 md:px-5">
            <button className="rounded-xl border border-[#e6ebe7] bg-white px-4 py-2 text-sm font-medium text-[#2c3440] shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
              Job wise breakdown
            </button>

            <button
              onClick={() => exportToCSV(tableRows)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#dad7fe] bg-[#f4f2ff] px-4 py-2 text-sm font-medium text-[#7367f0] transition hover:bg-[#ede8ff]"
            >
              <Download size={15} />
              Export to Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1650px] w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#fafbfa]">
                  <HeaderCell rowSpan={2} align="left">
                    Job Name
                  </HeaderCell>
                  <HeaderCell rowSpan={2} align="left">
                    Created by
                  </HeaderCell>
                  <HeaderCell rowSpan={2} align="left">
                    Business Unit
                  </HeaderCell>

                  <GroupHeader colSpan={5} bg="bg-[#f8f3fc]">
                    Total Applicants
                  </GroupHeader>
                  <GroupHeader colSpan={3} bg="bg-[#fbf7ee]">
                    Resume Analysis
                  </GroupHeader>
                  <GroupHeader colSpan={5} bg="bg-[#eef5ff]">
                    Recruiter Screening
                  </GroupHeader>
                  <GroupHeader colSpan={5} bg="bg-[#edf8f0]">
                    Functional Interview
                  </GroupHeader>
                </tr>

                <tr className="bg-[#fafbfa]">
                  <SubHeaderCell>Total</SubHeaderCell>
                  <SubHeaderCell>Career Page</SubHeaderCell>
                  <SubHeaderCell>Bulk Upload</SubHeaderCell>
                  <SubHeaderCell>Scheduled</SubHeaderCell>
                  <SubHeaderCell>Direct Link</SubHeaderCell>

                  <SubHeaderCell>Analysed</SubHeaderCell>
                  <SubHeaderCell>Shortlist</SubHeaderCell>
                  <SubHeaderCell>Waitlist</SubHeaderCell>

                  <SubHeaderCell>Total</SubHeaderCell>
                  <SubHeaderCell>Attempted</SubHeaderCell>
                  <SubHeaderCell>Scheduled</SubHeaderCell>
                  <SubHeaderCell>Shortlist</SubHeaderCell>
                  <SubHeaderCell>Waitlist</SubHeaderCell>

                  <SubHeaderCell>Total</SubHeaderCell>
                  <SubHeaderCell>Attempted</SubHeaderCell>
                  <SubHeaderCell>Scheduled</SubHeaderCell>
                  <SubHeaderCell>Shortlist</SubHeaderCell>
                  <SubHeaderCell>Waitlist</SubHeaderCell>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-[#edf1ee] transition hover:bg-[#fafcfa]"
                    >
                      <td className="max-w-[280px] px-4 py-5 text-left font-semibold leading-7 text-[#5b4dbb]">
                        {row.jobName}
                      </td>
                      <td className="px-4 py-5 text-left text-[#6b7280]">
                        {row.createdBy}
                      </td>
                      <td className="px-4 py-5 text-left text-[#6b7280]">
                        {row.businessUnit}
                      </td>

                      <BodyCell strong>{row.totalApplicants}</BodyCell>
                      <BodyCell>{row.careerPage}</BodyCell>
                      <BodyCell>{row.bulkUpload}</BodyCell>
                      <BodyCell>{row.scheduled}</BodyCell>
                      <BodyCell>{row.directLink}</BodyCell>

                      <BodyCell>{row.resumeAnalysed}</BodyCell>
                      <BodyCell color="green">{row.resumeShortlisted}</BodyCell>
                      <BodyCell color="amber">{row.resumeWaitlisted}</BodyCell>

                      <BodyCell>{row.recruiterTotal}</BodyCell>
                      <BodyCell>{row.recruiterAttempted}</BodyCell>
                      <BodyCell>{row.recruiterScheduled}</BodyCell>
                      <BodyCell color="green">{row.recruiterShortlisted}</BodyCell>
                      <BodyCell color="amber">{row.recruiterWaitlisted}</BodyCell>

                      <BodyCell>{row.functionalTotal}</BodyCell>
                      <BodyCell>{row.functionalAttempted}</BodyCell>
                      <BodyCell>{row.functionalScheduled}</BodyCell>
                      <BodyCell color="green">{row.functionalShortlisted}</BodyCell>
                      <BodyCell color="amber">{row.functionalWaitlisted}</BodyCell>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={21}
                      className="px-4 py-12 text-center text-sm text-[#8a94a3]"
                    >
                      No records found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-4 border-t border-[#eef2ef] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
            <p className="text-sm text-[#7b8494]">
              Showing{" "}
              {tableRows.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}-
              {Math.min(page * rowsPerPage, tableRows.length)} of {tableRows.length}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="h-10 rounded-xl border border-[#e6ebe7] bg-white px-3 text-sm text-[#334155] outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-10 rounded-xl border border-[#e6ebe7] bg-[#f8faf9] px-4 text-sm text-[#9aa3af] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Previous
                </button>

                <span className="text-sm text-[#6b7280]">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-10 rounded-xl border border-[#e6ebe7] bg-[#f8faf9] px-4 text-sm text-[#9aa3af] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function HeaderCell({
  children,
  rowSpan,
  align = "center",
}: {
  children: React.ReactNode;
  rowSpan?: number;
  align?: "left" | "center";
}) {
  return (
    <th
      rowSpan={rowSpan}
      className={clsx(
        "border-b border-r border-[#edf1ee] px-4 py-5 text-sm font-semibold text-[#2a313a]",
        align === "left" ? "text-left min-w-[180px]" : "text-center"
      )}
    >
      {children}
    </th>
  );
}

function GroupHeader({
  children,
  colSpan,
  bg,
}: {
  children: React.ReactNode;
  colSpan: number;
  bg: string;
}) {
  return (
    <th
      colSpan={colSpan}
      className={clsx(
        "border-b border-r border-[#edf1ee] px-4 py-4 text-center text-[15px] font-semibold text-[#2a313a]",
        bg
      )}
    >
      {children}
    </th>
  );
}

function SubHeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-r border-[#edf1ee] px-4 py-4 text-center font-medium text-[#5f6978]">
      {children}
    </th>
  );
}

function BodyCell({
  children,
  strong = false,
  color = "default",
}: {
  children: React.ReactNode;
  strong?: boolean;
  color?: "default" | "green" | "amber";
}) {
  const value =
    children === 0 || children === "0"
      ? 0
      : children
      ? children
      : "-";

  return (
    <td
      className={clsx(
        "border-r border-[#edf1ee] px-4 py-5 text-center",
        strong && "font-semibold text-[#1f2937]",
        !strong && color === "default" && "text-[#4b5563]",
        color === "green" && "text-[#4aa37a] font-medium",
        color === "amber" && "text-[#c39b6a] font-medium"
      )}
    >
      {value}
    </td>
  );
}

function StatCard({
  title,
  value,
  accent,
  icon,
  chips,
}: {
  title: string;
  value: number;
  accent: "purple" | "amber" | "blue" | "green";
  icon: React.ReactNode;
  chips: { label: string; value: number; icon: React.ReactNode }[];
}) {
  const styles = {
    purple: {
      card: "bg-[#f9f3ff] border-[#ecdff8]",
      iconWrap: "bg-[#f3e8ff] text-[#9333ea]",
      title: "text-[#7c3aed]",
      value: "text-[#7c3aed]",
    },
    amber: {
      card: "bg-[#fcf7ec] border-[#efe4cc]",
      iconWrap: "bg-[#fff1d6] text-[#c26a18]",
      title: "text-[#b8611c]",
      value: "text-[#b45309]",
    },
    blue: {
      card: "bg-[#eef6ff] border-[#dbe8fb]",
      iconWrap: "bg-[#e0eeff] text-[#3b82f6]",
      title: "text-[#2f5fb3]",
      value: "text-[#2f5fb3]",
    },
    green: {
      card: "bg-[#eef9f1] border-[#d9eedd]",
      iconWrap: "bg-[#def3e5] text-[#18945b]",
      title: "text-[#217a52]",
      value: "text-[#217a52]",
    },
  };

  const s = styles[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={clsx(
        "rounded-[18px] border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]",
        s.card
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={clsx(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              s.iconWrap
            )}
          >
            {icon}
          </div>

          <div>
            <p className={clsx("text-[14px] font-semibold leading-6", s.title)}>
              {title}
            </p>
          </div>
        </div>

        <div className={clsx("text-[44px] font-semibold leading-none", s.value)}>
          {value}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className="inline-flex items-center gap-2 rounded-[12px] border border-[#e8ece9] bg-white px-3 py-2 text-sm text-[#5f6978] shadow-[0_1px_2px_rgba(16,24,40,0.02)]"
          >
            <span className="text-[#8a94a3]">{chip.icon}</span>
            <span>{chip.label}</span>
            <span className="font-semibold text-[#374151]">{chip.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}